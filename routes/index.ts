import * as express from 'express';
import config from '../config'
import {viewDashboard} from '../controllers/dashboard';
import {viewCourses} from '../controllers/courses';
import {Request, Response, NextFunction} from 'express';
import {fromUrlId, toUrlId} from "../utils/url-ids";
import {getGQLToken} from "../lib/anon";
import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData, verifiedUserData} from "../lib/jwt";
import * as handlebars from 'handlebars';
import * as HandlebarsIntl from 'handlebars-intl';
import * as HandlebarsHelpers from 'handlebars-helpers';
import * as fs from 'fs';
import * as path from 'path';
import {viewCourseOverview} from "../controllers/course-overview";
import {viewCourseLive} from "../controllers/course-live";
import {viewCourseContent} from "../controllers/course-content";
import {viewCourseProgress} from "../controllers/course-progress";
import {viewCourseCertificate} from "../controllers/course-certificate";
import {redirectOldCardURL, redirectSectionURL, viewCourseCard} from "../controllers/course-card";
import {getCoinsCount} from "../lib/botmanager-api";
import {redirectMissingLocale} from "../controllers/redirect-locale";
import {redirectDashboard} from "../controllers/redirect-dashboard";
import {ampViewCourseCard} from "../controllers/amp-course-card";
import logger from "../utils/logger";
import {viewInstructor, viewInstructors} from "../controllers/instructors";
import {viewCourseHelp} from "../controllers/course-help";
import {viewDigitalDiplomas} from "../controllers/digital-diplomas";
import {viewDigitalDiplomaIndex} from "../controllers/digital-diploma-index";
import {generateBreadcrumbList, IBreadcrumbList, PlatformOrganization} from "../lib/jsonld";
import {viewProjectIndex} from "../controllers/project-index";
import {viewProjects} from "../controllers/projects";
import {mobileViewCourseCard} from "../controllers/mobile-course-card";
import {viewMarketingIndex} from "../controllers/marketing-index";
import {dataIntl} from "../i18n"
import {genAltUrls} from "../i18n/utils";

// @ts-ignore
HandlebarsIntl.registerWith(handlebars);
HandlebarsHelpers({
    // @ts-ignore
    handlebars: handlebars
});

const registerPartialHBS = (name: string) => {
    handlebars.registerPartial(name, fs.readFileSync(path.join(__dirname, `../views/partials/${name}.hbs`), {encoding: 'utf-8'}));
};

registerPartialHBS('course-top');
registerPartialHBS('digital-diploma-top');
registerPartialHBS('quiz-question');
registerPartialHBS('course-card-pagination');
registerPartialHBS('course-overview-pagination');
registerPartialHBS('course-enrollment-mutations');
registerPartialHBS('course-add-on-cards');
registerPartialHBS('course-booking');
registerPartialHBS('course-action-button-left');
registerPartialHBS('course-action-button-right');
registerPartialHBS('course-card-lg-vertical');
registerPartialHBS('instructor-card-lg-vertical');
registerPartialHBS('project-card-lg-vertical');
registerPartialHBS('digital-diploma-card-lg-vertical');
registerPartialHBS('course-card-banner');
registerPartialHBS('social-meta');

const router = express.Router();

type ParamsFunction = (req: Request, res: Response, next?: NextFunction) => any[]
type ControllerFunction = (client: GqlApi, user: IUserData, locale: string, ...args: any[]) => Promise<ISPFRouteResponse>

const computeUrlsAndBreadcrumbs = (req: Request, data: any): { canonicalUrl: string, breadcrumbs: IBreadcrumbList } => {
    let parts = [];
    let breadcrumbs: { name: string, url: string }[] = [];
    const breadcrumbUrlBase = `${config.clientBaseURL}/learn-en`;
    let matchedPath = req.route.path;
    // Assume that actual parts match with the matched path
    if (matchedPath.startsWith("/learn-")) {
        matchedPath = matchedPath.substr(matchedPath.indexOf('/', 1));
    } else if (matchedPath.startsWith("/amp/learn-")) {
        matchedPath = matchedPath.substr(matchedPath.indexOf('/', 2));
    }

    let matchedParts = matchedPath.split('/');
    let routeAffinity: "course" | "instructor" | "digital-diploma" | null = null;
    let partsToFill: { [key: string]: { ind: number, val: string }; } = {};
    for (let ind = 0; ind < matchedParts.length; ind++) {
        if (ind === 1) {
            // Find the base of the breadcrumb path
            // Note in-lined into for-loop to simplify scenario where matchedparts is empty or length === 1
            switch (matchedParts[ind]) {
                case "dashboard":
                    breadcrumbs.push({name: "Dashboard", url: `${breadcrumbUrlBase}/dashboard`});
                    break;
                case "courses":
                    breadcrumbs.push({name: "Courses", url: `${breadcrumbUrlBase}/courses`});
                    break;
                case "projects":
                    breadcrumbs.push({name: "Projects", url: `${breadcrumbUrlBase}/projects`});
                    break;
                case "instructors":
                    breadcrumbs.push({name: "Instructors", url: `${breadcrumbUrlBase}/instructors`});
                    break;
                case "digital-diplomas":
                    breadcrumbs.push({name: "Digital Diplomas", url: `${breadcrumbUrlBase}/digital-diplomas`});
                    break;
            }
        }
        switch (matchedParts[ind]) {
            case ":courseId":
                routeAffinity = 'course';
                partsToFill['courseId'] = {ind, val: req.params.courseId};
                parts.push("_");
                break;
            case ":unitId":
                partsToFill['unitId'] = {ind, val: req.params.unitId};
                parts.push("_");
                break;
            case ":sectionId":
                partsToFill['sectionId'] = {ind, val: req.params.sectionId};
                parts.push("_");
                break;
            case ":cardId":
                partsToFill['cardId'] = {ind, val: req.params.cardId};
                parts.push("_");
                break;
            case ":digitalDiplomaId":
                routeAffinity = 'digital-diploma';
                partsToFill['digitalDiplomaId'] = {ind, val: req.params.digitalDiplomaId};
                parts.push("_");
                break;
            case ":instructorId":
                routeAffinity = 'instructor';
                partsToFill['instructorId'] = {ind, val: req.params.instructorId};
                parts.push("_");
                break;
            default:
                parts.push(matchedParts[ind]);
        }
    }

    switch (routeAffinity) {
        case 'course':
            const cUrlId = toUrlId(data.course.meta.title, data.course.meta.id);
            parts[partsToFill['courseId'].ind] = cUrlId;
            breadcrumbs.push({name: data.course.meta.title, url: `${breadcrumbUrlBase}/courses/${cUrlId}`});
            if (partsToFill['unitId']) {
                const routeUnit = data.course.units.find(u => u.id == fromUrlId('CourseUnit', partsToFill['unitId'].val));
                const unitUrlId = toUrlId(routeUnit.title, routeUnit.id);
                parts[partsToFill['unitId'].ind] = unitUrlId;
                if (partsToFill['sectionId']) {
                    const routeSection = routeUnit.sections_list.find(s => s.id == fromUrlId('UnitSection', partsToFill['sectionId'].val));
                    const sectionUrlId = toUrlId(routeSection.title, routeSection.id);
                    parts[partsToFill['sectionId'].ind] = sectionUrlId;
                    if (partsToFill['cardId']) {
                        const routeCard = routeSection.cards_list.find(c => c.id == fromUrlId('SectionCard', partsToFill['cardId'].val));
                        const cardUrlId = toUrlId(routeCard.title, routeCard.id);
                        parts[partsToFill['cardId'].ind] = cardUrlId;
                        breadcrumbs.push({
                            name: data.course.meta.title,
                            url: `${breadcrumbUrlBase}/courses/${cUrlId}/${unitUrlId}/${sectionUrlId}/${cardUrlId}`
                        });
                    }
                }
            } else if (matchedParts.length > 1) {
                switch (matchedParts[matchedParts.length - 1]) {
                    case 'certificate':
                        breadcrumbs.push({
                            name: 'Certificate',
                            url: `${breadcrumbUrlBase}/courses/${cUrlId}/certificate`
                        });
                        break;
                    case 'content':
                        breadcrumbs.push({name: 'Content', url: `${breadcrumbUrlBase}/courses/${cUrlId}/content`});
                        break;
                    case 'help':
                        breadcrumbs.push({name: 'Help', url: `${breadcrumbUrlBase}/courses/${cUrlId}/help`});
                        break;
                    case 'live':
                        breadcrumbs.push({name: 'Live Classes', url: `${breadcrumbUrlBase}/courses/${cUrlId}/live`});
                        break;
                    case 'progress':
                        breadcrumbs.push({name: 'Progress', url: `${breadcrumbUrlBase}/courses/${cUrlId}/progress`});
                        break;
                }
            }
            break;
        case 'instructor':
            parts[partsToFill['instructorId'].ind] = toUrlId(data.instructor.full_name, data.instructor.id);
            breadcrumbs.push({name: data.instructor.full_name, url: `${breadcrumbUrlBase}/instructors/${cUrlId}`});
            break;
        case 'digital-diploma':
            parts[partsToFill['digitalDiplomaId'].ind] = toUrlId(data.digitalDiploma.title, data.digitalDiploma.id);
            if (matchedParts[1] === 'digital-diplomas') {
                breadcrumbs.push({
                    name: data.digitalDiploma.title,
                    url: `${breadcrumbUrlBase}/digital-diplomas/${cUrlId}`
                });
            } else if (matchedParts[1] === 'projects') {
                breadcrumbs.push({name: data.digitalDiploma.title, url: `${breadcrumbUrlBase}/projects/${cUrlId}`});
            }
            break;
    }

    // TODO logically handle locales in URLs, but for now just make sure to always use english
    return {
        canonicalUrl: `${config.clientBaseURL}/learn-en${parts.join('/')}`,
        breadcrumbs: generateBreadcrumbList(...breadcrumbs),
    };
};

/**
 * Handles controller execution and responds to user.
 * This way controllers are not attached to the API.
 * @param controllerFunction Controller Promise.
 * @param params (req) => [params, ...].
 */
const gqlBaseControllerHandler = (controllerFunction: ControllerFunction, params: ParamsFunction) => async (req: Request, res?: Response, next?: NextFunction) => {

    // Determine User Locale from Accept-Language or URL before getting (or creating) the JWT
    // This returns one value from Accept-Language that exists in the list defined in config.locales or 1-st config.locales value if no match found
    let user_language = req.language;
    logger.debug(`req.language ` + user_language);
    // Override if locale is explicitly present in the URL's path (`-:locale`) and it is valid
    if (req.params.locale && config.locales.includes(req.params.locale)){
        user_language = req.params.locale;
    }

    let startReqTs = (new Date()).getTime();
    let gqlToken = req.cookies['token'];
    let setUpdatedToken = false;
    if (!gqlToken) {
        setUpdatedToken = true;
        let startTknReq = (new Date()).getTime();
        gqlToken = await getGQLToken(user_language);
        console.log(`Get Token Req Duration: ${(new Date()).getTime() - startTknReq}ms`);
    }
    const gqlClient = new GqlApi(gqlToken);
    let userData: IUserData;
    try {
        userData = verifiedUserData(gqlToken);
    } catch (err) {
        return res.status(403) && next(err);
    }
    if (!userData || !userData.id || !userData.locale) {
        return res.status(403) && next(new Error('invalid/missing JWT'));
    }
    const initialParams = params ? params(req, res, next) : [req, res, next];

    // Override locale with the value from JWT if the value is valid. Otherwise, set to the earlier evaluated user_language value
    // NOTE: the locale from userData is not used in this server's process, however, it is ultimately used in the GQL server by virtue of being stored in the JWT
    if (config.locales.includes(userData.locale)) {
        req.params.locale = userData.locale;
    } else {
        req.params.locale = user_language;
    }
    logger.debug(`userData.locale ` + userData.locale + `. Setting req.params.locale to ` + req.params.locale);

    var intlData = dataIntl[req.params.locale];

    try {
        const result = await controllerFunction(gqlClient, userData, req.params.locale, ...initialParams);

        result.data.intl = intlData;

        if (setUpdatedToken) {
            res.cookie(config.jwt.cookieName, gqlToken, {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                domain: config.cookies.domain
            });
        }
        if (result.redirect) {
            res.redirect(result.redirect.permanent ? 301 : 302, result.redirect.url);
            return
        }

        const {canonicalUrl, breadcrumbs} = computeUrlsAndBreadcrumbs(req, result.data);
        result.config = config.templateConstants;
        result.route = {
            path: req.path,
            locale: req.params.locale,
            suffix: req.path.substr(req.path.indexOf('/', 1)),
            params: req.params,
            referer: req.headers.referer,
            referrer: req.headers.referer,
            url: config.clientBaseURL + req.path,
            canonicalUrl: canonicalUrl
        };

        if (!result.meta.jsonld) {
            result.meta.jsonld = [];
        } else if (!(result.meta.jsonld instanceof Array)) {
            result.meta.jsonld = [result.meta.jsonld]
        }
        if ((breadcrumbs as any).itemListElement && (breadcrumbs as any).itemListElement.length > 0) {
            result.meta.jsonld.push(breadcrumbs);
        }
        result.meta.jsonld.push(PlatformOrganization);

        if (!result.meta.altUrls) {
            result.meta.altUrls= genAltUrls(req.path);
        }

        // TODO internationalize full title prefix
        result.meta.fullTitle = `${result.meta.title} - EXLskills`;
        result.user = userData;
        if (!result.user.is_demo) {
            try {
                let startCoinsReq = (new Date()).getTime();
                result.user.coins = await getCoinsCount(result.user.id);
                console.log(`Get Coins Req Duration: ${(new Date()).getTime() - startCoinsReq}ms`);
            } catch (err) {
                if (process.env.NODE_ENV === 'production' && config.botManagerAPI.key !== 'set_me') {
                    throw new Error(err);
                }
                logger.debug(`getCoinsCount failed ` + err + ` setting user coins to zero`);
                result.user.coins = 0;
            }
        } else {
            result.user.coins = 0;
        }

        if (!result.meta.image) {
            result.meta.image = config.templateConstants.defaultMetaImage;
        }
        result.meta.og = {
            title: result.meta.fullTitle,
            description: result.meta.description,
            url: config.clientBaseURL + req.path,
            image: result.meta.image
        };
        result.meta.twitter = {
            title: result.meta.fullTitle,
            description: result.meta.description,
            image: result.meta.image,
            imageAlt: result.meta.title
        };

        console.log(`Req Data Load Duration: ${(new Date()).getTime() - startReqTs}ms`);
        if (result.amp) {
            result.layout = 'amp';
            return res.render(result.contentTmpl, result);
        }
        if (result.mobile) {
            result.layout = 'mobile';
            return res.render(result.contentTmpl, result);
        } else if (req.query['spf'] === 'navigate') {
            fs.readFile(path.join(config.viewsRoot, config.spfResponse.sidebar), {encoding: 'utf8'}, (err, data) => {
                if (err) {
                    return res.status(500) && next(err);
                }

                const sidebarHTML = handlebars.compile(data)(result, {
                    data: {intl: intlData}
                });

                fs.readFile(path.join(config.viewsRoot, result.contentTmpl + '.hbs'), {encoding: 'utf8'}, (err, data) => {
                    logger.debug('using template ' + result.contentTmpl);
                    if (err) {
                        return res.status(500) && next(err);
                    }
                    const contentHTML = handlebars.compile(data)(result, {
                        data: {intl: intlData}
                    });
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({
                        title: result.meta.fullTitle,
                        url: req.path,
                        body: {
                            sidebar: sidebarHTML,
                            content: contentHTML,
                            'topbar-title': result.meta.topbarTitle ? result.meta.topbarTitle : result.meta.title
                        }
                    }));
                });
            });
        } else {
            return res.render(result.contentTmpl, result);
        }
    } catch (error) {
        console.log('Error caught in router: ', error);
        return res.status(500) && next(error.message ? error.message : error);
    }
};

// Convenient short-hand version
const gc = gqlBaseControllerHandler;

// Health check for ELB
router.get('/health-check', (req, res) => res.sendStatus(200));

// Static
router.use('/learn-en/assets', express.static(path.join(__dirname, '../static/assets')));

// SPF Routes
// NOTE: All routes should be made (or become) compatible with the computeCanonicalUrl function for SEO.
//       That function will automatically compute the canonical URLs using consistent data from controllers
//       and consistent URL IDs provided in routes. The purpose is to streamline SEO among locale codes, avoiding
//       duplicate content penalties...

// strings positioned in the slots designated with `:` get loaded into corresponding `req.params.`, e.g., `:locale` => `req.params.locale`

router.get('/', gc(viewMarketingIndex, req => []));
router.get('/learn-:locale', redirectDashboard);
router.get('/learn-:locale/dashboard', gc(viewDashboard, req => []));
router.get('/learn-:locale/courses', gc(viewCourses, req => []));
router.get('/learn-:locale/courses/:courseId', gc(viewCourseOverview, req => [fromUrlId('Course', req.params.courseId)]));
router.get('/learn-:locale/courses/:courseId/content', gc(viewCourseContent, req => [fromUrlId('Course', req.params.courseId)]));
router.get('/learn-:locale/courses/:courseId/help', gc(viewCourseHelp, req => [fromUrlId('Course', req.params.courseId)]));
router.get('/learn-:locale/courses/:courseId/live', gc(viewCourseLive, req => [fromUrlId('Course', req.params.courseId)]));
router.get('/learn-:locale/courses/:courseId/progress', gc(viewCourseProgress, req => [fromUrlId('Course', req.params.courseId)]));
router.get('/learn-:locale/courses/:courseId/certificate', gc(viewCourseCertificate, req => [fromUrlId('Course', req.params.courseId)]));
router.get('/learn-:locale/courses/:courseId/units/:unitId/sections/:sectionId/card/:cardId', gc(redirectOldCardURL, req => [req]));
router.get('/learn-:locale/courses/:courseId/units/:unitId/sections/:sectionId', gc(redirectOldCardURL, req => [req]));
router.get('/learn-:locale/courses/:courseId/:unitId/:sectionId/:cardId', gc(viewCourseCard, req => [req, fromUrlId('Course', req.params.courseId), fromUrlId('CourseUnit', req.params.unitId), fromUrlId('UnitSection', req.params.sectionId), fromUrlId('SectionCard', req.params.cardId)]));
router.get('/learn-:locale/courses/:courseId/:unitId/:sectionId', gc(redirectSectionURL, req => [fromUrlId('Course', req.params.courseId), fromUrlId('CourseUnit', req.params.unitId), fromUrlId('UnitSection', req.params.sectionId)]));

router.get('/learn-:locale/digital-diplomas', gc(viewDigitalDiplomas, req => []));
router.get('/learn-:locale/digital-diplomas/:digitalDiplomaId', gc(viewDigitalDiplomaIndex, req => [fromUrlId('DigitalDiploma', req.params.digitalDiplomaId)]));

router.get('/learn-:locale/projects', gc(viewProjects, req => []));
router.get('/learn-:locale/projects/:digitalDiplomaId', gc(viewProjectIndex, req => [fromUrlId('DigitalDiploma', req.params.digitalDiplomaId)]));

router.get('/learn-:locale/instructors', gc(viewInstructors, req => []));
router.get('/learn-:locale/instructors/:instructorId', gc(viewInstructor, req => [fromUrlId('User', req.params.instructorId)]));

router.get('/learn/*', redirectMissingLocale);
router.get('/learn', redirectDashboard);

// AMP Routes
router.get('/amp/learn-:locale/courses/:courseId/:unitId/:sectionId/:cardId', gc(ampViewCourseCard, req => [req, fromUrlId('Course', req.params.courseId), fromUrlId('CourseUnit', req.params.unitId), fromUrlId('UnitSection', req.params.sectionId), fromUrlId('SectionCard', req.params.cardId)]));
router.get('/amp/learn-:locale/courses/:courseId/units/:unitId/sections/:sectionId/card/:cardId', gc(redirectOldCardURL, req => [req, true]));

// Mobile Web Routes
router.get('/mobile-v1/learn-:locale/courses/:courseId/:unitId/:sectionId/:cardId', gc(mobileViewCourseCard, req => [req, fromUrlId('Course', req.params.courseId), fromUrlId('CourseUnit', req.params.unitId), fromUrlId('UnitSection', req.params.sectionId), fromUrlId('SectionCard', req.params.cardId)]));

// Production error handlers:
if (process.env.NODE_ENV === 'production') {
    router.use(function (req, res) {
        res.status(404);
        res.render('error', {layout: 'splash'});
    });
    router.use(function (error, req, res, next) {
        res.status(500);
        res.render('error', {layout: 'splash'});
    });
}
export default router;

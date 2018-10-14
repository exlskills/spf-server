import * as express from 'express';
import config from '../config'
import { viewDashboard } from '../controllers/dashboard';
import { viewCourses } from '../controllers/courses';
import { Request, Response, NextFunction } from 'express';
import {fromUrlId} from "../utils/url-ids";
import {getGQLToken} from "../lib/anon";
import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData, verifiedUserData} from "../lib/jwt";
import * as handlebars from 'handlebars';
import * as HandlebarsIntl from 'handlebars-intl';
import * as HandlebarsHelpers from 'handlebars-helpers';
import * as fs from 'fs';
import * as path from 'path';
import {viewCourseIndex} from "../controllers/course-index";
import {viewCourseLive} from "../controllers/course-live";
import {viewCourseContent} from "../controllers/course-content";
import {viewCourseProgress} from "../controllers/course-progress";
import {viewCourseCertificate} from "../controllers/course-certificate";
import {redirectOldCardURL, redirectSectionURL, viewCourseCard} from "../controllers/course-card";
import {generateHash} from "../lib/intercom";
import {getCoinsCount} from "../lib/botmanager-api";

// @ts-ignore
HandlebarsIntl.registerWith(handlebars);
HandlebarsHelpers({
    // @ts-ignore
    handlebars: handlebars
});

const registerPartialHBS = (name: string) => {
    handlebars.registerPartial(name, fs.readFileSync(path.join(__dirname, `../views/partials/${name}.hbs`), {encoding: 'utf-8'}));
}

registerPartialHBS('course-top');
registerPartialHBS('course-card-pagination');
registerPartialHBS('course-enrollment-mutations');
registerPartialHBS('course-action-button-left');
registerPartialHBS('course-action-button-right');

const router = express.Router();

type ParamsFunction = (req: Request, res: Response, next?: NextFunction) => any[]
type ControllerFunction = (client: GqlApi, user: IUserData, locale: string, ...args: any[]) => Promise<ISPFRouteResponse>

/**
 * Handles controller execution and responds to user.
 * This way controllers are not attached to the API.
 * @param promise Controller Promise.
 * @param params (req) => [params, ...].
 */
const gqlBaseControllerHandler = (promise: ControllerFunction, params: ParamsFunction) => async (req: Request, res?: Response, next?: NextFunction) => {
    let gqlToken = req.cookies['token'];
    let setUpdatedToken = false;
    if (!gqlToken) {
        setUpdatedToken = true;
        gqlToken = await getGQLToken();
    }
    const gqlClient = new GqlApi(gqlToken);
    let userData: IUserData;
    try {
        userData = verifiedUserData(gqlToken);
    } catch (err) {
        return res.status(403) && next(err);
    }
    if (!userData || !userData.id) {
        return res.status(403) && next(new Error('invalid/missing JWT'));
    }
    const initialParams = params ? params(req, res, next) : [req, res, next];
    try {
        const result = await promise(gqlClient, userData, req.params.locale, ...initialParams);
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
        // TODO dynamic locale
        result.data.intl = {
            "locales": "en-US"
        };
        result.intercomHash = generateHash(userData.id);
        result.config = config.templateConstants;
        result.route = {
            path: req.path,
            locale: req.params.locale,
            suffix: req.path.substr(req.path.indexOf('/', 1)),
            params: req.params,
            referer: req.headers.referer,
            referrer: req.headers.referer,
            url: config.clientBaseURL + req.path
        };
        // TODO internationalize full title prefix
        result.meta.fullTitle = `EXLskills - ${result.meta.title}`;
        result.user = userData;
        if (!result.user.is_demo) {
            result.user.coins = await getCoinsCount(result.user.id);
        } else {
            result.user.coins = 0;
        }
        if (req.query['spf'] === 'navigate') {
            fs.readFile(path.join(config.viewsRoot, config.spfResponse.sidebar), {encoding: 'utf8'}, (err, data) => {
                if (err) {
                    return res.status(500) && next(err);
                }
                const sidebarHTML = handlebars.compile(data)(result);
                fs.readFile(path.join(config.viewsRoot, result.contentTmpl+'.hbs'), {encoding: 'utf8'}, (err, data) => {
                    if (err) {
                        return res.status(500) && next(err);
                    }
                    const contentHTML = handlebars.compile(data)(result);
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
        return res.status(500) && next(error);
    }
};

// Convenient short-hand version
const gc = gqlBaseControllerHandler;

router.get('/health-check', (req, res) => res.sendStatus(200));
router.use('/learn-en/assets', express.static(path.join(__dirname, '../static/assets')));
// TODO add redirects for bad locales and index
router.get('/learn-:locale/dashboard', gc(viewDashboard, req => []));
router.get('/learn-:locale/courses', gc(viewCourses, req => []));
router.get('/learn-:locale/courses/:courseId', gc(viewCourseIndex, req => [fromUrlId('Course', req.params.courseId)]));
router.get('/learn-:locale/courses/:courseId/content', gc(viewCourseContent, req => [fromUrlId('Course', req.params.courseId)]));
router.get('/learn-:locale/courses/:courseId/live', gc(viewCourseLive, req => [fromUrlId('Course', req.params.courseId)]));
router.get('/learn-:locale/courses/:courseId/progress', gc(viewCourseProgress, req => [fromUrlId('Course', req.params.courseId)]));
router.get('/learn-:locale/courses/:courseId/certificate', gc(viewCourseCertificate, req => [fromUrlId('Course', req.params.courseId)]));
router.get('/learn-:locale/courses/:courseId/card', gc(viewCourseCard, req => [fromUrlId('Course', req.params.courseId)]));
router.get('/learn-:locale/courses/:courseId/units/:unitId/sections/:sectionId/card/:cardId', gc(redirectOldCardURL, req => [req]));
router.get('/learn-:locale/courses/:courseId/units/:unitId/sections/:sectionId', gc(redirectOldCardURL, req => [req]));
router.get('/learn-:locale/courses/:courseId/:unitId/:sectionId/:cardId', gc(viewCourseCard, req => [fromUrlId('Course', req.params.courseId), fromUrlId('CourseUnit', req.params.unitId), fromUrlId('UnitSection', req.params.sectionId), fromUrlId('SectionCard', req.params.cardId)]));
router.get('/learn-:locale/courses/:courseId/:unitId/:sectionId', gc(redirectSectionURL, req => [fromUrlId('Course', req.params.courseId), fromUrlId('CourseUnit', req.params.unitId), fromUrlId('UnitSection', req.params.sectionId)]));

// Production error handlers:
if (process.env.NODE_ENV === 'production') {
    router.use(function(req, res) {
        res.status(404);
        res.render('error', {layout: 'splash'});
    });
    router.use(function(error, req, res, next) {
        res.status(500);
        res.render('error', {layout: 'splash'});
    });
}
export default router;

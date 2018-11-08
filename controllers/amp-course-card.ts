import GqlApi from "../lib/gql-api";
import * as showdown from 'showdown';
import * as cheerio from 'cheerio';
import {toUrlId} from "../utils/url-ids";
import {IUserData} from "../lib/jwt";
import {fetchDetailedCourseForView} from "./course-overview";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {Request} from 'express';

const mdToHTML = new showdown.Converter();
mdToHTML.setFlavor('github');

export async function ampViewCourseCard(client: GqlApi, user: IUserData, locale: string, req: Request, courseGID: string, unitGID: string, sectionGID: string, cardGID: string) : Promise<ISPFRouteResponse> {
    let gqlResp = await fetchDetailedCourseForView(client, courseGID);
    gqlResp.card = await client.getSectionCard(courseGID, unitGID, sectionGID, cardGID);
    gqlResp.card['url_id'] = toUrlId(gqlResp.card.title, gqlResp.card.id);
    const course = await client.getCourseByID(courseGID);
    const $ = cheerio.load(mdToHTML.makeHtml(gqlResp.card.content.content));
    $('iframe').each(function () {
        $(this).replaceWith(`
            <amp-iframe width="100"
                height="100"
                sandbox="allow-scripts allow-same-origin"
                layout="responsive"
                frameborder="0"
                src="${$(this).attr('src')}">
            </amp-iframe>
        `);
    });
    gqlResp.card['rendered_content'] = $.html();
    gqlResp.card['amp_title'] = `${course.title} - ${gqlResp.card.title}`;
    return {
        contentTmpl: 'amp_course_card',
        amp: true,
        meta: {
            title: `${gqlResp.meta.title} | ${gqlResp.card.title}`,
            topbarTitle: `${gqlResp.meta.title}`,
            image: gqlResp.meta.logo_url,
            amp: {
                canon_link: `/learn-${locale}/courses/${req.params.courseId}/${req.params.unitId}/${req.params.sectionId}/${req.params.cardId}`
            }
        },
        data: {
            course: gqlResp
        }
    }
}
import GqlApi from "../lib/gql-api";
import * as showdown from 'showdown';
import * as cheerio from 'cheerio';
import {toUrlId} from "../utils/url-ids";
import {IUserData} from "../lib/jwt";
import {fetchDetailedCourseForView} from "./course-overview";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {Request} from 'express';
import {generateArticle, PlatformOrganization} from "../lib/jsonld";

const mdToHTML = new showdown.Converter();
mdToHTML.setFlavor('github');

export async function ampViewCourseCard(client: GqlApi, user: IUserData, locale: string, req: Request, courseGID: string, unitGID: string, sectionGID: string, cardGID: string) : Promise<ISPFRouteResponse> {
    let gqlResp = await fetchDetailedCourseForView(client, courseGID);
    gqlResp.card = await client.getSectionCard(courseGID, unitGID, sectionGID, cardGID);
    gqlResp.card['url_id'] = toUrlId(gqlResp.card.title, gqlResp.card.id);
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
    gqlResp.card['amp_title'] = `${gqlResp.card.title} | ${gqlResp.meta.title}`;
    return {
        contentTmpl: 'amp_course_card',
        amp: true,
        meta: {
            title: `${gqlResp.card.title} | ${gqlResp.meta.title}`,
            topbarTitle: `${gqlResp.meta.title}`,
            image: gqlResp.meta.logo_url,
            // NOTE: If we don't have the updated_at date, then don't add this as we won't have all the required fields
            jsonld: gqlResp.card.updated_at ? generateArticle(`${gqlResp.card.title} | ${gqlResp.meta.title}`, undefined, gqlResp.meta.logo_url, gqlResp.card.updated_at, PlatformOrganization) : undefined
        },
        data: {
            course: gqlResp
        }
    }
}

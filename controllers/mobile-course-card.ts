import GqlApi from "../lib/gql-api";
import {IUserData} from "../lib/jwt";
import {Request} from "express";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {toUrlId} from "../utils/url-ids";
import {renderFullCardContentHTML, setupQuizQuestionForView} from "./course-card";
import {fetchDetailedCourseWithEnrollmentForView} from "./course-overview";

export async function mobileViewCourseCard(client: GqlApi, user: IUserData, locale: string, req: Request, courseGID: string, unitGID: string, sectionGID: string, cardGID: string) : Promise<ISPFRouteResponse> {
    let gqlResp = await fetchDetailedCourseWithEnrollmentForView(client, courseGID);
    gqlResp.card = await client.getSectionCard(courseGID, unitGID, sectionGID, cardGID);
    gqlResp.card.content.content = renderFullCardContentHTML(gqlResp.card.content.content);
    gqlResp.card['url_id'] = toUrlId(gqlResp.card.title, gqlResp.card.id);
    setupQuizQuestionForView(gqlResp.card.question, gqlResp.nav);
    return {
        contentTmpl: 'mobile_course_card',
        mobile: true,
        meta: {
            title: `${gqlResp.meta.title} | ${gqlResp.card.title}`,
            description: `Learn ${gqlResp.card.title} with EXLskills' Free ${gqlResp.meta.title} Course!`,
            topbarTitle: `${gqlResp.meta.title}`,
            image: gqlResp.meta.logo_url
        },
        data: {
            course: gqlResp
        }
    }
}

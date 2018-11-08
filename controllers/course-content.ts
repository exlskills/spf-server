import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {
    fetchDetailedCourseWithEnrollmentForView
} from "./course-overview";

export async function viewCourseContent(client: GqlApi, user: IUserData, locale: string, courseGID: string) : Promise<ISPFRouteResponse> {
    let gqlResp = await fetchDetailedCourseWithEnrollmentForView(client, courseGID);
    return {
        contentTmpl: 'course_content',
        meta: {
            title: gqlResp.meta.title,
            description: gqlResp.meta.description,
            image: gqlResp.meta.logo_url
        },
        data: {
            course: gqlResp
        }
    }
}

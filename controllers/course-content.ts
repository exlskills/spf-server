import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {fetchDetailedCourseForView, fetchUserCourseEnrollmentForView} from "./course-index";

export async function viewCourseContent(client: GqlApi, user: IUserData, locale: string, courseGID: string) : Promise<ISPFRouteResponse> {
    let gqlResp = await fetchDetailedCourseForView(client, courseGID, true);
    gqlResp.isEnrolled = fetchUserCourseEnrollmentForView(client, courseGID);
    return {
        contentTmpl: 'course_content',
        meta: {
            title: gqlResp.meta.title,
            description: gqlResp.meta.description
        },
        data: {
            course: gqlResp
        }
    }
}

import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {fetchDetailedCourseWithEnrollmentForView} from "./course-overview";

export async function viewCourseProgress(client: GqlApi, user: IUserData, locale: string, courseGID: string) : Promise<ISPFRouteResponse> {
    let gqlResp = await fetchDetailedCourseWithEnrollmentForView(client, courseGID);
    gqlResp.unitTitles = gqlResp.units.map(u => u.title);
    gqlResp.unitEMAs = gqlResp.units.map(u => Math.round(u.ema*100)/100);
    gqlResp.unitGrades = gqlResp.units.map(u => Math.round(u.grade*100)/100);
    return {
        contentTmpl: 'course_progress',
        meta: {
            title: gqlResp.meta.title,
            description: gqlResp.meta.description
        },
        data: {
            course: gqlResp
        }
    }
}

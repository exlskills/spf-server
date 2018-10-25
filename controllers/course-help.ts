import GqlApi from "../lib/gql-api";
import {IUserData} from "../lib/jwt";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {fetchDetailedCourseForView} from "./course-index";

export async function viewCourseHelp(client: GqlApi, user: IUserData, locale: string, courseGID: string) : Promise<ISPFRouteResponse> {
    const c = await fetchDetailedCourseForView(client, courseGID);
    return {
        contentTmpl: 'course_help',
        meta: {
            title: c.meta.title,
            description: `Get live personalized help studying for the ${c.meta.title} course`
        },
        data: {
            course: c,
        }
    }
}

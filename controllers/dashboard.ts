import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {fetchCourseListForView} from "./courses";

export async function viewDashboard(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    const relevant = await fetchCourseListForView(client, 'relevant');
    const mine = await fetchCourseListForView(client, 'mine');
    return {
        contentTmpl: 'dashboard',
        meta: {
            title: 'Dashboard',
            description: 'Your EXLskills Dashboard'
        },
        data: {
            courses: {
                relevant,
                mine
            }
        }
    }
}

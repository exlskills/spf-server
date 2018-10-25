import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {fetchCourseListForView} from "./courses";

export async function viewMarketing(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    const mine = await fetchCourseListForView(client, 'mine');
    return {
        contentTmpl: 'marketing-index',
        layout: 'marketing',
        meta: {
            title: 'test',
            description: 'Your EXLskills Dashboard'
        },
        data: {
            courses: {
                mine
            }
        }
    }
}

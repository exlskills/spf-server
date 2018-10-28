import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {fetchCourseListForView} from "./courses";

export async function viewMarketing(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    const relevant = await fetchCourseListForView(client, 'relevant');
    console.log('RELEVANT COURSES', relevant)
    return {
        contentTmpl: 'marketing-index',
        layout: 'marketing',
        meta: {
            title: 'Home'
        },
        data: {
            courses: {
                relevant
            }
        }
    }
}

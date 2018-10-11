import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";

export async function viewDashboard(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    return {
        pageMenu: [

        ],
        contentTmpl: 'dashboard',
        meta: {
            title: 'Dashboard',
            description: 'Your EXLskills dashboard'
        },
        data: {

        }
    }
}

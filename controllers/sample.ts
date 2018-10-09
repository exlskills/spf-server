import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";

export async function getSample(client: GqlApi, locale: string) : Promise<ISPFRouteResponse> {
    console.log("Say foo")
    return {
        pageMenu: [

        ],
        contentTmpl: 'sample',
        meta: {
            title: 'sample title',
            description: 'sample desc'
        },
        data: {

        }
    }
}

import GqlApi from "../lib/gql-api";
import {IUserData} from "../lib/jwt";
import {ISPFRouteResponse} from "../lib/spf-route-response";

export async function viewPWAOffline(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    return {
        contentTmpl: 'pwa_offline',
        meta: {
            title: 'Offline',
            description: 'You\'re Offline'
        },
        data: {}
    }
}

export async function viewPWABoot(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    return {
        contentTmpl: 'pwa_boot',
        meta: {
            title: 'App Loading',
            description: 'EXLskills is Loading'
        },
        data: {}
    }
}

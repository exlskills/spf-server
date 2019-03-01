import GqlApi from "../lib/gql-api";
import {IUserData} from "../lib/jwt";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import config from "../config";

export async function viewMySettings(client: GqlApi, user: IUserData, locale: string, settingsTab: string) : Promise<ISPFRouteResponse> {
    const profile = await client.getUserProfile();
    return {
        contentTmpl: 'user_settings',
        meta: {
            title: 'Settings',
            description: 'Manage user settings'
        },
        data: {
            settingsTab,
            profile
        }
    }
}

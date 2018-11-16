import GqlApi from "../lib/gql-api";
import {IUserData} from "../lib/jwt";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {generateCourse, PlatformOrganization} from "../lib/jsonld";
import {fetchDigitalDiplomaForView} from "./digital-diploma-index";

// NOTE: For beta, projects are digital diploma objects in the DB with `is_project=true`
export async function viewProjectIndex(client: GqlApi, user: IUserData, locale: string, digitalDiplomaGID: string) : Promise<ISPFRouteResponse> {
    const digitalDiploma = await fetchDigitalDiplomaForView(client, digitalDiplomaGID);
    let metaDesc =`${digitalDiploma.headline} Learn by doing with live help from professionals!`;
    return {
        contentTmpl: 'digital_diploma_index',
        meta: {
            title: digitalDiploma.title,
            description: metaDesc,
            image: digitalDiploma.logo_url,
            jsonld: generateCourse(digitalDiploma.title, metaDesc, digitalDiploma.logo_url, PlatformOrganization)
        },
        data: {
            digitalDiploma
        }
    }
}

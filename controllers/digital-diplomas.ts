import GqlApi, {CourseListType} from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {getBadgeURLForTopic} from "../lib/course-badges";
import {toUrlId} from "../utils/url-ids";
import {skillLevelToText} from "../lib/skill-levels";
import {minutesToText} from "../lib/duration";

export async function fetchDigitalDiplomaListForView(client: GqlApi) {
    let gqlEdges = await client.getAllDigitalDiplomas();
    let digitalDiplomas: any[] = [];
    for (let edge of gqlEdges) {
        let digitalDiploma = edge.node as any;
        digitalDiploma.url_id = toUrlId(digitalDiploma.title, digitalDiploma.id);
        digitalDiploma.badge_url = getBadgeURLForTopic(digitalDiploma.primary_topic);
        digitalDiploma.skill_level_text = skillLevelToText(digitalDiploma.skill_level);
        digitalDiploma.est_minutes_text = minutesToText(digitalDiploma.est_minutes);
        digitalDiplomas.push(digitalDiploma)
    }
    return digitalDiplomas
}

export async function viewDigitalDiplomas(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    const digitalDiplomas = await fetchDigitalDiplomaListForView(client);
    return {
        contentTmpl: 'digital_diplomas',
        meta: {
            title: 'Digital Diplomas',
            description: 'EXLskills Revolutionary Digital Diplomas to Kickstart Your Career in Tech'
        },
        data: {
            digitalDiplomas
        }
    }
}

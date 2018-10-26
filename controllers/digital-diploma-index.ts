import GqlApi, {CourseListType} from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {getBadgeURLForTopic} from "../lib/course-badges";
import {toUrlId} from "../utils/url-ids";
import {skillLevelToText} from "../lib/skill-levels";
import {minutesToText} from "../lib/duration";
import IDigitalDiploma = GQL.IDigitalDiploma;

export async function fetchDigitalDiplomaForView(client: GqlApi, digitalDiplomaGID: string) {
    let digitalDiploma = await client.getDigitalDiploma(digitalDiplomaGID) as IDigitalDiploma & {url_id: string, badge_url: string, skill_level_text: string, est_minutes_text: string};
    digitalDiploma.url_id = toUrlId(digitalDiploma.title, digitalDiploma.id);
    digitalDiploma.badge_url = getBadgeURLForTopic(digitalDiploma.primary_topic);
    digitalDiploma.skill_level_text = skillLevelToText(digitalDiploma.skill_level);
    digitalDiploma.est_minutes_text = minutesToText(digitalDiploma.est_minutes);
    return digitalDiploma
}

export async function viewDigitalDiplomaIndex(client: GqlApi, user: IUserData, locale: string, digitalDiplomaGID: string) : Promise<ISPFRouteResponse> {
    const digitalDiploma = await fetchDigitalDiplomaForView(client, digitalDiplomaGID);
    console.log(digitalDiploma)
    return {
        contentTmpl: 'digital_diploma_index',
        meta: {
            title: `${digitalDiploma.title}`,
            description: `${digitalDiploma.headline}. Kickstart Your Career in Tech Today!`
        },
        data: {
            digitalDiploma
        }
    }
}

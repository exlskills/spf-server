import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {getBadgeURLForTopic} from "../lib/course-badges";
import {toUrlId} from "../utils/url-ids";
import {skillLevelToText} from "../lib/skill-levels";
import {minutesToText} from "../lib/duration";
import {indexToLetter} from "../lib/ordered-lists";

export async function fetchDetailedCourseForView(client: GqlApi, courseGID: string, withEMA?: boolean) {
    let gqlResp: any;
    if (withEMA) {
        gqlResp = await client.getDetailedCourseByIDWithEMA(courseGID);
    } else {
        gqlResp = await client.getDetailedCourseByIDSansEMA(courseGID);
    }
    gqlResp.meta.url_id = toUrlId(gqlResp.meta.title, gqlResp.meta.id);
    gqlResp.meta.badge_url = getBadgeURLForTopic(gqlResp.meta.primary_topic);
    gqlResp.meta.skill_level_text = skillLevelToText(gqlResp.meta.skill_level);
    gqlResp.meta.est_minutes_text = minutesToText(gqlResp.meta.est_minutes);
    gqlResp.meta.has_live_mode = gqlResp.meta.delivery_methods.includes('live');
    gqlResp.units = gqlResp.units.map((u, uIdx) => {
        u.node.number = uIdx+1;
        u.node.url_id = toUrlId(u.node.title, u.node.id);
        if (u.node.sections_list && u.node.sections_list.length > 0) {
            u.node.first_section_url_id = toUrlId(u.node.sections_list[0].title, u.node.sections_list[0].id)
        }
        u.node.sections_list = u.node.sections_list.map((s, sIdx) => {
            s.url_id = toUrlId(s.title, s.id);
            if (s.cards_list && s.cards_list.length > 0) {
                const cUrlId= toUrlId(s.cards_list[0].title, s.cards_list[0].id);
                // Set the first card for the unit, which is the first card of the first section
                if (sIdx === 0) {
                    u.node.first_card_url_id = cUrlId;
                }
                s.first_card_url_id = cUrlId;
                s.letter_index = indexToLetter(sIdx);
            }
            s.cards_list = s.cards_list.map(c => {
                c.url_id = toUrlId(c.title, c.id);
                return c
            });
            return s
        });
        return u.node;
    });
    return gqlResp
}

export async function viewCourseIndex(client: GqlApi, user: IUserData, locale: string, courseGID: string) : Promise<ISPFRouteResponse> {
    let gqlResp = await fetchDetailedCourseForView(client, courseGID)
    console.log(gqlResp)
    return {
        contentTmpl: 'course_index',
        meta: {
            title: gqlResp.meta.title,
            description: gqlResp.meta.description
        },
        data: {
            course: gqlResp
        }
    }
}

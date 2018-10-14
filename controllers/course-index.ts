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
    if (!withEMA) {
        // No more calculations left unless we got the EMAs
        return gqlResp;
    }
    let completedUnits = 0;
    let markedSuggestedUnit = false;
    let unitEMAsSum = 0;
    for (let unit of gqlResp.units) {
        unitEMAsSum += unit.ema;
        const unitComplete = unit.unit_progress_state === 1;
        if (unitComplete) {
            completedUnits++;
            unit.suggestedUnit = false;
        } else if (!markedSuggestedUnit) {
            markedSuggestedUnit = true;
            unit.suggestedUnit = true;
        } else {
            unit.suggestedUnit = false;
        }
        let allSectionsProficient = true;
        let markedCurrentSection = false;
        for (let s = 0; s < unit.sections_list.length; s++) {
            if (unit.sections_list[s].ema > 80) {
                unit.sections_list[s].proficient = true;
            } else {
                unit.sections_list[s].proficient = false;
                allSectionsProficient = false;
            }
            if (
                unit.sections_list[s].ema > 0 &&
                !unit.sections_list[s].proficient &&
                !markedCurrentSection
            ) {
                unit.sections_list[s].current = true;
                markedCurrentSection = true;
            } else {
                unit.sections_list[s].current = false;
            }
            if (s === unit.sections_list.length - 1) {
                if (!allSectionsProficient && !markedCurrentSection) {
                    unit.sections_list[0].current = true;
                }
            }
        }
        unit.examIsNextStep = allSectionsProficient && !unitComplete;
    }
    gqlResp.proficiency = unitEMAsSum === 0 ? 0 : Math.round((unitEMAsSum / gqlResp.units.length)*100)/100;
    gqlResp.courseComplete = completedUnits === gqlResp.units.length;
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

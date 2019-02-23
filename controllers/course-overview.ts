import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {getBadgeURLForTopic} from "../lib/course-badges";
import {toUrlId} from "../utils/url-ids";
import {skillLevelToText} from "../lib/skill-levels";
import {minutesToText} from "../lib/duration";
import {indexToLetter} from "../lib/ordered-lists";
import {fromGlobalId} from "../utils/gql-ids";
import {generateCourse, PlatformOrganization} from "../lib/jsonld";
import {prepareCourseCardForView} from "./course-card";

export const courseOverviewFaqMDGen = (course: any) => `
### Is this course FREE?

Yes, this a 100% free course that you can contribute to on GitHub [here](${course.meta.repo_url})!

`;

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
    gqlResp.nextStep = gqlResp.courseComplete ? null : extractNextStepFromUnits(gqlResp.units);
    return gqlResp
}

function extractNextStepFromUnits(units: any[]) {
    let nextExam = null;
    let nextLearn = null;
    for (let i = 0; i < units.length; i++) {
        if (nextExam && nextLearn) {
            break;
        }
        if (units[i].examIsNextStep) {
            if (!nextExam) {
                nextExam = {
                    unit: units[i]
                }
            }
        }
        if (
            units[i].suggestedUnit ||
            i == units.length - 1
        ) {
            if (units[i].unit_progress_state == -1) {
                if (!nextLearn) {
                    nextLearn = {
                        unit: units[i],
                        section: units[i].sections_list[0],
                        card: units[i].sections_list[0].cards_list[0]
                    }
                }
            }
            for (let s = 0; s < units[i].sections_list.length; s++) {
                let section = units[i].sections_list[s]
                if (
                    section.ema < 80 ||
                    s == units[i].sections_list.length - 1
                ) {
                    for (let c = 0; c < section.cards_list.length; c++) {
                        let card = section.cards_list[c]
                        if (card.ema < 80 || c == section.cards_list.length - 1) {
                            if (!nextLearn) {
                                nextLearn = {
                                    unit: units[i],
                                    section,
                                    card
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return {
        exam: nextExam,
        learn: nextLearn
    }
}

export async function fetchUserCourseEnrollmentForView(client: GqlApi, courseGID: string) {
    const enrollment = await client.getUserCourseRoles();
    return enrollment.findIndex(item => item.node.course_id === fromGlobalId(courseGID).id) > -1;
}

export async function fetchDetailedCourseWithEnrollmentForView(client: GqlApi, courseGID: string) {
    let gqlResp = await fetchDetailedCourseForView(client, courseGID, true);
    gqlResp.isEnrolled = await fetchUserCourseEnrollmentForView(client, courseGID);
    return gqlResp;
}

export async function viewCourseOverview(client: GqlApi, user: IUserData, locale: string, courseGID: string) : Promise<ISPFRouteResponse> {
    let initialCourseGqlResp = await fetchDetailedCourseWithEnrollmentForView(client, courseGID);
    let unitGID = initialCourseGqlResp.units[0].id;
    let sectionGID = initialCourseGqlResp.units[0].sections_list[0].id;
    let cardGID = initialCourseGqlResp.units[0].sections_list[0].cards_list[0].id;
    console.log(await client.getSectionCard(courseGID, unitGID, sectionGID, cardGID));
    let gqlResp = await prepareCourseCardForView(initialCourseGqlResp, await client.getSectionCard(courseGID, unitGID, sectionGID, cardGID), locale, courseGID, unitGID, sectionGID, cardGID);
    return {
        contentTmpl: 'course_card',
        meta: {
            title: gqlResp.meta.title + ' Course',
            description: gqlResp.meta.description,
            image: gqlResp.meta.logo_url,
            jsonld: generateCourse(gqlResp.meta.title, gqlResp.meta.description, gqlResp.meta.logo_url, PlatformOrganization)
        },
        data: {
            course: gqlResp,
            displayOverview: true,
            courseOverviewFaqMD: courseOverviewFaqMDGen(gqlResp)
        }
    }
}

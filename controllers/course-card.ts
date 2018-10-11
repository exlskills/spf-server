import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import { Request, Response } from 'express';
import {getBadgeURLForTopic} from "../lib/course-badges";
import {toUrlId} from "../utils/url-ids";
import {skillLevelToText} from "../lib/skill-levels";
import {minutesToText} from "../lib/duration";
import {fetchDetailedCourseForView} from "./course-index";

export async function viewCourseCard(client: GqlApi, user: IUserData, locale: string, courseGID: string, unitGID: string, sectionGID: string, cardGID: string) : Promise<ISPFRouteResponse> {
    let gqlResp = await fetchDetailedCourseForView(client, courseGID);
    gqlResp.nav = {};
    const curUnitIdx = gqlResp.units.findIndex(u => u.id === unitGID);
    gqlResp.nav.currentUnit = gqlResp.units[curUnitIdx];
    const curSectIdx = gqlResp.nav.currentUnit.sections_list.findIndex(s => s.id === sectionGID);
    gqlResp.nav.currentSection = gqlResp.nav.currentUnit.sections_list[curSectIdx];
    const curCardIdx = gqlResp.nav.currentSection.cards_list.findIndex(c => c.id == cardGID);
    // Setup the card navigation
    gqlResp.nav.nextUnit = gqlResp.nav.currentUnit;
    gqlResp.nav.prevUnit = gqlResp.nav.currentUnit;
    gqlResp.nav.nextSection = gqlResp.nav.currentSection;
    gqlResp.nav.prevSection = gqlResp.nav.currentSection;
    if (curCardIdx+1 < gqlResp.nav.currentSection.cards_list.length) {
        gqlResp.nav.nextCard = gqlResp.nav.currentSection.cards_list[curCardIdx+1];
    } else {
        if (curSectIdx+1 < gqlResp.nav.currentUnit.sections_list.length) {
            // Use the first card of the next section and set next section
            gqlResp.nav.nextSection = gqlResp.nav.currentUnit.sections_list[curSectIdx+1];
            gqlResp.nav.nextCard = gqlResp.nav.nextSection.cards_list[0];
        } else {
            if (curUnitIdx+1 < gqlResp.units.length) {
                // Use the first card of the first section of the next unit
                gqlResp.nav.nextUnit = gqlResp.units[curUnitIdx+1];
                gqlResp.nav.nextSection = gqlResp.nav.nextUnit.sections_list[0];
                gqlResp.nav.nextCard = gqlResp.nav.nextSection.cards_list[0];
            } else {
                // END OF COURSE
                gqlResp.nav.nextUnit = null;
                gqlResp.nav.nextSection = null;
                gqlResp.nav.nextCard = null;
            }
        }
    }
    if (curCardIdx-1 > -1) {
        gqlResp.nav.prevCard = gqlResp.nav.currentSection.cards_list[curCardIdx-1];
    } else {
        if (curSectIdx-1 > -1) {
            // Use the last card of the prev section and set prev section
            gqlResp.nav.prevSection = gqlResp.nav.currentUnit.sections_list[curSectIdx-1];
            gqlResp.nav.prevCard = gqlResp.nav.prevSection.cards_list[gqlResp.nav.prevSection.cards_list.length-1];
        } else {
            if (curUnitIdx-1 > -1) {
                // Use the last card of the last section of the prev unit
                gqlResp.nav.prevUnit = gqlResp.units[curUnitIdx-1];
                gqlResp.nav.prevSection = gqlResp.nav.prevUnit.sections_list[gqlResp.nav.prevUnit.sections_list.length-1];
                gqlResp.nav.prevCard = gqlResp.nav.prevSection.cards_list[gqlResp.nav.prevSection.cards_list-1];
            } else {
                // FIRST CARD OF COURSE
                gqlResp.nav.prevUnit = null;
                gqlResp.nav.prevSection = null;
                gqlResp.nav.prevCard = null;
            }
        }
    }
    gqlResp.card = await client.getSectionCard(courseGID, unitGID, sectionGID, cardGID);
    gqlResp.card['url_id'] = toUrlId(gqlResp.card.title, gqlResp.card.id);
    return {
        contentTmpl: 'course_card',
        meta: {
            title: `${gqlResp.meta.title} | ${gqlResp.card.title}`,
            topbarTitle: `${gqlResp.meta.title}`
        },
        data: {
            course: gqlResp
        }
    }
}

export async function redirectSectionURL(client: GqlApi, user: IUserData, locale: string, courseGID: string, unitGID: string, sectionGID: string): Promise<ISPFRouteResponse> {
    let gqlResp = await fetchDetailedCourseForView(client, courseGID);
    const unit = gqlResp.units.find(u => u.id === unitGID);
    if (!unit) {
        return Promise.reject('unit not found')
    }
    const section = unit.sections_list.find(s => s.id === sectionGID);
    if (!section) {
        return Promise.reject('section not found')
    }
    if (!section.cards_list || section.cards_list.length < 1) {
        return Promise.reject('no valid card found')
    }
    return {
        contentTmpl: 'redirect',
        meta: {
            title: `${gqlResp.meta.title}`,
        },
        redirect: {
            permanent: false,
            url: `/learn-${locale}/courses/${toUrlId(gqlResp.meta.title, courseGID)}/${unit.url_id}/${section.url_id}/${section.cards_list[0].url_id}`
        },
        data: null
    }
}

export async function redirectOldCardURL(client: GqlApi, user: IUserData, locale: string, req: Request) {
    if (!req.params.cardId) {
        return {
            contentTmpl: 'redirect',
            meta: {
                title: `Redirecting ...`,
            },
            redirect: {
                permanent: true,
                url: `/learn-${locale}/courses/${req.params.courseId}/${req.params.unitId}/${req.params.sectionId}`
            },
            data: null
        }
    }
    return {
        contentTmpl: 'redirect',
        meta: {
            title: `Redirecting ...`,
        },
        redirect: {
            permanent: true,
            url: `/learn-${locale}/courses/${req.params.courseId}/${req.params.unitId}/${req.params.sectionId}/${req.params.cardId}`
        },
        data: null
    }
}

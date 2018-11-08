import GqlApi, {CourseListType} from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {getBadgeURLForTopic} from "../lib/course-badges";
import {toUrlId} from "../utils/url-ids";
import {skillLevelToText} from "../lib/skill-levels";
import {minutesToText} from "../lib/duration";
import IDigitalDiploma = GQL.IDigitalDiploma;
import IDigitalDiplomaPlan = GQL.IDigitalDiplomaPlan;
import {fromGlobalId} from "../utils/gql-ids";
import {generateCourse, PlatformOrganization} from "../lib/jsonld";

export async function fetchDigitalDiplomaForView(client: GqlApi, digitalDiplomaGID: string) {
    let digitalDiploma = await client.getDigitalDiploma(digitalDiplomaGID) as IDigitalDiploma & {plans: IDigitalDiplomaPlan & {checkoutItem: any, checkoutItemJSON: string}[], url_id: string, badge_url: string, skill_level_text: string, est_minutes_text: string};
    digitalDiploma.url_id = toUrlId(digitalDiploma.title, digitalDiploma.id);
    digitalDiploma.badge_url = getBadgeURLForTopic(digitalDiploma.primary_topic);
    digitalDiploma.skill_level_text = skillLevelToText(digitalDiploma.skill_level);
    digitalDiploma.est_minutes_text = minutesToText(digitalDiploma.est_minutes);
    for (let plan of digitalDiploma.plans) {
        plan.checkoutItem = {
            category: 'digital_diploma_plan',
            requireShippingInfo: plan.is_shipping_required,
            quantity: 1,
            options: {},
            refs: {
                dd_id: fromGlobalId(digitalDiploma.id).id,
                dd_plan_id: plan._id
            },
            displayUnitCost: plan.cost,
            displayName: `${digitalDiploma.title} - ${plan.title}`
        };
        plan.checkoutItemJSON = JSON.stringify(plan.checkoutItem);
    }
    return digitalDiploma
}

export async function viewDigitalDiplomaIndex(client: GqlApi, user: IUserData, locale: string, digitalDiplomaGID: string) : Promise<ISPFRouteResponse> {
    const digitalDiploma = await fetchDigitalDiplomaForView(client, digitalDiplomaGID);
    let metaDesc =`${digitalDiploma.headline} Kickstart Your Career in Tech Today!`;
    return {
        contentTmpl: 'digital_diploma_index',
        meta: {
            title: digitalDiploma.title,
            description: metaDesc,

            jsonld: generateCourse(digitalDiploma.title, metaDesc, PlatformOrganization)
        },
        data: {
            digitalDiploma
        }
    }
}

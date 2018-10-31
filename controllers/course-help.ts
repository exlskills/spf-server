import GqlApi from "../lib/gql-api";
import {IUserData} from "../lib/jwt";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {fetchDetailedCourseForView} from "./course-index";
import config from '../config';

const helpFaqMD = `

## Who are the EXLskills Instructors?

All EXLskills instructors are verified professionals in their areas of expertise with proven work experience. All EXLskills instructors currently teach in English.

## How do I connect with my instructor?

After your deposit is processed and the booking is confirmed, the instructor will reach out to you directly via the chat icon at the bottom right corner of EXLskills.com and via email. From there, they will help to coordinate a live phone call, screenshare, or live whiteboarding session with you!

## Will I be able to get a refund?

Yes! We are committed to the value of our live online training, and thus we offer risk-free refunds if you are not satisfied with your lesson. We also guarantee a full refund and extra $5 credit in the unlikely event your instructor is unable to fulfill their requirements or must cancel the session.

## Can my employer purchase this on my behalf?

Yes. Please have your employer contact support@exlskills.com with your request, and the EXLskills support team will arrange the purchase and specific terms.

## Have more questions?

If you have any questions at all regarding EXLskills Instructors, please use the chat icon in the bottom right of the screen to contact our support team. You may also check out our help center [here](${config.templateConstants.helpBaseURL}) to see if your question has already been answered.

`;

export async function viewCourseHelp(client: GqlApi, user: IUserData, locale: string, courseGID: string) : Promise<ISPFRouteResponse> {
    const c = await fetchDetailedCourseForView(client, courseGID);
    return {
        contentTmpl: 'course_help',
        meta: {
            title: c.meta.title,
            description: `Get live personalized help studying for the ${c.meta.title} course`
        },
        data: {
            course: c,
            helpFaqMD
        }
    }
}

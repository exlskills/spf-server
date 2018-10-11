import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {getBadgeURLForTopic} from "../lib/course-badges";
import {toUrlId} from "../utils/url-ids";
import {skillLevelToText} from "../lib/skill-levels";
import {minutesToText} from "../lib/duration";

export async function viewCourses(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    let gqlEdges = await client.getAllCourses('relevant');
    let courses: any[] = [];
    for (let edge of gqlEdges) {
        let course = edge.node as any;
        course.url_id = toUrlId(course.title, course.id);
        course.badge_url = getBadgeURLForTopic(course.primary_topic);
        course.skill_level_text = skillLevelToText(course.skill_level);
        course.est_minutes_text = minutesToText(course.est_minutes);
        course.has_live_mode = course.delivery_methods.includes('live')
        courses.push(course)
    }
    console.log(courses)
    return {
        pageMenu: [

        ],
        contentTmpl: 'courses',
        meta: {
            title: 'Courses',
            description: 'Your EXLskills courses'
        },
        data: {
            courses
        }
    }
}

import GqlApi, {CourseListType} from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {getBadgeURLForTopic} from "../lib/course-badges";
import {toUrlId} from "../utils/url-ids";
import {skillLevelToText} from "../lib/skill-levels";
import {minutesToText} from "../lib/duration";
import config from '../config'
import {generateItemList} from "../lib/jsonld";
import {getLocalizedTopicBySlug, getCourseTopicSlugs} from "../course_topics";

export async function fetchCourseListForView(client: GqlApi, listType: CourseListType, topic?: string) {
    let gqlEdges = await client.getAllCourses(listType, topic);
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
    return courses
}

export async function viewCourses(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    const courses = await fetchCourseListForView(client, 'relevant');
    return {
        contentTmpl: 'courses',
        meta: {
            title: 'Courses',
            description: 'Learn for Free with EXLskills\' Open Online Courses',
            jsonld: [generateItemList(...courses.map(c => `${config.clientBaseURL}/learn-en/courses/${c.url_id}`))]
        },
        data: {
            courses
        }
    }
}

export async function viewCoursesTopicPage(client: GqlApi, user: IUserData, locale: string, slug: string) : Promise<ISPFRouteResponse> {
    const topic = getLocalizedTopicBySlug(slug, locale);
    const courses = await fetchCourseListForView(client, 'relevant', topic.primary_topic);
    return {
        contentTmpl: 'courses',
        meta: {
            title: topic.meta.title,
            description: topic.meta.description,
            jsonld: [generateItemList(...courses.map(c => `${config.clientBaseURL}/learn-en/courses/${c.url_id}`))]
        },
        data: {
            topic,
            courses
        }
    }
}

export async function serveCoursesSitemap(req, res) {
    const locale = req.params.locale ? req.params.locale : 'en';
    res.setHeader('Content-Type', 'application/xml');
    let urlElements = getCourseTopicSlugs().map((slug) => `<url>
      <loc>${config.clientBaseURL}/learn-${locale}/courses/${slug}</loc>
      <changefreq>weekly</changefreq>
   </url>`);
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   ${urlElements.join('\n')}
</urlset> 
`)
}

import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {fetchCourseListForView} from "./courses";

export async function viewMarketingIndex(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    const relevant = (await fetchCourseListForView(client, 'relevant')).slice(0,4);
    return {
        contentTmpl: 'marketing_index',
        layout: 'marketing',
        meta: {
            title: 'Learn high-paying tech skills for free',
            description: '1 million+ learners have already joined EXLskills, the smartest way to learn high-paying tech skills! Start learning Python, Data Science, Machine Learning, Java, JavaScript, AI, and more for FREE today!'
        },
        data: {
            courses: {
                relevant
            },
            marketing: [
                { title: "100% Free Courses",
                    subtitle: "All of our courses are completely free and community-maintained!",
                    image: "https://cdn-mktg.exlskills.com/site-assets/_index/ico-color-opensource.svg"
                },
                { title: "Live Help & Feedback",
                    subtitle: "Learn by doing and get on-demand instruction via chat and video!",
                    image: "https://cdn-mktg.exlskills.com/site-assets/_index/ico-color-guided.svg"
                },
                { title: "Recognized Certifications",
                    subtitle: "Our unique guided projects and certifications get you noticed by employers!",
                    image: "https://cdn-mktg.exlskills.com/site-assets/_index/ico-color-validated.svg"
                },
            ]
        }
    }
}

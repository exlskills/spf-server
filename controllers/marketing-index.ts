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
            description: 'The smartest way to learn high-paying tech skills. Join the thousands of professionals who use EXLskills every day! Start Learning for FREE today!'
        },
        data: {
            courses: {
                relevant
            },
            marketing: [
                { title: "100% Free Courses",
                    subtitle: "All of our courses are completely free and community-maintained!",
                    image: "https://s3-us-west-2.amazonaws.com/exlskills-mktg-assets/site-assets/_index/ico-color-opensource.svg"
                },
                { title: "Live Help & Feedback",
                    subtitle: "Learn by doing and get on-demand instruction via chat and video!",
                    image: "https://s3-us-west-2.amazonaws.com/exlskills-mktg-assets/site-assets/_index/ico-color-guided.svg"
                },
                { title: "Recognized Certifications",
                    subtitle: "Our unique guided projects and certifications get you noticed by employers!",
                    image: "https://s3-us-west-2.amazonaws.com/exlskills-mktg-assets/site-assets/_index/ico-color-validated.svg"
                },
            ]
        }
    }
}

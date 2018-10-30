import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {fetchCourseListForView} from "./courses";

export async function viewMarketing(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    const relevant = await fetchCourseListForView(client, 'relevant');
    console.log('RELEVANT COURSES', relevant)
    return {
        contentTmpl: 'marketing-index',
        layout: 'marketing',
        meta: {
            title: 'Home'
        },
        data: {
            courses: {
                relevant
            },
            marketing: [
              { title: "Free & Open-source content from Github",
                subtitle: "100% of our content is free and open-source (hosted on Github)",
                image: "learn-en/assets/img/marketing/_index/ico-color-opensource.svg"
              },
              { title: "Guided, intelligent process with chatbot help",
                subtitle: "Intelligent IDE (via EXLcode) fixes mistakes in your code and helps you learn by doing",
                image: "learn-en/assets/img/marketing/_index/ico-color-guided.svg"
              },
              { title: "Expert help instantly",
                subtitle: "Need help? Ask an expert instantly and receive one-on-one help",
                image: "learn-en/assets/img/marketing/_index/ico-color-validated.svg"
              },
            ]
        }
    }
}

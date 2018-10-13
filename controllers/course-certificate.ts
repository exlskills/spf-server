import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {fetchDetailedCourseForView} from "./course-index";

export async function viewCourseCertificate(client: GqlApi, user: IUserData, locale: string, courseGID: string) : Promise<ISPFRouteResponse> {
    let gqlResp = await fetchDetailedCourseForView(client, courseGID)
    console.log(gqlResp)
    let checkoutItem = {
        category: 'course_cert',
        quantity: 1,
        options: {
            certificate_type: 'verified'
        },
        refs: {
            course_id: 'ap_java'
        },
        displayUnitCost: 200,
        displayName: 'AP® Computer Science A (Java) Verified Certificate'
    };
    return {
        contentTmpl: 'course_certificate',
        meta: {
            title: gqlResp.meta.title,
            description: gqlResp.meta.description
        },
        data: {
            course: gqlResp,
            checkoutItem,
            checkoutItemJSON: JSON.stringify(checkoutItem)
        }
    }
}

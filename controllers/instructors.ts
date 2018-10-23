import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {toUrlId} from "../utils/url-ids";
import IUser = GQL.IUser;

export async function fetchInstructorListForView(client: GqlApi) {
    let gqlEdges = await client.getAllInstructors();
    let instructors: any[] = [];
    for (let edge of gqlEdges) {
        let instructor = edge.node as any;
        instructor.url_id = toUrlId(instructor.full_name, instructor.id);
        instructors.push(instructor)
    }
    return instructors
}

export async function fetchInstructorForView(client: GqlApi, instructorGId: string) {
    let instructor = await client.getInstructor(instructorGId) as IUser & { url_id: string };
    console.log(instructor);
    instructor.url_id = toUrlId(instructor.full_name, instructor.id);
    return instructor;
}

export async function viewInstructors(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    const instructors = await fetchInstructorListForView(client);
    return {
        contentTmpl: 'instructors',
        meta: {
            title: 'Instructors',
            description: 'EXLskills Instructors'
        },
        data: {
            instructors
        }
    }
}

export async function viewInstructor(client: GqlApi, user: IUserData, locale: string, instructorGID: string) : Promise<ISPFRouteResponse> {
    const instructor = await fetchInstructorForView(client, instructorGID);
    return {
        contentTmpl: 'instructor_index',
        meta: {
            title: `${instructor.full_name} (Verified)`,
            description: `${instructor.full_name} EXLskills Verified Instructor`
        },
        data: {
            instructor
        }
    }
}

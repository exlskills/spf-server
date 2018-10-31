import GqlApi, {CourseListType} from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {fetchDigitalDiplomaListForView} from "./digital-diplomas";

export async function viewProjects(client: GqlApi, user: IUserData, locale: string) : Promise<ISPFRouteResponse> {
    let projects = await fetchDigitalDiplomaListForView(client);
    projects = projects.filter(dd => dd.is_project);
    return {
        contentTmpl: 'projects',
        meta: {
            title: 'Guided Projects',
            description: 'EXLskills\' Guided Projects Help You Learn by Doing to Kickstart Your Career in Tech'
        },
        data: {
            projects
        }
    }
}

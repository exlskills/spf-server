import {IPageMenuList} from "./page-menu";
import {IUserData} from "./jwt";

export interface ISPFRouteMeta {
    title: string
    fullTitle?: string
    description?: string
}

export interface ISPFRouteResponse {
    pageMenu?: IPageMenuList
    contentTmpl: string
    meta: ISPFRouteMeta
    data: any
    user?: IUserData
    config?: any
    intercomHash?: string
    route?: {
        path: string
        locale: string
        suffix: string
        params: any
    }
}

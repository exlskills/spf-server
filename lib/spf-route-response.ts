import {IPageMenuList} from "./page-menu";
import {IUserData} from "./jwt";

export interface ISPFRouteMeta {
    title: string
    topbarTitle?: string
    fullTitle?: string
    description?: string
}

export interface ISPFRouteResponse {
    pageMenu?: IPageMenuList
    contentTmpl: string
    meta: ISPFRouteMeta
    data: any
    redirect?: {
        permanent: boolean
        url: string
    }
    user?: IUserData
    config?: any
    intercomHash?: string
    route?: {
        path: string
        locale: string
        suffix: string
        params: any
        referer: string
        referrer: string
        url: string
    }
}

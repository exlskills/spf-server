import {IPageMenuList} from "./page-menu";
import {IUserData} from "./jwt";

export interface ISPFRouteMeta {
    title: string
    topbarTitle?: string
    fullTitle?: string
    description?: string
    amphtml?: string
    amp?: {
        canon_link: string
    }
}

export interface ISPFRouteResponse {
    contentTmpl: string
    meta: ISPFRouteMeta
    data: any
    redirect?: {
        permanent: boolean
        url: string
    }
    amp?: boolean
    user?: IUserData
    config?: any
    intercomHash?: string
    layout?: string
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

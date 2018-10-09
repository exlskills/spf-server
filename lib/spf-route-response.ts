import {IPageMenuList} from "./page-menu";

export interface ISPFRouteMeta {
    title: string
    description?: string
}

export interface ISPFRouteResponse {
    pageMenu?: IPageMenuList
    contentTmpl: string
    meta: ISPFRouteMeta
    data: any
}

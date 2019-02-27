import {IUserData} from "./jwt";
import {IJSONLD} from "./jsonld";

export interface ISPFRouteMeta {
    title: string
    altUrls?: any
    topbarTitle?: string
    fullTitle?: string
    description?: string
    image?: string
    amphtml?: string
    og?: {
        title: string
        description: string
        url: string
        image: string
    }
    twitter?: {
        title: string
        description: string
        image: string
        imageAlt: string
    }
    jsonld?: IJSONLD | IJSONLD[]
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
    mobile?: boolean
    user?: IUserData
    config?: any
    layout?: string
    route?: {
        path: string
        locale: string
        suffix: string
        params: any
        referer: string
        referrer: string
        url: string
        canonicalUrl: string
        themeMode: string
    }
}

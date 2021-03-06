import config from '../config'

export interface IJSONLD {
    marshalJSONLD: () => string
}

export type IOrganization = IJSONLD
export type ICourse = IJSONLD
export type ILogo = IJSONLD
export type IBreadcrumbList = IJSONLD
export type IItemList = IJSONLD

export const toJSONLD = (obj: any) => {
    return JSON.stringify(obj)
};

export const generateOrganiztion = (name: string, description: string, legalName?: string, url?: string, logoUrl?: string): IOrganization => {
    let org = {
        "@context": "http://schema.org",
        '@type': 'Organization',
        name,
        description,
        legalName,
        url,
        sameAs: url,
        logo: logoUrl,
    } as any;
    org.marshalJSONLD = () => toJSONLD(org);
    return org;
};

export const PlatformOrganization = generateOrganiztion("EXLskills", "The smartest way to learn high-paying tech skills!", "EXL Inc.", "https://exlskills.com", "https://cdn-misc-assets.exlskills.com/atom512blue.png");

export const generateCourse = (name: string, description: string, imageUrl: string, provider: IOrganization): ICourse => {
    let course = {
        "@context": "http://schema.org",
        '@type': 'Course',
        name,
        description,
        provider,
        image: imageUrl
    } as any;
    course.marshalJSONLD = () => toJSONLD(course);
    return course;
};

export const generateArticle = (headline: string, description: string | undefined, imageUrl: string, datePublished: string, authorPublisher: IOrganization): ICourse => {
    let article = {
        "@context": "http://schema.org",
        '@type': 'Article',
        headline,
        description,
        datePublished,
        author: authorPublisher,
        publisher: authorPublisher,
        image: imageUrl
    } as any;
    article.marshalJSONLD = () => toJSONLD(article);
    return article;
};

export const generateBreadcrumbList = (...listItems: {name: string, url: string}[]): IBreadcrumbList => {
    let bcList = {
        "@context": "http://schema.org",
        '@type': 'BreadcrumbList',
        "itemListElement": listItems.map((item, idx) => {
            return {
                "@type": "ListItem",
                "position": idx+1,
                "name": item.name,
                "item": item.url
            }
        })
    } as any;
    bcList.marshalJSONLD = () => toJSONLD(bcList);
    return bcList;
};

export const generateItemList = (...listItems: string[]): IItemList => {
    let iList = {
        "@context": "http://schema.org",
        '@type': 'ItemList',
        "itemListElement": listItems.map((url, idx) => {
            return {
                "@type": "ListItem",
                "position": idx+1,
                "url": url
            }
        })
    } as any;
    iList.marshalJSONLD = () => toJSONLD(iList);
    return iList;
};

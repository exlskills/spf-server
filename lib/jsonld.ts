import config from '../config'

export interface IJSONLD {
    marshalJSONLD: () => string
}

export type IOrganization = IJSONLD
export type ICourse = IJSONLD
export type ILogo = IJSONLD

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

export const PlatformOrganization = generateOrganiztion("EXLskills", "The smartest way to learn high-paying tech skills!", "EXL Inc.", "https://exlskills.com", "https://s3-us-west-2.amazonaws.com/exlskills-misc-assets/atom512blue.png");

export const generateCourse = (name: string, description: string, provider: IOrganization): ICourse => {
    let course = {
        '@type': 'Course',
        name,
        description,
        provider
    } as any;
    course.marshalJSONLD = () => toJSONLD(course);
    return course;
};

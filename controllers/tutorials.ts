import GqlApi from "../lib/gql-api";
import {IUserData} from "../lib/jwt";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {generateItemList} from "../lib/jsonld";
import config from "../config";
import {getLocalizedTutorialBySlug, getTutorialSlugs} from "../tutorials";

export async function viewTutorialPage(client: GqlApi, user: IUserData, locale: string, slug: string) : Promise<ISPFRouteResponse> {
    const tutorial = getLocalizedTutorialBySlug(slug, locale);
    return {
        contentTmpl: 'tutorial',
        meta: {
            title: tutorial.title,
            description: tutorial.description,
            // TODO setup jsonld for tutorials jsonld: [generateItemList(...courses.map(c => `${config.clientBaseURL}/learn-en/courses/${c.url_id}`))]
        },
        data: {
            tutorial
        }
    }
}

export async function serveTutorialsSitemap(req, res) {
    const locale = req.params.locale ? req.params.locale : 'en';
    res.setHeader('Content-Type', 'application/xml');
    let urlElements = getTutorialSlugs().map((slug) => `<url>
      <loc>${config.clientBaseURL}/learn-${locale}/tutorials/${slug}</loc>
      <changefreq>weekly</changefreq>
   </url>`);
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   ${urlElements.join('\n')}
</urlset> 
`)
}

import config from "../config";

const sitemapLocationTmpls = [
    `${config.clientBaseURL}/learn-:locale/courses-sitemap.xml`
];

export function serveSitemapIndex(req, res) {
    let urlElements = [] as string[];
    config.locales.forEach((locale) => {
        sitemapLocationTmpls.forEach((locTmpl) => {
            urlElements.push(`<sitemap>
    <loc>${locTmpl.replace(':locale', locale)}</loc>
 </sitemap>`);
        });
    });
    res.setHeader('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.google.com/schemas/sitemap/0.84">
  ${urlElements.join('\n')}
</sitemapindex>`);
}

import config from "../config";
import logger from "../utils/logger";

export function genAltUrls(urlPath: string, locales?: Array<string>): any {
    logger.debug(`in genAltUrls ` + urlPath);
    const altUrls = {};

    if (urlPath.startsWith(`/${config.rootUrlPrefix}`)) {
        if (!locales) {
            locales = config.locales;
        }
        const urlSuffix = urlPath.substr(urlPath.indexOf('/', 1));
        for (let locale of locales) {
            altUrls[locale] = `${config.clientBaseURL}/${config.rootUrlPrefix}-${locale}${urlSuffix}`;
            // logger.debug(`locale ` + locale + ` altUrls ` + altUrls[locale]);
        }
    }
    return altUrls;
}
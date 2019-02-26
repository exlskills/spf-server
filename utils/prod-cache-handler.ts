import * as fs from 'fs-extra';
import logger from "../utils/logger";
import config from '../config'

const global_cache_object = {};

export const readFromProductionCacheOrFile = async (cacheObjElementId: string, sourceFilePath: string) => {

    if (process.env.NODE_ENV === "production" || config.activateTestMode) {
        if (global_cache_object[cacheObjElementId]) {
            logger.debug(`Returning value from the cache with id ` + cacheObjElementId);
            return global_cache_object[cacheObjElementId];
        }
        logger.debug(`Value is not in cache, getting from the file. Id ` + cacheObjElementId);
    }

    const objVal = await fs.readFile(sourceFilePath, {encoding: 'utf8'})

    if (process.env.NODE_ENV === "production" || config.activateTestMode) {
        logger.debug(`Storing value into the cache with id ` + cacheObjElementId);
        global_cache_object[cacheObjElementId] = objVal;
    }

    return objVal;
}

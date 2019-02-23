import * as fs from 'fs-extra';
import logger from "../utils/logger";
import * as path from "path";
import config from "../config";

const global_cache_object = {};

export const getObjectFromCache = async (id: string, rawGetSource: any, mode: string ) => {

    if (mode !== "production"){
        if (global_cache_object["id"]){
            logger.debug(`Returning from cache id ` + id);
            return global_cache_object["id"];
        }
    }

    logger.debug(`Value not in cache. Getting via raw`);
    const objVal = await fs.readFile(rawGetSource, {encoding: 'utf8'})

    if (mode !== "production"){
        logger.debug(`Storing into cache id ` + id);
        global_cache_object["id"] = objVal;
    }

    return objVal;
}
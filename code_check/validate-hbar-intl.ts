// ts-node code_check/validate-hbar-intl.ts

import {join, extname} from 'path'
import * as fs from 'fs-extra'
import logger from '../utils/logger';
import {dataIntl} from "../i18n"
import config from '../config'

startRun("../views");

async function startRun(dir) {

    // logger.debug(`path __dirname ` + __dirname);

    let allFiles;
    try {
        allFiles = await rreaddir(join(__dirname, dir));
    } catch (err) {
        logger.error("While reading files " + err);
        return;
    }

    // logger.debug(allFiles);

    const problems = [];

    for (let locale of config.locales) {
        logger.debug(locale);
        try {
            for (let file of allFiles) {
                const fStat = await fs.stat(file);
                if (fStat.isDirectory() || extname(file) != '.hbs') {
                    continue;
                }

                logger.debug(file);

                const fContent = await fs.readFile(file);
                const fileProb = await validateIntlGet(fContent, locale);
                if (fileProb.length > 0) {
                    problems.push(fileProb, locale);
                }
            }
        } catch (err) {
            logger.error("While processing files " + err);
        }
    }

    if (problems.length > 0) {
        logger.info("Issues Found:");
        logger.info(problems);
    } else {
        logger.info("No Issues Found");
    }

}

async function rreaddir(dir, allFiles = []) {
    const files = (await fs.readdir(dir)).map(f => join(dir, f));
    allFiles.push(...files);
    await Promise.all(files.map(async f => (
        (await fs.stat(f)).isDirectory() && rreaddir(f, allFiles)
    )));
    return allFiles
}

async function validateIntlGet(fContent, locale) {
    const fileProb = [];
    const allStartPos = indexes(fContent, '{{intlGet ', 0, false);
    // logger.debug(allStartPos);
    for (let ipos of allStartPos) {
        let intlData = dataIntl[locale];
        //logger.debug(ipos);
        const closingPos = indexes(fContent, '}}', ipos, true);
        const msgPointer = fContent.toString().substring(ipos + 9, closingPos).trim().replace(/['"]+/g, '');
        //logger.debug(msgPointer);
        const pathParts = msgPointer.split('.');
        //logger.debug(pathParts);
        let obj;
        try {
            for (let i = 0, len = pathParts.length; i < len; i++) {
                obj = intlData = intlData[pathParts[i]];
            }
        } finally {
            if (obj === undefined) {
                logger.debug(msgPointer + " undefined");
                fileProb.push(msgPointer);
            } else {
                // logger.debug("ok");
            }
        }
    }
    return fileProb;
}

function indexes(text, subText, startPos, findOne) {
    var _source = text;
    var _find = subText;
    var result = [];
    for (var i = startPos; i < _source.length;) {
        if (_source.toString().substring(i, i + _find.length) == _find) {
            result.push(i);
            if (findOne) {
                break;
            }
            i += _find.length;  // found a subText, skip to next position
        } else {
            i += 1;
        }
    }
    return result;
}
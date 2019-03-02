import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import logger from '../utils/logger';

const tutorialsBaseDir = path.join(__dirname, '../tutorials_content');
let loadCompleted = false;
const tutorialsBySlug = {};

function sanitizeTutorial(t, filePath) {
    if (!t) {
        throw `Invalid/missing topic yaml for ${filePath}`
    }
    if (!t.primary_topic) {
        throw `Invalid/missing primary_topic for ${filePath}`
    }
    if (!t.url_slug) {
        throw `Missing url_slug for ${filePath}`
    }
    if (encodeURIComponent(t.url_slug) != t.url_slug) {
        throw `Invalid url_slug for ${filePath}`
    }
    t.default_locale = t.default_locale ? t.default_locale : 'en';
}

function checkLoadedF() {
    if (!loadCompleted) {
        throw 'Unable to get course topic until course topics have been loaded'
    }
}

export function loadTutorials(forceReload?: boolean) {
    if (loadCompleted && !forceReload) {
        return;
    }
    logger.debug("Loading tutorials ...");
    let filesToLoad = [];
    fs.readdirSync(tutorialsBaseDir).forEach(file => {
        if (file.endsWith('.md')) {
            filesToLoad.push(path.join(tutorialsBaseDir, file));
        }
    });
    for (let i = 0; i < filesToLoad.length; i++) {
        logger.debug(`Loading tutorial from: ${filesToLoad[i]} ...`);
        const docParts = fs.readFileSync(filesToLoad[i], 'utf8').split('---\n', 3).slice(1);
        let tutorial = yaml.safeLoad(docParts[0]);
        tutorial.content_md = docParts[1];
        sanitizeTutorial(tutorial, filesToLoad[i]);
        if (tutorialsBySlug[tutorial.url_slug] && tutorialsBySlug[tutorial.url_slug][tutorial.locale]) {
            throw `Tutorial url_slug+locale duplicate for ${tutorial.url_slug}`;
        }
        if (!tutorialsBySlug[tutorial.url_slug]) {
            tutorialsBySlug[tutorial.url_slug] = {}
        }
        tutorialsBySlug[tutorial.url_slug][tutorial.locale] = tutorial;
        logger.debug(`Successfully loaded tutorial for slug[${tutorial.locale}]: ${filesToLoad[i]} from: ${filesToLoad[i]}`);
    }
    loadCompleted = true;
}

export function getLocalizedTutorialBySlug(slug: string, locale?: string) {
    checkLoadedF();
    if (!tutorialsBySlug[slug]) {
        return null
    }
    if (!locale || !tutorialsBySlug[slug][locale]) {
        if (tutorialsBySlug[slug]['en']) {
            locale = 'en'
        } else {
            locale = Object.keys(tutorialsBySlug[slug])[0]
        }
    }
    return tutorialsBySlug[slug][locale];
}

export function getTutorialSlugs() {
    checkLoadedF();
    return Object.keys(tutorialsBySlug)
}

export function getRawTutorialBySlug(slug: string) {
    checkLoadedF();
    return tutorialsBySlug[slug]
}

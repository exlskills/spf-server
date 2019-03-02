import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import logger from '../utils/logger';

const yamlBaseDir = path.join(__dirname, '../course_topics_content');
let loadCompleted = false;
const courseTopicsBySlug = {};

function sanitizeTopic(t, filePath) {
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
        console.error(new Error('crap'));
        throw 'Unable to get course topic until course topics have been loaded'
    }
}

export function loadTopics(forceReload?: boolean) {
    if (loadCompleted && !forceReload) {
        return;
    }
    logger.debug("Loading course topics ...");
    let filesToLoad = [];
    fs.readdirSync(yamlBaseDir).forEach(file => {
        if (file.endsWith('.yaml')) {
            filesToLoad.push(path.join(yamlBaseDir, file));
        }
    });
    for (let i = 0; i < filesToLoad.length; i++) {
        logger.debug(`Loading course topic from: ${filesToLoad[i]} ...`);
        let topic = yaml.safeLoad(fs.readFileSync(filesToLoad[i], 'utf8'));
        sanitizeTopic(topic, filesToLoad[i]);
        if (courseTopicsBySlug[topic.url_slug]) {
            throw `Course topic url_slug duplicate for ${topic.url_slug}`;
        }
        courseTopicsBySlug[topic.url_slug] = topic;
        logger.debug(`Successfully loaded course topic for slug: ${filesToLoad[i]} from: ${filesToLoad[i]}`);
    }
    loadCompleted = true;
}

export function getLocalizedTopicBySlug(slug: string, locale?: string) {
    checkLoadedF();
    if (!courseTopicsBySlug[slug]) {
        return null
    }
    const ct = courseTopicsBySlug[slug];
    if (!locale || !ct[locale]) {
        locale = ct.default_locale;
    }
    return {
        locale,
        primary_topic: ct.primary_topic,
        url_slug: ct.url_slug,
        meta: ct[locale].meta,
        info_md: ct[locale].info_md
    }
}

export function getSlugs() {
    checkLoadedF();
    return Object.keys(courseTopicsBySlug)
}

export function getRawTopicBySlug(slug: string) {
    checkLoadedF();
    return courseTopicsBySlug[slug]
}

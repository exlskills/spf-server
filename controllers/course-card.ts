import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import { Request } from 'express';
import {toUrlId} from "../utils/url-ids";
import {fetchDetailedCourseForView, fetchDetailedCourseWithEnrollmentForView} from "./course-overview";
import IQuestion = GQL.IQuestion;
import config from '../config';
import {uuidv4} from "../utils/uuid";
import * as showdown from 'showdown';
import * as url from 'url';
import * as cheerio from 'cheerio';
import {generateArticle, PlatformOrganization} from "../lib/jsonld";

const mdToHTML = new showdown.Converter();
mdToHTML.setFlavor('github');
mdToHTML.setOption('tables', true);
mdToHTML.setOption('tasklists', true);
mdToHTML.setOption('ghCompatibleHeaderId', true);

export function setupQuizQuestionForView(question: IQuestion, nav: any) {
    if (!question) {
        return;
    }
    (question as any).nav = nav;
    if (question.question_type === 'WSCQ') {
        (question.data as any).workspace_id = uuidv4();
        let workspace = {
            files: JSON.parse(question.data.tmpl_files),
            name: 'EXLskills',
            id: (question.data as any).workspace_id,
            environmentKey: question.data.environment_key
        };
        (question.data as any).editor_iframe_url = `${config.templateConstants.codeQuestionEditorURL}/?embedded=true&workspace=${encodeURIComponent(JSON.stringify(workspace))}`;
    }
}

export function renderFullCardContentHTML(content: string) {
    // console.log(content);
    const $ = cheerio.load(mdToHTML.makeHtml(content));
    cardFullHTMLJavaSetup($);
    cardFullHTMLJavascriptSetup($);
    let hasPythonCode = cardFullHTMLPythonSetup($);
    if (!hasPythonCode && $('div[data-datacamp-exercise]').length) {
        hasPythonCode = true;
    }
    $('table').addClass('table');
    $('table thead tr th').addClass('col');
    let html = $.html();
    if (hasPythonCode) {
        html += `
            <script type="text/javascript" src="//cdn.datacamp.com/dcl-react.js.gz"></script>
            <script>$(function() { initAddedDCLightExercises(); })</script>
        `;
    }
    return html;
}

function recurseWorkspaceFilePath(curFiles: Array<any>, curPath: string, file: any) {
    if (!file.isDir) {
        curFiles.push({
            path: `${curPath}/${file.name}`,
            contents: file.contents
        });
        return curFiles
    } else if (!file.children || file.children.length < 1) {
        return curFiles
    }
    Object.keys(file.children).forEach((childFileKey) => {
        recurseWorkspaceFilePath(curFiles, `${curPath}/${file.name}`, file.children[childFileKey])
    });
    return curFiles
};

function cardFullHTMLJavaSetup($: CheerioStatic) {
    $('iframe').filter((index, element) => {
        return !!$(element).attr('src').match(/https:\/\/exlcode\.com\/repl.*/gm);
    }).each((index, element) => {
        let srcUrl = new url.URL($(element).attr('src'));
        let wspc = JSON.parse(srcUrl.searchParams.get('workspace'));
        if (!wspc || !wspc.files) {
            return
        }
        try {
            let javaFiles = wspc.files.src.children.main.children.java.children.exlcode.children;
            let fileNames = Object.keys(javaFiles);
            const contentId = uuidv4();
            let replacement = $(`<div><div><button id="btn-${contentId}" class="btn btn-sm btn-secondary mb-2"><span class="fe fe-play"></span> Run &amp; Edit in Smart IDE (Beta)</button></div><div id="static-${contentId}"></div><div id="iframe-${contentId}"></div><script>
$(function() {
    var beenFlipped = false;
    var iframeShowing = false;
    var iframeHTML = '${$(element)}';
    var flipBtn = $('#btn-${contentId}');
    var staticWrapper = $('#static-${contentId}');
    var iframeWrapper = $('#iframe-${contentId}');
    var flipFunc = function() {
        if (!beenFlipped) {
            staticWrapper.hide();
            iframeWrapper.html(iframeHTML);
            flipBtn.removeClass('mb-2');
            beenFlipped = true;
        } else if (iframeShowing) {
            staticWrapper.show();
            iframeWrapper.hide();
            flipBtn.addClass('mb-2');
        } else {
            staticWrapper.hide();
            iframeWrapper.show();
            flipBtn.removeClass('mb-2');
        }
        iframeShowing = !iframeShowing;
        localStorage.setItem('exlcode_java_ide_beta_pref_0', iframeShowing ? 'smart_beta' : 'static');
        if (iframeShowing) {
            flipBtn.html('<span class="fe fe-wifi-off"></span> View as Plain Text');
        } else {
            flipBtn.html('<span class="fe fe-play"></span> Run &amp; Edit in Smart IDE (Beta)');
        }
    };
    flipBtn.click(flipFunc);
    if (localStorage.getItem('exlcode_java_ide_beta_pref_0') === 'smart_beta') {
        flipFunc();
    }
});
</script></div>`);
            let displayFiles = [];
            fileNames.forEach((key) => {
                displayFiles.push(...recurseWorkspaceFilePath([], '', javaFiles[key]))
            });
            displayFiles.forEach((df) => {
                replacement.find(`#static-${contentId}`).append(`<div style="font-size: 16px;font-weight: 500;">${df.path.substr(1)}</div><pre><code class="java language-java">${df.contents}</code></pre>`)
            });
            $(element).replaceWith(replacement);
        } catch (err) {
            // Invalid workspace
            return
        }
    });
}

function cardFullHTMLPythonSetup($: CheerioStatic) {
    let hasPythonCode = false;
    $('pre code.python').each(function() {
        hasPythonCode = true;
        let self = $(this);
        self.replaceWith(`
            <div data-datacamp-exercise data-lang="python">
                <code data-type="sample-code">
                    ${self.html()}
                </code>
            </div>
        `);
    });
    return hasPythonCode;
}

function cardFullHTMLJavascriptSetup($: CheerioStatic) {
    let hasJavascriptCode = false;
    $('div.js-cp-boilerplate').each(function() {
        hasJavascriptCode = true;
        let self = $(this);
        self.replaceWith(`
            <div  class="js-cp-example">
                <iframe height="400px" width="100%" src="https://cp-editor.exlskills.com/"></iframe>
                <script>
                    window.addEventListener('message', ({ data = {}, source }) => {
                        if (data.type === 'codepan-ready') {
                            source.postMessage({
                                type: 'codepan-set-boilerplate', 
                                boilerplate: htmlDecode(${JSON.stringify(self.html())})
                            }, '*');
                        }
                    })
                </script>
            </div>
        `);
    });
    return hasJavascriptCode;
}

export async function viewCourseCard(client: GqlApi, user: IUserData, locale: string, req: Request, courseGID: string, unitGID: string, sectionGID: string, cardGID: string) : Promise<ISPFRouteResponse> {
    let gqlResp = await fetchDetailedCourseWithEnrollmentForView(client, courseGID);
    gqlResp.nav = {
        locale,
        courseUrlId: gqlResp.meta.url_id
    };
    const curUnitIdx = gqlResp.units.findIndex(u => u.id === unitGID);
    gqlResp.nav.currentUnit = gqlResp.units[curUnitIdx];
    const curSectIdx = gqlResp.nav.currentUnit.sections_list.findIndex(s => s.id === sectionGID);
    gqlResp.nav.currentSection = gqlResp.nav.currentUnit.sections_list[curSectIdx];
    const curCardIdx = gqlResp.nav.currentSection.cards_list.findIndex(c => c.id == cardGID);
    gqlResp.nav.pages = {
        all: [] as {title: string, path: string}[],
        currentIndex: 0
    };
    let curPagesIdx = -1;
    for (let uIdx = 0; uIdx < gqlResp.units.length; uIdx++) {
        for (let sIdx = 0; sIdx < gqlResp.units[uIdx].sections_list.length; sIdx++) {
            for (let cIdx = 0; cIdx < gqlResp.units[uIdx].sections_list[sIdx].cards_list.length; cIdx++) {
                curPagesIdx++;
                const page = {
                    title: gqlResp.units[uIdx].sections_list[sIdx].cards_list[cIdx].title,
                    path: `/learn-${locale}/courses/${gqlResp.meta.url_id}/${gqlResp.units[uIdx].url_id}/${gqlResp.units[uIdx].sections_list[sIdx].url_id}/${gqlResp.units[uIdx].sections_list[sIdx].cards_list[cIdx].url_id}`
                };

                if (uIdx != curUnitIdx) {
                    gqlResp.nav.pages.all.push(page);
                } else {
                    if (sIdx != curSectIdx) {
                        gqlResp.nav.pages.all.push(page);
                    } else {
                        gqlResp.nav.pages.all.push(page);
                        if (cIdx == curCardIdx) {
                            gqlResp.nav.pages.currentIndex = curPagesIdx;
                        }
                    }
                }
            }
        }
    }
    // Setup the card navigation
    gqlResp.nav.nextUnit = gqlResp.nav.currentUnit;
    gqlResp.nav.prevUnit = gqlResp.nav.currentUnit;
    gqlResp.nav.nextSection = gqlResp.nav.currentSection;
    gqlResp.nav.prevSection = gqlResp.nav.currentSection;
    if (curCardIdx+1 < gqlResp.nav.currentSection.cards_list.length) {
        gqlResp.nav.nextCard = gqlResp.nav.currentSection.cards_list[curCardIdx+1];
    } else {
        if (curSectIdx+1 < gqlResp.nav.currentUnit.sections_list.length) {
            // Use the first card of the next section and set next section
            gqlResp.nav.nextSection = gqlResp.nav.currentUnit.sections_list[curSectIdx+1];
            gqlResp.nav.nextCard = gqlResp.nav.nextSection.cards_list[0];
        } else {
            if (curUnitIdx+1 < gqlResp.units.length) {
                // Use the first card of the first section of the next unit
                gqlResp.nav.nextUnit = gqlResp.units[curUnitIdx+1];
                gqlResp.nav.nextSection = gqlResp.nav.nextUnit.sections_list[0];
                gqlResp.nav.nextCard = gqlResp.nav.nextSection.cards_list[0];
            } else {
                // END OF COURSE
                gqlResp.nav.nextUnit = null;
                gqlResp.nav.nextSection = null;
                gqlResp.nav.nextCard = null;
            }
        }
    }
    if (curCardIdx-1 > -1) {
        gqlResp.nav.prevCard = gqlResp.nav.currentSection.cards_list[curCardIdx-1];
    } else {
        if (curSectIdx-1 > -1) {
            // Use the last card of the prev section and set prev section
            gqlResp.nav.prevSection = gqlResp.nav.currentUnit.sections_list[curSectIdx-1];
            gqlResp.nav.prevCard = gqlResp.nav.prevSection.cards_list[gqlResp.nav.prevSection.cards_list.length-1];
        } else {
            if (curUnitIdx-1 > -1) {
                // Use the last card of the last section of the prev unit
                gqlResp.nav.prevUnit = gqlResp.units[curUnitIdx-1];
                gqlResp.nav.prevSection = gqlResp.nav.prevUnit.sections_list[gqlResp.nav.prevUnit.sections_list.length-1];
                gqlResp.nav.prevCard = gqlResp.nav.prevSection.cards_list[gqlResp.nav.prevSection.cards_list.length-1];
            } else {
                // FIRST CARD OF COURSE
                gqlResp.nav.prevUnit = null;
                gqlResp.nav.prevSection = null;
                gqlResp.nav.prevCard = null;
            }
        }
    }
    gqlResp.card = await client.getSectionCard(courseGID, unitGID, sectionGID, cardGID);
    gqlResp.card.content.content = renderFullCardContentHTML(gqlResp.card.content.content);
    gqlResp.card['url_id'] = toUrlId(gqlResp.card.title, gqlResp.card.id);
    setupQuizQuestionForView(gqlResp.card.question, gqlResp.nav);
    return {
        contentTmpl: 'course_card',
        meta: {
            title: `${gqlResp.card.title} | ${gqlResp.meta.title}`,
            topbarTitle: `${gqlResp.meta.title}`,
            image: gqlResp.meta.logo_url,
            amphtml: `/amp${req.path}`,
            // NOTE: If we don't have the updated_at date, then don't add this as we won't have all the required fields
            jsonld: !!gqlResp.card.updated_at ? generateArticle(`${gqlResp.card.title} | ${gqlResp.meta.title}`, undefined, gqlResp.meta.logo_url, gqlResp.card.updated_at, PlatformOrganization) : undefined
        },
        data: {
            course: gqlResp,
            infiniteScrollRequest: !!req.query.infiniteScroll
        }
    }
}

export async function redirectSectionURL(client: GqlApi, user: IUserData, locale: string, courseGID: string, unitGID: string, sectionGID: string): Promise<ISPFRouteResponse> {
    let gqlResp = await fetchDetailedCourseForView(client, courseGID);
    const unit = gqlResp.units.find(u => u.id === unitGID);
    if (!unit) {
        return Promise.reject('unit not found')
    }
    const section = unit.sections_list.find(s => s.id === sectionGID);
    if (!section) {
        return Promise.reject('section not found')
    }
    if (!section.cards_list || section.cards_list.length < 1) {
        return Promise.reject('no valid card found')
    }
    return {
        contentTmpl: 'redirect',
        meta: {
            title: `${gqlResp.meta.title}`,
        },
        redirect: {
            permanent: false,
            url: `/learn-${locale}/courses/${toUrlId(gqlResp.meta.title, courseGID)}/${unit.url_id}/${section.url_id}/${section.cards_list[0].url_id}`
        },
        data: null
    }
}

export async function redirectOldCardURL(client: GqlApi, user: IUserData, locale: string, req: Request, amp?: boolean) {
    if (!req.params.cardId) {
        return {
            contentTmpl: 'redirect',
            meta: {
                title: `Redirecting ...`,
            },
            redirect: {
                permanent: true,
                url: `${amp ? '/amp' : ''}/learn-${locale}/courses/${req.params.courseId}/${req.params.unitId}/${req.params.sectionId}`
            },
            data: null
        }
    }
    return {
        contentTmpl: 'redirect',
        meta: {
            title: `Redirecting ...`,
        },
        redirect: {
            permanent: true,
            url: `${amp ? '/amp' : ''}/learn-${locale}/courses/${req.params.courseId}/${req.params.unitId}/${req.params.sectionId}/${req.params.cardId}`
        },
        data: null
    }
}

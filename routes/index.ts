import * as express from 'express';
import config from '../config'
import { getSample } from '../controllers/sample';
import { Request, Response, NextFunction } from 'express';
import {fromUrlId} from "../utils/url-ids";
import {getGQLToken} from "../lib/anon";
import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import * as handlebars from 'handlebars';
import * as HandlebarsIntl from 'handlebars-intl';
import * as fs from 'fs';
import * as path from 'path';

// @ts-ignore
HandlebarsIntl.registerWith(handlebars);

const router = express.Router();

type ParamsFunction = (req: Request, res: Response, next?: NextFunction) => any[]
type ControllerFunction = (client: GqlApi, locale: string, ...args: any[]) => Promise<ISPFRouteResponse>

/**
 * Handles controller execution and responds to user.
 * This way controllers are not attached to the API.
 * @param promise Controller Promise.
 * @param params (req) => [params, ...].
 */
const gqlBaseControllerHandler = (promise: ControllerFunction, params: ParamsFunction) => async (req: Request, res?: Response, next?: NextFunction) => {
    let gqlToken = req.cookies['token'];
    let setUpdatedToken = false;
    if (!gqlToken) {
        setUpdatedToken = true;
        gqlToken = await getGQLToken()
    }
    const gqlClient = new GqlApi(gqlToken)
    const initialParams = params ? params(req, res, next) : [req, res, next];
    try {
        const result = await promise(gqlClient, req.params.locale, ...initialParams);
        if (setUpdatedToken) {
            res.cookie(config.jwt.cookieName, gqlToken, {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                domain: config.cookies.domain
            });
        }
        // TODO dynamic locale
        result.data.intl = {
            "locales": "en-US"
        }
        if (req.query['spf'] === 'navigate') {
            fs.readFile(path.join(config.viewsRoot, config.spfResponse.sidebar), {encoding: 'utf8'}, (err, data) => {
                if (err) {
                    return res.status(500) && next(err);
                }
                const sidebarHTML = handlebars.compile(data)(result);
                fs.readFile(path.join(config.viewsRoot, result.contentTmpl+'.hbs'), {encoding: 'utf8'}, (err, data) => {
                    if (err) {
                        return res.status(500) && next(err);
                    }
                    const contentHTML = handlebars.compile(data)(result);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({
                        sidebar: sidebarHTML,
                        content: contentHTML
                    }));
                });
            });
        } else {
            return res.render(result.contentTmpl, result);
        }
    } catch (error) {
        return res.status(500) && next(error);
    }
};

// Convenient short-hand version
const gc = gqlBaseControllerHandler;

router.get('/health-check', (req, res) => res.sendStatus(200))
router.get('/learn-:locale/sample', gc(getSample, req => []))

export default router;

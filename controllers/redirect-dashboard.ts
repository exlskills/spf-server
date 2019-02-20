import {Request, Response} from "express";
import config from '../config'

export async function redirectDashboard(req: Request, res: Response) {
    let locale = req.params.locale ? req.params.locale : config.locales[0];
    res.redirect(302, `/learn-${locale}/dashboard`);
}
import {Request, Response} from "express";

export async function redirectMissingLocale(req: Request, res: Response) {
    res.redirect(302, req.path.replace('/learn', '/learn-en'));
}

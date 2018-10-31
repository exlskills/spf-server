import {Request, Response} from "express";

export async function redirectMarketing(req: Request, res: Response) {
    let locale = req.params.locale ? req.params.locale : 'en';
    res.redirect(302, `/learn-${locale}/home`);
}

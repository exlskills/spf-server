import GqlApi from "../lib/gql-api";
import {ISPFRouteResponse} from "../lib/spf-route-response";
import {IUserData} from "../lib/jwt";
import {fetchDetailedCourseForView} from "./course-index";
import * as moment from 'moment-timezone';

export async function fetchCourseDeliverySchedule(client: GqlApi, courseGID: string, courseTitle: string) {
    let sched = await client.getCourseDeliverySchedule(courseGID, new Date()) as any;
    sched.instructors = [] as any;
    sched.session_info.sort((a: any, b: any) => a.session_seq - b.session_seq);
    const sessions = sched.session_info.map((item: any) => {
        return {
            headline: item.headline,
            desc: item.desc,
            session_notes: item.session_notes
        }
    });
    let totalDurationSum = 0;
    for (let run of sched.scheduled_runs) {
        run.purchase_item = {
            category: 'course_run',
            quantity: 1,
            options: {},
            refs: {
                cd_sched_id: sched._id,
                cd_run_id: run._id
            },
            displayUnitCost: run.offered_at_price.amount,
            displayName: `${courseTitle} - Live Class`
        };
        run.purchase_item_json = JSON.stringify(run.purchase_item);
        run.run_sessions.sort((a: any, b: any) => a.session_seq - b.session_seq);
        for (let rInd = 0; rInd < run.run_sessions.length; rInd++) {
            run.run_sessions[rInd].headline = sessions[rInd].headline;
            run.run_sessions[rInd].desc = sessions[rInd].desc;
            run.run_sessions[rInd].session_notes = sessions[rInd].session_notes;
            const hrs = moment
                .duration(run.run_sessions[rInd].session_duration)
                .asHours();
            totalDurationSum += hrs;
            run.run_sessions[rInd].session_duration_hrs = hrs;
            for (let inst of run.run_sessions[rInd].instructors) {
                sched.instructors[inst.username] = inst
            }
        }
    }
    if (sched.scheduled_runs.length > 0) {
        sched.scheduled_runs[0].soonest_run = true;
    }
    sched.course_duration = `${moment.duration({ months: 0, weeks: 1, days: 0, hours: 0, minutes: 0 }).asWeeks()} Week(s)`;
    sched.total_hours = `${Math.round(totalDurationSum/sched.scheduled_runs.length)} Hour(s)`;
    sched.instructors = Object.keys(sched.instructors).map(uname => sched.instructors[uname]);
    console.log(sched);
    return sched;
}

export async function viewCourseLive(client: GqlApi, user: IUserData, locale: string, courseGID: string) : Promise<ISPFRouteResponse> {
    const c = await fetchDetailedCourseForView(client, courseGID);
    const s = await fetchCourseDeliverySchedule(client, courseGID, c.meta.title);
    return {
        contentTmpl: 'course_live',
        meta: {
            title: c.meta.title,
            description: c.meta.description
        },
        data: {
            course: c,
            sched: s
        }
    }
}

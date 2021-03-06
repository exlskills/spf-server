import axios, {AxiosInstance} from 'axios';
import ISectionCard = GQL.ISectionCard;
import logger from "../utils/logger";
import config from "../config"
import IQuery = GQL.IQuery;
import ICourse = GQL.ICourse;
import ICourseEdge = GQL.ICourseEdge;
import ICourseUnitEdge = GQL.ICourseUnitEdge;
import ICourseDeliverySchedule = GQL.ICourseDeliverySchedule;
import * as moment from 'moment-timezone';
import IUserCourseRoleEdge = GQL.IUserCourseRoleEdge;
import IUserEdge = GQL.IUserEdge;
import IUser = GQL.IUser;
import IDigitalDiplomaEdge = GQL.IDigitalDiplomaEdge;
import IDigitalDiploma = GQL.IDigitalDiploma;

export type CourseListType = 'mine' | 'relevant'
export interface IDetailedCourse {
    meta: ICourse
    units: ICourseUnitEdge[]
}

export default class GqlApi {
    private readonly token: string;
    private readonly client: AxiosInstance;

    constructor(token: string) {
        this.token = token;
        this.client = axios.create({
            withCredentials: true,
            headers: {
                'Cookie': `token=${this.token}`,
                'Accept': 'application/json'
            }
        });
        // this.client.interceptors.request.use(request => {
        //     logger.debug('Starting Request', request)
        //     return request
        // })
        //
        // this.client.interceptors.response.use(response => {
        //     logger.debug('Response:', response)
        //     return response
        // })
    }

    // Returns data response, if errors exist, reject Promise and log
    private async request(query: string): Promise<IQuery> {
        logger.debug('[GQL] Request: ' + query);
        try {
            let startReqTs = (new Date()).getTime();
            const resp = await this.client.post(config.gql.endpoint, {
                query: query,
                operationName: null,
                variables: null
            });
            console.log(`GQL Req Time: ${(new Date()).getTime() - startReqTs}ms`);
            if (resp.data.errors) {
                logger.error('[GQL] ' + JSON.stringify(resp.data.errors));
                return Promise.reject('GQL Error')
            }
            return resp.data.data
        } catch (err) {
            logger.error('[GQL] Error --- ');
            logger.error(err);
            return Promise.reject('GQL Error')
        }
    }

    public async getSectionCard(courseId: string, unitId: string, sectionId: string, cardId: string): Promise<ISectionCard> {
        const q = `
            {
                cardEntry(course_id: "${courseId}", unit_id: "${unitId}", section_id: "${sectionId}", card_id: "${cardId}") {
                    id
                    index
                    title
                    headline
                    content_id
                    tags
                    github_edit_url
                    updated_at
                    content {
                        id
                        version
                        content
                    }
                    question {
                        id
                        question_text
                        question_type
                        hint_exists
                        data {
                            id
                            tmpl_files
                            environment_key
                            use_advanced_features
                            explanation
                            src_files
                            options {
                                id
                                seq
                                text
                            }
                        }
                    }
                }
            }
        `;
        return (await this.request(q)).cardEntry!
    }

    public async getCourseByID(courseId: string): Promise<ICourse> {
        const q = `
            {
                courseById(course_id: "${courseId}") {
                    id
                    title
                    description
                    headline
                    enrolled_count
                    view_count
                    logo_url
                    skill_level
                    est_minutes
                    primary_topic
                    info_md
                    verified_cert_cost
                    repo_url
                    delivery_methods
                    instructor_timekit {
                        intervals {
                            credits
                            project_id
                            duration_seconds
                        }
                    }
                }
            }
        `;
        return (await this.request(q)).courseById!
    }

    public async getDetailedCourseByIDSansEMA(courseId: string): Promise<IDetailedCourse> {
        const q = `
            {
                courseById(course_id: "${courseId}") {
                    id
                    title
                    description
                    headline
                    enrolled_count
                    view_count
                    logo_url
                    skill_level
                    est_minutes
                    primary_topic
                    info_md
                    verified_cert_cost
                    delivery_methods
                    instructor_timekit {
                        intervals {
                            credits
                            project_id
                            duration_seconds
                        }
                    }
                }
                unitPaging(first: 999, resolverArgs: [{param: "course_id", value: "${courseId}"}]) {
                    edges {
                        node {
                            unit_progress_state
                            id
                            title
                            headline
                            index
                            is_continue_exam
                            exam_attempt_id
                            sections_list {
                                id
                                title
                                headline
                                cards_list {
                                    id
                                    title
                                }
                            }
                        }
                    }
                }
            }
        `;
        const resp = await this.request(q);
        return {
            meta: resp.courseById!,
            units: resp.unitPaging.edges!
        }
    }

    public async getUserProfile(): Promise<IUser> {
        const q = `
        {
          getUserProfile {
            id
            full_name
            username
            primary_email
            headline
            biography
            is_demo
            is_instructor
            avatar_url
            twitter_username
            linkedin_username
            is_verified
            is_instructor
            is_public
          }
        }
        `;
        const resp = await this.request(q);
        return resp.getUserProfile;
    }

    public async getUserCourseRoles(): Promise<IUserCourseRoleEdge[]> {
        const q = `
        {
            userProfile {
              course_roles(first: 999) {
                edges {
                  node {
                    id
                    course_id
                    role
                    last_accessed_at
                  }
                }
              }
            }
        }
        `;
        const resp = await this.request(q);
        if (!resp.userProfile.course_roles) {
            return [];
        }
        return resp.userProfile.course_roles.edges;
    }

    public async getDetailedCourseByIDWithEMA(courseId: string): Promise<IDetailedCourse> {
        const q = `
            {
                courseById(course_id: "${courseId}") {
                    id
                    title
                    description
                    headline
                    enrolled_count
                    view_count
                    logo_url
                    skill_level
                    est_minutes
                    primary_topic
                    info_md
                    repo_url
                    verified_cert_cost
                    delivery_methods
                    instructor_timekit {
                        intervals {
                            credits
                            project_id
                            duration_seconds
                        }
                    }
                }
                unitPaging(first: 999, resolverArgs: [{param: "course_id", value: "${courseId}"}]) {
                    edges {
                        node {
                            unit_progress_state
                            id
                            title
                            headline
                            attempts_left
                            attempts
                            final_exam_weight_pct
                            last_attempted_at
                            passed
                            index
                            ema
                            grade
                            is_continue_exam
                            exam_attempt_id
                            sections_list {
                                id
                                ema
                                title
                                headline
                                cards_list {
                                    id
                                    ema
                                    title
                                }
                            }
                        }
                    }
                }
            }
        `;
        const resp = await this.request(q);
        return {
            meta: resp.courseById!,
            units: resp.unitPaging.edges!
        }
    }

    public async getAllCourses(listType: CourseListType, topic?: string): Promise<ICourseEdge[]> {
        const q = `
            {
                coursePaging(first: 9999, resolverArgs: [${!topic ? "" : `{ param: "primary_topic", value: "${topic}"}`}{ param: "list", value: "${listType}" }], filterValues: null) {
                    edges {
                        node {
                            id
                            title
                            headline
                            enrolled_count
                            view_count
                            logo_url
                            skill_level
                            est_minutes
                            primary_topic
                            verified_cert_cost
                            delivery_methods
                        }
                    }
                }
                topicFilter {
                    value
                }
            }
        `;
        return (await this.request(q)).coursePaging.edges!
    }

    public async getAllInstructors(): Promise<IUserEdge[]> {
        const q = `
            {
              listInstructors(first: 9999, resolverArgs: [], filterValues: null) {
                edges {
                  node {
                    id
                    username
                    full_name
                    headline
                    biography
                    avatar_url
                    instructor_topics_locale
                  }
                }
              }
            }
        `;
        return (await this.request(q)).listInstructors.edges!
    }

    public async getAllDigitalDiplomas(): Promise<IDigitalDiplomaEdge[]> {
        const q = `
            {
              listDigitalDiplomas(first: 9999, resolverArgs: [], filterValues: null) {
                edges {
                  node {
                    id
                    title
                    headline
                    logo_url
                    skill_level
                    est_minutes
                    primary_topic
                    is_project
                    topics
                  }
                }
              }
            }
        `;
        return (await this.request(q)).listDigitalDiplomas.edges!
    }

    public async getDigitalDiploma(digitalDiplomaId: string): Promise<IDigitalDiploma> {
        const q = `
            {
                getDigitalDiplomaById(digital_diploma_id: "${digitalDiplomaId}") {
                    id
                    title
                    headline
                    description
                    logo_url
                    skill_level
                    est_minutes
                    primary_topic
                    info_md
                    is_project
                    topics
                    plans {
                        _id
                        title
                        headline
                        cost
                        is_hidden
                        opens_at
                        closes_at
                        is_shipping_required
                    }
                    instructor_timekit {
                      intervals {
                        credits
                        project_id
                        duration_seconds
                      }
                    }
                }
            }
        `;
        return (await this.request(q)).getDigitalDiplomaById!
    }

    public async getInstructor(userId: string): Promise<IUser> {
        const q = `
            {
              userProfile(user_id: "${userId}") {
                id
                username
                full_name
                headline
                biography
                avatar_url
                instructor_topics_locale
                instructor_timekit {
                  intervals {
                    credits
                    project_id
                    duration_seconds
                  }
                }
                location_name
                linkedin_username
                twitter_username
              }
            }
        `;
        return (await this.request(q)).userProfile!
    }

    public async getCourseDeliverySchedule(courseId: string, dateOnOrAfter: Date): Promise<ICourseDeliverySchedule> {
        const q = `
                {
                  courseDeliverySchedule(course_id: "${courseId}", date_on_or_after: "${moment(dateOnOrAfter).format(config.templateConstants.liveCourseScheduleMomentOutFmt)}") {
                    _id
                    delivery_structure
                    delivery_methods
                    course_notes
                    course_duration {
                      months
                      weeks
                      days
                      hours
                      minutes
                    }
                    session_info {
                      session_seq
                      headline
                      desc
                      session_notes
                    }
                    scheduled_runs {
                      _id
                      offered_at_price {
                        amount
                      }
                      seat_purchased
                      run_start_date
                      run_sessions {
                        _id
                        session_seq
                        session_duration {
                          months
                          weeks
                          days
                          hours
                          minutes
                        }
                        session_start_date
                        session_run_notes
                        instructors {
                          username
                          full_name
                          headline
                          biography
                          avatar_url
                        }
                      }
                    }
                  }
                }
        `;
        return (await this.request(q)).courseDeliverySchedule!
    }

}

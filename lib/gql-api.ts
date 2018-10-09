import axios, {AxiosInstance} from 'axios';
import ISectionCard = GQL.ISectionCard;
import logger from "../utils/logger";
import config from "../config"
import IQuery = GQL.IQuery;
import ICourse = GQL.ICourse;
import IVersionedContentRecord = GQL.IVersionedContentRecord;

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
            const resp = await this.client.post(config.gql.endpoint, {
                query: query,
                operationName: null,
                variables: null
            });
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
                    content {
                        id
                        version
                        content
                    }
                    question {
                        id
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
                    headline
                    description
                    logo_url
                }
            }
        `;
        return (await this.request(q)).courseById!
    }

}

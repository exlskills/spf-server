import axios from 'axios'
import config from '../config'

const cPrefix = 'token=';

export async function getGQLToken(primaryLocale) {
    const resp = await axios.post(config.auth.apiBaseURL + '/anonymous',  {locale: primaryLocale});
    let newCookies = resp.headers['set-cookie'].map(c => {
        return c.split(';')[0]
    });
    for (let c of newCookies) {
        if (c.startsWith(cPrefix)) {
            return c.substr(cPrefix.length);
        }
    }
    return Promise.reject('anonymous credentials request failed')
}

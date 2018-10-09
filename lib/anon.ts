import axios from 'axios'
import config from '../config'

export async function getGQLToken() {
    const resp = await axios.post(config.auth.apiBaseURL + '/anonymous')
    if (!(resp && resp.data.cookies)) {
        return Promise.reject('anonymous credentials request failed')
    }
    return resp.data.cookies.find(item => item.name === 'token').value
}

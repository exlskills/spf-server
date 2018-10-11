import * as crypto from 'crypto'
import config from '../config'

export const generateHash = (str: string) => {
    return crypto
        .createHmac('sha256', config.auth.intercomSecret)
        .update(str)
        .digest('hex');
}
import config from '../config';
import * as jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import * as fs from 'fs';

let jwtPublicKey = '';

if (config.jwt.publicKeyBase64) {
    try {
        jwtPublicKey = new Buffer(config.jwt.publicKeyBase64, 'base64').toString(
            'ascii'
        );
    } catch (err) {
        logger.error('Failed to decode base64 public key: ', err);
    }
} else {
    try {
        jwtPublicKey = fs.readFileSync(String(config.jwt.publicKeyFile), 'ascii');
    } catch (err) {
        logger.error(
            'Failed to read public key from file: ',
            config.jwt.publicKeyFile,
            ' with error: ',
            err
        );
    }
}

export interface IUserRawJWT {
    user_id: string
    locale?: string
    email?: string
    avatar_url: string
    full_name?: string
    username?: string
    is_demo: boolean
    has_completed_first_tutorial?: boolean
    is_verified: boolean
    subscription: {
        level: number
    }[]
}

export interface IUserData {
    id: string
    locale?: string
    email?: string
    avatar_url: string
    full_name?: string
    username?: string
    is_demo: boolean
    sub_level: number
    coins?: number
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, jwtPublicKey, {
        algorithms: ['RS256']
    });
};

export const verifiedUserData = (token: string) : IUserData => {
    const decodedData = verifyToken(token) as IUserRawJWT;
    let maxSubLevel = 1;
    if (decodedData.subscription) {
        for (let sub of decodedData.subscription) {
            if (sub.level > maxSubLevel) {
                maxSubLevel = sub.level;
            }
        }
    }
    return {
        id: decodedData.user_id,
        locale: decodedData.locale,
        email: decodedData.email,
        avatar_url: decodedData.avatar_url,
        full_name: decodedData.full_name,
        username: decodedData.username,
        is_demo: decodedData.is_demo,
        sub_level: maxSubLevel
    }
};

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load whatever's in the .env file
dotenv.config();

export default {
    port: process.env.WEB_PORT || 3000,
    clientBaseURL: process.env.WEB_CLIENT_BASE_URL || 'https://exlskills.com',
    auth: {
        apiBaseURL: process.env.WEB_AUTH_API_BASE_URL || 'https://auth-api.exlskills.com',
        intercomSecret: process.env.WEB_AUTH_INTERCOM_SECRET || 'set_me'
    },
    gql: {
        endpoint: process.env.WEB_GQL_ENDPOINT || 'https://gql-api.exlskills.com/graph'
    },
    cors: {
        origin: process.env.WEB_CORS_REGEX
            ? [new RegExp(process.env.AMP_CORS_REGEX)]
            : [/localhost/, /exlskills.com/, /\.exlskills\.com$/]
    },
    jwt: {
        cookieName: process.env.WEB_JWT_COOKIE_NAME || 'token',
        publicKeyFile:
            process.env.WEB_JWT_PUB_KEY_FILE ||
            path.join(__dirname, '../config/sample_keys/public_key.pem'),
        publicKeyBase64: process.env.WEB_JWT_PUB_KEY_B64 || ''
    },
    botManagerAPI: {
        key: process.env.WEB_BOT_MANAGER_API_KEY || 'set_me',
        url: process.env.WEB_BOT_MANAGER_API_URL || 'http://localhost:2999'
    },
    cookies: {
        domain: process.env.WEB_COOKIES_DOMAIN || 'localhost'
    },
    logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    viewsRoot: path.join(__dirname, "../views"),
    spfResponse: {
        topbar: 'partials/topbar.hbs',
        sidebar: 'partials/sidebar.hbs'
    },
    templateConstants: {
        logoutURL: process.env.WEB_TMPL_LOGOUT_URL || 'https://accounts.exlinc.com/auth/realms/exlinc/protocol/openid-connect/logout?redirect_uri=https%3A%2F%2Fexlskills.com',
        stripePubKey: process.env.WEB_TMPL_STRIPE_PUB_KEY || 'set_me',
        wsUSIEndpoint: process.env.WEB_TMPL_WS_USI_ENDPOINT || 'wss://usi-api.exlskills.com/v0/wsusi',
        gqlEndpoint: process.env.WEB_TMPL_GQL_ENDPOINT || 'https://gql-api.exlskills.com/graph',
        authAPIBaseURL: process.env.WEB_TMPL_AUTH_API_BASE_URL || 'https://auth-api.exlskills.com',
        eraseDataFormURL: process.env.WEB_TMPL_ERASE_DATA_FORM_URL || 'https://exlinc.typeform.com/to/X0MWrR',
        intercomAppID: process.env.WEB_TMPL_IC_APP_ID || 'set_me',
        accountsURL: process.env.WEB_TMPL_ACCOUNTS_URL || 'https://accounts.exlinc.com/auth/realms/exlinc/account',
        helpBaseURL: process.env.WEB_TMPL_HELP_BASE_URL || 'https://help.exlskills.com',
        privacyPolicyAndTermsURL: process.env.WEB_TMPL_PRIVACY_POLICY_AND_TERMS_URL || 'https://exlskills.com/legal',
        subscribersSiteID: process.env.WEB_TMPL_SUBSCRIBERS_SITE_ID || 'set_me',
        liveCourseScheduleMomentParseFmt: 'YYYY-MM-DD[T]HH:mm[:00.000]Z',
        liveCourseScheduleMomentOutFmt: 'YYYY-MM-DD[T]HH:mm[:00.000Z]'
    }
}

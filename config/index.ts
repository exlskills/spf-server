import * as dotenv from 'dotenv';
import * as path from 'path';

// Load whatever's in the .env file
dotenv.config();

export default {
    port: process.env.WEB_PORT || 3000,
    auth: {
        apiBaseURL: process.env.WEB_AUTH_API_BASE_URL || 'https://auth-api.exlskills.com'
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
    },
    cookies: {
        domain: process.env.WEB_COOKIES_DOMAIN || 'localhost'
    },
    logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    viewsRoot: path.join(__dirname, "../views"),
    spfResponse: {
        topbar: 'partials/topbar.hbs',
        sidebar: 'partials/sidebar.hbs'
    }
}

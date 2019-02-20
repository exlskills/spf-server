import * as express from 'express';
import * as http from 'http'
import * as requestLanguage from 'express-request-language';
import config from './config';
import routes from './routes';
import logger from './utils/logger';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as exphbs from 'express-handlebars';
import * as cors from 'cors';
import * as HandlebarsIntl from 'handlebars-intl';
import * as HandlebarsHelpers from 'handlebars-helpers';
import * as robots from 'express-robots-txt';

const app = express();
const server = http.createServer(app);

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs'
});
// @ts-ignore
HandlebarsIntl.registerWith(hbs.handlebars);
HandlebarsHelpers({
    // @ts-ignore
    handlebars: hbs.handlebars
});

// This is only used if the Load Balancer Path rule allows so - non-production
app.use(robots(__dirname + '/robots.txt'));

app.use(cookieParser());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.use(
    cors({
        origin: config.cors.origin,
        credentials: true
    })
);

app.use(requestLanguage({
    languages: config.locales}));

app.use('/', routes);

server.listen(config.port);
logger.info('-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-');
logger.info(`🌐  Listening on port ${config.port}`);
logger.info('-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-');

import * as express from 'express';
import * as http from 'http'
import config from './config';
import routes from './routes';
import logger from './utils/logger';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as exphbs from 'express-handlebars';
import * as cors from 'cors';
import * as HandlebarsIntl from 'handlebars-intl';

const app = express();
const server = http.createServer(app);

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs'
});
// @ts-ignore
HandlebarsIntl.registerWith(hbs.handlebars);

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

app.use('/', routes);

server.listen(config.port);
logger.info('-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-');
logger.info(`🌐  Listening on port ${config.port}`);
logger.info('-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-');

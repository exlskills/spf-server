import * as winston from 'winston';
import config from '../config';

export default winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: config.logLevel,
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(
                    info => `${info.timestamp} ${info.level}: ${info.message}`
                )
            )
        })
    ],
    exitOnError: false // do not exit on handled exceptions
});

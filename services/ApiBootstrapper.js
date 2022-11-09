/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const { Logger } = require('dhp-logging-lib');
const helmet = require('helmet');
const path = require('path');
const swaggerUI = require('swagger-ui-express');
const uuid = require('uuid');

const config = require('../config/config');
const copyrightText = require('../swagger/copyright-text');

class ApiBootstrapper {
    constructor(pathToSpec, name = 'api', logger) {
        this.pathToSpec = pathToSpec;
        this.name = name;
        this.logger = logger;
    }

    // NOTE: kept for backwards compatibility
    createExpressApp() {
        return this.bootstrap();
    }

    /**
     * @returns {object} express app
     */
    bootstrap() {
        const app = express();

        app.use(bodyParser.urlencoded({ extended: false }));

        app.use(bodyParser.json());

        app.use(cors());

        app.use(helmet());

        app.use((req, res, next) => {
            // create correlation id if one is not already present
            // in the request headers
            let correlationId;
            if (req.headers[config.correlationIdHeaderName]) {
                correlationId = req.headers[config.correlationIdHeaderName];
            } else if (req.headers[config.globalTransactionIdHeaderName]) {
                correlationId = req.headers[config.globalTransactionIdHeaderName];
            } else {
                correlationId = uuid.v4();
            }

            // inject logger in the request
            const logger =
                this.logger ||
                new Logger({
                    name: this.name,
                    correlationId,
                });

            logger.info('Injecting logger and correlation id');
            req.logger = logger;
            req.correlationId = correlationId;

            // add correlationId to the response
            res.set(config.correlationIdHeaderName, correlationId);
            next();
        });

        // customJs file needed to render legal-notice in swagger ui
        app.use('/static/legal.js', express.static(path.join(__dirname, '..', 'swagger', 'legal-notice.js')));

        // serve swagger doc
        const swaggerFile = fs.readFileSync(this.pathToSpec, 'utf8');
        const swaggerDoc = JSON.parse(swaggerFile);
        swaggerDoc.info.description += copyrightText.join('\n\n');
        app.use(
            '/api-docs',
            swaggerUI.serve,
            swaggerUI.setup(swaggerDoc, { customJs: `${process.env.INGRESS_PATH || ''}/static/legal.js` })
        );

        return app;
    }

    getLogger() {
        return this.logger;
    }
}

module.exports = { ApiBootstrapper };

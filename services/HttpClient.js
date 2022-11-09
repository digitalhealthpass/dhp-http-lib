/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const axios = require('axios');
const axiosRetry = require('axios-retry');
const Config = require('../config/config');

const HEADER_NAMES = {
    CONTENT_TYPE: 'Content-Type',
    AUTHORIZATION: 'Authorization',
};

const NON_AXIOS_OPTIONS = ['bearerToken', 'body', 'contentType', 'correlationId', 'logger', 'retry'];

const DEFAULT_OPTIONS = {
    /**
     * {string} the absolute URL for the request. See
     * https://github.com/axios/axios#request-config
     */
    url: undefined,
    /**
     * {string}? will be set in the authorization header as a bearer token`
     * */
    bearerToken: undefined,
    /**
     * {object}? if an object(o), o.username and o.password will
     * be concatenated, base64-encoded and set in the authorization header.
     * See https://github.com/axios/axios#request-config
     * */
    auth: undefined,
    /**
     * {object}? request body
     * See https://github.com/axios/axios#request-config (data)
     */
    body: undefined,
    /**
     * {string}? the value of the content-type header. This value will be
     * ignored if content-type is set in the `headers` property
     */
    contentType: 'application/json',
    /**
     * {string}? an identifier to be propagated to facilitate tracing global
     * transactions across requests
     */
    correlationId: undefined,

    /**
     * {object}? an object where o.instance and o.functionName correspond to the
     * logger and the name of the desired log function, respectively. The logger
     * must support logging javascript objects and any requirement for redaction
     * is the responsibility of the logger.
     */
    logger: undefined,
    /**
     * {string} HTTP method. See
     * https://github.com/axios/axios#request-config
     */
    method: 'GET',
    /**
     * {object}? supports retry for typically idempotent (e.g. GET, HEAD,
     * PUT, DELETE)
     */
    retry: {
        /**
         * {number}? the number times to retry after a failure. See
         * https://github.com/softonic/axios-retry#options (retries)
         */
        count: Config.httpRetryCount,
        /**
         * {function(error) => boolean}? determines whether a request should
         * be retried. See https://github.com/softonic/axios-retry#options
         * (retryCondition)
         */
        condition: undefined,
        /**
         * {function(retryAttempt) => number}? determines how much time,
         * in milliseconds, should elapse before a retry attempt. See
         * https://github.com/softonic/axios-retry#options (retryDelay)
         */
        delay: (retryAttempt) => {
            return Config.httpRetryDelay * retryAttempt;
        },
        /**
         * {boolean} whether the timeout value should apply to each retry
         * or all retries. See https://github.com/softonic/axios-retry#options
         */
        shouldResetTimeout: false,
    },

    /**
     * {number}? request timeout in milliseconds, including all retries.
     * If the timeout value should apply to each request instead of all,
     * set the option `shouldResetTimeout` to true. See
     * https://github.com/axios/axios#request-config
     */
    timeout: Config.httpTimeout,
};

const configureRequestLogger = (logger) => {
    if (logger && typeof logger.instance === 'object' && typeof logger.functionName === 'string') {
        const { instance, functionName } = logger;

        axios.interceptors.request.use(
            (config) => {
                const log = {
                    url: config.url,
                    headers: config.headers,
                    data: config.data,
                };
                instance[functionName]({ request: log });
                return config;
            },
            (error) => {
                instance[functionName]({ error });
                return Promise.reject(error);
            }
        );
    }
};

// eslint-disable-next-line complexity
const prepareAxiosOptions = (initOptions = {}) => {
    const options = { ...initOptions };

    // set headers
    const headers = options.headers || {};
    if (options.contentType) {
        headers[HEADER_NAMES.CONTENT_TYPE] = options.contentType;
    }
    if (options.bearerToken) {
        headers[HEADER_NAMES.AUTHORIZATION] = `Bearer ${options.bearerToken}`;
    }
    if (options.correlationId) {
        headers[Config.correlationIdHeaderName] = options.correlationId;
    }
    options.headers = headers;

    // set body
    options.data = options.data || options.body;

    // get log function reference
    const { logger } = options;

    // set axios-retry options
    let retryOptions;
    if (options.retry) {
        retryOptions = {
            retries: options.retry.count,
            shouldResetTimeout: options.retry.shouldResetTimeout,
            delay: options.retry.delay,
            retryCondition: options.retry.condition,
        };
    }

    // remove custom options
    NON_AXIOS_OPTIONS.forEach((option) => {
        delete options[option];
    });

    if (retryOptions) {
        // configure retry
        axiosRetry(axios, retryOptions);
    }

    if (logger) {
        // set up request and response logging
        configureRequestLogger(logger);
    }

    return options;
};

/**
 * HttpClient with syntactic sugar for common settings (e.g. headers),
 * retry, request/response logging, etc.
 *
 * Currently implemented using axios and axios-retry.
 * See https://github.com/axios/axios and
 * https://github.com/softonic/axios-retry
 */
class HttpClient {
    /**
     *
     * @param {*} options configuration options for the client. See
     * <code>DEFAULT_OPTIONS</code> and
     * https://github.com/pinojs/pino/blob/master/docs/api.md#options for valid
     * values
     */
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.axiosOptions = prepareAxiosOptions(this.options);
    }

    /**
     * Invokes the request specified in this.options
     * @returns {Promise}
     */
    invoke() {
        return new Promise((resolve, reject) => {
            const start = new Date().getTime();
            axios(this.axiosOptions)
                .then((response) => {
                    if (response) {
                        response.performance = {
                            elapsedTime: new Date().getTime() - start,
                        };
                        const { logger } = this.options;
                        if (logger && logger.instance && logger.functionName) {
                            const { instance, functionName } = logger;
                            const log = {
                                status: response.status,
                                headers: response.headers,
                                retry: response.config['axios-retry'],
                                data: response.data,
                                performance: response.performance,
                            };
                            instance[functionName]({ response: log });
                        }
                    }
                    resolve(response);
                })
                .catch((error) => {
                    if (error) {
                        // eslint-disable-next-line no-param-reassign
                        error.performance = {
                            elapsedTime: new Date().getTime() - start,
                        };
                    }
                    reject(error);
                });
        });
    }

    getOptions() {
        return this.options;
    }
}

module.exports = { HttpClient, DefaultHttpClientOptions: DEFAULT_OPTIONS };

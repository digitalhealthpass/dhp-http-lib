/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const config = {
    authorizationHeaderName: process.env.AUTHORIZATION_HEADER_NAME || 'authorization',
    correlationIdHeaderName: process.env.CORRELATION_ID_HEADER_NAME || 'x-correlation-id',
    globalTransactionIdHeaderName: process.env.GLOBAL_TRANSACTION_ID_HEADER_NAME || 'x-global-k8fdic-transaction-id',
    httpRetryCount: process.env.HTTP_RETRY_COUNT || 0,
    httpRetryDelay: process.env.HTTP_RETRY_DELAY_MILLIS || 2000,
    httpTimeout: process.env.HTTP_TIMEOUT_MILLIS || 30000,
    oauthServiceClientId: process.env.OAUTH_SERVICE_CLIENT_ID,
    oauthServiceClientSecret: process.env.OAUTH_SERVICE_CLIENT_SECRET,
    oauthTokenVerificationUrl: process.env.OAUTH_TOKEN_VERIFICATION_URL,
};

module.exports = config;

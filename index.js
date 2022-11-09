/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const { ApiBootstrapper } = require('./services/ApiBootstrapper');
const { HttpClient, DefaultHttpClientOptions } = require('./services/HttpClient');

module.exports = {
    ApiBootstrapper,
    HttpClient,
    DefaultHttpClientOptions,
};

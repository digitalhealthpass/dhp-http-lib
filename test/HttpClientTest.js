/* eslint-disable max-lines-per-function */
/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const chai = require('chai');
const btoa = require('btoa');
const nock = require('nock');
const qs = require('qs');

const { HttpClient } = require('../services/HttpClient');

const { expect } = chai;

describe('HttpClient tests', () => {
    beforeEach(() => {
        nock.cleanAll();
    });

    it('client invokes requested url', (done) => {
        const testUrl = 'http://fake.url/1';

        nock(testUrl, { allowUnmocked: false })
            .get(() => true)
            .reply(200, () => {
                done();
            });

        const httpClient = new HttpClient({
            url: testUrl,
            timeout: 3000,
        });

        httpClient.invoke().catch((error) => {
            done(error);
        });
    });

    it('client leaves response body undisturbed', (done) => {
        const testUrl = 'http://fake.url/2';
        const responseBody = { foo: 'bar' };

        nock(testUrl, { allowUnmocked: false })
            .get(() => true)
            .reply(200, responseBody);

        const httpClient = new HttpClient({
            url: testUrl,
            timeout: 3000,
        });

        httpClient
            .invoke()
            .then((response) => {
                expect(response.data).to.deep.equal(responseBody);
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('client enriches response with performance data', (done) => {
        const testUrl = 'http://fake.url/3';

        const responseBody = { foo: 'bar' };

        nock(testUrl, { allowUnmocked: false })
            .get(() => true)
            .reply(200, responseBody);

        const httpClient = new HttpClient({
            url: testUrl,
            timeout: 3000,
        });

        httpClient
            .invoke()
            .then((response) => {
                expect(response.performance.elapsedTime > 0).to.be.true;
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('client retries on failure of idempotent request', (done) => {
        const testUrl = 'http://fake.url/4';
        const retryCount = 1;
        const maxAttemptCount = retryCount + 1;
        let attemptCount = 0;

        nock(testUrl, { allowUnmocked: false })
            .get(() => true)
            .times(maxAttemptCount)
            .reply(500, () => {
                attemptCount += 1;
            });

        const httpClient = new HttpClient({
            url: testUrl,
            timeout: 3000,
            retry: {
                count: retryCount,
                shouldResetTimeout: true,
            },
        });

        httpClient
            .invoke()
            .then(() => {
                done('the request should have failed');
            })
            .catch(() => {
                try {
                    expect(attemptCount).to.equal(maxAttemptCount);
                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('client doest not retry on failure of non-idempotent request', (done) => {
        const testUrl = 'http://fake.url/5';
        const retryCount = 2;
        const maxAttemptCount = retryCount + 1;
        let attemptCount = 0;

        nock(testUrl, { allowUnmocked: false })
            .post(() => true)
            .times(maxAttemptCount)
            .reply(500, () => {
                attemptCount += 1;
            });

        const httpClient = new HttpClient({
            url: testUrl,
            method: 'post',
            timeout: 3000,
            retry: {
                count: retryCount,
                shouldResetTimeout: true,
            },
            body: { foo: 'bar' },
        });

        httpClient
            .invoke()
            .then(() => {
                done('the request should have failed');
            })
            .catch(() => {
                try {
                    expect(attemptCount).to.equal(1);
                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('client propagates correlation id in the request header', (done) => {
        const testUrl = 'http://fake.url/6';
        const correlationId = 123;
        const correlationIdHeaderName = 'x-correlation-id';
        process.env.CORRELATION_ID_HEADER_NAME = correlationIdHeaderName;

        nock(testUrl, { allowUnmocked: false })
            .get(() => true)
            .reply(function checkCorrelationHeader() {
                const { headers } = this.req;
                expect(headers[correlationIdHeaderName]).to.equal(correlationId);
                return [200];
            });

        const httpClient = new HttpClient({
            url: testUrl,
            method: 'get',
            timeout: 3000,
            correlationId: 123,
        });

        httpClient
            .invoke()
            .then(() => {
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('client propagates bearer token in the request header', (done) => {
        const testUrl = 'http://fake.url/7';
        const bearerToken = '123';
        const authorizationHeaderName = 'authorization';

        nock(testUrl, { allowUnmocked: false })
            .get(() => true)
            .reply(function checkAuthHeader() {
                const { headers } = this.req;
                expect(headers[authorizationHeaderName]).to.equal(`Bearer ${bearerToken}`);
                return [200];
            });

        const httpClient = new HttpClient({
            url: testUrl,
            method: 'get',
            timeout: 3000,
            bearerToken: 123,
        });

        httpClient
            .invoke()
            .then(() => {
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('client propagates basic auth in the request header', (done) => {
        const testUrl = 'http://fake.url/8';

        const credentials = {
            username: 'foo',
            password: 'bar',
        };

        const token = btoa(`${credentials.username}:${credentials.password}`);
        const authorizationHeaderName = 'authorization';

        nock(testUrl, { allowUnmocked: false })
            .get(() => true)
            .reply(function checkAuthHeader() {
                const { headers } = this.req;
                expect(headers[authorizationHeaderName]).to.equal(`Basic ${token}`);
                return [200];
            });

        const httpClient = new HttpClient({
            url: testUrl,
            method: 'get',
            timeout: 3000,
            auth: credentials,
        });

        httpClient
            .invoke()
            .then(() => {
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('client logs request and response with injected logger', (done) => {
        const testUrl = 'http://fake.url/9';

        nock(testUrl, { allowUnmocked: false })
            .get(() => true)
            .reply(200);

        const maxLogAttemptCount = 2;
        let logAttemptCount = 0;

        const logger = {
            info: (message) => {
                if (message.response || message.request) {
                    logAttemptCount += 1;
                    if (logAttemptCount === maxLogAttemptCount) {
                        done();
                    }
                }
            },
        };

        const httpClient = new HttpClient({
            url: testUrl,
            timeout: 3000,
            logger: {
                instance: logger,
                functionName: 'info',
            },
        });

        httpClient.invoke().catch((error) => {
            done(error);
        });

        setTimeout(() => {
            done('timed out');
        }, 2000);
    });

    it('client properly handles url-encoded request', (done) => {
        const testUrl = 'http://fake.url/10';
        const grantType = 'password';
        const username = 'usernam3';
        const password = 'passw0rd';
        const originalRequestBody = qs.stringify({
            grant_type: grantType,
            username,
            password,
        });

        nock(testUrl, { allowUnmocked: false })
            .post(() => true)
            .reply((_, requestBody) => {
                expect(originalRequestBody).to.equal(requestBody);
                return [200];
            });

        const httpClient = new HttpClient({
            url: testUrl,
            method: 'post',
            contentType: 'application/x-www-form-urlencoded',
            auth: {
                username: 'client_id',
                password: 'client_secret',
            },
            data: qs.stringify({
                grant_type: grantType,
                username,
                password,
            }),
            timeout: 3000,
            correlationId: 123,
        });

        httpClient
            .invoke()
            .then(() => {
                done();
            })
            .catch((error) => {
                done(error);
            });
    });
});

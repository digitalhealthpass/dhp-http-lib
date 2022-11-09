/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const assert = require('assert');

const { ApiBootstrapper } = require('../services/ApiBootstrapper');

describe('ApiBootstrapper tests', () => {
    it('can instantiate bootstrapper', (done) => {
        const bootstrapper = new ApiBootstrapper();
        assert.ok(bootstrapper);
        done();
    });

    it('supports returning the logger used/created during bootstrapping', (done) => {
        const bootstrapper = new ApiBootstrapper();
        assert.ok(bootstrapper.getLogger);
        done();
    });

    it("the logger is undefined  bootstrap hasn't been called ", (done) => {
        const bootstrapper = new ApiBootstrapper();
        assert.strictEqual(bootstrapper.getLogger(), undefined);
        done();
    });

    it('createExpressApp is retained for backward compatibility', (done) => {
        const bootstrapper = new ApiBootstrapper();
        assert.ok(bootstrapper.createExpressApp);
        done();
    });
});

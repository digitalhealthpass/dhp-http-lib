# DHP http-lib module

## Introduction

This module contain Common HTTP service call functionality (retry, correlation headers, etc.), used by backed services.

## Build

```
npm install
```

## Basic Usage Example
```
const { HttpClient } = require('healthpass-http-lib');

let httpClient = new HttpClient({
  url: 'https://my-unprotected-api.cloud/resources/123',
})

httpClient.invoke()
.then(response => {})
.catch(err => {})
```

### Usage Example with auth / retries
```
const { HttpClient } = require('healthpass-http-lib');

let token, logger, correlationId;
// ...get or generate values for the above variables

let httpClient = new HttpClient({
  method: 'post'
  url: 'https://my-protected-api.cloud/resources/123',
  bearerToken: token, // will be set in the Authorization header with "Bearer " as the prefix
  logger: {
    instance: logger,
    functionName: 'trace' // the request and response will be logged using `logger.trace(...)`
  },
  retry: {
    count: 5
    delay: function(retryAttempt) {
      return 2000 * retryAttempt;
    }
  },
  body: {
    foo:'bar', // this will be posted as JSON, by default
  },
  timeout: 15000,
  correlationId: corelationId // this will propagated as the request header x-correlation-id for global tracing
})

httpClient.invoke()
.then(response => {})
.catch(err => {})
```
### Implementation notes
- [axios] (https://www.npmjs.com/package/axios) is used to underpin the http functionality
- The module exports a class `HttpClient` , and middleware for setting standard request or response headers

## Library Licenses

This section lists license details of libraries / dependencies.

| Name                   | License type            | Link                                                         |
| :--------------------- | :---------------------- | :----------------------------------------------------------- |
| axios                  | MIT                     | git+https://github.com/axios/axios.git                       |
| axios-retry            | Apache-2.0              | git+https://github.com/softonic/axios-retry.git              |
| body-parser            | MIT                     | git+https://github.com/expressjs/body-parser.git             |
| cors                   | MIT                     | git+https://github.com/expressjs/cors.git                    |
| express                | MIT                     | git+https://github.com/expressjs/express.git                 |
| fs                     | ISC                     | git+https://github.com/npm/security-holder.git               |
| helmet                 | MIT                     | git://github.com/helmetjs/helmet.git                         |
| lodash                 | MIT                     | git+https://github.com/lodash/lodash.git                     |
| swagger-ui-express     | MIT                     | git+ssh://git@github.com/scottie1984/swagger-ui-express.git  |
| uuid                   | MIT                     | git+https://github.com/uuidjs/uuid.git                       |
| assert                 | MIT                     | git+https://github.com/browserify/commonjs-assert.git        |
| btoa                   | (MIT OR Apache-2.0)     | git://git.coolaj86.com/coolaj86/btoa.js.git                  |
| chai                   | MIT                     | git+https://github.com/chaijs/chai.git                       |
| eslint                 | MIT                     | git+https://github.com/eslint/eslint.git                     |
| eslint-config-airbnb   | MIT                     | git+https://github.com/airbnb/javascript.git                 |
| eslint-config-node     | ISC                     | git+https://github.com/kunalgolani/eslint-config.git         |
| eslint-config-prettier | MIT                     | git+https://github.com/prettier/eslint-config-prettier.git   |
| eslint-plugin-jsx-a11y | MIT                     | git+https://github.com/jsx-eslint/eslint-plugin-jsx-a11y.git |
| eslint-plugin-node     | MIT                     | git+https://github.com/mysticatea/eslint-plugin-node.git     |
| eslint-plugin-prettier | MIT                     | git+https://github.com/prettier/eslint-plugin-prettier.git   |
| eslint-plugin-react    | MIT                     | git+https://github.com/jsx-eslint/eslint-plugin-react.git    |
| husky                  | MIT                     | git+https://github.com/typicode/husky.git                    |
| mocha                  | MIT                     | git+https://github.com/mochajs/mocha.git                     |
| nock                   | MIT                     | git+https://github.com/nock/nock.git                         |
| nodemon                | MIT                     | git+https://github.com/remy/nodemon.git                      |
| nyc                    | ISC                     | git+ssh://git@github.com/istanbuljs/nyc.git                  |
| qs                     | BSD-3-Clause            | git+https://github.com/ljharb/qs.git                         |
| sinon                  | BSD-3-Clause            | git+ssh://git@github.com/sinonjs/sinon.git                   |
| sinon-chai             | (BSD-2-Clause OR WTFPL) | git+https://github.com/domenic/sinon-chai.git                |
| supertest              | MIT                     | git+https://github.com/visionmedia/supertest.git             |


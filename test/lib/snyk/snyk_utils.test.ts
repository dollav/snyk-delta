import { getConfig } from '../../../src/lib/snyk/snyk_utils';
import * as fs from 'fs';
import * as nock from 'nock';
import * as path from 'path';

const fixturesFolderPath = path.resolve(__dirname, '../..') + '/fixtures/';
beforeEach(() => {
  return nock('https://snyk.io')
    .get(/\/xyz/)
    .reply(404, '404')
    .post(/\/xyz/)
    .reply(404, '404')
    .get(/\/apierror/)
    .reply(500, '500')
    .post(/\/apierror/)
    .reply(500, '500')
    .get(/\/genericerror/)
    .reply(512, '512')
    .post(/\/genericerror/)
    .reply(512, '512')
    .get(/\/apiautherror/)
    .reply(401, '401')
    .post(/\/apiautherror/)
    .reply(401, '401')
    .post(/^(?!.*xyz).*$/)
    .reply(200, (uri, requestBody) => {
      switch (uri) {
        case '/api/v1/':
          return requestBody;
          break;
        default:
      }
    })
    .get(/^(?!.*xyz).*$/)
    .reply(200, (uri) => {
      switch (uri) {
        case '/api/v1/':
          return fs.readFileSync(
            fixturesFolderPath + 'apiResponses/general-doc.json',
          );
        default:
      }
    });
});

const OLD_ENV = process.env;
beforeEach(() => {
  jest.resetModules(); // this is important - it clears the cache
  process.env = { ...OLD_ENV };
  delete process.env.SNYK_TOKEN;
});

afterEach(() => {
  process.env = OLD_ENV;
});

describe('Test getConfig function', () => {
  it('Get snyk token via env var', async () => {
    process.env.SNYK_TOKEN = '123';
    expect(getConfig().token).toEqual('123');
  });

  it('Get snyk.io api endpoint default', async () => {
    expect(getConfig().endpoint).toEqual('https://snyk.io/api/v1');
  });

  it('Get snyk api endpoint via env var', async () => {
    process.env.SNYK_API = 'API';
    expect(getConfig().endpoint).toEqual('API');
  });
});

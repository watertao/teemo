import fetch from 'dva/fetch';
import router from 'umi/router';
import pconf from 'projectConfig';
import { getLocale } from 'umi/locale';


const NOCACHE_HEADERS = {
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache',
};

/**
 * Requests a URL with optional options and returning a promise with data structure:
 * ----------------------------------------------
 * {
 *     status: 200,
 *     statusText: 'OK',
 *     headers: { key: value ... },
 *     data: { ... }
 * }
 * ----------------------------------------------
 *
 * When the response code is not 2XX, an exception will be thrown by promise rejection. the exception(Error) has a property which carries
 * the exception detail:
 * ----------------------------------------------
 * {
 *     status: 400,
 *     statusText: 'Bad Request',
 *     headers: { key: value ... },
 *     data; { ... }
 * }
 * ----------------------------------------------
 *
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, option) {

  let newOptions = _appendDefaultOptions(option);

  const fetchPromise = fetch(url, newOptions)
    .then(response => {
      // convert original response to simple result
      const result = {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      };
      const headers = {};
      response.headers.forEach((value, name) => {
        headers[name.toLowerCase()] = value;
      });
      result.headers = headers;
      if (result.headers['content-type'] &&
        result.headers['content-type'].indexOf('application/json') >= 0) {
        return response.json().then(data => {
          return {
            ...result,
            data,
          };
        });
      } else {
        return result;
      }
    })
    .then(simpleResponse => {
      // check status
      if (simpleResponse.status >= 200 && simpleResponse.status < 300) {
        return simpleResponse;
      } else {
        const error = new Error(simpleResponse.data.error);
        error.extra = {
          ...simpleResponse,
          statusText: simpleResponse.data.error,
          options: newOptions
        };
        error.request = {
          url,
          options: newOptions,
        };
        throw error;
      }
    })
    .catch(e => {
      throw _makeFetchFailedError(e, { url, options: newOptions, });
    });

  return Promise.race([
    fetchPromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(_makeTimeoutError({ url, options: newOptions,})), newOptions.timeout)
    )
  ]);

}

function _appendDefaultOptions(option) {
  let newOptions = {...option};

  // append timeout option
  newOptions = {
    timeout: pconf.request.timeout,
    ...newOptions,
  };

  // append no cache headers
  newOptions.headers = {
    ...NOCACHE_HEADERS,
    ...newOptions.headers,
  };

  // append accept-language header
  newOptions.headers = {
    'Accept-Language': getLocale(),
    ...newOptions.headers,
  };

  return newOptions;
}

function _makeTimeoutError(request) {
  const errMsg = 'Request Timeout';
  const errCode = -9;
  const error = new Error();
  error.extra = {
    status: errCode,
    statusText: errMsg,
    headers: {},
    data: {
      error: errCode,
      message: errMsg,
    },
  };
  error.request = request;
  return error;
}

function _makeFetchFailedError(originError, request) {
  if (originError.extra) {
    // Error thrown by check status do not need to convert
    return originError;
  } else {
    const errCode = -1;
    const error = new Error(originError.message);
    error.extra = {
      status: errCode,
      statusText: originError.message,
      headers: {},
      data: {
        error: errCode,
        message: originError.message,
      },
    };
    error.request = request;
    return error;
  }
}

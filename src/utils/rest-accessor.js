import request from './request';
import env from 'environment';
import _ from 'lodash';
import { notification, Tag } from 'antd';


const JSON_CONTENT_HEADER = {
  'Content-Type': 'application/json; charset=utf-8'
};



/**
 * HTTP GET 方法
 *
 * @param uri
 * @param pathVariables
 * @param filterParams
 * @returns {Promise<void>}
 */
export async function get(uri, pathVariables, filterParams, showNotify = true) {
  let options = { method: 'GET' };
  options = _appendXAuthTokenHeader(options);
  try {
    return await request(resolveQualifiedURL(uri, pathVariables, filterParams), options);
  } catch (e) {
    processError(e, showNotify);
    throw e;
  }
}


export async function post(uri, pathVariables, filterParams, data, showNotify = true) {
  let options = { method: 'POST', body: JSON.stringify(data) };
  options = _appendXAuthTokenHeader(options);
  options = _appendJsonContentHeader(options);
  try {
    return await request(resolveQualifiedURL(uri, pathVariables), options);
  } catch (e) {
    processError(e, showNotify);
    throw e;
  }
}

export async function put(uri, pathVariables, filterParams, data, showNotify = true) {
  let options = { method: 'PUT', body: JSON.stringify(data) };
  options = _appendXAuthTokenHeader(options);
  options = _appendJsonContentHeader(options);
  try {
    return await request(resolveQualifiedURL(uri, pathVariables), options);
  } catch (e) {
    processError(e, showNotify);
    throw e;
  }
}

export async function patch(uri, pathVariables, filterParams, data, showNotify = true) {
  let options = { method: 'PATCH', body: JSON.stringify(data) };
  options = _appendXAuthTokenHeader(options);
  options = _appendJsonContentHeader(options);
  try {
    return await request(resolveQualifiedURL(uri, pathVariables), options);
  } catch (e) {
    processError(e, showNotify);
    throw e;
  }
}

export async function del(uri, pathVariables, filterParams, showNotify = true) {
  let options = { method: 'DELETE' };
  options = _appendXAuthTokenHeader(options);
  try {
    return await request(resolveQualifiedURL(uri, pathVariables, filterParams), options).catch(processError);
  } catch (e) {
    processError(e, showNotify);
    throw e;
  }
}

function processError(ex, showNotify) {
  const { extra, request } = ex;
  if (showNotify) {
    notifyError(
      extra.statusText,
      extra.status,
      request.url,
      extra.data? extra.data.message : extra.statusText,
      request.options.method
    );
  }
}

function resolveQualifiedURL(uri, pathVariables, filterParams) {
  if (!uri.startsWith('/')) {
    throw new SyntaxError('uri should be start with /');
  }

  let newUri = uri;

  // process path variables
  if (pathVariables) {
    for (let variable in pathVariables) {
      newUri = newUri.replace(':' + variable, pathVariables[variable].toString());
    }
  }

  // process filter parameters
  if (filterParams) {
    let filterParamsClause = '';
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key] != null) {
        if (filterParamsClause == '') {
          filterParamsClause = `?${key}=${filterParams[key]}`;
        } else {
          filterParamsClause += `&${key}=${filterParams[key]}`;
        }
      }
    });
    newUri += filterParamsClause;
  }

  return env.endpoint + newUri;
}


function _appendJsonContentHeader(option) {
  let newOptions = {...option};
  newOptions.headers = {
    ...JSON_CONTENT_HEADER,
    ...newOptions.headers,
  };
  return newOptions;
}

function _appendXAuthTokenHeader(option) {
  let newOptions = {...option};
  if (sessionStorage.getItem('auth_token')) {
    newOptions.headers = {
      'X-Auth-Token': sessionStorage.getItem('auth_token'),
      ...newOptions.headers,
    };
  }
  return newOptions;
}

function notifyError(error, status, url, message, method) {
  notification.open({
    message: <div style={{ fontWeight: 500, fontSize: '13px' }}><Tag color='red' style={{marginRight: 16}}>{status}</Tag> {error}</div>,
    description: (<div>
      <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: 16}}>{message}</div>

      <div className={'word-break'} style={{ marginTop: 16, borderTop: '1px solid #f5f5f5', fontSize: '12px', paddingTop: 8, color: 'rgba(0,0,0,0.45)' }}>
        {method} {url}
      </div>

    </div>)
  });
}

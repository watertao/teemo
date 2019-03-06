import _ from 'lodash';
import { notification, Tag } from 'antd';
import env from 'environment';
import router from 'umi/router';


const SESSION_SYNC_REQ = { verb: 'GET', uri: '/system/session' };
const SESSION_CREATE_REQ = { verb: 'POST', uri: '/system/session' };

/**
 * process error during rest access
 * @param e
 */
export default function(e) {
  const { extra, request } = e;
  const { url, options: { method } } = request;
  const { endpoint } = env;

  if (!_.startsWith(url, endpoint)) {
    throw `url not start with ${endpoint}`;
  }

  let path = url.substring(endpoint.length);
  path = _.startsWith(path, '/') ? path : `/${path}`;

  if (extra.status == 401) {
    process_401(e, path);
  }

}

function process_401(e, path) {
  const { extra, request } = e;
  const { url, options: { method } } = request;
  const { endpoint } = env;

  // GET /system/session
  // no notify , but redirect to /login
  if (method == SESSION_SYNC_REQ.verb && _.startsWith(path, SESSION_SYNC_REQ.uri)) {
    router.push('/login');
  }

  // POST /system/session
  // notify, but don't redirect to /login
  else if (method == SESSION_CREATE_REQ.verb && _.startsWith(path, SESSION_CREATE_REQ.uri)) {
    notifyError(
      extra.statusText,
      extra.status,
      request.url,
      extra.data? extra.data.message : extra.statusText,
      request.options.method
    );
  }

  // other requests
  // notify, and redirect to /login
  else {
    notifyError(
      extra.statusText,
      extra.status,
      request.url,
      extra.data? extra.data.message : extra.statusText,
      request.options.method
    );
    router.push('/login');
  }

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

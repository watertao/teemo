import { get, post, del } from '../utils/rest-accessor';


/**
 * 获取完整的资源列表
 *
 * @returns {Promise<void>}
 */
export function fetchFullResourceMetadata() {
  return get('/metadata/resources', null, null);
}


/**
 * 获取当前会话的用户
 *
 * @returns {Promise<void>}
 */
export async function queryCurrent() {

  const response = await get('/system/session', null, null);
  _constructResourceIds(response);
  return response;

}

/**
 * 登录
 * @returns {Promise<*>}
 */
export async function login(loginData) {
  const response = await post('/system/session', null, null, loginData);
  _constructResourceIds(response);
  return response;
}

/**
 * 注销
 * @returns {Promise<*|undefined>}
 */
export function logout() {
  return del('/system/session')
}

function _constructResourceIds(response) {
  response.data.resource_ids = response.data.resources.map(resource => resource.id);
}

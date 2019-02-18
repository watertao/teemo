import request from '@/utils/request';
import { get, post } from '../utils/rest-accessor';


/**
 * 获取当前会话的用户
 *
 * @returns {Promise<void>}
 */
export async function queryCurrent() {
  return get('/system/session', null, null, false);
}

/**
 *
 * @returns {Promise<*>}
 */
export async function login(loginData) {
  return post('/system/session', null, null, loginData);
}

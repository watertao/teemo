import { get, post } from '@/utils/rest-accessor';


/**
 * 查询资源列表
 *
 * @returns {Promise<void>}
 */
export function findResources(filterParam) {
  return get('/auth/resources', null, filterParam);
}

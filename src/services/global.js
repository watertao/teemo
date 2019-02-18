import { get } from '../utils/rest-accessor';


/**
 * 获取完整的资源列表
 *
 * @returns {Promise<void>}
 */
export async function fetchFullResourceMetadata() {
  return get('/metadata/resources?infinite=true', null, null, false);
}

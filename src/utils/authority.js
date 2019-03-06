import MODULE_SETTINGS from '@tmp/moduleSettings';
import _ from 'lodash';

const CACHE = {
  RESOURCE_ID_MAP: null,
  RESOURCE_VERB_PATTERN_MAP: null,
};


/**
 * NOTE: 此文件中的方法由于用到了菜单模块数据，当前登录用户数据，因此必须在 BasicLayout 初始化加载了以上数据后方可正常调用
 */

/**
 * 检查当前用户是否具备访问指定路径的权限。
 *
 * @param pathname
 */
export function hasAuthority4Path(pathname) {
  // 根据路径找到对应的模块配置
  // 若未找到，则直接放行

  // 根据当前用户的 resource 和 模块的 resource 进行判断
  let moduleOfPath = null;
  Object.keys(MODULE_SETTINGS).forEach(moduleCode => {
    const moduleConfig = MODULE_SETTINGS[moduleCode];
    if (_.startsWith(pathname, moduleConfig.path)) {
      moduleOfPath = moduleConfig;
    }
  });

  if (!moduleOfPath) {
    return true;
  } else {
    return checkPermissionByResourceVerbPatterns(moduleOfPath.authority.resources)
  }

}


/**
 * 检查当前用户是否具备访问指定 event 的权限。
 *
 * @param qualifiedEventCode 全限定 event code
 */
export function hasAuthority4Event(qualifiedEventCode) {
  // 根据 qualifiedEventCode 的前缀提取 module code
  // 找到对应 module下该 event 的配置
  // 根据当前用户的 resource 和 该 event 的配置进行判断
}


export function getResourceById(id) {

  // initial cache if not initialized
  if (_.isEmpty(CACHE.RESOURCE_ID_MAP)) {
    CACHE.RESOURCE_ID_MAP = {};
    window.g_app._store.getState().global.resourceMetadata.forEach(resource => {
      CACHE.RESOURCE_ID_MAP[resource.id] = resource;
    });
  }

  return CACHE.RESOURCE_ID_MAP[id];
}


export function getResourceByVerbUriPattern(verbUriPattern) {

  // initial cache if not initialized
  if (_.isEmpty(CACHE.RESOURCE_VERB_PATTERN_MAP)) {
    CACHE.RESOURCE_VERB_PATTERN_MAP = {};
    window.g_app._store.getState().global.resourceMetadata.forEach(resource => {
      CACHE.RESOURCE_VERB_PATTERN_MAP[`${resource.verb} ${resource.uri_pattern}`] = resource;
    });
  }

  return CACHE.RESOURCE_VERB_PATTERN_MAP[verbUriPattern];

}


export function checkPermissionByResourceIds(resourceIds) {
  let userResourceIds = [];
  if (window.g_app._store.getState().global.currentUser) {
    userResourceIds = window.g_app._store.getState().global.currentUser.resource_ids;
  }
  return _.difference(resourceIds, userResourceIds).length === 0;
}

export function checkPermissionByResources(resources) {
  let userResourceIds = [];
  if (window.g_app._store.getState().global.currentUser) {
    userResourceIds = window.g_app._store.getState().global.currentUser.resource_ids;
  }
  const itemResourceIds = resources.map(resource => resource.id);
  return _.difference(itemResourceIds, userResourceIds).length === 0;
}

export function checkPermissionByResourceVerbPatterns(resourceVerbPatterns) {
  let userResourceIds = [];
  if (window.g_app._store.getState().global.currentUser) {
    userResourceIds = window.g_app._store.getState().global.currentUser.resource_ids;
  }
  const itemResourceIds = resourceVerbPatterns.map(verbPattern => {
    const resource = getResourceByVerbUriPattern(verbPattern)
    if (!resource) {
      console.warn(`resource[${verbPattern}] not exist in resource metadata`)
      return null;
    }
    return resource.id;
  }).filter(item => item);
  return _.difference(itemResourceIds, userResourceIds).length === 0;
}

/**
 * 此文件中的方法由于用到了菜单模块数据，当前登录用户数据，因此必须在 BasicLayout 初始化加载了以上数据后方可正常调用
 */

/**
 * 检查当前用户是否具备访问指定路径的权限。
 *
 * @param pathname
 */
export function hasAuthority4Path(pathname) {
  console.log(pathname)
  console.log(window.g_app._store.getState())
  // 根据路径找到对应的模块配置
  // 若未找到，则直接放行

  // 根据当前用户的 resource 和 模块的 resource 进行判断
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
import memoizeOne from 'memoize-one';
import isEqual from 'lodash/isEqual';
import { formatMessage } from 'umi/locale';
import { menu } from '../defaultSettings';
import MODULE_SETTINGS from '@tmp/moduleSettings';
import _ from 'lodash';


// Conversion router to menu.
// original routes looks like:
// [
//   {
//     path: '/aa',
//     name: 'aa',  这是一个 locale name,若是找不到相应的 locale，则直接取 locale key
//     component: './aa.js',
//     isMenuData: true,  用于区分非菜单相关的子路由
//   },
//   {
//     path: '/bb',   这里确认一下菜单组是否有必要设置 path
//     name: 'bb',
//     isMenuData: true,
//     routes: [
//       {
//         path: '/bb/xx',
//         name: 'xx',
//         component: './bb/xx.js',
//         isMenuData: true,
//       },
//       ...
//     ]
//   }
// ]
//
// after converting by formatter function, data will be;
// [
//   {
//     path: '/aa',
//     name: 'aa的locale名',
//     icon: 'dashboard',
//     nodeType: 'module',
//     locale: 'menu.aa',
//     code: 'aa',
//     children: [
//       {
//         nodeType: 'event',
//         name: '新增aa',
//         code: 'aa.create',
//         locale: 'menu.aa.create',
//       },
//       ...
//     ]
//   },
//   {
//     name: 'bb的locale名',
//     code: 'bb',
//     nodeType: 'group',
//     locale: 'menu.bb',
//     children: [
//       {
//         path: '/bb/xx',
//         name: 'xx的locale名',
//         nodeType: 'module',
//         code: 'bb.xx',
//         resources: ['GET /test-a'],
//         children: [
//           {
//             nodeType: 'event',
//             name: '新增xx',
//             code: 'bb.xx.create',
//             locale: 'menu.bb.xx.create',
//             resources: []
//           }
//         ]
//       },
//       ...
//     ]
//   }
// ]
//
function formatter(data, parentName, resourceMetadata) {
  return data
    .map(item => {

      if (!(item.isMenuData)) {
        return null;
      }

      // 确定节点类型 (module / group / event)
      let nodeType = null;
      if (item.routes) {
        // 如果节点包含 routes 子节点，则认为是一个菜单组
        nodeType = 'group';
      } else if (MODULE_SETTINGS[item.name]) {
        // 如果能够在模块配置中找到对应的配置，则认为是一个菜单模块
        nodeType = 'module';
      }

      // 设置节点 code，节点 code 为级联累加
      let code = null;
      if (parentName) {
        code = `${parentName}.${item.name}`;
      } else {
        code = item.name
      }

      const locale = `menu.${code}`;
      // if enableMenuLocale use item.name,
      // close menu international
      const name = menu.disableLocal
        ? item.name
        : formatMessage({ id: locale, defaultMessage: locale });

      const result = {
        name,
        code,
        nodeType,
        locale,
        path: item.path,
      };
      if (nodeType == 'group') {
        const children = formatter(item.routes, code, resourceMetadata);
        // Reduce memory usage
        result.children = children;
        delete result.routes;
        return result;
      } else if (nodeType == 'module') {
        const moduleSetting = MODULE_SETTINGS[item.name];
        result.resources = moduleSetting.resources.map(verbUriPattern => {
          const resource = getResourceByVerbUriPattern(resourceMetadata, verbUriPattern);
          if (resource) {
            return resource;
          } else {
            console.warn(`resource[${resourceVerbUriPattern}] in module[${result.code}] is not defined in metadata(db)`);
            return null;
          }
        }).filter(item => item);
        return result;
      }

      return null;
    })
    .filter(item => item);
}

const memoizeOneFormatter = memoizeOne(formatter, isEqual);

/**
 * get SubMenu or Item
 */
const getSubMenu = (item, currentUser, resourceMetadata) => {
  // doc: add hideChildrenInMenu
  if (item.children) {
    const subMenus = filterMenuData(item.children, currentUser, resourceMetadata);
    if (_.isEmpty(subMenus)) {
      return null;
    } else {
      return {
        ...item,
        children: subMenus, // eslint-disable-line
      };
    }
  }
  return item;
};

/**
 * 根据当前登录用户，过滤无权限的菜单
 */
const filterMenuData = (menuData, currentUser, resourceMetadata) => {
  if (!menuData) {
    return [];
  }
  return menuData
    .map(item => check(getSubMenu(item, currentUser, resourceMetadata), currentUser, resourceMetadata))
    .filter(item => item);
};
/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 */
const getBreadcrumbNameMap = menuData => {
  const routerMap = {};

  const flattenMenuData = data => {
    data.forEach(menuItem => {
      if (menuItem.children) {
        flattenMenuData(menuItem.children);
      }
      // Reduce memory usage
      routerMap[menuItem.path] = menuItem;
    });
  };
  flattenMenuData(menuData);
  return routerMap;
};

const memoizeOneGetBreadcrumbNameMap = memoizeOne(getBreadcrumbNameMap, isEqual);


function getResourceById(resourceMetadata, id) {
  for (let i = 0; i < resourceMetadata.length; i++) {
    if (resourceMetadata[i].id == id) {
      return resourceMetadata[i];
    }
  }
  return null;
}

function getResourceByVerbUriPattern(resourceMetadata, verbUriPattern) {
  for (let i = 0; i < resourceMetadata.length; i++) {
    if (`${resourceMetadata[i].verb} ${resourceMetadata[i].uri_pattern}` == verbUriPattern) {
      return resourceMetadata[i];
    }
  }
  return null;
}

function check(item, currentUser, resourceMetadata) {
  if (item == null) {
    return null;
  }
  if (_.isEmpty(item.resources)) {
    return item;
  }
  const itemResourceIds = item.resources.map(resource => resource.id);
  // check if current user's resource_ids has all ids in itemResourceIds.
  if ( _.difference(itemResourceIds, currentUser.resource_ids).length === 0){
    return item;
  }
  return null;
}

export default {
  namespace: 'menu',

  state: {
    fullMenuData: [],
    menuData: [],
    breadcrumbNameMap: {},
  },

  effects: {
    *getMenuData({ payload }, { put, select, call}) {
      const { routes } = payload;
      const currentUser = yield select(state => state.global.currentUser);
      const resourceMetadata = yield select(state => state.global.resourceMetadata);

      // 从路由配置及模块配置转换完整的菜单元数据
      const fullMenuData = memoizeOneFormatter(routes, null, resourceMetadata);
      yield put({
        type: 'save',
        payload: { fullMenuData },
      });

      try {
        // 根据当前会话的用户权限，过滤不可访问的菜单
        const menuData = filterMenuData(fullMenuData, currentUser, resourceMetadata);
        const breadcrumbNameMap = memoizeOneGetBreadcrumbNameMap(fullMenuData);
        yield put({
          type: 'save',
          payload: {menuData, breadcrumbNameMap},
        });
      } catch (e) {
        console.log(e)
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};

import memoizeOne from 'memoize-one';
import isEqual from 'lodash/isEqual';
import { formatMessage } from 'umi/locale';
import { menu } from '../defaultSettings';
import MENU_CONFIG from '../menu.config.js';
import MODULE_SETTINGS from '@tmp/moduleSettings';
import _ from 'lodash';
import { getResourceByVerbUriPattern } from '@/utils/authority';


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
function formatter(data, parentNames) {
  return data
    .map(item => {
      const nParentNames = _.cloneDeep(parentNames || []);
      const result = {
        code: item.code,
        nodeType: item.type,
      };
      if (item.type == 'group') {
        const locale = `menu.${nParentNames.length > 0 ? _.join(nParentNames, '.') + '.' : ''}${item.code}`;
        // if enableMenuLocale use item.name,
        // close menu international
        const name = menu.disableLocal
          ? item.code
          : formatMessage({ id: locale, defaultMessage: locale });
        result.path = `${nParentNames.length > 0 ? '/' + _.join(nParentNames, '/') : ''}/${item.code}`;
        nParentNames.push(item.code);
        const children = formatter(item.children, nParentNames);
        // Reduce memory usage
        result.children = children;
        result.name = name;
        result.locale = locale;
        result.icon = item.icon;
        return result;
      } else if (item.type == 'module') {
        const moduleSetting = MODULE_SETTINGS[item.code];
        const locale = `module.${item.code}`;
        // if enableMenuLocale use item.name,
        // close menu international
        const name = menu.disableLocal
          ? item.code
          : formatMessage({ id: locale, defaultMessage: locale });
        result.resources = moduleSetting.authority.resources ? moduleSetting.authority.resources.map(verbUriPattern => {
          const resource = getResourceByVerbUriPattern(verbUriPattern);
          if (resource) {
            return resource;
          } else {
            console.warn(`resource[${verbUriPattern}] in module[${result.code}] is not defined in metadata(db)`);
            return null;
          }
        }).filter(item => item) : [];
        result.path = moduleSetting.path;
        result.name = name;
        result.locale = locale;
        result.icon = item.icon;
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
const getSubMenu = (item, currentUser) => {
  // doc: add hideChildrenInMenu
  if (item.children) {
    const subMenus = filterMenuData(item.children, currentUser);
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
const filterMenuData = (menuData, currentUser) => {
  if (!menuData) {
    return [];
  }
  return menuData
    .map(item => check(getSubMenu(item, currentUser), currentUser))
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


function check(item, currentUser) {
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
      try {
        const currentUser = yield select(state => state.global.currentUser);
        //const resourceMetadata = yield select(state => state.global.resourceMetadata);

        // 从菜单配置(menu.config.js)及模块配置(moduleSettings.js)转换完整的菜单元数据
        const fullMenuData = memoizeOneFormatter(MENU_CONFIG, null);

        yield put({
          type: 'save',
          payload: { fullMenuData },
        });


        // 根据当前会话的用户权限，过滤不可访问的菜单
        const menuData = filterMenuData(fullMenuData, currentUser);
        const breadcrumbNameMap = memoizeOneGetBreadcrumbNameMap(fullMenuData);
        yield put({
          type: 'save',
          payload: {menuData, breadcrumbNameMap},
        });
      } catch (e) {
        console.error(e)
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

import memoizeOne from 'memoize-one';
import isEqual from 'lodash/isEqual';
import { formatMessage } from 'umi/locale';
import { menu } from '../defaultSettings';
import MENU_CONFIG from '../menu.config.js';
import MODULE_SETTINGS from '@tmp/moduleSettings';
import _ from 'lodash';
import { getResourceByVerbUriPattern } from '@/utils/authority';


function formatter(data, parentNames, parentNode) {
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
        const children = formatter((item.children || []), nParentNames);
        // Reduce memory usage
        result.children = children;
        result.name = name;
        result.locale = locale;
        result.icon = item.icon;
        children.forEach(child => child.parent = result);
        return result;
      } else if (item.type == 'module') {
        const moduleSetting = MODULE_SETTINGS[item.code];
        const locale = `module.${item.code}.${moduleSetting.name}`;
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
        result.children = (moduleSetting.authority.events || []).map(event => {
          return {
            code: `${item.code}.${event.code}`,
            nodeType: 'event',
            resources: (event.resources || []).map(verbUriPattern => {
              const resource = getResourceByVerbUriPattern(verbUriPattern);
              if (resource) {
                return resource;
              } else {
                console.warn(`verbUriPattern[${verbUriPattern}] in module[${item.code}] is not defined in metadata(db)`);
                return null;
              }
            }).filter(item => item),
            name: formatMessage({id: `module.${item.code}.${event.name}`, defaultMessage: event.name}),
            parent: result,
          };
        });
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
  if (item.nodeType == 'group') {
    const subMenus = filterMenuData(item.children, currentUser);
    if (_.isEmpty(subMenus)) {
      return null;
    } else {
      return {
        ...item,
        children: subMenus, // eslint-disable-line
      };
    }
  } else if (item.nodeType == 'module') {
    delete item.children;
    return item;
  } else {
    return null;
  }

};

/**
 * 根据当前登录用户，过滤无权限的菜单,以及 event
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
      if (menuItem.nodeType == 'group') {
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
  // if no resources defined for module, we let it display
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
    /**
     * [
     *   {
     *    "code": "test",
     *    "nodeType": "group",
     *    "path": "/test",
     *    "name": "menu.test",
     *    "locale": "menu.test",
     *    "icon": "profile"
     *    "children": [
     *      {
     *        "code": "test-a",
     *        "nodeType": "module",
     *        "resources": [],
     *        "path": "/test/test-a",
     *        "name": "module.test-a.testa",
     *        "locale": "module.test-a.testa"
     *      },
     *    ],
     *  },
     *  {
     *    "code": "authority",
     *    "nodeType": "group",
     *    "path": "/authority",
     *    "children": [
     *      {
     *        "code": "authority_resource-mgnt",
     *        "nodeType": "module",
     *        "resources": [],
     *        "path": "/authority/authority_resource-mgnt",
     *        "name": "Resource Management",
     *        "locale": "module.authority_resource-mgnt.moduleName"
     *      },
     *      {
     *        "name": "Authority Management",
     *        "locale": "menu.authority",
     *        "icon": "safety"
     *        "code": "authority_role-mgnt",
     *        "nodeType": "module",
     *        "resources": [],
     *        "path": "/authority/authority_role-mgnt",
     *        "name": "Role Management",
     *        "locale": "module.authority_role-mgnt.moduleName"
     *      }
     *    ],
     *  }
     *]
     */
    fullMenuData: [],
    menuData: [],
    breadcrumbNameMap: {},
  },

  effects: {

    *getFullMenuData({ payload }, { put, select, call}) {
      try {

        // 从菜单配置(menu.config.js)及模块配置(moduleSettings.js)转换完整的菜单元数据
        const fullMenuData = memoizeOneFormatter(MENU_CONFIG, null);
        const breadcrumbNameMap = memoizeOneGetBreadcrumbNameMap(fullMenuData);
        yield put({
          type: 'save',
          payload: { fullMenuData, breadcrumbNameMap },
        });
      } catch (e) {
        console.error(e)
      }
    },

    *getMenuData({ payload }, { put, select, call}) {
      try {
        const currentUser = yield select(state => state.global.currentUser);
        const fullMenuData = yield select(state => state.menu.fullMenuData);

        // 根据当前会话的用户权限，过滤不可访问的菜单
        const menuData = filterMenuData(_.cloneDeep(fullMenuData), currentUser);
        yield put({
          type: 'save',
          payload: {menuData},
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

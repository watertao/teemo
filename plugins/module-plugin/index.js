import { join } from 'path';
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'fs';
import _ from 'lodash';
import chalk from 'chalk';


export default function(api, options = { exclude: [] }) {
  const { paths } = api;
  const { exclude } = options;

  const pagesLocation = join(paths.absSrcPath, 'pages');
  const globalModuleSettingFile = join(paths.absTmpDirPath, 'moduleSettings.js');
  const menuConfigFile = join(paths.absSrcPath, 'menu.config.js');

  if (!existsSync(paths.absTmpDirPath)) {
    mkdirSync(paths.absTmpDirPath);
  }

  api.addPageWatcher([pagesLocation]);

  api.onPatchRoute(({ route }) => {
    // found BasicLayout route, and refresh routes with menu config
    if (route.path == '/') {
      const startTime = new Date().getTime();

      // combine module.config.js in modules into globalModuleSetting
      const globalModuleSetting = {};
      for (let moduleId in require.cache) {
        if (moduleId.indexOf("module.config.js") >= 0) {
          delete require.cache[moduleId];
        }
      }
      recursiveReadDir(pagesLocation, exclude, (dir, parents) => {
        const moduleConfigFileLocation = join(dir, 'module.config.js');
        if (existsSync(moduleConfigFileLocation)) {
          const moduleConfig = require(moduleConfigFileLocation);
          const moduleQualifiedCode = _.join(parents, '_');
          preprocessModuleConfig(moduleQualifiedCode, moduleConfig);
          moduleConfig.component = `./${_.join(parents, '/')}`;
          globalModuleSetting[moduleQualifiedCode] = moduleConfig;
        }
      });

      // generate routes according to menu.config.json and globalModuleSetting
      for (let moduleId in require.cache) {
        if (moduleId.indexOf("menu.config.js") >= 0) {
          delete require.cache[moduleId];
        }
      }
      const menuConfig = require(menuConfigFile);

      const menuRouteConfig = recursiveConvertMenu2Route(menuConfig, [], globalModuleSetting);
      // console.log(JSON.stringify(menuRouteConfig,null,2))
      route.routes = [
        ...route.routes,
        ...menuRouteConfig,
      ];
      // add 404 as last routes
      route.routes.push({
        "component": "./src/components/Exception/404"
      });


      // generate locale definition in module.locale.xx-XX.js
      const moduleLocaleMap = {};
      const MODULE_LOCALE_FILE_REG = /module\.locale\.([\w\-]+)\.js$/;
      for (let moduleId in require.cache) {
        if (MODULE_LOCALE_FILE_REG.test(moduleId)) {
          delete require.cache[moduleId];
        }
      }
      recursiveReadDir(pagesLocation, exclude, (dir, parents) => {
        const moduleConfigFileLocation = join(dir, 'module.config.js');
        if (!existsSync(moduleConfigFileLocation)) {
          return;
        }
        const subItems = readdirSync(dir);
        subItems.forEach(item => {
          const path = join(dir, item);
          if (statSync(path).isFile()) {
            if (MODULE_LOCALE_FILE_REG.test(item)) {
              const locale = RegExp.$1;
              const moduleQualifiedCode = _.join(parents, '_');
              const originModuleLocale = require(path);
              const moduleLocale = {};
              Object.keys(originModuleLocale).forEach(key => {
                moduleLocale[`module.${moduleQualifiedCode}.${key}`] = originModuleLocale[key];
              });
              moduleLocaleMap[locale] = {
                ...(moduleLocaleMap[locale] || {}),
                ...moduleLocale,
              };
            }
          }
        })
      });
      Object.keys(moduleLocaleMap).forEach(locale => {
        const tmpLocaleFile = join(paths.absTmpDirPath, `moduleLocale_${locale}.js`);
        if (existsSync(tmpLocaleFile)) {
          unlinkSync(tmpLocaleFile);
        }
        writeFileSync(tmpLocaleFile, "export default " + JSON.stringify(moduleLocaleMap[locale]));
      });

      // write globalModuleSetting to .umi directory for further use
      if (existsSync(globalModuleSettingFile)) {
        unlinkSync(globalModuleSettingFile);
      }
      const globalModuleSettingContent = "export default " + JSON.stringify(globalModuleSetting);
      writeFileSync(globalModuleSettingFile, globalModuleSettingContent);

      const costTime = new Date().getTime() - startTime;
      console.log(`[module-plugin] success in ${costTime} ms.`);

    }

  });

}


function recursiveConvertMenu2Route(menuConfig, paths, globalModuleSetting) {
  const routes = [];
  const nPaths = _.cloneDeep(paths || [])
  menuConfig.forEach(configItem => {
    const routeItem = {};
    if (configItem.type == 'group') {
      routeItem.path = `${paths.length > 0 ? '/' + _.join(paths, '/') : ''}/${configItem.code}`;
      if (paths.length == 0) {
        routeItem.icon = configItem.icon;
      }
      const nnPaths = _.cloneDeep(nPaths);
      nnPaths.push(configItem.code);
      routeItem.routes = recursiveConvertMenu2Route(configItem.children, nnPaths, globalModuleSetting);
    } else if (configItem.type == 'module') {
      routeItem.path = `${paths.length > 0 ? '/' + _.join(paths, '/') : ''}/${configItem.code}`;
      const moduleConfig = globalModuleSetting[configItem.code];
      moduleConfig.path = routeItem.path;
      if (!moduleConfig) {
        throw `module config not found for qualified code [${configItem.code}]`;
      }
      routeItem.component = join('./src/pages', moduleConfig.component);
      //console.log(moduleConfig);
      if (moduleConfig.routes && moduleConfig.routes.length > 0) {
        routeItem.routes = recursiveConvertModuleRoutes(moduleConfig.routes, routeItem.path, routeItem.component);
      }
    } else {
      throw 'menu.config.js definition invalid (type must be group/module): ' + JSON.stringify(configItem);
    }
    routes.push(routeItem);
  });

  return routes;
}


function recursiveConvertModuleRoutes(moduleRoutes, parentPath, moduleLocation) {
  let result = [];
  moduleRoutes.forEach(route => {
    const nRoute = {
      ...route,
    };
    result.push(nRoute);
    nRoute.path = join(parentPath, route.path);
    //route.path = nRoute.path;
    nRoute.component = join(moduleLocation, nRoute.component);
    if(route.routes && route.routes.length > 0) {
      nRoute.routes = recursiveConvertModuleRoutes(route.routes, parentPath, moduleLocation);
    }
  });
  return result;
}

function recursiveReadDir(absDir, exclude, callback, parents) {
  if (!parents) {
    parents = [];
  }
  callback(absDir, parents);
  const subDirs = readdirSync(absDir);
  if (subDirs.length > 0) {
    subDirs.forEach(subDir => {
      if (_.indexOf(exclude, subDir) >=0) {
        return;
      }
      const absSubDir = join(absDir, subDir);
      if (statSync(absSubDir).isDirectory()) {
        const nParents = _.cloneDeep(parents);
        nParents.push(subDir);
        recursiveReadDir(absSubDir, exclude, callback, nParents);
      }

    });

  }
}


/**
 * check configuration
 *
 * @param moduleConfig
 */
function preprocessModuleConfig(moduleQCode, moduleConfig) {

  if (!moduleConfig.name) {
    error(`name not specified in config [${moduleQCode}] `);
    throw new Error();
  }

  if (moduleConfig.authority) {
    const { authority } = moduleConfig;

    if (!authority.resources) {
      authority.resources = [];
    } else {
      authority.resources = _.uniq(authority.resources);
    }

    if (!authority.events) {
      authority.events = [];
    } else {
      const tmpEventsMap = {};
      authority.events.forEach(event => {
        if (!event.code) {
          error(`event code not specified in config [${moduleQCode}] `);
          throw new Error();
        }
        if (!event.name) {
          error(`event name not specified in config [${moduleQCode}] `);
          throw new Error();
        }
        if (!event.resources) {
          event.resources = [];
        } else {
          event.resources = _.uniq(event.resources);
        }
        if (tmpEventsMap[event.code]) {
          error(`event code [${event.code}] duplicated in config [${moduleQCode}] `);
          throw new Error();
        } else {
          tmpEventsMap[event.code] = true;
        }
      });
    }

  } else {
    moduleConfig.authority = {
      resources: [],
      events: [],
    };
  }

  if (!moduleConfig.routes) {
    moduleConfig.routes  = [];
  }

}

function error(message) {
  console.log(chalk.red(message));
}

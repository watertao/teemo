import { join } from 'path';
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import _ from 'lodash';
export default function(api, options = { exclude: [] }) {
  const { paths } = api;
  const { exclude } = options;


  // combine module.config.js in modules
  const pagesLocation = join(paths.absSrcPath, 'pages');
  const globalModuleSettingFile = join(paths.absTmpDirPath, 'moduleSettings.js');
  api.addPageWatcher(pagesLocation);
  api.onGenerateFiles(() => {
    const startTime = new Date().getTime();
    const globalModuleSetting = {};
    recursiveReadDir(pagesLocation, exclude, (dir, parents) => {
      const moduleConfigFileLocation = join(dir, 'module.config.js');
      if (existsSync(moduleConfigFileLocation)) {
        const moduleConfig = require(moduleConfigFileLocation);
        const moduleCode = _.join(parents, '_');
        globalModuleSetting[moduleCode] = moduleConfig;
      }
    });
    if (existsSync(globalModuleSettingFile)) {
      unlinkSync(globalModuleSettingFile);
    }
    const globalModuleSettingContent = "export default " + JSON.stringify(globalModuleSetting);
    writeFileSync(globalModuleSettingFile, globalModuleSettingContent);

    const costTime = new Date().getTime() - startTime;
    console.log(`[module-plugin] success in ${costTime} ms.`);

  });

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

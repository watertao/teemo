import { join } from 'path';
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
export default function(api, options = {}) {
  const {config, paths} = api;
  const {targets} = config;
  const modulesLocation = join(paths.absSrcPath, 'pages');
  const globalModuleSettingFile = join(paths.absTmpDirPath, 'moduleSettings.js');
  api.addPageWatcher(modulesLocation);
  api.onGenerateFiles(() => {
    const globalModuleSetting = {};
    const modules = readdirSync(modulesLocation);
    modules.forEach(module => {
      const moduleSettingPath = join(modulesLocation, module, 'module.json');
      if (existsSync(moduleSettingPath)) {
        const content = readFileSync(moduleSettingPath);
        const jsonMap = JSON.parse(content);
        globalModuleSetting[module] = jsonMap;
      }
    });
    if (existsSync(globalModuleSettingFile)) {
      unlinkSync(globalModuleSettingFile);
    }
    const globalModuleSettingContent = "export default " + JSON.stringify(globalModuleSetting);
    writeFileSync(globalModuleSettingFile, globalModuleSettingContent);
    // console.log(globalModuleSetting);
  });
}

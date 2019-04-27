import { formatMessage as fm, FormattedMessage } from 'umi/locale';
import MODULE_SETTINGS from '@tmp/moduleSettings';
import _ from 'lodash';

export default function(id) {

  const url = new URL(window.location.href);
  const { pathname } = url;

  const moduleKeys = Object.keys(MODULE_SETTINGS);
  let currentModuleCode = null;
  for (let i = 0; i < moduleKeys.length; i++) {
    const modulePathname = MODULE_SETTINGS[moduleKeys[i]].path;
    if (_.startsWith(pathname, modulePathname)) {
      currentModuleCode = moduleKeys[i];
      break;
    }
  }

  if (currentModuleCode) {
    return fm({id: `module.${currentModuleCode}.${id}`, defaultMessage: id});
  } else {
    return id;
  }

}

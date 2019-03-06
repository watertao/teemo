// do not modify this file,
// modify src/router.config.js or  module.config.js under each module

import addtionalRoutes from '../src/router.config';

export default [
  ...addtionalRoutes,
  {
    "path": "/",
    "component": "../layouts/BasicLayout",
    "routes": []
  },

]

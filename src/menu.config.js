// restart server after change

module.exports = [
  // 测试
  {
    code: 'test', type: 'group',  icon: 'profile',
    children: [
      // 测试A
      { code: 'test-a', type: 'module' },
      // 测试B
      { code: 'test-b', type: 'module', },
      // 测试C
      { code: 'test-c', type: 'module', },


    ]
  },


  // authority management
  {
    code: 'authority', type: 'group', icon: 'safety',
    children: [
      // resource management
      { code: 'authority_resource-mgnt', type: 'module' },
      // role management
      { code: 'authority_role-mgnt', type: 'module' },
      // user management
      { code: 'authority_user-mgnt', type: 'module' },
    ]
  },


];

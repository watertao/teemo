export default [
  // 测试
  {
    code: 'test', type: 'group',
    children: [
      // 测试A
      { code: 'test-a', type: 'module', },
      // 测试B
      { code: 'test-b', type: 'module', }
    ]
  },

  // 范例
  {
    code: 'demo', type: 'group',
    children: [
      // 基本列表展示
      { code: 'basic-data-list', type: 'module' }
    ]
  }
];

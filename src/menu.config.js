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

  // 范例
  {
    code: 'demo', type: 'group', icon: 'profile',
    children: [
      {
        // 数据展示类
        code: 'data-display', type: 'group',
        children: [
          // 基本列表展示
          { code: 'demo_basic-data-list', type: 'module' }
        ]
      }
    ]
  }
];

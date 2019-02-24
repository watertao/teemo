module.exports = {

  name: {
    'zh-CN': '测试B',
    'en-US': 'test-B',
  },

  authority: {
    resources: [
      'GET /test/b',
      'GET /test/b/{bId}'
    ],
    events: {
      code: 'create',
      resources: [

      ]
    }
  },

  routes: [
    {
      path: '/detail',
      component: 'components/Analysis',
      authority: 'create',
    }
  ]

}

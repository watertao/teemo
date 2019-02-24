module.exports = {

  name: {
    'zh-CN': '测试A',
    'en-US': 'test-A',
  },

  authority: {
    resources: [
      'GET /test/a',
      'GET /test/a/{aId}'
    ],
    events: {
      code: 'update',
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

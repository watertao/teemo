module.exports = {

  name: {
    'zh-CN': '基础列表展示',
    'en-US': 'test-A',
  },

  authority: {
    resources: [
      'GET /test/a',
      'GET /test/a/{aId}',
      'GET /test/c/{aId}',
    ],
    events: {
      code: 'update',
      resources: [

      ]
    }
  },

  routes: []

}

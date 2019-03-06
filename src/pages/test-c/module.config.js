module.exports = {

  name: {
    'zh-CN': '测试C',
    'en-US': 'test-C',
  },

  authority: {
    resources: [
      'GET /test/c',
      'GET /test/c/{cId}'
    ],
    events: {
      code: 'create',
      resources: [

      ]
    }
  },

  routes: []

}

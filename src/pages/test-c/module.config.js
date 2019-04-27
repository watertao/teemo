module.exports = {

  name: 'testa',

  authority: {
    resources: [
      'GET /test/c',
      'GET /test/c/{cId}'
    ],
    events: [
      {
        code: 'create',
        name: 'create test',
        resources: []
      },
    ],
  },

  routes: []

}

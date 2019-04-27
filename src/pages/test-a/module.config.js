module.exports = {

  name: 'testa',

  authority: {
    resources: [
      'GET /test/a',
      'GET /test/a/{aId}'
    ],
    events: [
      {
        code: 'update',
        name: 'update',
        resources: []
      },
    ],
  },

  routes: [

  ]

}

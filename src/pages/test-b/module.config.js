module.exports = {

  name: 'testa',

  authority: {
    resources: [
      'GET /test/b',
      'GET /test/b/{bId}'
    ],
    events: [
      {
        code: 'create',
        name: 'create test',
        resources: []
      },
    ],
  },

}

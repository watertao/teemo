module.exports = {

  name: 'moduleName',

  authority: {
    resources: [
      'GET /auth/roles',
      'GET /auth/roles/{roleId}',
      'GET /auth/roles/{roleId}',
      'GET /auth/roles/{roleId}',
    ],
    events: [
      {
        code: 'create-role',
        name: 'createRoleEventName',
        resources: [
          'POST /auth/roles',
        ],
      },
      {
        code: 'modify-role',
        name: 'modifyRoleEventName',
        resources: [
          'PUT /auth/roles/{roleId}',
          'GET /auth/roles',
          'GET /auth/roles/{roleId}',
          'GET /auth/rols',
        ],
      },
      {
        code: 'delete-role',
        name: 'deleteRoleEventName',
        resources: [
          'DELETE /auth/roles/{roleId}',
        ],
      },
    ],
  },

  routes: []

}

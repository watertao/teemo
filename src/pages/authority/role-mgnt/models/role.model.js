import { findRoles, deleteRole } from "../services/role.service";

export default {

  namespace: 'role',


  state: {
    list: [],
  },


  effects: {

    *fetchList({ payload }, { call, put }) {
      const {filterParameters} = payload;
      // convert filterParameters
      const nFilterParameters = {...filterParameters, status: filterParameters.status == 'a' ? null : filterParameters.status};
      try {
        const response = yield call(findRoles, nFilterParameters);
        yield put({
          type: 'updateList',
          payload: response.data
        });
        return parseInt(response.headers['x-total-count']);
      } catch (e) {
        console.error(e);
        return 0;
      }
    },

    *deleteRole({ payload: { roleId } }, { call, put }) {
      try {
        yield call(deleteRole, roleId);
      } catch (e) {
        console.error(e);
      }
    },

  },


  reducers: {

    updateList(state, action) {
      return {
        ...state,
        list: action.payload
      }
    },

  }

}

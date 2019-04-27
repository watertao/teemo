import {deleteUser, findUsers} from "../services/user.service";

export default {

    namespace: 'user',

    state: {
      list: [],
    },


    effects: {
      *fetchList({ payload }, { call, put }) {
        const {filterParameters} = payload;
        // convert filterParameters
        const nFilterParameters = {...filterParameters, status: filterParameters.status == 'a' ? null : filterParameters.status};
        try {
          const response = yield call(findUsers, nFilterParameters);
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

      *deleteUser({ payload: { userId } }, { call, put }) {
        try {
          yield call(deleteUser, userId);
          return true;
        } catch (e) {
          return false;
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

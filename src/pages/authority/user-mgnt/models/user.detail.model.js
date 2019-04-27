import { selectUser, createUser, updateUser, fetchFullRoles } from "../services/user.service";
import { OPERATE_TYPE_ENUM } from '../components/UserDetailDrawer';

const MODEL_SCOPE_NAME = 'user_detail';

export default {

  namespace: 'user_detail',


  state: {

    detail: {},
    operateType: null,
    id: null,

    tabKey: '1',
    fullRoles: [],
  },


  effects: {

    *initDrawer({ payload }, { call, put }) {
      const { operateType, itemId } = payload;

      const response = yield call(fetchFullRoles);
      yield put({
        type: 'updateModel',
        payload: {
          fullRoles: response.data.map(item => {
            return {
              key: item.id,
              title: item.name,
              description: item.remark,
              disabled: item.status == '0',
              roleData: item,
            };
          }),
        }
      });

      switch(operateType) {
        case OPERATE_TYPE_ENUM.CREATE:
          yield put({ type: 'initCreate' })
          break;
        case OPERATE_TYPE_ENUM.MODIFY:
          try {
            const response = yield call(selectUser, itemId);
            yield put({
              type: 'initModify',
              payload: response.data,
            });
          } catch (e) {
            console.error(e);
          }
          break;
        default:
          console.error('unrecognized operation type');
      }
    },

    *submitForm({ payload }, { call, put, select }) {
      const { operateType, id } = yield select(state => state[MODEL_SCOPE_NAME]);

      try {
        switch(operateType) {
          case OPERATE_TYPE_ENUM.CREATE:
            yield call(createUser, payload);
            return true;
          case OPERATE_TYPE_ENUM.MODIFY:
            yield call(updateUser, id, payload);
            return true;
          default:
            console.error('unrecognized operation type');
            return false;
        }
      } catch (e) {
        console.error(e);
        return false;
      }
    },

  },

  reducers: {

    initCreate(state) {
      return {
        ...state,
        operateType: OPERATE_TYPE_ENUM.CREATE,
        id: null,
        tabKey: '1',
      }
    },

    initModify(state, { payload }) {
      return {
        ...state,
        operateType: OPERATE_TYPE_ENUM.MODIFY,
        id: payload.id,
        detail: payload,
        tabKey: '1',
      }
    },

    updateModel(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

  }

}

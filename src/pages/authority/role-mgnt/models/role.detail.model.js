import { selectRole, createRole, updateRole } from "../services/role.service";
import { ROLE_OPERATE_TYPE_ENUM } from '../components/RoleDetailDrawer';

export default {

  namespace: 'role_detail',


  state: {

    formData: {},

    operateType: null,
    id: null,

    tabKey: '1',
  },


  effects: {

    *initDrawer({ payload }, { call, put }) {
      const { operateType, roleId } = payload;

      switch(operateType) {
        // create a role
        case ROLE_OPERATE_TYPE_ENUM.CREATE:
          yield put({ type: 'initCreate' })
          break;
        // modify a role
        case ROLE_OPERATE_TYPE_ENUM.MODIFY:
          try {
            const response = yield call(selectRole, roleId);
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
      const { operateType, id } = yield select(state => state.role_detail);

      console.log(payload)
      try {
        switch(operateType) {
          // create a role
          case ROLE_OPERATE_TYPE_ENUM.CREATE:
            yield call(createRole, payload);
            return true;
          // modify a role
          case ROLE_OPERATE_TYPE_ENUM.MODIFY:
            yield call(updateRole, id, payload);
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

    initCreate(state, action) {
      return {
        operateType: ROLE_OPERATE_TYPE_ENUM.CREATE,
        id: null,
        formData: {
          code: '',
          name: '',
          remark: '',
          resource_ids: [],
        },
        tabKey: '1',
      }
    },

    initModify(state, { payload }) {
      return {
        operateType: ROLE_OPERATE_TYPE_ENUM.MODIFY,
        id: payload.id,
        formData: {
          code: payload.code,
          name: payload.name,
          status: payload.status,
          remark: payload.remark,
          resource_ids: payload.resources.map(r => r.id),
        },
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

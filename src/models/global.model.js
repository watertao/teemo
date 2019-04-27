import { fetchFullResourceMetadata, queryCurrent, login,logout } from '@/services/global.service';
import { storeToken } from '@/utils/rest-token-resolver';
import router from 'umi/router';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    loadedAllNotices: false,
    currentUser: null,
    resourceMetadata: [],
    isSessionSynced: false,
  },

  effects: {

    /**
     * 同步会话，获取当前登录用户的会话信息，保存到 currentUser
     */
    *fetchCurrent(_, { call, put }) {
      try {
        const { data } = yield call(queryCurrent);
        yield put({
          type: 'saveCurrentUser',
          payload: data
        });
        return true;
      } catch (ex) {
        // 若获取会话失败，则跳转到 login
        if (ex.extra.status == 401) {
          router.push('/login');
        }
        return false;
      }
    },

    *fetchResourceMetadata(_, { call, put }) {
      try {
        const { data } = yield call(fetchFullResourceMetadata);
        yield put({
          type: 'saveResourceMetadata',
          payload: data
        });
      } catch (ex) {
        console.error(ex);
      }
    },

    *login(action, { call, put, select }){
      try {
        const { data } = yield call(login, action.payload);
        yield put({
          type: 'saveCurrentUser',
          payload: data
        });
        storeToken(data.token);
        router.push("/");
      } catch (ex) {
        console.error(ex);
      }
    },

    /**
     * 登出，销毁服务端会话，并刷新当前页，由于当前页无法再同步到已经销毁的会话，便会转向到 /login
     */
    *logout(_, { call, put}) {
      try {
        yield call(logout);
        yield put({
          type: 'user/saveCurrentUser',
          payload: {}
        });
        window.location.reload(true);
      } catch (ex) {
        console.error(ex);
      }

    },

  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    saveResourceMetadata(state, action) {
      return {
        ...state,
        resourceMetadata: action.payload || [],
        isSessionSynced: true,
      };
    },

  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};

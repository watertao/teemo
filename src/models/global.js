import { queryNotices } from '@/services/api';
import { queryCurrent, login } from '@/services/user';
import { fetchFullResourceMetadata } from '@/services/global';
import router from 'umi/router';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    loadedAllNotices: false,
    currentUser: null,
    resourceMetadata: [],
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
      } catch (ex) {
        // 若获取会话失败，则跳转到 login
        if (ex.extra.status == 401) {
          router.push('/login');
        }
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
        console.log(ex);
      }
    },

    *login(action, { call, put, select }){
      try {
        const { data } = yield call(login, action.payload);
        yield put({
          type: 'saveCurrentUser',
          payload: data
        });
        // store token to localstorage
        sessionStorage.setItem("auth_token", data.token);
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


    *fetchNotices(_, { call, put, select }) {
      const data = yield call(queryNotices);
      const loadedAllNotices = data && data.length && data[data.length - 1] === null;
      yield put({
        type: 'setLoadedStatus',
        payload: loadedAllNotices,
      });
      yield put({
        type: 'saveNotices',
        payload: data.filter(item => item),
      });
      const unreadCount = yield select(
        state => state.global.notices.filter(item => !item.read).length
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: data.length,
          unreadCount,
        },
      });
    },
    *fetchMoreNotices({ payload }, { call, put, select }) {
      const data = yield call(queryNotices, payload);
      const loadedAllNotices = data && data.length && data[data.length - 1] === null;
      yield put({
        type: 'setLoadedStatus',
        payload: loadedAllNotices,
      });
      yield put({
        type: 'pushNotices',
        payload: data.filter(item => item),
      });
      const unreadCount = yield select(
        state => state.global.notices.filter(item => !item.read).length
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: data.length,
          unreadCount,
        },
      });
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      const unreadCount = yield select(
        state => state.global.notices.filter(item => !item.read).length
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: count,
          unreadCount,
        },
      });
    },
    *changeNoticeReadState({ payload }, { put, select }) {
      const notices = yield select(state =>
        state.global.notices.map(item => {
          const notice = { ...item };
          if (notice.id === payload) {
            notice.read = true;
          }
          return notice;
        })
      );
      yield put({
        type: 'saveNotices',
        payload: notices,
      });
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: notices.length,
          unreadCount: notices.filter(item => !item.read).length,
        },
      });
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
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
    pushNotices(state, { payload }) {
      return {
        ...state,
        notices: [...state.notices, ...payload],
      };
    },
    setLoadedStatus(state, { payload }) {
      return {
        ...state,
        loadedAllNotices: payload,
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

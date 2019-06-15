import { findAuditlogs, findOperators, findResources } from "../services/auditlog.service";
import { formatDateFromMoment } from '@/utils/date-util';


export default {

  namespace: 'auditlog',


  state: {
    list: [],
  },


  effects: {
    *fetchList({ payload: { filterParameters } }, { call, put, select }) {

      const nFilterParameters = {
        ...filterParameters,
        start_time: filterParameters.date_range.length > 0 ? formatDateFromMoment(filterParameters.date_range[0], true) : null,
        end_time: filterParameters.date_range.length > 1 ? formatDateFromMoment(filterParameters.date_range[1], true) : null,
      };
      delete nFilterParameters.date_range;

      try {
        const response = yield call(findAuditlogs, nFilterParameters);

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


    *findOperators({ payload: { filterParameters } }, { call, put, select }) {
      try {
        const response = yield call(findOperators, filterParameters);
        return {
          total: parseInt(response.headers['x-total-count']),
          data: response.data,
        };
      } catch (e) {
        console.error(e);
      }
    },

    *findOperations({ payload: { filterParameters } }, { call, put, select }) {
      try {
        const response = yield call(findResources, filterParameters);
        return {
          total: parseInt(response.headers['x-total-count']),
          data: response.data,
        };
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

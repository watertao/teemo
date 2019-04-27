import { findResources } from '../services/resource.service';
import { convertPaginationFilterParam, convertSortFilterParam } from '@/utils/request-util';


export default {

    namespace: 'resource',

    state: {
        list: [],
    },


    effects: {
    
        *fetchList({ payload: { filterParameters } }, { call, put, select }) {

            try {
                const response = yield call(findResources, filterParameters);

                yield put({
                    type: 'updateList',
                    payload: response.data
                });
                return parseInt(response.headers['x-total-count']);
            } catch (e) {
                console.error(e);
                return 0;
            }
        }

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

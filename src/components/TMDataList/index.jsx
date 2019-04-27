import React, {Component} from "react";
import PropTypes from 'prop-types';
import { formatMessage as fm } from 'umi/locale';
import _ from 'lodash';
import {Table} from "antd";
import styles from './style.less';
import pconf from 'projectConfig';

export default class TMDataList extends Component {

  static propTypes = {
    onDataFetchExpect: PropTypes.func.isRequired,
    queryConditionRender: PropTypes.func,
    dataSource: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    rowKey: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    pagination: PropTypes.object,
  };

  static defaultProps = {
    rowKey: record => record.id,
    pagination: {
      defaultCurrent: 1,
      defaultPageSize: 10,
      pageSizeOptions: [ '10', '20', '50', '100'],
      showSizeChanger: true,
      simple: false,
      showTotal: (total, range) => (
        <span>
          { fm(
              {id: 'component.TMDataList.total'},
              { rangeStart: range[0], rangeEnd: range[1], total }
            )
          }
        </span>
      )
    },
  };

  constructor(props) {
    super(props);

    this._qcComponentRef = this._qcComponentRef.bind(this);
    this._onQueryConditionChange = this._onQueryConditionChange.bind(this);
    this._fireDataFetchExpectEvent = _.debounce(this._fireDataFetchExpectEvent, pconf.request.debounceDelay)

    props.componentRef && props.componentRef(this);

    const pagination = {
      ...TMDataList.defaultProps.pagination,
      ...props.pagination,
    };
    this.state = {
      tableProp: {
        last_cursor: (pagination.defaultCurrent - 1) * pagination.defaultPageSize,
        count: pagination.defaultPageSize,
      },
      pagination,
    }
  }

  query(type) {
    if (type == 'first') {
      this._firstPage(this._fireDataFetchExpectEvent);
    } else if (type == 'reset') {
      this._reset(this._fireDataFetchExpectEvent);
    } else {
      this._fireDataFetchExpectEvent();
    }
  }

  render() {
    const { queryConditionRender, rowKey, loading, dataSource, columns } = this.props;

    return (
      <React.Fragment>
        {
          queryConditionRender ? (
            <div className={styles['query-content']}>
              { queryConditionRender(this._qcComponentRef, this._onQueryConditionChange) }
            </div>
          ) : null
        }

        <div className={styles.content}>
          <Table
            rowKey={rowKey}
            loading={loading}
            dataSource={dataSource}
            columns={columns}
            pagination={this.state.pagination}
            onChange={this._onTablePropChange}
          />
        </div>

      </React.Fragment>
    );

  };

  _onTablePropChange = (pagination, _, sorter) => {

    this.setState({
      ...this.state,
      tableProp: {
        last_cursor: (pagination.current - 1) * pagination.pageSize,
        count: pagination.pageSize,
        sort_field: sorter.field,
        sort_order: sorter.order,
      },
      pagination: {
        ...this.state.pagination,
        ...pagination,
      }
    }, () => {
      this.query();
    });
  }

  _qcComponentRef = (qcComponent) => {
    this.qcComponent = qcComponent;
  }

  _onQueryConditionChange = () => {
    this.query('first');
  }

  _reset = (callback) => {
    this.qcComponent && this.qcComponent.resetForm();
    this.setState({
      tableProp: {
        ...this.state.tableProp,
        last_cursor: 0,
      },
      pagination: {
        ...this.state.pagination,
        current: 1,
      },
    }, callback)
  }

  _firstPage = (callback) => {
    this.setState({
      ...this.state,
      tableProp: {
        ...this.state.tableProp,
        last_cursor: 0,
      },
      pagination: {
        ...this.state.pagination,
        current: 1,
      },
    }, callback)
  }

  _fireDataFetchExpectEvent = () => {
    const { onDataFetchExpect } = this.props;
    Promise.resolve(onDataFetchExpect({...(this.qcComponent ? this.qcComponent.getFormValues() : {}), ...this.state.tableProp})).then(total => {
      this.setState({
        ...this.state,
        pagination: {
          ...this.state.pagination,
          total,
        }
      })
    });
  }



}

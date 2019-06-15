import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import mm from '@/utils/message-util';
import { formatMessage as fm, FormattedMessage } from 'umi/locale';
import {Button, Icon, Table, Tag} from 'antd';
import TMDataList from '@/components/TMDataList';
import dateformat from 'dateformat';
import { connect } from 'dva';
import styles from './style.less';
import QueryConditionForm from "./components/QueryConditionForm";


@connect(({ auditlog, loading }) => ({ auditlog, loading }))
export default class Auditlog extends Component {

  constructor(props) {
    super(props);
    this.tmDataListRef = React.createRef();
    this._onDataFetchExpect = this._onDataFetchExpect.bind(this);
    this._queryConditionRender = this._queryConditionRender.bind(this);
  }

  componentDidMount() {
    this.tmDataListRef.current.query();
  }


  render = () => {

    const { auditlog: { list }, loading } = this.props;

    const columns = [
      {
        title: '#',
        dataIndex: 'seq',
        width: 50,
        render: (text, record, index) => {
          return <span style={{ fontWeight: '500' }}>{index + 1}</span>;
        }
      },
      {
        title: mm('auditlog.field.logId'),
        dataIndex: 'id',
        width: 150,
        render: (text, record) => {
          return <a href="javascript:;" onClick={this._onDetailBtnClick.bind(this, record)}>{'#' + text}</a>;
        }
      },
      {
        title: mm('auditlog.field.method'),
        dataIndex: 'resource_verb',
        width: 100,
        render: (text, record, index) => {
          switch(text) {
            case 'DELETE':
              return <Tag color='#F50'>{ text }</Tag>;
            case 'GET':
              return <Tag color='#87D068'>{ text }</Tag>;
            case 'POST':
              return <Tag color='#108EE9'>{ text }</Tag>;
            case 'PUT':
              return <Tag color='#2DB7F5'>{ text }</Tag>;
            default:
              return <Tag color='#BFBFBF'>{ text }</Tag>
          }
        },
      },
      {
        title: mm('auditlog.field.uriPattern'),
        dataIndex: 'resource_uri_pattern',
        render: (text) => {
          return <span className={styles['uri_pattern']}>{ text }</span>
        }
      },
      {
        title: mm('auditlog.field.operation'),
        dataIndex: 'resource_name',
      },
      {
        title: mm('auditlog.field.operator'),
        dataIndex: 'operator_id',
        width: 140,
        render: (text, record) => {

          return <div className={styles.operator}>
            <div className={styles.name}>{ record.operator_name }</div>
            <div className={styles.extra}>{record.operator_login_name}#{record.operator_id}</div>
          </div>
        }
      },
      {
        title: mm('auditlog.field.operateTime'),
        dataIndex: 'operate_time',
        align: 'right',
        width: 200,
        render: (text) => {
          return <span>{ dateformat(text, 'yyyy-mm-dd HH:MM:ss') }</span>
        }
      },
      {
        title: mm('auditlog.field.cost'),
        dataIndex: 'cost',
        key: 'cost',
        align: 'right',
        width: 100,
        render: (text) => {
          return <React.Fragment><span>{ text }</span><span style={{ fontSize: '11px' }}> ms</span></React.Fragment>
        }
      },
    ];

    return (
      <PageHeaderWrapper
        title={mm('moduleName')}
      >

        <div className={ styles["button-area"] }>
          <Button onClick={this._onRefreshBtnClick} disabled={loading.effects['role/fetchList']} style={{ marginRight: '8px' }}>
            <Icon type="redo" /><span>{fm({id: 'component.TMDataList.btn.refresh'})}</span>
          </Button>
          <Button onClick={this._onResetBtnClick} disabled={loading.effects['role/fetchList']}>{fm({id: 'component.TMDataList.btn.reset'})}</Button>
        </div>

        <TMDataList
          ref={this.tmDataListRef}
          onDataFetchExpect={this._onDataFetchExpect}
          dataSource={list}
          columns={columns}
          loading={loading.effects['auditlog/fetchList']}
          queryConditionRender={this._queryConditionRender}
        />

      </PageHeaderWrapper>
    );

  }

  _queryConditionRender = (componentRef, onQueryConditionChange) => {
    const { loading } = this.props;
    return (
      <QueryConditionForm
        componentRef={componentRef}
        onQueryConditionChange={onQueryConditionChange}
        loading={loading.effects['auditlog/fetchList']}
      />
    );
  }

  _onRefreshBtnClick = () => {
    this.tmDataListRef.current.query();
  }

  _onResetBtnClick = () => {
    this.tmDataListRef.current.query('reset');
  }

  _onDetailBtnClick = (record) => {
    console.log(record)
  }

  _onDataFetchExpect = (filterParameters) => {
    const { dispatch } = this.props;
    return dispatch({
      type: 'auditlog/fetchList',
      payload: {
        filterParameters,
      }
    });
  }

}

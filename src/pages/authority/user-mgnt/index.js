import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage as fm, FormattedMessage } from 'umi/locale';
import mm from '@/utils/message-util';
import { connect } from 'dva';
import styles from './style.less';
import TMDataList from '@/components/TMDataList';
import QueryConditionForm from './components/QueryConditionForm';
import { Badge, Button, Divider, Icon, message, Popconfirm, Tag, Popover } from "antd";
import UserDetailDrawer, { OPERATE_TYPE_ENUM } from "./components/UserDetailDrawer";
import dateformat from 'dateformat';
import _ from "lodash";


@connect(({ user, loading }) => ({ user, loading }))
export default class Index extends PureComponent {

  constructor(props) {
    super(props);

    this.tmDataListRef = React.createRef();
    this._onDataFetchExpect = this._onDataFetchExpect.bind(this);
    this._queryConditionRender = this._queryConditionRender.bind(this);
    this._detailDrawerRef = this._detailDrawerRef.bind(this);
  }

  componentDidMount() {
    this.tmDataListRef.current.query();
  }

  render = () => {
    const { user: { list }, loading } = this.props;

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
        title: mm('label.loginName'),
        dataIndex: 'login_name',
        sorter: true,
        render: (text, record) => {
          return record.type == '1' ? (
            <a href="javascript:;" onClick={this._onDetailBtnClick.bind(this, record)}>{text}</a>
          ) : text;
        }
      },
      {
        title: mm('label.userName'),
        dataIndex: 'name',
      },
      {
        title: (
          <span>
            <span>{mm('label.userType')}</span>
            <Popover
              content={<div style={{width: '300px', fontSize: '12px'}}>{mm('tip.description.userType')}</div>}
              placement="top">
              <Icon className={styles["tb-column-title-tip"]} type="question-circle" />
            </Popover>

          </span>
        ),
        width: 150,
        dataIndex: 'type',
        render: (text, record, index) => {
          switch(text) {
            case '1':
              return <Tag color="blue">{mm('dict.userType.normal')}</Tag>;
            case '9':
              return <Tag color="volcano">{mm('dict.userType.supervisor')}</Tag>;
            default:
              return <Tag>{mm('dict.userType.unknown')}</Tag>;
          }
        },
      },
      {
        title: mm('label.userStatus'),
        width: 150,
        dataIndex: 'status',
        render: (text, record, index) => {
          switch(text) {
            case '0':
              return <Badge status="default" text={mm('dict.userStatus.disabled')} />;
            case '1':
              return <Badge status="success" text={mm('dict.userStatus.enabled')} />;
            default:
              return <span>{mm('dict.userStatus.unknown')}</span>
          }
        },
      },
      {
        title: mm('label.lastLoginTime'),
        dataIndex: 'last_login_time',
        sorter:  true,
        render: (value) => {
          if (value) {
            return dateformat(value, 'yyyy-mm-dd HH:MM:ss');
          } else {
            return '-';
          }

        },
      },
      {
        title: fm({id: 'label.action'}),
        width: 180,
        align: 'right',
        render: (text, record) => {
          return record.type == '1' ? (
            <span>
            <a href="javascript:;" onClick={this._onDetailBtnClick.bind(this, record)}>{fm({id: 'label.viewOrModify'})}</a>
            <Divider type="vertical" />
            <Popconfirm placement="topRight" title={mm('tip.confirm.deleteUser')} onConfirm={this._onDeleteBtnClick.bind(this, record)}>
              <a href="javascript:;">{fm({id: 'label.delete'})}</a>
            </Popconfirm>

          </span>
          ) : null;
        }
      }
    ];

    return (
      <PageHeaderWrapper title={mm('moduleName')}>

        <div className={ styles["button-area"] }>
          <Button onClick={this._onRefreshBtnClick} disabled={loading.effects['user/fetchList']} style={{ marginRight: '8px' }}>
            <Icon type="redo" /><span>{fm({id: 'component.TMDataList.btn.refresh'})}</span>
          </Button>
          <Button onClick={this._onResetBtnClick} disabled={loading.effects['user/fetchList']}>{fm({id: 'component.TMDataList.btn.reset'})}</Button>

          <div style={{float: 'right'}}>
            <Button type="primary" onClick={this.onCreateBtnClick} disabled={loading.effects['user/fetchList']}>{mm('button.createUser')}</Button>
          </div>
        </div>

        <TMDataList
          ref={this.tmDataListRef}
          onDataFetchExpect={this._onDataFetchExpect}
          dataSource={list}
          columns={columns}
          loading={loading.effects['user/fetchList']}
          queryConditionRender={this._queryConditionRender}
        />

        <UserDetailDrawer
          componentRef={this._detailDrawerRef}
          onSubmitSuccessCallback={this._onRefreshBtnClick}
        />

      </PageHeaderWrapper>
    );

  }

  _detailDrawerRef = (component) => {
    this.detailDrawerRef = component;
  }

  _onDataFetchExpect = (filterParameters) => {
    const { dispatch } = this.props;
    return dispatch({
      type: 'user/fetchList',
      payload: {
        filterParameters,
      }
    });
  }

  _queryConditionRender = (componentRef, onQueryConditionChange) => {
    const { loading } = this.props;
    return (
      <QueryConditionForm
        componentRef={componentRef}
        onQueryConditionChange={onQueryConditionChange}
        loading={loading.effects['user/fetchList']}
      />
    );
  }

  _onRefreshBtnClick = () => {
    this.tmDataListRef.current.query();
  }

  _onResetBtnClick = () => {
    this.tmDataListRef.current.query('reset');
  }

  _onDeleteBtnClick = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/deleteUser',
      payload: { userId: record.id },
    }).then((result) => {
      if (result) {
        message.success(mm('tip.feedback.deleteUserSuccess'));
        this.tmDataListRef.current.query('reset');
      }
    });
  }

  _onDetailBtnClick = (record) => {
    this.detailDrawerRef.show(OPERATE_TYPE_ENUM.MODIFY, record.id);
  }

  onCreateBtnClick = () => {
    this.detailDrawerRef.show(OPERATE_TYPE_ENUM.CREATE);
  }

}

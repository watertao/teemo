import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage as fm, FormattedMessage } from 'umi/locale';
import mm from '@/utils/message-util';
import { connect } from 'dva';
import styles from './style.less';
import { Form, Badge, Select, Button, Input, Radio, Divider, Popconfirm, message, Icon } from "antd";
import TMDataList from '@/components/TMDataList';
import TMStandardFormRow from '@/components/TMStandardFormRow';
import RoleDetailDrawer, { ROLE_OPERATE_TYPE_ENUM } from './components/RoleDetailDrawer';
import QueryConditionForm from './components/QueryConditionForm';

const { Option } = Select;
const FormItem = Form.Item;



@connect(({ loading, role }) => ({ loading, role }))
export default class Index extends Component {

  constructor(props) {
    super(props);
    this.tmDataListRef = React.createRef();
    this._onDataFetchExpect = this._onDataFetchExpect.bind(this);
    this._queryConditionRender = this._queryConditionRender.bind(this);
  }

  componentDidMount() {
    this.tmDataListRef.current.query();
  }

  _onDataFetchExpect = (filterParameters) => {
    const { dispatch } = this.props;
    return dispatch({
      type: 'role/fetchList',
      payload: {
        filterParameters,
      }
    });
  }

  roleEditDrawerRef = (component) => {
    this.roleEditDrawer = component;
  }

  render = () => {
    const { role: { list }, loading } = this.props;

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
        title: mm('label.roleName'),
        dataIndex: 'name',
        sorter:  true,
      },
      {
        title: mm('label.roleCode'),
        dataIndex: 'code',
        sorter: true,
      },
      {
        title: mm('label.roleStatus'),
        width: 150,
        dataIndex: 'status',
        render: (text, record, index) => {
          switch(text) {
            case '0':
              return <Badge status="default" text={mm('dict.roleStatus.disabled')} />;
            case '1':
              return <Badge status="success" text={mm('dict.roleStatus.enabled')} />;
            default:
              return <span>{mm('dict.roleStatus.unknown')}</span>
          }
        },
      },
      {
        title: fm({id: 'label.action'}),
        width: 180,
        align: 'right',
        render: (text, record) => {
          return (
            <span>
            <a href="javascript:;" onClick={this._onDetailBtnClick.bind(this, record)}>{fm({id: 'label.viewOrModify'})}</a>
            <Divider type="vertical" />
            <Popconfirm placement="topRight" title={mm('tip.confirm.deleteRole')} onConfirm={this._onDeleteBtnClick.bind(this, record)}>
              <a href="javascript:;">{fm({id: 'label.delete'})}</a>
            </Popconfirm>

          </span>
          );
        }
      }
    ];

    return (
      <PageHeaderWrapper title={mm('moduleName')}>

        <div className={ styles["button-area"] }>
          <Button onClick={this._onRefreshBtnClick} disabled={loading.effects['role/fetchList']} style={{ marginRight: '8px' }}>
            <Icon type="redo" /><span>{fm({id: 'component.TMDataList.btn.refresh'})}</span>
          </Button>
          <Button onClick={this._onResetBtnClick} disabled={loading.effects['role/fetchList']}>{fm({id: 'component.TMDataList.btn.reset'})}</Button>

          <div style={{float: 'right'}}>
            <Button type="primary" onClick={this._onCreateBtnClick} disabled={loading.effects['role/fetchList']}>{mm('button.createRole')}</Button>
          </div>
        </div>

        <TMDataList
          ref={this.tmDataListRef}
          onDataFetchExpect={this._onDataFetchExpect}
          dataSource={list}
          columns={columns}
          loading={loading.effects['role/fetchList']}
          queryConditionRender={this._queryConditionRender}
        >

        </TMDataList>
        <RoleDetailDrawer
          componentRef={this.roleEditDrawerRef}
          onSubmitSuccessCallback={this._onRefreshBtnClick}
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
        loading={loading.effects['role/fetchList']}
      />
    );
  }


  _onRefreshBtnClick = () => {
    this.tmDataListRef.current.query();
  }

  _onResetBtnClick = () => {
    this.tmDataListRef.current.query('reset');
  }

  _onCreateBtnClick = () => {
    this.roleEditDrawer.show(ROLE_OPERATE_TYPE_ENUM.CREATE);
  }

  _onDeleteBtnClick = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/deleteRole',
      payload: { roleId: record.id },
    }).then(() => {
      message.success(mm('tip.feedback.deleteRoleSuccess'));
      this.tmDataListRef.current.query('first');
    });
  }

  _onDetailBtnClick = (record) => {
    this.roleEditDrawer.show(ROLE_OPERATE_TYPE_ENUM.MODIFY, record.id);
  }

  _onRoleModifySubmitBtnClick = () => {

  }

}

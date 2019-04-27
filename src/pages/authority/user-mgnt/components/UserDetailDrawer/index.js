import React, { PureComponent } from 'react';
import { Transfer, Form, Tabs, Radio, Button, Input, message } from 'antd';
import mm from '@/utils/message-util';
import PropTypes from "prop-types";
import TMFormDrawer from '@/components/TMFormDrawer';
import RoleAssignment from '../RoleAssignment';
import { connect } from 'dva';
import styles from './style.less';

export const OPERATE_TYPE_ENUM = {
  CREATE: 'create',
  MODIFY: 'modify',
}



class UserDetailDrawer extends PureComponent {

  static propTypes = {
    componentRef: PropTypes.func,
    onSubmitSuccessCallback: PropTypes.func,
  };

  static defaultProps = {
    componentRef: () => {},
    onSubmitSuccessCallback: () => {},
  };

  constructor(props) {
    super(props);
    props.componentRef(this);
    this._initForm = this._initForm.bind(this);
    this._onSubmitBtnClick = this._onSubmitBtnClick.bind(this);
    this._onSubmitSuccess = this._onSubmitSuccess.bind(this);
    this._renderForm = this._renderForm.bind(this);
  }

  show = (operateType, itemId) => {
    const { dispatch } = this.props;
    dispatch({ type: 'user_detail/updateModel', payload: { operateType } });
    this.tmFormDrawer.show({ operateType, itemId });
  }

  render = () => {
    const { fetchUserDetail, user_detail } = this.props;
    return (
      <TMFormDrawer
        width={620}
        title={this._renderTitle()}
        componentRef={tmFormDrawer => this.tmFormDrawer = tmFormDrawer}
        loading={fetchUserDetail}
        initForm={this._initForm}
        onSubmitBtnClick={this._onSubmitBtnClick}
        onSubmitSuccessCallback={this._onSubmitSuccess}
      >
        { this._renderForm }
      </TMFormDrawer>
    );

  }

  _onSubmitSuccess = () => {
    const { onSubmitSuccessCallback } = this.props;
    onSubmitSuccessCallback();
  }

  _onSubmitBtnClick = values => {
    const { dispatch } = this.props;
    return new Promise((resolve) => {
      resolve(dispatch({
        type: 'user_detail/submitForm',
        payload: values
      }));
    });

  }

  _initForm(initData, form) {
    const { dispatch } = this.props;
    const { setFieldsValue } = form;

    dispatch({
      type: 'user_detail/initDrawer',
      payload: initData,
    }).then(() => {
      const { user_detail: { operateType, detail } } = this.props;
      if (operateType == OPERATE_TYPE_ENUM.CREATE) {
        setFieldsValue({
          login_name: '',
          name: '',
          password: '',
          remark: '',
          role_ids: []
        });
      } else if (operateType == OPERATE_TYPE_ENUM.MODIFY) {
        setFieldsValue({
          login_name: detail.login_name,
          name: detail.name,
          remark: detail.remark,
          role_ids: detail.roles.map(r => r.id),
          status: detail.status,
        });
      }

    });
  }

  _renderForm(form) {
    const { getFieldDecorator } = form;
    const { user_detail: { tabKey, operateType, fullRoles }, dispatch } = this.props;

    return (
      <React.Fragment>
        <Tabs className={styles.tab} activeKey={tabKey} animated={false} onChange={tabKey => dispatch({type: 'user_detail/updateModel', payload: {tabKey}})}>
          <Tabs.TabPane tab={mm('label.tab.basic')} key='1' style={{ padding: '16px 16px 0 16px', overflow: 'auto' }} forceRender={true}>

            <Form.Item label={mm('label.userName')}>
              {getFieldDecorator('name', {
                rules: [
                  {required: true, message: mm('tip.formValidation.userName.empty')}
                ]
              })(<Input style={{width: '50%'}}  />)}
            </Form.Item>
            <Form.Item
              label={mm('label.loginName')}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              {getFieldDecorator('login_name', {
                rules: [
                  {required: true, message: mm('tip.formValidation.loginName.empty')}
                ]
              })(<Input style={{width: '50%'}} />)}
            </Form.Item>
            {
              operateType == OPERATE_TYPE_ENUM.CREATE ? (
                <Form.Item
                  label={mm('label.userPassword')}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  {getFieldDecorator('password', {
                    rules: [
                      {required: true, message: mm('tip.formValidation.password.empty')}
                    ]
                  })(<Input.Password style={{width: '50%'}} />)}
                </Form.Item>
              ) : null
            }
            {
              operateType == OPERATE_TYPE_ENUM.MODIFY ? (
                <Form.Item
                  label={mm('label.userStatus')}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  {getFieldDecorator('status', {})(
                    <Radio.Group>
                      <Radio.Button value="1">{mm('dict.userStatus.enabled')}</Radio.Button>
                      <Radio.Button value="0">{mm('dict.userStatus.disabled')}</Radio.Button>
                    </Radio.Group>
                  )}
                </Form.Item>
              ) : null
            }
            <Form.Item
              label={mm('label.userRemark')}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              {getFieldDecorator('remark', {})(<Input.TextArea style={{marginTop: '4px'}} rows={4} />)}
            </Form.Item>
          </Tabs.TabPane>
          <Tabs.TabPane tab={mm('label.tab.authority')} key='2' style={{ paddingLeft: 16, paddingTop: 16 }}>

            {getFieldDecorator('role_ids', {})(<RoleAssignment fullRoles={fullRoles}/>)}

          </Tabs.TabPane>

        </Tabs>
      </React.Fragment>
    );
  }

  _renderTitle = () => {
    const { user_detail: { operateType } } = this.props;
    switch(operateType) {
      case OPERATE_TYPE_ENUM.CREATE :
        return mm('label.createUser');
      case OPERATE_TYPE_ENUM.MODIFY :
        return mm('label.userDetail');
    }
  }

}

export default connect(({ user_detail, loading }) => ({
  user_detail,
  fetchUserDetail: loading.effects['user_detail/initDrawer'],
}))(UserDetailDrawer);

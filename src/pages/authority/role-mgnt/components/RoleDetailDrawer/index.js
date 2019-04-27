import React, { PureComponent } from 'react';
import { Drawer, Form, Tabs, Radio, Button, Input } from 'antd';
import mm from '@/utils/message-util';
import PropTypes from "prop-types";
import TMFormDrawer from '@/components/TMFormDrawer';
import AuthorityTree from '../AuthorityTree';
import { connect } from 'dva';

export const ROLE_OPERATE_TYPE_ENUM = {
  CREATE: 'create',
  MODIFY: 'modify',
}



class RoleEditDrawer extends PureComponent {

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


  /**
   * 使用 api 来管理 drawer 的显示状态，可让父组件不必维护 visible，父组件的 model 变得更干净。
   * 当然 副作用就是 父组件无法获取 drawer 的 visible 状态，不过可以通过额外增加一个 isVisible() API 来解决。
   * @param operateType
   * @param roleId
   */
  show = (operateType, roleId) => {
    const { dispatch } = this.props;
    dispatch({ type: 'role_detail/updateModel', payload: { operateType } });
    this.tmFormDrawer.show({ operateType, roleId });
  }

  render = () => {
    console.log('render RoleDetailDrawer')
    const { fetchRoleDetail } = this.props;
    return (
      <TMFormDrawer
        width={620}
        title={this._renderTitle()}
        componentRef={tmFormDrawer => this.tmFormDrawer = tmFormDrawer}
        loading={fetchRoleDetail}
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
        type: 'role_detail/submitForm',
        payload: values
      }));
    });

  }

  _initForm(initData, form) {
    const { dispatch } = this.props;
    const { setFieldsValue } = form;

    dispatch({
      type: 'role_detail/initDrawer',
      payload: initData,
    }).then(() => {
      setFieldsValue(this.props.role_detail.formData);
    });
  }

  _renderForm(form) {
    const { getFieldDecorator } = form;
    const { role_detail: { tabKey, operateType }, dispatch } = this.props;

    return (
      <React.Fragment>
        <Tabs activeKey={tabKey} animated={false} onChange={tabKey => dispatch({type: 'role_detail/updateModel', payload: {tabKey}})}>
          <Tabs.TabPane tab={mm('label.tab.basic')} key='1' style={{ padding: '16px 16px 0 16px', }} forceRender={true}>

            <Form.Item
              label={mm('label.roleName')}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              {getFieldDecorator('name', {
                rules: [
                  {required: true, message: mm('tip.formValidation.roleName.empty')}
                ]
              })(<Input style={{width: '50%'}} />)}
            </Form.Item>
            <Form.Item
              label={mm('label.roleCode')}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              {getFieldDecorator('code', {
                rules: [
                  {required: true, message: mm('tip.formValidation.roleCode.empty')}
                ]
              })(<Input style={{width: '50%'}} />)}
            </Form.Item>
            {
              operateType == ROLE_OPERATE_TYPE_ENUM.MODIFY ? (
                <Form.Item
                  label={mm('label.roleStatus')}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  {getFieldDecorator('status', {})(
                    <Radio.Group>
                      <Radio.Button value="1">{mm('dict.roleStatus.enabled')}</Radio.Button>
                      <Radio.Button value="0">{mm('dict.roleStatus.disabled')}</Radio.Button>
                    </Radio.Group>
                  )}
                </Form.Item>
              ) : null
            }
            <Form.Item
              label={mm('label.roleRemark')}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              {getFieldDecorator('remark', {})(<Input.TextArea style={{marginTop: '4px'}} rows={4} />)}
            </Form.Item>

          </Tabs.TabPane>
          <Tabs.TabPane tab={mm('label.tab.authority')} key='2' style={{ paddingLeft: 16, paddingTop: 8 }} forceRender={true}>

            {getFieldDecorator('resource_ids', {})(<AuthorityTree/>)}

          </Tabs.TabPane>

        </Tabs>
      </React.Fragment>
    );
  }

  _renderTitle = () => {
    const { role_detail: { operateType } } = this.props;
    console.log(operateType)
    switch(operateType) {
      case ROLE_OPERATE_TYPE_ENUM.CREATE :
        console.log(mm('label.createRole'))
        return mm('label.createRole');
      case ROLE_OPERATE_TYPE_ENUM.MODIFY :
        console.log(mm('label.roleDetail'))
        return mm('label.roleDetail');

    }
  }

}

export default connect(({ role_detail, loading }) => ({
  role_detail,
  fetchRoleDetail: loading.effects['role_detail/initDrawer'],
}))(RoleEditDrawer);

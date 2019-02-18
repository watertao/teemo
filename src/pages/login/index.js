import React, {Component} from 'react';
import {Form, Input, Icon, Button, Radio, Popover, Alert} from 'antd';
import {connect} from 'dva';
import styles from './login.css';
import logo from '@/assets/EDA-LOGO.svg';
import _ from 'lodash';


@connect(({app, loading}) => ({app, loading}))
@Form.create()
export default class Login extends Component {


  constructor(props) {
    super(props);
  }


  render = () => {

    const {loading, form} = this.props;
    const {getFieldDecorator} = form;

    return (
      <div className={styles["login-container"]}>
        <div className={styles["login-panel"]}>

          <div className={styles.banner}>
            <div className={styles.title}>登录到 XXX 管理平台</div>
            <img className={styles.logo} src={logo}/>
          </div>

          <div className={styles['login-form']}>
            <Form onSubmit={this.login}>
              <Form.Item>
                <div className={styles['input-label']}><span>用户名</span></div>
                {getFieldDecorator('login_name', {
                  rules: [{required: true, message: '用户名不可为空'}],
                })(
                  <Input size='large' prefix={<Icon type="user" className={styles["input-prefix-icon"]}/>}/>
                )}
              </Form.Item>

              <Form.Item>
                <div className={styles['input-label']}><span>密码</span></div>

                <div className={styles['forget-password']}>
                  <Popover placement="top" content='asdfgasdf' trigger="click">
                    <a tabIndex='-1' href="#">忘记密码?</a>
                  </Popover>
                </div>
                {getFieldDecorator('password', {
                  rules: [{required: true, message: '密码不可为空'}],
                })(
                  <Input size='large' type='password'
                         prefix={<Icon type="lock" className={styles["input-prefix-icon"]}/>}
                  />
                )}
              </Form.Item>


              <Button loading={loading.effects['global/login']} htmlType="submit" style={{width: '100%'}} type="primary"
                      size='large' disabled={!this.isFormFullFilled()}>登 录</Button>


            </Form>
          </div>

          {/*<div className={styles['login-type']}>*/}
          {/*<div className={styles['login-type-label']}>认证方式</div>*/}
          {/*<Radio.Group value={login.form.auth_type} size="large" style={{ width: '100%' }} onChange={this.changeAuthType.bind(this)}>*/}
          {/*<Radio.Button className={styles["radio-btn"]} value="0">*/}
          {/*<span>本地账号登录</span>*/}
          {/*</Radio.Button>*/}
          {/*<Radio.Button disabled className={styles["radio-btn"]} value="1" >*/}
          {/*<span>OA 账号登录</span>*/}
          {/*</Radio.Button>*/}
          {/*</Radio.Group>*/}
          {/*</div>*/}

        </div>
      </div>
    );

  }


  login = (e) => {
    e.preventDefault();
    const {dispatch, form} = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'global/login',
          payload: {
            ...values
          }
        });
      }
    });
  }


  isFormFullFilled = () => {
    const {form} = this.props;
    const fieldsValues = form.getFieldsValue();

    if (_.isEmpty(fieldsValues.login_name) || _.isEmpty(fieldsValues.password)) {
      return false;
    } else {
      return true;
    }

  }


}

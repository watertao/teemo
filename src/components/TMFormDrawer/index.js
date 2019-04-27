import React, { PureComponent } from 'react';
import {Button, Drawer, Form, message } from "antd";
import PropTypes from "prop-types";
import PageLoading from '@/components/PageLoading';
import { formatMessage as fm } from 'umi/locale';
import styles from './style.less';


/** drawer 动画的持续时间 */
const DRAWER_TRANSFORM_DURATION = 350;

/**
 * 具有 form 编辑的抽屉组件
 * 抽象：
 * 1. 定义 form
 * 2. 定义 submit 事件，该事件能够获取当前 form 的值
 * 3. 初始化 form， 在 show（） 之前会被调用
 * 4. 显示 form 的 API
 * 5. 关闭 form 的 API
 * 6. submit 提交成功后的回调，在某些场景用于刷新父组件的数据
 *
 *
 */
@Form.create()
export default class TMFormDrawer extends PureComponent {

  static propTypes = {
    componentRef: PropTypes.func,
    title: PropTypes.string,
    width: PropTypes.number,
    /** drawer loading status, usually used when form data is on loading */
    loading: PropTypes.bool,
    /**
     * IMPORTANT: trigger when submit button clicked, this function should return a boolean value or a promise which resolve a
     * boolean value, TMFormDrawer use this for deciding whether close or remain drawer.
     * */
    onSubmitBtnClick: PropTypes.func,
    /** called before show */
    initForm: PropTypes.func,
    onSubmitSuccessCallback: PropTypes.func,
  };

  static defaultProps = {
    componentRef: () => {},
    title: '',
    width: 620,
    loading: false,
    onSubmitBtnClick: (form) => true,
    onSubmitSuccessCallback: () => {},
    initForm: (form) => {},
  };

  state = {
    visible: false,
    submitLoading: false,
    transition: false,
  };

  constructor(props) {
    super(props);
    props.componentRef(this);
  }

  show(initData) {
    const { initForm, form } = this.props;
    this.setState({ visible: true, transition: true }, () => {
      setTimeout(() => {
        initForm(initData, form);
        this.setState({ transition: false });
      }, DRAWER_TRANSFORM_DURATION)

    });
  }

  hide() {
    this.setState({ visible: false });
  }

  render() {
    const { visible, submitLoading, transition } = this.state;
    const { width, title, loading, children, form } = this.props;
    return (
      <Drawer
        destroyOnClose={true}
        closable={false}
        title={title}
        width={width}
        placement='right'
        className={styles['form-drawer']}
        visible={visible}
        onClose={this._closeDrawer}
      >
        {
          (loading || transition) ? (
            <PageLoading />
          ) : (
            <div style={{ height: '100%'}}>
              <Form style={{ height: '100%'}}>
                { children(form) }
              </Form>
              <div className={styles.footer}>
                <Button
                  className={styles["button"]} type='primary'
                  loading={submitLoading} onClick={this._fireSubmitEvent.bind(this, form)}
                >{fm({id: 'component.TMFormDrawer.button.submit'})}</Button>
                <Button className={styles["button"]} onClick={this._closeDrawer}
                >{fm({id: 'component.TMFormDrawer.button.close'})}</Button>
              </div>
            </div>
          )
        }
      </Drawer>
    );
  }

  _closeDrawer = () => {
    // fix concurrent effects cause loading status error
    const { loading } = this.props;
    if (!loading) {
      this.setState({ visible: false });
    }
  }

  _fireSubmitEvent = (form) => {

    form.validateFields((errors, values) => {
      if (!errors) {
        const { onSubmitBtnClick, onSubmitSuccessCallback } = this.props;
        this.setState({ submitLoading: true }, () => {

          Promise.resolve(onSubmitBtnClick(values)).then((result) => {
            this.setState({ submitLoading: false })
            if (result == true) {
              message.success(fm({id: 'component.TMFormDrawer.tip.submitSuccess'}));
              this.hide();
              // 滑动完成后再执行可避免滑动过程中因为组件的render而卡顿
              setTimeout(onSubmitSuccessCallback, DRAWER_TRANSFORM_DURATION);

            }
          }).catch(() => {
            this.setState({ submitLoading: false })
          });
        })
      } else {
        message.error(errors[Object.keys(errors)[0]].errors[0].message);
      }
    });

  }

}

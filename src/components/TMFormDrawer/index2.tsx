import React, { PureComponent } from 'react';
import {Button, Drawer, Form,} from "antd";
import { FormComponentProps } from "antd/lib/form/Form";
import PropTypes from "prop-types";
import PageLoading from '@/components/PageLoading';

const styles = require("./style.less");

interface IFormComponentProps extends FormComponentProps {
  componentRef: Function,
  title: string,
  width: number,
  loading: boolean,
  onSubmitBtnClick: Function,
}


export default abstract class TMFormDrawer extends PureComponent<IFormComponentProps> {

  static propTypes = {
    componentRef: PropTypes.func,
    title: PropTypes.string,
    width: PropTypes.number,
    /** drawer loading status, usually used when form data is on loading */
    loading: PropTypes.bool,
    /**
     * IMPORTANT: trigger when submit button clicked, this function should return or a boolean value or a promise which resolve a
     * boolean value, TMFormDrawer use this for deciding whether close or remain drawer.
     * */
    onSubmitBtnClick: PropTypes.func,
  };

  static defaultProps = {
    componentRef: () => {},
    title: '',
    width: 620,
    loading: false,
    onSubmitBtnClick: () => true,
  };

  state = {
    visible: false,
    submitLoading: false,
  };

  protected constructor(props) {
    super(props);
    props.componentRef(this);
  }

  show() {
    this.setState({ visible: true });
  }

  abstract renderForm(): React.ReactNode;

  render() {
    const { visible, submitLoading } = this.state;
    const { width, title, loading } = this.props;
    return (
      <Drawer
        closable={false}
        title={title}
        width={width}
        placement='right'
        className={styles['form-drawer']}
        visible={visible}
        onClose={this._closeDrawer}
      >
        {
          loading ? (
            <PageLoading />
          ) : (
            <div>
              <Form>
                { this.renderForm() }
              </Form>
              <div className={styles.footer}>
                <Button className={styles["button"]} type='primary' loading={submitLoading} onClick={this._fireSubmitEvent}>提交</Button>
                <Button className={styles["button"]} onClick={this._closeDrawer}>关闭</Button>
              </div>
            </div>
          )
        }
      </Drawer>
    );
  }

  _closeDrawer = () => {
    this.setState({ visible: false });
  }

  _fireSubmitEvent = () => {
    const { onSubmitBtnClick } = this.props;
    this.setState({ submitLoading: true }, () => {

      Promise.resolve(onSubmitBtnClick()).then(() => {
        this.setState({ submitLoading: false })
      }).catch(() => {
        this.setState({ submitLoading: false })
      });
    })
  }

}

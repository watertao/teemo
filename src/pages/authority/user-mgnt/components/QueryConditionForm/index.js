import React from 'react';
import AbstractQueryCondition from '@/components/TMDataList/query-condition';
import TMStandardFormRow from '@/components/TMStandardFormRow';
import { Form, Input, Radio  } from "antd";
import _ from 'lodash';
import mm from '@/utils/message-util';

const { Item: FormItem } = Form;


export default class QueryConditionForm extends AbstractQueryCondition {

  static propTypes = {
    ...AbstractQueryCondition.propTypes
  };

  static initQueryCondition = {
    name: '',
    status: 'a',
  };

  constructor(props) {
    super(props);
    this.nameRef = React.createRef();
    this.lastQueryCondition = { ...QueryConditionForm.initQueryCondition };
    this.state = {
      ...QueryConditionForm.initQueryCondition,
    }
  }

  resetForm(callback) {
    this.setState({ ...QueryConditionForm.initQueryCondition }, callback);
  }

  getFormValues() {
    return _.cloneDeep(this.state);
  }

  render() {
    const { loading } = this.props;

    const labelWidth = { labelWidth: 100};
    const contentWidth = { width: 300 };

    return (
      <Form layout="inline">
        <TMStandardFormRow {...labelWidth} title={mm('label.userName')} grid>
          <FormItem>
            <Input
              disabled={loading}
              placeholder={mm('tip.queryCondition.userName')}
              style={contentWidth}
              allowClear
              value={this.state.name}
              ref={this.nameRef}
              onChange={this._onNameChange}
              onBlur={this._onNameBlur}
            />
          </FormItem>
        </TMStandardFormRow>
        <TMStandardFormRow {...labelWidth} title={mm('label.userStatus')} grid last>
          <FormItem>
            <Radio.Group disabled={loading} value={this.state.status} onChange={this._onStatusChange}>
              <Radio.Button value="a">{mm('dict.userStatus.all')}</Radio.Button>
              <Radio.Button value="1">{mm('dict.userStatus.enabled')}</Radio.Button>
              <Radio.Button value="0">{mm('dict.userStatus.disabled')}</Radio.Button>
            </Radio.Group>
          </FormItem>

        </TMStandardFormRow>

      </Form>
    );

  };

  _onStatusChange = (e) => {
    this.onFieldChange({ status: e.target.value });
  }

  _onNameChange = (e) => {
    this.setState({ name: e.currentTarget.value }, () => {
      this.nameRef.current.focus();
    });
  }

  _onNameBlur = () => {
    this.fireQueryConditionChangeEvent();
  }

}

import React from 'react';
import AbstractQueryCondition from '@/components/TMDataList/query-condition';
import TMStandardFormRow from '@/components/TMStandardFormRow';
import TMCombobox from '@/components/form-item/TMCombobox2';
import { Form, Input, Radio, Row, Col, DatePicker  } from "antd";
import _ from 'lodash';
import mm from '@/utils/message-util';
import { connect } from 'dva';
import styles from './style.less';

const { Item: FormItem } = Form;
const { RangePicker } = DatePicker;


@connect(({ auditlog, loading }) => ({ auditlog, gLoading: loading }))
export default class QueryConditionForm extends AbstractQueryCondition {

  static propTypes = {
    ...AbstractQueryCondition.propTypes
  };

  static initQueryCondition = {
    operator: [],
    operation: [],
    date_range: [],
  };

  constructor(props) {
    super(props);
    this.lastQueryCondition = { ...QueryConditionForm.initQueryCondition };
    this.state = {
      ...QueryConditionForm.initQueryCondition,
    };
  }

  resetForm(callback) {
    this.setState({ ...QueryConditionForm.initQueryCondition }, callback);
  }

  getFormValues() {
    return _.cloneDeep(this.state);
  }



  render() {
    const { loading, auditlog, gLoading } = this.props;

    return (
      <Form layout="inline" labelCol={{ span: 4 }}>
        <TMStandardFormRow grid>
          <Row gutter={16}>
            <Col md={12} sm={24} xs={24}>
              <FormItem label={'Operator'}>
                <TMCombobox
                  disabled={loading}
                  placeHolder={'请输入查询关键字'}
                  onSearchExpected={this._fetchOperators}
                  value={this.state.operator}
                  onChange={this._onOperatorChange}
                  optionContentRender={this._renderOperatorSearchOption}
                  tagResolver={item => item.name}
                ></TMCombobox>
              </FormItem>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <FormItem label={'Operation'}>
                <TMCombobox
                  disabled={loading}
                  placeHolder={'请输入查询关键字'}
                  onSearchExpected={this._fetchOperations}
                  value={this.state.operation}
                  onChange={this._onOperationChange}
                  optionContentRender={this._renderOperationSearchOption}
                  tagResolver={item => item.name}
                ></TMCombobox>
              </FormItem>
            </Col>
          </Row>
        </TMStandardFormRow>
        <TMStandardFormRow grid last>
          <FormItem label={'Operate Time'} labelCol={{span: 2}}>
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              placeholder={['Start Time', 'End Time']}
              value={this.state.date_range}
              onChange={this._onDateRangeChange}
            />
          </FormItem>

        </TMStandardFormRow>


      </Form>
    );

  };

  _fetchOperators = (keyword, page, pageSize) => {
    const { dispatch } = this.props;
    return dispatch({
      type: 'auditlog/findOperators',
      payload: {
        filterParameters: {
          keyword,
          last_cursor:(page - 1) * pageSize,
          count: pageSize,
        }
      },
    });
  }

  _fetchOperations = (keyword, page, pageSize) => {
    const { dispatch } = this.props;
    return dispatch({
      type: 'auditlog/findOperations',
      payload: {
        filterParameters: {
          keyword,
          last_cursor:(page - 1) * pageSize,
          count: pageSize,
        }
      },
    });
  }

  _onDateRangeChange = (value) => {
    this.onFieldChange({date_range: value});
  }

  _onOperatorChange = (value) => {
    this.onFieldChange({operator: value});
  }

  _onOperationChange = (value) => {
    this.onFieldChange({operation: value});
  }

  _renderOperatorSearchOption = (item, highlight) => {
    return (
      <React.Fragment>
        <span>{highlight(item.name)}</span>
        <span className={styles.login_name}>({highlight(item.login_name)}#{item.id})</span>
      </React.Fragment>
    );
  }

  _renderOperationSearchOption = (item, highlight) => {
    return (
      <React.Fragment>
        <div>{highlight(item.name)}</div>
        <div style={{height: '17px', lineHeight: '17px', verticalAlign: 'middle'}}>{this._makeMenuTipContentVerbTag(item.verb)}<span style={{height: '16px', lineHeight: '16px', fontStyle: 'italic', fontSize: '11px', verticalAlign:'middle'}}> {highlight(item.uri_pattern)}</span></div>
      </React.Fragment>
    );
  }

  _makeMenuTipContentVerbTag(verb) {
    switch(verb) {
      case 'DELETE':
        return <span style={{ backgroundColor: '#F50', height: '16px', lineHeight: '16px', fontSize: '11px', color: '#FFF', fontWeight: '700', paddingLeft: '2px', paddingRight: '2px', borderRadius: '2px' }}>{ verb }</span>;
      case 'GET':
        return <span style={{ backgroundColor: '#87D068', height: '16px', lineHeight: '16px', fontSize: '11px', color: '#FFF', fontWeight: '700', paddingLeft: '2px', paddingRight: '2px', borderRadius: '2px' }}>{ verb }</span>;
      case 'POST':
        return <span style={{ backgroundColor: '#108EE9', height: '16px', lineHeight: '16px', fontSize: '11px', color: '#FFF', fontWeight: '700', paddingLeft: '2px', paddingRight: '2px', borderRadius: '2px' }}>{ verb }</span>;
      case 'PUT':
        return <span style={{ backgroundColor: '#2DB7F5', height: '16px', lineHeight: '16px', fontSize: '11px', color: '#FFF', fontWeight: '700', paddingLeft: '2px', paddingRight: '2px', borderRadius: '2px' }}>{ verb }</span>;
      default:
        return <span style={{ backgroundColor: '#BFBFBF', height: '16px', lineHeight: '16px', fontSize: '11px', color: '#FFF', fontWeight: '700', paddingLeft: '2px', paddingRight: '2px', borderRadius: '2px' }}>{ verb }</span>
    }
  }

}

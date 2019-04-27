import React, { Component } from 'react';
import { Transfer, Icon, Popover, Tag } from 'antd';
import PropTypes from "prop-types";
import { connect } from 'dva';
import _ from 'lodash';
import mm from '@/utils/message-util';
import { getResourceByVerbUriPattern } from '@/utils/authority';
import styles from './style.less';


/**
 * 角色分配控件
 * value 是 role id 集合，例： [ 1, 2, 3, 4 ]
 *
 */
@connect()
export default class RoleAssignment extends Component {

  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.array,
    fullRoles: PropTypes.array,
  };


  /**
   * full menu data with events
   *
   * @type {Array}
   */
  static fullMenuData = [];

  static getDerivedStateFromProps(nextProps, state) {

    // Should be a controlled component.
    if ('value' in nextProps && nextProps.value != undefined) {
      const nState = { assignedRoleIds: _.cloneDeep(nextProps.value) };
      return nState;
    }

    return null;
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (_.isEqual(this.props.value, nextProps.value) && _.isEqual(this.state, nextState)) {
      return false;
    } else {
      return true;
    }
    return true;
  }

  constructor(props) {
    super(props);

    this.state = {
      assignedRoleIds: [61],
    };

    this._onTransferChange = this._onTransferChange.bind(this);
    this._renderItem = this._renderItem.bind(this);
  }


  render() {
    const { fullRoles } = this.props;
    return (
      <Transfer
        className={styles["role-assignment"]}
        titles={[ mm('label.transfer.title.unassigned'), mm('label.transfer.title.assigned')]}
        dataSource={fullRoles || []}
        showSearch
        listStyle={{
          width: 242,
          height: '100%',
        }}
        lazy={false}
        filterOption={this._filter}
        targetKeys={this.state.assignedRoleIds}
        onChange={this._onTransferChange}
        render={this._renderItem}
      />

    );
  }

  _renderItem = item => {
    const { assignedRoleIds } = this.state;

    return (
      <Popover
        content={this._renderPopoverContent(item)}
        title={this._renderPopoverTitle(item)}
        placement="left">
        <div className={styles.item} style={{ ...(_.indexOf(assignedRoleIds, item.key) >= 0 ? { paddingRight: '24px' } : {}) }}>
          {_.indexOf(assignedRoleIds, item.key) >= 0 ? <Icon className={styles.assigned} type="check" /> : null}
          <div>{item.title}</div>
          <div style={{ color: 'rgba(0,0,0,0.35)', fontSize: '10px' }}>{item.roleData.code}</div>
        </div>
      </Popover>
    );
  }

  _onTransferChange = (targetKeys, direction, moveKeys) => {
    const { onChange } = this.props;
    onChange && onChange(_.cloneDeep(targetKeys));
  }

  _filter = (inputValue, { roleData: { name, code } }) => {
    if (name.indexOf(inputValue) >= 0 || code.indexOf(inputValue) >= 0) {
      return true;
    }
    return false;
  }

  _renderPopoverTitle = (item) => {
    return (
      <div>
        <span>{item.title}</span>
        {
          item.roleData.status == '0' ? <Tag style={{marginLeft: '8px'}}>disabled</Tag> : null
        }
      </div>
    );
  }

  _renderPopoverContent = (item) => {
    return (
      <div style={{fontSize: '12px', width: '250px'}}>
        {item.roleData.remark || <span>( empty )</span> }
      </div>
    );
  }

}

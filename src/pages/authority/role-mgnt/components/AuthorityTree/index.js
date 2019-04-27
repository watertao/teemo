import React, { Component } from 'react';
import { Table, Pagination, Row, Col, Form, Button, Input, Drawer, Tabs, Spin, Radio, Tree, Tag, Icon, Popover } from 'antd';
import PropTypes from "prop-types";
import { connect } from 'dva';
import _ from 'lodash';
import mm from '@/utils/message-util';
import MODULE_SETTINGS from '@tmp/moduleSettings';
import { getResourceByVerbUriPattern } from '@/utils/authority';
import { AuthorityTreeNodeTitle, AuthorityTreeNodeCheckbox, AuthorityTreeNodeIcon } from './AuthorityTreeNode';


/**
 * 权限输入空间
 * value 是 resource id 集合，例： [ 1, 2, 3, 4 ]
 *
 * 全模块（菜单）配置可从 .umi/moduleSettings.js 获取，资源元数据可从 global/resourceMetadata 获取
 *
 */
@connect(({ global, menu }) => ({ global, menu }))
export default class AuthorityTree extends Component {

  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.array,
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

      const actualCheckedKeys = _.uniq(AuthorityTree.getCheckedMenuCodesFromResourceIds(AuthorityTree.fullMenuData, (nextProps.value || [])));
      const nState = {};
      nState.checkedKeys = {
        checked: actualCheckedKeys,
      };

      if (state.isInitialized == false) {
        nState.expandedKeys = actualCheckedKeys;
        nState.isInitialized = true;
      }

      return nState;

    }
    return null;
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (_.isEqual(this.props.value, nextProps.value) && _.isEqual(this.state, nextState)) {
      return false;
    } else {
      console.log(this.props.value)
      console.log(nextProps.value)

      console.log(this.state)
      console.log(nextState)
      return true;
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: {},

      isInitialized: false,

    };

    const { menu: { fullMenuData } } = props;
    const nFullMenuData = _.cloneDeep(fullMenuData);
    AuthorityTree.fullMenuData = nFullMenuData;

  }



  render() {
    console.log('render AuthorityTreeNode')
    //console.log(JSON.stringify(this.fullMenuData,null,2))
    return (
      <Tree
        checkable
        expandedKeys={this.state.expandedKeys}
        autoExpandParent={this.state.autoExpandParent}
        checkedKeys={this.state.checkedKeys}
        onExpand={this.onExpand}
        onCheck={this.onCheck}
        checkStrictly={true}
        showIcon={true}
      >
        { this.renderTreeNodes(AuthorityTree.fullMenuData) }
      </Tree>
    );
  }


  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(_.cloneDeep(changedValue));
    }
  }


  renderTreeNodes = (items) => {
    return items.map((item) => {
      if (item.children) {
        return (
          <Tree.TreeNode
            title={<AuthorityTreeNodeTitle item={item} />}
            key={item.code}
            dataRef={item}
            disableCheckbox={AuthorityTreeNodeCheckbox(item)}
            selectable={false}
            icon={<AuthorityTreeNodeIcon item={item} />}
          >
            {this.renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      } else {
        return <Tree.TreeNode
          title={<AuthorityTreeNodeTitle item={item} />}
          key={item.code}
          dataRef={item}
          disableCheckbox={AuthorityTreeNodeCheckbox(item)}
          selectable={false}
          icon={<AuthorityTreeNodeIcon item={item} />}
        />
      }
    });
  }

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  onCheck = (checkedKeys, event) => {
    const checkedMenuData = this._getMenuDataByCode(AuthorityTree.fullMenuData, event.node.props.eventKey);
    let actualCheckedKeys = checkedKeys.checked || [];
    if (event.checked) {
      // make parents checked
      actualCheckedKeys = _.concat(actualCheckedKeys, this.findParentCodes(checkedMenuData));

      // make all children checked
      actualCheckedKeys = _.concat(actualCheckedKeys, this.findChildCodes(checkedMenuData));


    } else {
      // make all children unchecked
      actualCheckedKeys = _.pullAll(actualCheckedKeys, this.findChildCodes(checkedMenuData));

      // if parent has no child anymore, uncheck them
      if (!(checkedMenuData.nodeType == 'event')) {
        actualCheckedKeys = _.pullAll(actualCheckedKeys, this.findLonelyParentCodes(checkedMenuData, actualCheckedKeys));
      }

    }

    actualCheckedKeys = _.uniq(actualCheckedKeys);
    // this.setState({
    //   checkedKeys: {
    //     ...checkedKeys,
    //     checked: actualCheckedKeys,
    //   }
    // });

    this.triggerChange(this.getSelectedResourceIds(actualCheckedKeys));

  }

  getSelectedResourceIds = (checkedCodes) => {
    let result = [];
    checkedCodes.forEach(code => {
      const menuDataItem = this._getMenuDataByCode(AuthorityTree.fullMenuData, code);
      if (menuDataItem && menuDataItem.resources) {
        menuDataItem.resources.forEach(resource => {
          result = _.concat(result, resource.id);
        });
      }
    });

    return _.uniq(result);
  }



  _getMenuDataByCode = (menuData, code) => {
    for (let i = 0; i < menuData.length; i++) {
      const item = menuData[i];
      if (item.code == code) {
        return item;
      }
      if (item.children) {
        const result = this._getMenuDataByCode(item.children, code);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  findParentCodes = (menuData) => {
    if (menuData.parent) {
      return _.concat(this.findParentCodes(menuData.parent), menuData.parent.code);
    } else {
      return [];
    }
  }

  /**
   * 找出去掉 menuData 的 checkbox 后不再有儿子的节点，这些节点也要级联去掉 checkbox
   *
   * @param menuData
   * @param checkedCodes
   * @returns {*}
   */
  findLonelyParentCodes = (menuData, checkedCodes) => {
    if (menuData.parent) {
      for (let i = 0; i < menuData.parent.children.length; i++) {
        const sibling = menuData.parent.children[i];
        if (sibling.code == menuData.code) {
          continue;
        }
        if (_.indexOf(checkedCodes, sibling.code) >= 0) {
          return [];
        }
      }
      return _.concat(this.findLonelyParentCodes(menuData.parent, checkedCodes), menuData.parent.code);
    } else {
      return [];
    }
  }

  findChildCodes = (menuData) => {
    if (menuData.children) {
      let codes = [];
      for (let i = 0; i < menuData.children.length; i++) {
        const child = menuData.children[i];
        codes = _.concat(codes, child.code);
        codes = _.concat(codes, this.findChildCodes(child));
      }
      return codes;
    } else {
      return [];
    }
  }

  static getCheckedMenuCodesFromResourceIds = (menuData, resourceIds) => {
    let result = [];
    menuData.forEach(item => {
      if (item.resources) {
        if (_.difference(item.resources.map(r => r.id), resourceIds).length == 0) {
          result = _.concat(result, item.code);
        }
      }
      if (item.children) {
        let resultOfChildren = AuthorityTree.getCheckedMenuCodesFromResourceIds(item.children, resourceIds);
        if (resultOfChildren.length > 0) {
          result = _.concat(result, resultOfChildren, item.code);
        }
      }
    });
    return result;
  }
}

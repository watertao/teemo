import React, { PureComponent } from 'react';
import PropTypes from "prop-types";
import _ from 'lodash';
import { Select, Spin } from "antd";
import styles from './style.less';

export default class TMCombobox extends PureComponent {

  static DEFAULT_VALUE = [];

  static propTypes = {
    // onChange (optional)
    placeHolder: PropTypes.string,
    disabled: PropTypes.bool,

    /**
     * function (keyword) {
     *     return [...]; //search results
     * }
     */
    onSearchExpected: PropTypes.func.isRequired,

    /**
     * function (item) {
     *     return item.id;
     * }
     */
    optionKeyResolver: PropTypes.func,
    optionContentRender: PropTypes.func,
    tagResolver: PropTypes.func,
  };

  static defaultProps = {
    optionKeyResolver: (item) => item.id,
    optionContentRender: (item) => item.name,
    tagResolver: (item) => item.name,
  };

  state = {
    exposedValue: TMCombobox.DEFAULT_VALUE,
    value: TMCombobox.DEFAULT_VALUE,
    searchText: '',
    searchResults: [],
    isSearching: false,
  };

  static getDerivedStateFromProps(nextProps, state) {
    console.log(nextProps)
    if ('value' in nextProps) {
      if (!_.isEqual(nextProps.value, state.exposedValue)) {
        return {
          exposedValue: nextProps.value || TMCombobox.DEFAULT_VALUE,
          value: nextProps.value || TMCombobox.DEFAULT_VALUE,
        };
      }
    }
    return null;
  }



  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.compRef = React.createRef();
    this._doSearch = _.debounce(this._doSearch.bind(this), 500);
    this._onChange = this._onChange.bind(this);
  }


  render() {

    const { placeHolder, disabled, optionKeyResolver, optionContentRender, tagResolver } = this.props;
    const { value, searchResults, isSearching } = this.state;
    return (
      <Select
        mode="multiple"
        value={value}
        placeholder={placeHolder}
        notFoundContent={ this._renderNotFoundContent() }
        filterOption={false}
        onSearch={this._doSearch}
        onChange={this._onChange}
        style={{ width: 300 }}
        disabled={disabled}
        onBlur={this._onBlur}
        ref={this.compRef}
        onDeselect={this._onDeselect}
        optionLabelProp={'data-tag'}
      >

        {searchResults.map(item =>
          <Select.Option key={optionKeyResolver(item)} data-tag={tagResolver(item)}>
            {optionContentRender(item, this._makeKeywordHighlight)}
          </Select.Option>)}
      </Select>
    );
  }

  _doSearch = (value) => {
    const nValue = _.trim(value);
    this.setState({ searchResults: [], searchText: nValue }, () => {
      if (nValue == '') {
        return;
      }
      const { onSearchExpected } = this.props;

      this.lastFetchId += 1;
      const fetchId = this.lastFetchId;
      this.setState({ isSearching: true }, () => {
        Promise.resolve(onSearchExpected(nValue)).then((results) => {
          this.setState({ isSearching: false });
          if (fetchId == this.lastFetchId) {
            this.setState({ searchResults: results || [] })
          }
        }).catch(() => {
          this.setState({ isSearching: false })
        });
      });
    });
  }

  _renderNotFoundContent = () => {
    if (this.state.searchText == '') {
      return <span>请输入搜索关键字</span>;
    } else if (this.state.isSearching) {
      return <Spin size="small" />;
    } else {
      return <span>无匹配记录</span>;
    }
  }

  _onChange = (changedValue) => {
    // change status
    this.setState({ value: changedValue });

  }


  _onDeselect = () => {
    this.compRef.current.focus();
  }

  _onBlur = () => {
    this.setState({ searchResults: [], searchText: '' });
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(_.cloneDeep(this.state.value));
    }
  }

  _makeKeywordHighlight = (text) => {
    const { searchText } = this.state;
    let parts = text.split(new RegExp(`(${searchText})`, 'gi'));
    return (
      <React.Fragment>
        {
          parts.map((part, i) => {
            return <span key={i} className={part === searchText ? styles["keyword-highlight"] : null}>{part}</span>;
          })
        }
      </React.Fragment>
    );
  }

}

import React, { PureComponent } from 'react';
import PropTypes from "prop-types";
import _ from 'lodash';
import {Pagination, Select, Spin} from "antd";
import styles from './style.less';

export default class TMCombobox extends PureComponent {

  static DEFAULT_VALUE = [];

  static propTypes = {
    // onChange (optional)
    placeHolder: PropTypes.string,
    disabled: PropTypes.bool,

    /**
     *
     * // page ，start from 1
     * function (keyword, page, pageSize) {
     *     return {
     *         total: 3,
     *         data: [{...}, {...}, {...}]
     *     }
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
    searchResult: {
      total: 0,
      data: null
    },
    isSearching: false,
    pagination: {
      current: 1,
      pageSize: 5,
    }
  };

  static getDerivedStateFromProps(nextProps, state) {
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
    this._onKeywordChange = _.debounce(this._onKeywordChange.bind(this), 500);
    this._onChange = this._onChange.bind(this);
    this.state = {
      ...this.state,
      pagination: {
        ...this.state.pagination,
        pageSize: this.props.pageSize || this.state.pagination.pageSize,
      }
    };
  }


  render() {

    const { placeHolder, disabled, optionKeyResolver, optionContentRender, tagResolver } = this.props;
    const { value, searchResult, isSearching, pagination: { current, pageSize } } = this.state;
    return (
      <div
        onMouseDown={e => {
          e.preventDefault();
          return false;
        }}
      >
        <Select
          mode="multiple"
          value={value}
          placeholder={placeHolder}
          filterOption={false}
          onSearch={this._onKeywordChange}
          onChange={this._onChange}
          style={{ width: 300 }}
          disabled={disabled}
          onBlur={this._onBlur}
          onFocus={this._onFocus}
          ref={this.compRef}
          onDeselect={this._onDeselect}
          optionLabelProp={'data-tag'}
          dropdownRender={this._renderDropdown}
        >

          {(searchResult.data || []).map(item =>
            <Select.Option key={optionKeyResolver(item)} data-tag={tagResolver(item)}>
              {optionContentRender(item, this._makeKeywordHighlight)}
            </Select.Option>)}
        </Select>
      </div>
    );
  }

  _renderDropdown = (menu) => {
    const { isSearching, searchResult: { total, data }, pagination: { current, pageSize } } = this.state;

    return (
      <Spin size='small' spinning={isSearching}>

        { total > 0 ? menu : ( data == null ?
          <div style={{height: '35px'}}></div> :
          <div style={{height: '35px', color: 'rgba(0,0,0,0.45)', paddingLeft: '8px', lineHeight: '35px'}}>没有匹配的记录</div>) }

        { total > pageSize ? (
          <div className={styles.pagination}>
            <Pagination size="small" current={current} pageSize={pageSize} total={total} onChange={this._onPageChange} />
          </div>
        ): null}

      </Spin>
    );

  }

  _onFocus = () => {
    this.setState({ isSearching: true }, () => {
      this._doSearch();
    });
  }

  /**
   * When input field focused or changed
   *
   * @param keyword
   * @private
   */
  _doSearch = () => {
    const { onSearchExpected } = this.props;
    const { pagination: { current, pageSize }, searchText } = this.state;
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;

    Promise.resolve(onSearchExpected(searchText, current, pageSize)).then((searchResult) => {
      if (fetchId == this.lastFetchId) {
        this.setState({ searchResult, isSearching: false });
      }
    }).catch(() => {
      this.setState({ isSearching: false })
    });

  }

  _onPageChange = (page, pageSize) => {
    console.log('++++++ on page change')
    this.setState({ pagination: { current: page, pageSize }, isSearching: true }, () => {
      this._doSearch();
    });
  }

  _onKeywordChange = (keyword) => {
    console.log('+++++++on search:' + keyword)
    const nKeyword = _.trim(keyword);
    this.setState({ searchText: nKeyword, isSearching: true, pagination: { ...this.state.pagination, current: 1 }, }, () => {
      this._doSearch();
    });
  }

  _onChange = (changedValue) => {
    // change status
    this.setState({ value: changedValue });

  }


  _onDeselect = () => {
    this.compRef.current.focus();
  }

  _onBlur = () => {
    this.setState({
      searchResult: { total: 0, data: null },
      searchText: '',
      pagination: { ...this.state.pagination, current: 1 },
      isSearching: false,
    });
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

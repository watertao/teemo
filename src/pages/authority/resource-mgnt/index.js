import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage as fm, FormattedMessage } from 'umi/locale';
import mm from '@/utils/message-util';
import {Button, Icon, Table, Tag} from 'antd';
import TMDataList from '@/components/TMDataList';
import { connect } from 'dva';
import styles from './style.less';


@connect(({ resource, loading }) => ({ resource, loading }))
export default class ResourceManagement extends Component {

  constructor(props) {
    super(props);
    this.tmDataListRef = React.createRef();
    this._onDataFetchExpect = this._onDataFetchExpect.bind(this);
  }

  componentDidMount() {
    this.tmDataListRef.current.query();
  }


  render = () => {
    
    const { resource: { list }, loading } = this.props;

    const columns = [
      {
        title: '#',
        dataIndex: 'seq',
        width: 50,
        render: (text, record, index) => {
          return <span style={{ fontWeight: '500' }}>{index + 1}</span>;
        }
      },
      {
        title: mm('resource.field.method'),
        dataIndex: 'verb',
        key: 'verb',
        width: 170,
        render: (text, record, index) => {
          switch(record.verb) {
            case 'DELETE':
              return <Tag color='#F50'>{ record.verb }</Tag>;
            case 'GET':
              return <Tag color='#87D068'>{ record.verb }</Tag>;
            case 'POST':
              return <Tag color='#108EE9'>{ record.verb }</Tag>;
            case 'PUT':
              return <Tag color='#2DB7F5'>{ record.verb }</Tag>;
            default:
              return <Tag color='#BFBFBF'>{ record.verb }</Tag>
          }
        },
        sorter:  true,
      },
      {
        title: mm('resource.field.pattern'),
        dataIndex: 'uri_pattern',
        key: 'uri_pattern',
        sorter: true,
        render: (text) => {
          return <span className={styles['uri_pattern']}>{text}</span>
        }
      },
      {
        title: mm('resource.field.name'),
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: mm('resource.field.remark'),
        dataIndex: 'remark',
        key: 'remark'
      },
    ];

    return (
      <PageHeaderWrapper
        title={mm('moduleName')}
      >

        <TMDataList
          ref={this.tmDataListRef}
          onDataFetchExpect={this._onDataFetchExpect}
          dataSource={list}
          columns={columns}
          loading={loading.effects['resource/fetchList']}
        />

      </PageHeaderWrapper>
    );

  }


  _onDataFetchExpect = (filterParameters) => {
    const { dispatch } = this.props;
    return dispatch({
      type: 'resource/fetchList',
      payload: {
        filterParameters,
      }
    });
  }

}

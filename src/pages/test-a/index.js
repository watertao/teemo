import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import TMCombobox from '@/components/form-item/TMCombobox2';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { connect } from 'dva';
import { Select, Pagination } from 'antd';


const children = [];
for (let i = 0; i < 10; i++) {
  children.push(
    <Select.Option key={i}>
      {i}
    </Select.Option>,
  );
}


@connect(({ loading }) => ({ loading }))
export default class ModuleEntry extends Component {

  constructor(props) {
    super(props);
    console.log('Constructor of test-a')
  }


  componentDidMount() {
    const { dispatch } = this.props;
    // do some initial data loading here
  }

  state = {
    value: ['name2', 'name3'],
  };

  onChange = (value, option) => {
    console.log(`changed ${value}`, option);
    this.setState({
      value,
    });
  };

  onSelect = (value, option) => {
    console.log(`selected ${value}`, option.props);
  };

  onDeselect = (value, option) => {
    console.log(`deselected ${value}`, option);
  };


  render = () => {
    const { loading } = this.props;
    const { value } = this.state;
    return (
      <PageHeaderWrapper
        title={<FormattedMessage id="module.test-a" />}
      >
        <TMCombobox
          onSearchExpected={ (keyword, page, pageSize) => {

            return new Promise((resolve) => {
              setTimeout(() => {
                if (keyword == 'a') {
                  resolve({
                    total: 12,
                    data: [
                      {id: 1, name: 'aaaaa'},
                      {id: 2, name: 'bbbbb'},
                    ]
                  })
                } else {
                  resolve({
                    total: 0,
                    data: []
                  })
                }

              }, 1000);
            });

          } }
        />

      </PageHeaderWrapper>
    );

  }

}

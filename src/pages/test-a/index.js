import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { connect } from 'dva';


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


  render = () => {
    const { loading } = this.props;

    return (
      <PageHeaderWrapper
        title={<FormattedMessage id="module.test-a" />}
      >
        <div>
          hello world
        </div>
      </PageHeaderWrapper>
    );

  }

}

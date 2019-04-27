import React, { Fragment } from 'react';
import { Layout, Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';
import pconf from 'projectConfig';

const { Footer } = Layout;
const FooterView = () => (
  <Footer style={{ padding: 0 }}>
    <GlobalFooter
      links={pconf.footer.links}
      copyright={pconf.footer.copyright}
    />
  </Footer>
);
export default FooterView;

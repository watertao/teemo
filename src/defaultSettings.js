module.exports = {

  navTheme: 'dark', // theme for nav menu
  primaryColor: '#1890FF', // primary color of ant design
  layout: 'sidemenu', // nav menu position: sidemenu or topmenu
  contentWidth: 'Fluid', // layout of content: Fluid or Fixed, only works when layout is topmenu
  fixedHeader: false, // sticky header
  autoHideHeader: false, // auto hide header
  fixSiderbar: false, // sticky siderbar

  menu: {
    disableLocal: false,
  },

  pwa: true,

  title: 'app.title',      // 浏览器 TAB 标签的 title,登录框title，导航栏 title。 NOTE： title 过长可能会导致样式扭曲，文字消失
  logoImg: 'MY-LOGO.svg',   // LOGO 图片，相对于 src/assets 的路径, 注意该值修改后需要重启 npm start

  request: {
    // default fetch timeout
    timeout: 5000,
    debounceDelay: 50,
  },

  footer: {
    links: [
      // {
      //   key: 'github',
      //   title: <Icon type="github" />,
      //   href: 'https://github.com/ant-design/ant-design-pro',
      //   blankTarget: true,
      // },
    ],
    copyright: 'Copyright123 © 2019 watertao.github.com',
  },

};


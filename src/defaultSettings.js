

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

  title: 'XX 管理平台',      // 浏览器 TAB 标签的 title
  logoImg: 'HTSEC-LOGO.svg',   // LOGO 图片，相对于 src/assets 的路径, 注意该值修改后需要重启 npm start

  pwa: true,
  request: {
    // default fetch timeout
    timeout: 3000,
  },
};


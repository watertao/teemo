import exception from './zh-CN/exception';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';
import pwa from './zh-CN/pwa';
import component from './zh-CN/component';
import MODULE_LOCALE from '@tmp/moduleLocale_zh-CN';

export default {
  'app.title': 'API协议管理平台',

  'login.title': '登录',
  'login.literal.loginTo': '登录到',
  'login.userName': '用户名',
  'login.password': '密码',
  'login.forgotPassword': '忘记密码?',
  'login.forgotPassword.tip': '请联系管理员',
  'login.loginButton': '登 录',
  'login.form.userName.empty': '用户名不可为空',
  'login.form.password.empty': '密码不可为空',

  'label.action': '操作',
  'label.delete': '删除',
  'label.viewOrModify': '查看/编辑',

  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  'app.home.introduce': '介绍',
  'app.forms.basic.title': '基础表单',
  'app.forms.basic.description':
    '表单页用于向用户收集或验证信息，基础表单常见于数据项较少的表单场景。',
  ...exception,
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...MODULE_LOCALE,
};

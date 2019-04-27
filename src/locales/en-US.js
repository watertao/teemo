import exception from './en-US/exception';
import globalHeader from './en-US/globalHeader';
import menu from './en-US/menu';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';
import pwa from './en-US/pwa';
import component from './en-US/component';
import MODULE_LOCALE from '@tmp/moduleLocale_en-US';

export default {
  'app.title': 'Teemo Console',

  'login.title': 'Login',
  'login.literal.loginTo': 'Login to ',
  'login.userName': 'User Name',
  'login.password': 'Password',
  'login.forgotPassword': 'Forgot Password?',
  'login.forgotPassword.tip': 'Please contact to administrator',
  'login.loginButton': 'Login',
  'login.form.userName.empty': 'User name could not be empty',
  'login.form.password.empty': 'Password could not be empty',

  'label.action': 'Action',
  'label.delete': 'Delete',
  'label.viewOrModify': 'View/Modify',


  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  'app.home.introduce': 'introduce',
  'app.forms.basic.title': 'Basic form',
  'app.forms.basic.description':
    'Form pages are used to collect or verify information to users, and basic forms are common in scenarios where there are fewer data items.',
  ...exception,
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...MODULE_LOCALE,
};

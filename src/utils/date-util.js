import _ from 'lodash';

// 2019-05-06T15:56:46.000+0800
const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

export function formatDateFromMoment(moment, needURLEncode) {
  if (needURLEncode) {
    return encodeURIComponent(moment.format(DATE_FORMAT));
  } else {
    return moment.format(DATE_FORMAT);
  }
}

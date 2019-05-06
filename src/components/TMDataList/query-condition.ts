import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

interface IQueryConditionProps {
  componentRef: Function,
  onQueryConditionChange: Function,
  loading: boolean,
}

/**
 * 子类需要处理搜索条件变化时的回调。
 * 在 props 中会有 onQueryConditionChange 回调函数
 *
 */
export default abstract class AbstractQueryCondition extends PureComponent<IQueryConditionProps> {

  static propTypes = {
    componentRef: PropTypes.func,
    onQueryConditionChange: PropTypes.func,
    loading: PropTypes.bool,
  };

  protected constructor(props) {
    super(props);

    props.componentRef && props.componentRef(this);
  }

  protected lastQueryCondition: Object;

  protected fireQueryConditionChangeEvent = () => {
    if (_.isEqual(this.lastQueryCondition, this.state)) {
      return;
    }
    this.lastQueryCondition = _.cloneDeep(this.state);
    const { onQueryConditionChange } = this.props;
    onQueryConditionChange(this.state);
  }

  protected onFieldChange = (valueObj) => {
    this.setState({...valueObj}, this.fireQueryConditionChangeEvent);
  }

  public reset = () => {
    this.resetForm(this.fireQueryConditionChangeEvent);

  }

  protected abstract resetForm(callback): Object;

  abstract getFormValues(): Object;

}


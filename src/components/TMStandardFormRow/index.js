import React from 'react';
import classNames from 'classnames';
import styles from './index.less';

const StandardFormRow = ({ title, children, last, block, grid, labelWidth, ...rest }) => {
  const cls = classNames(styles.standardFormRow, {
    [styles.standardFormRowBlock]: block,
    [styles.standardFormRowLast]: last,
    [styles.standardFormRowGrid]: grid,
  });

  return (
    <div className={cls} {...rest}>
      {title && (
        <div className={styles.label} style={{ width: labelWidth ? labelWidth : 'auto' }}>
          <span>{title}</span>
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default StandardFormRow;

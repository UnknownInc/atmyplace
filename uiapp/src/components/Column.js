import React, { PureComponent } from 'react';
import PropTypes from "prop-types";

export default class Column extends PureComponent {
  static propTypes = {
    height: PropTypes.string.isRequired,
    mainAxisAlignment: PropTypes.string.isRequired,
    crossAxisAlignment: PropTypes.string.isRequired
  };

  static defaultProps = {
    height: '100%',
    mainAxisAlignment: 'start',
    crossAxisAlignment: 'start'
  }

  render() {
    const {
      style, children, 
      mainAxisAlignment = this.defaultProps.mainAxisAlignment,
      crossAxisAlignment = this.defaultProps.crossAxisAlignment,
      height = Column.defaultProps.height, 
      ...props} = this.props;

    var mergedStyle = Object.assign({
      display: 'flex',
      flexDirection:'column',
      justifyContent: mainAxisAlignment,
      alignItems: crossAxisAlignment,
      height: height
    }, style);
    return <div style={mergedStyle} {...props}>
      {children}
    </div>
  }
}
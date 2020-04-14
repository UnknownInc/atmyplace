import React, { PureComponent } from 'react';

export default class Row extends PureComponent {
  static defaultProps = {
      width: '100%',
      height: 'auto',
      mainAxisAlignment: 'start',
      crossAxisAlignment: 'start'
  }

  render() {
    const { style={}, children, 
      mainAxisAlignment = Row.defaultProps.mainAxisAlignment,
      crossAxisAlignment = Row.defaultProps.crossAxisAlignment,
      height = Row.defaultProps.height, 
      width = Row.defaultProps.width, 
      ...props }=this.props;
    var mergedStyle = Object.assign({
      display: 'flex',
      flexDirection:'row',
      justifyContent: mainAxisAlignment,
      alignItems: crossAxisAlignment,
      width: width, height: height
    }, style);
    return <div style={mergedStyle} {...props}>
      {children}
    </div>
  }
}
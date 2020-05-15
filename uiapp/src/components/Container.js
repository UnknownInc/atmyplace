import React, { PureComponent } from 'react';

export default class Container extends PureComponent {
  static defaultProps = {
    color   : 'transparent',
    padding : '0',
    width   :'100%',
    height  :'100%'
  };

  render() {
    const {style, children, 
      color   = Container.defaultProps.color,
      padding = Container.defaultProps.padding,
      height  = Container.defaultProps.height,
      width   = Container.defaultProps.width,
      ...props}=this.props;
    var mergedStyle = Object.assign({
      diaplay:'flex',
      top:0, left:0,
      width: width, height: height,
      padding: padding,
      backgroundColor: color,
    }, style);
    return <div style={mergedStyle} {...props}>
      {children}
    </div>;
  }
}
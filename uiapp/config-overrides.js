const { darkTheme } = require('@ant-design/dark-theme');
const { 
  override, fixBabelImports, addLessLoader,
  addDecoratorsLegacy,
} = require('customize-cra');

module.exports = override(
  addDecoratorsLegacy(),
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    //style: 'css',
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      ...darkTheme,
    }
  }),
);
const { override, fixBabelImports, addLessLoader } = require('customize-cra');

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    //style: 'css',
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { 
      //'@primary-color': '#1DA57A' 
      dark: true, // enable dark mode
      compact: true, // enable compact mode
    },
  }),
);
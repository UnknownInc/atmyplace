import React, { Component } from 'react';

import { Layout, Menu, Breadcrumb } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UploadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  CalendarFilled,
  VideoCameraOutlined,
} from '@ant-design/icons';


import Container from '../components/Container';
import Column from '../components/Column';
import Row from '../components/Row';

import CalendarView from './CalendarView';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

const options={
  Schedule:'Schedule',
  Account: 'Account',
  Experiments: 'Experiments'
};

export default class HomePage extends Component {
  state = {
    sideBarcollapsed: false,
    selectedOption: options.Schedule,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };
  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  onClickSchedule = _e => {
    this.setState({selectedOption:options.Schedule});
  }
  onClickAccount = _e => {
    this.setState({selectedOption:options.Account});
  }
  onClickExperiments = _e => {
    this.setState({selectedOption: options.Experiments});
  }

  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        {this.renderHeader()}
        <Layout className="site-layout">
          <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
            <div style={{height:64}}/>
            <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
              <Menu.Item key="1" onClick={this.onClickSchedule}>
                <CalendarOutlined/>
                <span>{options.Schedule}</span>
              </Menu.Item>
              <Menu.Item key="2" onClick={this.onClickAccount}>
                <UserOutlined/>
                <span>{options.Account}</span>
              </Menu.Item>
              <Menu.Item key="3" onClick={this.onClickExperiments}>
                <ExperimentOutlined/>
                <span>{options.Experiments}</span>
              </Menu.Item>

            </Menu>
          </Sider>
          <Content
            className="site-layout-background"
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              display:'block'
            }}
          >
            {this.renderContent()}
          </Content>
        </Layout>
      </Layout>
    );
  }

  renderContent() {
    switch(this.state.selectedOption) {
      case options.Schedule:
        return <CalendarView/>;
      case options.Account:
        return "Account Settings";
      case options.Experiments:
        return "Experiments";
      default:
        return "oops"
    }
  }
  renderHeader() {
    return <Header className="site-layout-background" style={{ padding: 0 }}>
      {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
        className: 'trigger',
        onClick: this.toggle,
      })}
    </Header>;
  }
}
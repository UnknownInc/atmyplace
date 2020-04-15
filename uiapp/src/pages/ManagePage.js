import React, { Component } from 'react';

import { Layout, Menu, Modal, Space } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  ExperimentOutlined,
  AppstoreAddOutlined,
} from '@ant-design/icons';

import JoinForm from './JoinForm';


import CalendarView from './CalendarView';

const { Header, Content, Sider } = Layout;

const options={
  Schedule:'Schedule',
  Account: 'Account',
  Settings: 'Settings',
  Experiments: 'Experiments',

};

export default class ManagePage extends Component {
  state = {
    sideBarcollapsed: false,
    selectedOption: options.Schedule,
    showJoinModal: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  showJoinModal = ()=>{
    this.setState({showJoinModal:true})
  }
  hideJoinModal = ()=>{
    this.setState({showJoinModal: false});
  }

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
  onClickSettings = _e => {
    this.setState({selectedOption:options.Settings});
  }
  onClickExperiments = _e => {
    this.setState({selectedOption: options.Experiments});
  }

  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        {this.renderSideMenu()}
        <Layout className="site-layout">
          {this.renderHeader()}
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
            <Modal visible={this.state.showJoinModal}
              title={<span><AppstoreAddOutlined/> Join or Create Event</span>}
              footer={null}
              onCancel={this.hideJoinModal}>
                <JoinForm/>
            </Modal>
          </Content>
        </Layout>
      </Layout>
    );
  }

  renderSideMenu() {
    return (
    <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
      <div style={{height:64}}/>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
        <Menu.Item key="0" onClick={this.showJoinModal}>
          <AppstoreAddOutlined/>
          <span>Join event</span>
        </Menu.Item>
        <Menu.Item key="1" onClick={this.onClickSchedule}>
          <CalendarOutlined/>
          <span>{options.Schedule}</span>
        </Menu.Item>
        <Menu.Item key="2" onClick={this.onClickAccount}>
          <UserOutlined/>
          <span>{options.Account}</span>
        </Menu.Item>
        <Menu.Item key="3" onClick={this.onClickSettings}>
          <SettingOutlined/>
          <span>{options.Settings}</span>
        </Menu.Item>
        <Menu.Item key="4" onClick={this.onClickExperiments}>
          <ExperimentOutlined/>
          <span>{options.Experiments}</span>
        </Menu.Item>

      </Menu>
    </Sider>
    );
  }

  renderContent() {
    switch(this.state.selectedOption) {
      case options.Schedule:
        return <CalendarView/>;
      case options.Account:
        return "Account Info";
      case options.Settings:
        return "Settings"
      case options.Experiments:
        return "Experiments";
      default:
        return "oops"
    }
  }
  renderHeader() {
    return <Header >
    </Header>;
  }
}
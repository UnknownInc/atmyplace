import React, {useState} from 'react';
import {
  Switch,
  Route,
  useHistory,
  useRouteMatch,
} from "react-router-dom";

import {observer} from 'mobx-react';

import { Layout, Menu, Modal,Spin } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  ExperimentOutlined,
  AppstoreAddOutlined,
  HomeOutlined,
} from '@ant-design/icons';

import {useStores} from '../hooks';

import JoinForm from './JoinForm';
import AccountView from './AccountView';
import SettingsView from './SettingsView';

import CalendarView from './CalendarView';
import EventView from './EventView';

const { Content, Sider } = Layout;

const options={
  Home: 'home',
  Schedule:'schedule',
  Account: 'account',
  Settings: 'settings',
  Experiments: 'experiments',
  Event: 'event'
};

const MainPage = observer((props)=>{

  let match = useRouteMatch("/:route")||{params:{route:'home'}};
  const history = useHistory();
  const appcontext = useStores();
  const [sideBarcollapsed,setSideBarState] = useState(true);
  const [joinModalVisibility,setJoinModalVisibility] = useState(false);
  const [selectedView, setSelectedView] = useState(appcontext.isAuthenticated?(match.params.route):options.Event);

  const hideJoinModal = ()=>setJoinModalVisibility(false);

  const onCollapse = collapsed => setSideBarState(collapsed);

  const selectView = view => {
    if (appcontext.isAuthenticated) {
      history.push(`/${view}`);
      setSelectedView(view);
    }
  }

  const renderSideMenu=()=>{
    return (
    <Sider collapsible collapsed={sideBarcollapsed} onCollapse={onCollapse}>
      <div style={{height:8}}/>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={['-1']} selectedKeys={[selectedView]}>
        <Menu.Item key={options.Home} onClick={()=>selectView(options.Home)}>
          <HomeOutlined />
          <span>Home</span>
        </Menu.Item>
        <Menu.Item key={options.Event} onClick={()=>selectView(options.Event)}>
          <AppstoreAddOutlined/>
          <span>Join event</span>
        </Menu.Item>
        <Menu.Item key={options.Schedule} onClick={()=>selectView(options.Schedule)}>
          <CalendarOutlined/>
          <span>{options.Schedule}</span>
        </Menu.Item>
        <Menu.Item key={options.Account} onClick={()=>selectView(options.Account)}>
          <UserOutlined/>
          <span>{options.Account}</span>
        </Menu.Item>
        <Menu.Item key={options.Settings} onClick={()=>selectView(options.Settings)}>
          <SettingOutlined/>
          <span>{options.Settings}</span>
        </Menu.Item>
        <Menu.Item key={options.Experiments} onClick={()=>selectView(options.Experiments)}>
          <ExperimentOutlined/>
          <span>{options.Experiments}</span>
        </Menu.Item>

      </Menu>
    </Sider>
    );
  }

  const renderContent = ()=>{
    if (!appcontext.isAuthenticated) {
      return <EventView {...props}/>
    }

    return <Switch>
      <Route path={`/${options.Experiments}`} component={()=><div>Experiments</div>}/>
      <Route path={`/${options.Schedule}`} component={CalendarView}/>
      <Route path={`/${options.Settings}`} component={SettingsView}/>
      <Route path={`/${options.Event}/:eventid`} component={(props)=><EventView {...props}/>}/>
      <Route path={`/${options.Event}`} component={(props)=><EventView {...props}/>}/>
      <Route path={`/${options.Account}`} component={AccountView}/>
      <Route exact path='/' component={()=><div>Home</div>}/>
    </Switch>
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {renderSideMenu()}
      <Layout className="site-layout">
        <Content
          className="site-layout-background"
          style={{
            minHeight: 280,
            display:'block'
          }}
        >
          {renderContent()}
          <Modal visible={joinModalVisibility}
            title={<span><AppstoreAddOutlined/> Join or Create Event</span>}
            footer={null}
            onCancel={hideJoinModal}>
              <JoinForm/>
          </Modal>
        </Content>
      </Layout>
      <Modal
          title="Bad connection"
          centered
          visible={appcontext.connectionState!=='online'}
          footer={null}
        >
          <div style={{textAlign:'center'}}>
            <Spin size='large'/>
            <p>Current Connection State: <strong>{appcontext.connectionState}</strong></p>
          </div>
        </Modal>
    </Layout>
  );
});

export default MainPage;
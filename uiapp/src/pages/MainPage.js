import React, {useState} from 'react';

import {observer} from 'mobx-react';

import { Layout, Menu, Modal } from 'antd';
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

import CalendarView from './CalendarView';
import EventView from './EventView';

const { Content, Sider } = Layout;

const options={
  Home: 'Home',
  Schedule:'Schedule',
  Account: 'Account',
  Settings: 'Settings',
  Experiments: 'Experiments',
  Welcome: 'Welcome'
};


// let isCreatingSocket = false; 
// const createMainSocket = async () =>{
//   if (isCreatingSocket) return;
//   isCreatingSocket = true;
//   const key='n_conncetionstatus'
//   const notify = (description)=>{
//     notification.open({
//       key,
//       message:'Server Connection',
//       description,
//       icon:<ApiOutlined />
//     });
//   }
//   try {
//     const socket = new WebSocket('wss://atmyplace.rmcloudsoftware.com');
    
//     socket.onopen = () => {
//      notify('Connected.')
//     }

//     socket.onmessage = (message) => {
//       console.info('Recieving Websocket message: ', message);
//       const data = JSON.parse(message.data);
//       // switch (data.type) {
//       //   case TYPE_NEW_USER:
//       //     handleSocketConnection(data.id);
//       //     break;
//       //   case TYPE_CONNECTION:
//       //     handleConnectionReady(data);
//       //     break;
//       //   case TYPE_OFFER:
//       //     console.log('case Offer')
//       //     handleOffer(data);
//       //     break;
//       //   case TYPE_ANSWER:
//       //     console.log('case Answer')
//       //     handleAnswer(data);
//       //     break;
//       //   case TYPE_ICECANDIDATE:
//       //     console.log('case Ice Candidate')
//       //     handleIceCandidate(data);
//       //     break;
//       //   default:
//       //     console.error('Recieving message failed');
//       // }
//     }

//     socket.onclose = (event) => {
//       console.log('Websocket closed: ', event);
//       notify('Disconnected.')
//     }

//     socket.onerror = (error) => {
//       console.error('Websocket error: ', error);
//       notify('Error in connection. Retrying...');
//     }
//     window.mainSocket = socket;
//   } finally {
//     isCreatingSocket = false;
//   }
// }

const MainPage = observer((props)=>{

  const appcontext = useStores();
  const [sideBarcollapsed,setSideBarState] = useState(true);
  const [joinModalVisibility,setJoinModalVisibility] = useState(false);
  const [selectedView, setSelectedView] = useState(options.Welcome);

  // if (!window.mainSocket) {
  //   createMainSocket().then(()=>{});
  // }

  const hideJoinModal = ()=>setJoinModalVisibility(false);

  const onCollapse = collapsed => setSideBarState(collapsed);

  const selectView = view => {
    if (appcontext.isAuthenticated) {
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
        <Menu.Item key={options.Welcome} onClick={()=>selectView(options.Welcome)}>
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

    switch(selectedView) {
      case options.Schedule:
        return <CalendarView/>;
      case options.Account:
        return <AccountView {...props}/>
      case options.Settings:
        return "Settings"
      case options.Experiments:
        return "Experiments";
      case options.Home:
        return "Home";
      default:
        return <EventView {...props}/>
    }
  }

  // const renderHeader = ()=>{
  //   return <Header >
  //   </Header>;
  // }

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
    </Layout>
  );
});

export default MainPage;
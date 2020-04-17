import React from 'react';

import {observer} from 'mobx-react';

import {Link} from 'react-router-dom';

import { Layout, Input, Row,Col, Form, Divider, Button, Space } from 'antd';
import {
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';

import {useStores} from '../hooks';

import JoinForm from './JoinForm';

const { Header, Content, Footer, Sider } = Layout;

const { Search } = Input;

const WelcomePage = observer((props)=>{
    const {authStore} = useStores();
    const {history} = props;
    return <Layout style={{minHeight:'100vh'}}>
      <Content className='center'>
        <Space direction='vertical'>
        {authStore.isAuthenticated ? <div style={{textAlign:'center'}}>
          <h2>Welcome back!</h2>
          <Link to='/manage'>Manage your Events</Link>
        </div>:null}
        <JoinForm/>
        {authStore.isAuthenticated ? <Row>
          <Col span='8'></Col>
          <Col>
            <h4>Not you? <Link to={'/logout'}>Logout</Link></h4>
          </Col>
        </Row>:<Row>
          <Col span='8'></Col>
          <Col span='7'>
            <Button type="primary" onClick={()=>history.push("/login")}
              icon={<LoginOutlined />}>Login in</Button>
          </Col>
          <Col span='2'>
          </Col>
          <Col span='7'>
            <Button type="primary" onClick={()=>history.push("/signup")}
              icon={<UserAddOutlined />}>Sign up</Button>
          </Col>
        </Row>}
        </Space>
      </Content>
      <Footer style={{textAlign:'center'}}></Footer>
    </Layout>
});

export default WelcomePage;
import React from 'react';

import {Link} from 'react-router-dom';

import { Layout, Input, Row,Col, Form, Divider, Button, Space } from 'antd';
import {
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;

const { Search } = Input;

export default class WelcomePage extends React.Component {
  render() {
    const {history} = this.props;
    return <Layout style={{minHeight:'100vh'}}>
      <Content className='center'>
        <Space direction='vertical'>
        {this.props.authenticated ? <div style={{textAlign:'center'}}>
          <h2>Welcome back!</h2>
          <Link to='/manage'>Manage your Events</Link>
        </div>:null}
        <Form size='large'>
          <Form.Item label="Visit">
            <Search size="large" placeholder="event" suffix="@myplace" enterButton="go" onSearch={value => console.log(value)}/>
          </Form.Item>
        </Form>
        {this.props.authenticated ? <Row>
          <Col>
            <h4>Not you? <Link>Logout</Link></h4>
          </Col>
        </Row>:<Row>
          <Col>
            <Button type="primary" onClick={()=>history.push("/login")}
              icon={<LoginOutlined />}>Login in</Button>
          </Col>
          <Col style={{width:'20px'}}>
            <Divider vertical />
          </Col>
          <Col>
            <Button type="primary" onClick={()=>history.push("/signup")}
              icon={<UserAddOutlined />}>Sign up</Button>
          </Col>
        </Row>}
        </Space>
      </Content>
      <Footer style={{textAlign:'center'}}></Footer>
    </Layout>
  }
}
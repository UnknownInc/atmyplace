import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { signin, signInWithGoogle, signInWithGitHub } from "../helpers/auth";

import { Layout, Input, Row,Col, Form, Divider, Button, Checkbox, Card  } from 'antd';
import {
  UserOutlined, 
  LockOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;


const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 24 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
export default class LoginPage extends Component {
  onFinish = async (values) => {
    // console.log('Success:', values);
    try {
      await signin(values.email, values.password);
    } catch(e) {
      console.error(e)
    }
  };

  onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };
  render() {
    return <Layout style={{minHeight:'100vh'}}>
      <Content className="center">
        <Card title="Sign in to @myplace">
          <Form
            {...layout} size="large"
            name="signin"
            initialValues={{ remember: true }}
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            style={{minWidth:'320px'}}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input prefix={<UserOutlined/>} placeholder="your@email.com"/>
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password prefix={<LockOutlined/>} placeholder="password"/>
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" {...tailLayout}>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item >
              <Button type="primary" htmlType="submit" style={{width:'100%'}}>
                Sign in
              </Button><br/>
            </Form.Item>
            <Form.Item>
            <div>
              <a style={{float:'left'}}>forgot password?</a>
              <span style={{float: 'right'}}><Link to={'/signup'}>register now!</Link></span>
            </div>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>;
  }
}
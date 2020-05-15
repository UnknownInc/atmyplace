import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import {observer} from 'mobx-react';

import { Layout, Input, Alert, Form, Button, Checkbox, Card, Space} from 'antd';
import {
  UserOutlined, 
  LockOutlined,
} from '@ant-design/icons';

import {useStores} from '../hooks';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 24 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
const LoginPage = observer(()=>{
  const appcontext = useStores();
  const [error, setError] = useState(null);
  const [values, setValues] = useState({remember: true});
  const onFinish = async (values) => {
    setError(null);
    try {
      await appcontext.signin(values.email, values.password);
    } catch(e) {
      console.error(e);
      setError('Bad username or password.');
    }
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  }

  const onValuesChanged = (_changedValues, allValues) => {
    setValues(allValues);
  }

  if (appcontext.isAuthenticated) {
    return <Redirect to='/'/>
  }

  return <Layout style={{minHeight:'100vh'}}>
    <Layout.Content className="center">
      <Card title="Sign in to @myplace" loading={appcontext.busy}>
        {error?<>
          <Alert message={error} type="error"/>
          <Space direction='vertical'/>
          </>:null}
        <Form 
          {...layout}
          size="large"
          name="signin"
          initialValues={values}
          onValuesChange={onValuesChanged}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
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
            <Input.Password prefix={<LockOutlined/>} placeholder="password" onPressEnter={()=>onFinish(values)}/>
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
            <a href='/' style={{float:'left'}}>forgot password?</a>
            <span style={{float: 'right'}}><Link to={'/signup'}>register now!</Link></span>
          </div>
          </Form.Item>
        </Form>
      </Card>
    </Layout.Content>
  </Layout>;
});

export default LoginPage;
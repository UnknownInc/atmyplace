import React, { Component, useState } from 'react';

import {observer} from 'mobx-react';

import {
  Form,
  Select,
  Input,
  Switch,
  Radio,
  Slider,
  Button,
  Upload,
  Rate,
  Checkbox,
  Row,
  Col,
  Layout,
  PageHeader,
} from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';

import {useStores} from '../hooks';

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};

const AccountView  =observer((props)=>{
  const {authStore} = useStores();
  const [form] = Form.useForm();

  const onFinish = values => {
    authStore.updateProfile(values);
  };
  return <Layout style={{height:'100%'}}>
    <Layout.Content>
      <PageHeader title='Account Information'
        avatar={{ src: authStore.user.photoURL }} >

      </PageHeader> 
      <Form form={form} colon={false}
        name="validate_other"
        {...formItemLayout}
        onFinish={onFinish}
        initialValues={{
          displayName: authStore.user.displayName,
          shortDescription: authStore.user.shortDescription 
        }}
      >
        {/* <Form.Item label=" ">
          <span className="ant-form-text">User Details</span>
        </Form.Item> */}
        <Form.Item
          {...formItemLayout}
          name="displayName"
          label="Display Name"
          rules={[
            {
              required: true,
              message: 'Please input your display name',
            },
          ]}
        >
          <Input placeholder="Please input your display name" />
        </Form.Item>
        <Form.Item 
          name="shortDescription"
          label="Short Description"
          rules={[
            {
              required: true,
              message: 'Please enter a short description',
            },
          ]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 12, offset: 4 }}>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Form.Item>
      </Form>
    </Layout.Content>
  </Layout>
})

export default AccountView;
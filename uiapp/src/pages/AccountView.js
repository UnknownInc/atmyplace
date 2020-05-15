import React from 'react';

import {observer} from 'mobx-react';

import {
  Form,
  Input,
  Button,
  Layout,
  PageHeader,
} from 'antd';

import {useStores} from '../hooks';


const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};

const AccountView  =observer((_props)=>{
  const {user} = useStores();
  const [form] = Form.useForm();

  const onFinish = values => {
    user.update(values);
  };
  return <Layout style={{height:'100%'}}>
    <Layout.Content>
      <PageHeader title='Account Information'
        avatar={{ src: user.photoURL }} >

      </PageHeader> 
      <Form form={form} colon={false}
        name="form_account"
        {...formItemLayout}
        onFinish={onFinish}
        initialValues={{
          displayName: user.displayName,
          shortDescription: user.shortDescription 
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
import React from 'react';

import { Form, Input } from 'antd';
const { Search } = Input;

const layout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 24 },
};
// const tailLayout = {
//   wrapperCol: { offset: 8, span: 16 },
// };
export default class JoinForm extends React.Component {
  render(){
    return <Form size='large' {...layout} style={{minWidth:'320px'}}>
    <Form.Item label="Join">
      <Search size="large" placeholder="event" suffix="@myplace" enterButton="go" onSearch={value => console.log(value)}/>
    </Form.Item>
  </Form>
  }
}
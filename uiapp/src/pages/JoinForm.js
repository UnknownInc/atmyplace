import React from 'react';

import { Alert, Form, Input, notification } from 'antd';
import {observer} from 'mobx-react';
import {useStores} from '../hooks';
const { Search } = Input;

const layout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 24 },
};
// const tailLayout = {
//   wrapperCol: { offset: 8, span: 16 },
// };
const JoinForm = observer(()=>{
  const {sessionStore={}} = useStores();
  const {isBusy, lasterror} = sessionStore??{};
  const [form] = Form.useForm();

  const onJoin = async ()=>{
    const eventname = form.getFieldValue('eventname')||''
    if (eventname.trim()==='') return;
    try {
      await sessionStore.get(eventname);
    } catch (e) {
      console.error(e);
      notification.error({
        message: 'Join ' + eventname,
        description: e,
        duration: 0
      })
    }
  }

  return <Form form={form} name='form_join' size='large' {...layout} style={{minWidth:'320px'}}>
    <Form.Item label="Join" name='eventname'>
      <Search size="large" placeholder="event" suffix="@myplace" enterButton="go" onSearch={onJoin} loading={isBusy}/>
    </Form.Item>
    {lasterror ? <Alert message={lasterror} type="error" /> : null}
  </Form>
})

export default JoinForm;  
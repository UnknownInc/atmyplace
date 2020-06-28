import React from 'react';

import {observer} from 'mobx-react';

import {
  Form,
  Input,
  InputNumber,
  Select,
  Slider,
  Button,
  Layout,
  PageHeader,
  Row,
  Col,
  Switch,
} from 'antd';

import {useStores} from '../hooks';

import Camera from '../components/Camera';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const SettingsView  =observer((_props)=>{
  const cameraRef = React.useRef();
  const canvasRef = React.useRef();
  const [preview, setPreview] = React.useState(true);
  const [devices, setDevices] = React.useState([]);
  const {user, localSettings={}} = useStores();
  const [form] = Form.useForm();

  React.useEffect(()=>{
    localSettings.getMediaDevices()
      .then(d=>setDevices(d));
  })
  const onFinish = values => {
    localSettings.setValues(values);      
  };

  const getI = (x, y, width) => {
    const red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
  };

  return <Layout style={{height:'100%'}}>
    <Layout.Content>
      <PageHeader title='Settings'
        avatar={{ src: user.photoURL }} >

      </PageHeader> 

      <Form form={form} colon={false}
        name="form_account"
        {...formItemLayout}
        onFinish={onFinish}
        initialValues={{
          preview: preview,
          fps: localSettings.fps,
          size: localSettings.size,
          videodevice: localSettings.videodevice,
          audioinputdevice: localSettings.audioinputdevice,
          audiooutputdevice: localSettings.audiooutputdevice,
        }}
      >
        {/* <Form.Item label=" ">
          <span className="ant-form-text">User Details</span>
        </Form.Item> */}
        <Form.Item {...formItemLayout} label='Video' style={{marginBottom:0}}>
          <Form.Item name='preview' valuePropName="checked" style={{display: 'inline-block'}}>
            <Switch onChange={(checked)=>{
              if (checked){
                cameraRef.current.startCapture();
              } else {
                cameraRef.current.pauseCapture();
                canvasRef.current.height='0px';
              }
              setPreview(checked);
            }} checkedChildren="on" unCheckedChildren="off"/>
          </Form.Item>

          <Form.Item name='videodevice' style={{display: 'inline-block', margin:'0 8px'}}>
            <Select onChange={v=>localSettings.setVideoDeviceId(v)}>
            {devices.filter(d=>d.kind==='videoinput').map((d)=>{
              return <Select.Option key={d.deviceId} value={d.deviceId}>{d.label}</Select.Option>;
            })}
            </Select>
        </Form.Item>
        </Form.Item>
        <Form.Item {...formItemLayout} name='audiooutputdevice' label='Speaker'>
          <Select onChange={v=>localSettings.setAudioOutputDeviceId(v)}>
          {devices.filter(d=>d.kind==='audiooutput').map((d)=>{
            return <Select.Option key={d.deviceId} value={d.deviceId}>{d.label}</Select.Option>;
          })}
          </Select>
        </Form.Item>
        <Form.Item {...formItemLayout} name='audioinputdevice' label='Microphone'>
          <Select onChange={v=>localSettings.setAudioInputDeviceId(v)}>
          {devices.filter(d=>d.kind==='audioinput').map((d)=>{
            return <Select.Option key={d.deviceId} value={d.deviceId}>{d.label}</Select.Option>;
          })}
          </Select>
        </Form.Item>
        <Row>
          <Col span={4}></Col>
          <Col span={16}>
            <Camera ref={cameraRef}
              width={localSettings.width}
              height={localSettings.height}
              fps={localSettings.fps}
              mirror={localSettings.mirror}
              videodevice={localSettings.videodevice}
              audioinputdevice={localSettings.audioinputdevice}
              targetCanvas={canvasRef.current}
              onFrame={(imgData)=>{
                // const {width, height}=imgData;
                // const ctx=canvasRef.current.getContext("2d");
                if (window.socket) {
                  // window.socket.send(Buffer.from(imgData.data),{uid:'123'})
                }
              }}
              />
            <canvas ref={canvasRef} style={{width:'100%'}}/>
          </Col>
        </Row>
        <Form.Item {...formItemLayout} name='size' label='Quality'>
          <Slider
            min={0} max={2}
            step={1}
            marks={{
              0: 'small',
              1: 'medium',
              2: 'large',
            }}
            onChange={(v)=>localSettings.setSize(v)}
          />
        </Form.Item>
        <Form.Item {...formItemLayout} name='fps' label='Frames per Second'>
          <Slider
            min={12} max={60}
            step={1}
            onChange={(v)=>localSettings.setFPS(v)}
          />
        </Form.Item>
        {/* <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Form.Item> */}
      </Form>
    </Layout.Content>
  </Layout>
})

export default SettingsView;
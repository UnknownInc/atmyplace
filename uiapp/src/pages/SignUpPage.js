import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { signup, signInWithGoogle, signInWithGitHub } from "../helpers/auth";

import { Layout, Input, Row,Col, Form, Divider, Button, Checkbox, Card  } from 'antd';
import {
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

export default class SignUpPage extends Component {

  constructor() {
    super();
    this.state = {
      error: null,
      email: '',
      password: '',
      busy: false,
    };
  }

  onFinish = values => {
    console.log('Submitted:', values);
    this.setState(values);
    if (values.password === values.confirm && values.agreement) {
      this.handleSignin();
    }
  };

  onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  // handleChange(event) {
  //   this.setState({
  //     [event.target.name]: event.target.value
  //   });
  // }

  handleSignin = async () => {
    this.setState({ error: '', busy: true });
    try {
      await signup(this.state.email, this.state.password);
    } catch (error) {
      return this.setState({ error: error.message, busy: false});
    }
    return this.setState({busy: false})
  }

  async googleSignIn() {
    try {
      await signInWithGoogle();
    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  async githubSignIn() {
    try {
      await signInWithGitHub();
    } catch (error) {
      console.log(error)
      this.setState({ error: error.message });
    }
  }
  validatePassword = (rule, value, callback) => {
    if (value && value.length <6) {
      callback("The password should be atleast 6 characters long!");
    } else {
      callback();
    }
  };
  render() {
    return (<Layout style={{minHeight:'100vh'}}>
      <Content className='center'>
        <Card title="Sign up for a free account" bordered={false} loading={this.state.busy}>
          <Form style={{minWidth:'400px'}}
            {...layout}
            name="signup"
            size='large'
            initialValues={{ remember: true }}
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                },{ 
                  required: true, 
                  message: 'Please input your Email!' 
                }]}
            >
              <Input/>
            </Form.Item>
      
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }, {validator: this.validatePassword }]}
              hasFeedback
            >
              <Input.Password/>
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Confirm Password"
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: 'Please confirm your password!',
                },
                ({ getFieldValue }) => ({
                  validator(_rule, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('The two passwords that you entered do not match!');
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
  {/*     
            <Form.Item {...tailLayout} name="remember" valuePropName="checked">
              <Checkbox>Remember me</Checkbox>
            </Form.Item> */}
      
            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                { validator:(_, value) => value ? Promise.resolve() : Promise.reject('Should accept agreement') },
              ]}
              {...tailLayout}
            >
              <Checkbox>
                I have read the <a href="#">agreement</a>
              </Checkbox>
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Sign up
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
      // <div className="container">
      //   <form className="mt-5 py-5 px-5" onSubmit={this.handleSubmit}>
      //     <h1>
      //       Sign Up to
      //     <Link className="title ml-2" to="/">Chatty</Link>
      //     </h1>
      //     <p className="lead">Fill in the form below to create an account.</p>
      //     <div className="form-group">
      //       <input className="form-control" placeholder="Email" name="email" type="email" onChange={this.handleChange} value={this.state.email}></input>
      //     </div>
      //     <div className="form-group">
      //       <input className="form-control" placeholder="Password" name="password" onChange={this.handleChange} value={this.state.password} type="password"></input>
      //     </div>
      //     <div className="form-group">
      //       {this.state.error ? <p className="text-danger">{this.state.error}</p> : null}
      //       <button className="btn btn-primary px-5" type="submit">Sign up</button>
      //     </div>
      //     <p>You can also sign up with any of these services</p>
      //     <button className="btn btn-danger mr-2" type="button" onClick={this.googleSignIn}>
      //       Sign up with Google
      //     </button>
      //     <button className="btn btn-secondary" type="button" onClick={this.githubSignIn}>
      //       Sign up with GitHub
      //     </button>
      //     <hr></hr>
      //     <p>Already have an account? <Link to="/login">Login</Link></p>
      //   </form>
      // </div>
    )
  }
}
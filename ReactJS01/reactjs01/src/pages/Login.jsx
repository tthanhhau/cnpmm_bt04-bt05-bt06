import React from 'react'
import { Card, Form, Input, Button, Typography, message } from 'antd'
import api from '../util/axios.js'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../components/context/AuthContext.jsx'

const { Title } = Typography

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const onFinish = async (values) => {
    try {
      const res = await api.post('/login', values)
      login(res.data.token, res.data.user)
      message.success('Logged in!')
      navigate('/home')
    } catch (err) {
      message.error(err?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <Card style={{ maxWidth: 420, margin: '24px auto' }}>
      <Title level={3} style={{ textAlign:'center' }}>Login</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email' }]}>
          <Input placeholder="you@example.com" />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true }]}>
          <Input.Password placeholder="your password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Login</Button>
        </Form.Item>
        <div>New here? <Link to="/register">Create an account</Link></div>
      </Form>
    </Card>
  )
}

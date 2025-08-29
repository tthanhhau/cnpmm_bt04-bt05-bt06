import React from 'react'
import { Card, Form, Input, Button, Typography, message } from 'antd'
import api from '../util/axios.js'
import { Link, useNavigate } from 'react-router-dom'

const { Title } = Typography

export default function Register() {
  const navigate = useNavigate()
  const onFinish = async (values) => {
    try {
      await api.post('/register', values)
      message.success('Registered! Please login.')
      navigate('/login')
    } catch (err) {
      message.error(err?.response?.data?.error || 'Registration failed')
    }
  }
  return (
    <Card style={{ maxWidth: 520, margin: '24px auto' }}>
      <Title level={3} style={{ textAlign:'center' }}>Register</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Full name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Nguyen Van A" />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="you@example.com" />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}>
          <Input.Password placeholder="At least 6 characters" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Sign up</Button>
        </Form.Item>
        <div>Already have an account? <Link to="/login">Login</Link></div>
      </Form>
    </Card>
  )
}

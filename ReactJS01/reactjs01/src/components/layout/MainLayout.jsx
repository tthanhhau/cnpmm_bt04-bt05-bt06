import React from 'react'
import { Layout, Menu, Button, Typography } from 'antd'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const { Header, Content, Footer } = Layout
const { Title } = Typography

export default function MainLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { token, user, logout } = useAuth()

  const current = location.pathname.startsWith('/home') ? 'home' :
                  location.pathname.startsWith('/products') ? 'products' :
                  location.pathname.startsWith('/login') ? 'login' :
                  location.pathname.startsWith('/register') ? 'register' : ''

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display:'flex', alignItems:'center', gap:16 }}>
        <Title level={4} style={{ margin:0, color:'#fff' }}>ReactJS01</Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[current]}
          items={[
            { key:'home', label:<Link to="/home">Home</Link> },
            { key:'products', label:<Link to="/products">Products</Link> },
            { key:'login', label:<Link to="/login">Login</Link> },
            { key:'register', label:<Link to="/register">Register</Link> },
          ]}
          style={{ flex:1 }}
        />
        {token ? (
          <>
            <span style={{ color:'#fff' }}>{user?.name}</span>
            <Button onClick={() => { logout(); navigate('/login') }}>Logout</Button>
          </>
        ) : null}
      </Header>
      <Content style={{ padding:'24px', background:'#fff' }}>
        {children}
      </Content>
      <Footer style={{ textAlign:'center' }}>
        FullStack Tutorial • Express + React + MongoDB
      </Footer>
    </Layout>
  )
}

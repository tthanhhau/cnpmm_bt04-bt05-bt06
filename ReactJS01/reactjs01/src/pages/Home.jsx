import React, { useEffect, useState } from 'react'
import api from '../util/axios.js'
import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function Home() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/homepage')
      .then(res => setData(res.data))
      .catch(err => setError(err?.response?.data?.error || 'Error'))
  }, [])

  return (
    <Card>
      <Title level={3}>Protected Home</Title>
      {data ? (
        <Paragraph>{data.message} — {new Date(data.time || Date.now()).toLocaleString()}</Paragraph>
      ) : (
        <Paragraph>{error || 'Loading...'}</Paragraph>
      )}
    </Card>
  )
}

'use client'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

const sessionProvider = ({children}) => {
  return (
    <SessionProvider>{children}</SessionProvider>
  )
}

export default sessionProvider
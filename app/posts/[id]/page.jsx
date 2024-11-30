"use client"
import React from 'react'
import AllPosts from "@/components/AllPosts"
import { useParams } from 'next/navigation'
function page() {
   const {id} =useParams()
  return (
    <AllPosts id={id}/>
  )
}

export default page
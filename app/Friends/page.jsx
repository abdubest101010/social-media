"use client"
import React from 'react'
import Friends from "@/components/Friends"
import FetchFriendRequest from "@/components/FetchFriendRequest"
function page() {
  return (
    <>
    <FetchFriendRequest />
    <Friends/>
    </>
  )
}

export default page
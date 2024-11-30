"use client";
import React from "react";
import AllPosts from "@/components/AllPosts";
import { useParams } from "next/navigation";

function Page() { // Rename "page" to "Page"
  const { id } = useParams();
  return <AllPosts id={id} />;
}

export default Page; // Export it with the updated name

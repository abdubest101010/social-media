// app/posts/page.js
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts/getPost');
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Posts</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold">{post.content}</h2>
              {post.imageUrl && (
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  width={500} // Set the width
                  height={300} // Set the height
                  className="w-full h-40 object-cover mt-2"
                />
              )}
              <p className="text-gray-600 mt-2">Posted by: {post.user.username}</p>
              <p className="text-gray-500 text-sm">Created at: {new Date(post.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts/getPost');
        const data = await res.json();

        const postsWithLikeStatus = data.map((post) => {
          const likeCount = post.likes.length;
          const hasLiked = post.likes.some((like) => like.userId === userId);

          return {
            ...post,
            hasLiked,
            likeCount,
            comments: [],
            newComment: '',
          };
        });

        setPosts(postsWithLikeStatus);

        for (const post of postsWithLikeStatus) {
          const commentRes = await fetch(`/api/comments?postId=${post.id}`);
          const comments = await commentRes.json();
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p.id === post.id ? { ...p, comments } : p
            )
          );
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchPosts();
    }
  }, [status]);

  // Function to calculate time difference
  const getTimeDifference = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Posts</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts available</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
                {/* Link to the user's profile page */}
              <p className="text-gray-600 mt-2">
                 
                <Link href={`/posts/${post.user.id}`}>
                  <span className="text-blue-500 hover:underline">{post.user.username}</span>
                </Link>
              </p>
              
              {post.imageUrl && (
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  width={500}
                  height={300}
                  className="w-full h-40 object-cover mt-2"
                />
              )}

<h2 className="text-xl font-semibold">{post.content}</h2>
              
              {/* Show the time difference */}
              <p className="text-gray-500 text-sm">
                Created: {getTimeDifference(post.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

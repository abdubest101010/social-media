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
                  width={500}
                  height={300}
                  className="w-full h-40 object-cover mt-2"
                />
              )}

              {/* Link to the user's profile page */}
              <p className="text-gray-600 mt-2">
                Posted by: 
                <Link href={`/posts/${post.user.id}`}>
                  <span className="text-blue-500 hover:underline">{post.user.username}</span>
                </Link>
              </p>
              
              <p className="text-gray-500 text-sm">
                Created at: {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

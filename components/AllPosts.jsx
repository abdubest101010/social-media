'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
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

        // Map through posts to include user liking status and count
        const postsWithLikeStatus = data.map((post) => {
          const likeCount = post.likes.length; // Count likes from the fetched data
          const hasLiked = post.likes.some((like) => like.userId === userId); // Check if the user has liked the post

          return {
            ...post,
            hasLiked,
            likeCount, // Add the like count
          };
        });

        setPosts(postsWithLikeStatus);
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

  const handleLike = async (postId, hasLiked) => {
    try {
      const url = '/api/likes'; // The URL is the same for both actions
      const method = hasLiked ? 'DELETE' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId }),
      });

      if (res.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likeCount: post.likeCount + (hasLiked ? -1 : 1), // Update like count correctly
                  hasLiked: !hasLiked, // Toggle like status
                }
              : post
          )
        );
      } else {
        const error = await res.json();
        console.error(error.error); // Log error for debugging
      }
    } catch (error) {
      console.error('Failed to like/unlike post:', error);
    }
  };

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
              <p className="text-gray-600 mt-2">Posted by: {post.user.username}</p>
              <p className="text-gray-500 text-sm">Created at: {new Date(post.createdAt).toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => handleLike(post.id, post.hasLiked)}
                  className={`px-4 py-2 rounded mr-2 ${post.hasLiked ? 'bg-red-500' : 'bg-blue-500'} text-white`}
                >
                  {post.hasLiked ? 'Unlike' : 'Like'}
                </button>
                <p className="text-gray-600">{post.likeCount} likes</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

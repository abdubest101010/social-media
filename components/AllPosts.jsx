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

        const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const postsWithStatus = sortedPosts.map((post) => ({
          ...post,
          hasLiked: post.likes.some((like) => like.userId === userId),
          likeCount: post.likes.length,
          comments: post.comments || [],
          newComment: '',
          showComments: false,
          showLikes: false,
        }));

        setPosts(postsWithStatus);
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
      const url = '/api/likes';
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
              ? { ...post, likeCount: post.likeCount + (hasLiked ? -1 : 1), hasLiked: !hasLiked }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Failed to like/unlike post:', error);
    }
  };

  const toggleComments = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

  const toggleLikes = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showLikes: !post.showLikes } : post
      )
    );
  };

  const handleCommentChange = (postId, value) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, newComment: value } : post
      )
    );
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const post = posts.find((post) => post.id === postId);
    if (!post.newComment) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content: post.newComment, postId }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, comments: [...post.comments, newComment], newComment: '' }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

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
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-2">
                <Link href={`/${post.user.id}`}>
                  <span className="text-blue-500 hover:underline font-semibold">{post.user.username}</span>
                </Link>
                <p className="text-gray-500 text-sm">{getTimeDifference(post.createdAt)}</p>
              </div>
              <Link href={`/posts/${post.id}`}>
                {post.imageUrl && (
                  <Image
                    src={post.imageUrl}
                    alt="Post image"
                    width={700}
                    height={500}
                    className="w-full h-80 object-cover rounded mb-2"
                  />
                )}
                <h2 className="text-xl font-semibold mb-2">{post.content}</h2>
              </Link>
              <div className="flex items-center mb-4 space-x-4">
                <button
                  onClick={() => handleLike(post.id, post.hasLiked)}
                  className={`px-4 py-2 rounded ${post.hasLiked ? 'bg-red-500' : 'bg-blue-500'} text-white`}
                >
                  {post.hasLiked ? 'Unlike' : 'Like'}
                </button>
                <p className="text-gray-600">
                  {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
                </p>
                {post.comments.length > 0 && (
                  <p className="text-gray-600">
                    {post.comments.length === 1 ? `Comment: 1` : `Comments: ${post.comments.length}`}
                  </p>
                )}
              </div>

              {/* Conditionally display "Show Likes" button if there are likes */}
              {post.likeCount > 0 && (
                <button
                  onClick={() => toggleLikes(post.id)}
                  className="text-blue-500 hover:underline mr-4"
                >
                  {post.showLikes ? 'Hide Likes' : 'Show Likes'}
                </button>
              )}

              <button
                onClick={() => toggleComments(post.id)}
                className="text-blue-500 hover:underline mt-2"
              >
                {post.showComments ? 'Hide Comments' : 'Comment'}
              </button>

              {post.showLikes && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-inner">
                  <h3 className="text-lg font-semibold mb-2">Liked by:</h3>
                  <ul>
                    {post.likes.map((like) => (
                      <li key={like.id} className="text-gray-600">
                        {like.user.username}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {post.showComments && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-inner">
                  <h3 className="text-lg font-semibold mb-2">Comments</h3>
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex mt-2">
                    <input
                      type="text"
                      value={post.newComment}
                      onChange={(e) => handleCommentChange(post.id, e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-grow border border-gray-300 rounded p-2"
                    />
                    <button type="submit" className="ml-2 bg-green-500 text-white px-4 rounded">
                      Submit
                    </button>
                  </form>
                  <div className="mt-2 space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-200 py-2">
                        <p className="text-gray-500 text-sm font-medium">- {comment.user.username}</p>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

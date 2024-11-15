'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import FriendsList from './ShareFriend';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [showFriendsList, setShowFriendsList] = useState(null);
  const [showLikes, setShowLikes] = useState(null);

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
          shareCount: post.shareCount || 0,
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

  const handleShare = (postId) => {
    setShowFriendsList((prevState) => (prevState === postId ? null : postId));
  };

  const handleCommentToggle = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

  const handleLikesToggle = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showLikes: !post.showLikes } : post
      )
    );
  };

  const handleNewComment = (postId, newComment) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, newComment } : post
      )
    );
  };

  const submitComment = async (postId, newComment) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId, content: newComment }),
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...post.comments, updatedPost],
                  newComment: '',
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const getTimeDifference = (createdAt) => {
    const currentTime = new Date();
    const postTime = new Date(createdAt);
    const timeDiff = Math.floor((currentTime - postTime) / 1000);

    if (timeDiff < 60) {
      return `${timeDiff} seconds ago`;
    } else if (timeDiff < 3600) {
      return `${Math.floor(timeDiff / 60)} minutes ago`;
    } else if (timeDiff < 86400) {
      return `${Math.floor(timeDiff / 3600)} hours ago`;
    } else {
      return `${Math.floor(timeDiff / 86400)} days ago`;
    }
  };
  const handleSharesToggle = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showShares: !post.showShares } : post
      )
    );
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
                {post.likeCount > 0 && (
                  <p
                    onClick={() => handleLikesToggle(post.id)}
                    className="text-gray-600 cursor-pointer hover:underline"
                  >
                    {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
                  </p>
                )}
                {/* Show comment button only when there are no comments */}
                {post.comments.length === 0 ? (
                  <button
                    onClick={() => handleCommentToggle(post.id)}
                    className="text-gray-600 cursor-pointer hover:underline"
                  >
                    Comment
                  </button>
                ) : (
                  <p
                    className="text-gray-600 cursor-pointer"
                    onClick={() => handleCommentToggle(post.id)}
                  >
                    {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                  </p>
                )}
                {post.shareCount > 0 && (
                  <p
                    onClick={() => handleSharesToggle(post.id)}
                    className="text-gray-600 cursor-pointer hover:underline"
                  >
                    {post.shareCount} {post.shareCount === 1 ? 'share' : 'shares'}
                  </p>
                )}
                 {post.showShares && post.shares.length > 0 && (
                <div className="bg-gray-100 p-2 rounded mb-2">
                  <h3 className="text-sm font-semibold mb-1">Shared by:</h3>
                  {post.shares.map((share, index) => (
                    <Link key={index} href={`/${share.user.id}`} passHref>
                      <p className="text-gray-700 text-sm hover:underline">{share.user.username}</p>
                    </Link>
                  ))}
                </div>
              )}
                <button
                  onClick={() => handleShare(post.id)}
                  className="px-4 py-2 rounded bg-green-500 text-white"
                >
                  Share
                </button>
              </div>
              {showFriendsList === post.id && <FriendsList postId={post.id} />}
              {post.showLikes && (
                <div className="bg-gray-100 p-2 rounded mb-2">
                  <h3 className="text-sm font-semibold mb-1">Liked by:</h3>
                  {post.likes.map((like) => (
                    <Link href={`/${like.user.id}`} key={like.user.id}>
                      <p className="text-gray-700 text-sm hover:underline">{like.user.username}</p>
                    </Link>
                  ))}
                </div>
              )}
              {post.showComments && (
                <div className="mt-2">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start mt-2">
                      <Link href={`/${comment.user.id}`}>
                        <span className="text-blue-500 hover:underline font-semibold mr-2">
                          {comment.user.username}
                        </span>
                      </Link>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={post.newComment}
                    onChange={(e) => handleNewComment(post.id, e.target.value)}
                    placeholder="Add a comment"
                    className="mt-2 w-full p-2 border border-gray-300 rounded"
                  />
                  <button
                    onClick={() => submitComment(post.id, post.newComment)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Comment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

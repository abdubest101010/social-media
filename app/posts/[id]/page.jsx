"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(null); // For share confirmation

  // Toggles for likes, comments, and shares
  const [showLikes, setShowLikes] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShares, setShowShares] = useState(false);

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];
    for (let interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
      }
    }
    return "just now";
  };

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`/api/posts/getPost/${id}`);
          if (!response.ok) {
            throw new Error("Post not found");
          }
          const data = await response.json();
          setPost(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id]);

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id }),
      });

      if (response.ok) {
        const updatedPost = await response.json(); // Assuming API returns the updated post
        setPost(updatedPost);
        setShareSuccess("Post shared successfully!");
        setTimeout(() => setShareSuccess(null), 3000);
      } else {
        throw new Error("Failed to share post");
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{post.content}</h2>
        {post.imageUrl && (
          <img src={post.imageUrl} alt="Post image" className="w-full h-auto mt-2 rounded-lg" />
        )}
        <div className="flex items-center text-gray-500 text-sm mt-2">
          <span>Posted by {post.user?.username} • {timeAgo(post.createdAt)}</span>
        </div>
      </div>

     

      {/* Shares Toggle */}
      <button
        onClick={() => setShowShares((prev) => !prev)}
        className="text-blue-500 font-semibold hover:underline mt-4"
      >
        {showShares ? "Hide Shares" : `Shares (${post.shares.length})`}
      </button>
      {showShares && (
        <div className="mt-2">
          {post.shares.length > 0 ? (
            post.shares.map((share, index) => (
              <p key={index} className="text-gray-700">
                Shared by: {share.user.username}
              </p>
            ))
          ) : (
            <p className="text-gray-500">No shares yet.</p>
          )}
        </div>
      )}

      {/* Likes Toggle */}
      <button
        onClick={() => setShowLikes((prev) => !prev)}
        className="text-blue-500 font-semibold hover:underline mt-4"
      >
        {showLikes ? "Hide Likes" : `Likes (${post.likes.length})`}
      </button>
      {showLikes && (
        <div className="mt-2">
          {post.likes.length > 0 ? (
            post.likes.map((like, index) => (
              <p key={index} className="text-gray-700">
                Liked by: {like.user.username}
              </p>
            ))
          ) : (
            <p className="text-gray-500">No likes yet.</p>
          )}
        </div>
      )}

      {/* Comments Toggle */}
      <button
        onClick={() => setShowComments((prev) => !prev)}
        className="text-blue-500 font-semibold hover:underline mt-4"
      >
        {showComments ? "Hide Comments" : `Comments (${post.comments.length})`}
      </button>
      {showComments && (
        <div className="mt-2 space-y-4">
          {post.comments?.length > 0 ? (
            post.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-100 p-2 rounded-lg">
                <p className="text-gray-800">{comment.content}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Commented by {comment.user?.username} • {timeAgo(comment.createdAt)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostPage;

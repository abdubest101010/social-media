'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image';

export default function PostForm() {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!content.trim() || !image) {
      setError('Content and image are both required.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result;

      try {
        const response = await axios.post('/api/posts', {
          id: session?.user?.id,
          content,
          imageUrl: base64Image,
        });

        if (response.status === 201) {
          setSuccess('Post created successfully!');
          setContent('');
          setImage(null);
          setImagePreview(null); // Clear preview after submission
        }
      } catch (error) {
        console.error('Error creating post:', error);
        setError('Failed to create post. Please try again later.');
      }
    };

    reader.readAsDataURL(image);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);

      // Generate image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result); // Update image preview
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="post-form  p-4 rounded-lg mb-4">
      <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border p-2 rounded mb-4 text-blue"
        ></textarea>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4"
        />

        {imagePreview && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Preview:
            </label>
            <Image
              src={imagePreview}
              alt="Preview"
              width={300}
              height={150}
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Post
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
}

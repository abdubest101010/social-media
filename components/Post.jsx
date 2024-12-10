'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

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

    // Check if both content and image are provided
    if (!content.trim() || !image) {
      setError('Content and image are both required.');
      return;
    }

    // Create a FileReader to convert the image to Base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result;

      try {
        // Make API call to create a post
        const response = await axios.post('/api/posts', {
          id: session?.user?.id, // User ID from session
          content,
          imageUrl: base64Image, // Send the Base64 encoded image
        });

        if (response.status === 201) {
          setSuccess('Post created successfully!');
          setContent(''); // Reset content field
          setImage(null); // Reset image state
          setImagePreview(null); // Reset image preview
        }
      } catch (error) {
        console.error('Error creating post:', error);
        setError('Failed to create post. Please try again later.');
      }
    };

    reader.readAsDataURL(image); // Convert the image to Base64
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);

      // Generate image preview
      const reader = new FileReader();
      reader.onload = () => {

        setImagePreview(reader.result); // Update image preview

        setImagePreview(reader.result); // Set the preview with Base64 data

      };
      reader.readAsDataURL(file); // Convert the selected image to Base64
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
            <img
              src={imagePreview}
              alt="Preview"
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
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image';

export default function PostForm() {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!content.trim()) {
      setError('Content is required.');
      return;
    }

    if (!image) {
      setError('Image is required.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result; // Get the Base64 string

      try {
        const response = await axios.post('/api/posts', {
          id: session?.user?.id, // Pass user ID from session
          content,
          imageUrl: base64Image, // Send Base64 image
        });

        if (response.status === 201) {
          setSuccess('Post created successfully!');
          setContent('');
          setImage(null);
          setImagePreview(null); // Clear form after success
        }
      } catch (err) {
        console.error('Error creating post:', err);
        setError('Failed to create post. Please try again.');
      }
    };

    reader.readAsDataURL(image); // Convert file to Base64
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);

      // Generate image preview
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="post-form p-4 rounded-lg mb-4">
      <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border p-2 rounded mb-4"
        ></textarea>

        <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />

        {imagePreview && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Preview:
            </label>
<<<<<<< HEAD
            <Image
              src={imagePreview}
              alt="Preview"
              width={300}
              height={600}
              className="max-w-full h-auto rounded-lg border"
            />
=======
            <Image src={imagePreview} alt="Preview" width={300} height={150} className="rounded" />
>>>>>>> 60c69143e10cfb5372c53b0a490c8c2826dab7c0
          </div>
        )}

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Post
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
}
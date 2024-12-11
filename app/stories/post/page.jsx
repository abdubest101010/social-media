"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

const StoryForm = () => {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!content.trim() || !image) {
      setError("Content and image are both required.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result;

      try {
        const response = await axios.post("/api/stories/create", {
          id: session?.user?.id, // Use the authenticated user's ID (id instead of userId)
          content,
          imageUrl: base64Image, // Send image as base64
        });

        if (response.status === 201) {
          setSuccess("Story created successfully!");
          setContent("");
          setImage(null);
          setImagePreview(null); // Clear the preview after submission
          router.push("/"); // Navigate to home page
        }
      } catch (error) {
        console.error("Error creating story:", error);
        setError("Failed to create story. Please try again later.");
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
    <div className="story-form max-w-md mx-auto border p-4 rounded-lg mb-4">
      <h2 className="text-xl font-bold mb-4">Create a New Story</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's your story?"
          className="w-full border p-2 rounded mb-4"
          required
        ></textarea>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4"
          required
        />

        {imagePreview && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Preview:
            </label>
            <Image
              src={imagePreview}
              width={360}
              height={180}
              alt="Preview"
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit Story
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
};

export default StoryForm;

'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfileForm({ initialProfile }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [livingIn, setLivingIn] = useState('');
  const [wentTo, setWentTo] = useState('');
  const [worksAt, setWorksAt] = useState('');
  const [bio, setBio] = useState('');
  const [profilePictureBase64, setProfilePictureBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePictureBase64(reader.result);
        setImagePreview(reader.result); // Set the image preview
      };
      reader.readAsDataURL(file); // Convert file to Base64
    } else {
      console.error('No file selected');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare profile data
    const profileData = {
      id: userId,
      firstName,
      lastName,
      livingIn,
      wentTo,
      worksAt,
      bio,
      profilePicture: profilePictureBase64, // Send Base64 encoded image
    };

    try {
      // Send profile data along with the base64 image
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Profile updated successfully', result);
        router.push('/');
      } else {
        console.error('Error updating profile:', result.error);
      }
    } catch (error) {
      console.error('An error occurred while updating the profile:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-8 bg-white shadow-lg rounded-lg space-y-6"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800">Update Profile</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">First Name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Last Name</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Living In</label>
        <input
          type="text"
          value={livingIn}
          onChange={(e) => setLivingIn(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Went To</label>
        <input
          type="text"
          value={wentTo}
          onChange={(e) => setWentTo(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Works At</label>
        <input
          type="text"
          value={worksAt}
          onChange={(e) => setWorksAt(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {imagePreview && (
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
          <img
            src={imagePreview}
            alt="Profile Preview"
            className="mx-auto w-32 h-32 rounded-full object-cover border border-gray-300"
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Update Profile
      </button>
    </form>
  );
}

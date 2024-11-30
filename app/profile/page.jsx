'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProfileForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [livingIn, setLivingIn] = useState('');
  const [wentTo, setWentTo] = useState('');
  const [worksAt, setWorksAt] = useState('');
  const [bio, setBio] = useState('');
  const [profilePictureBase64, setProfilePictureBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [isFormValid, setIsFormValid] = useState(false); // State for form validation
  const [errorMessage, setErrorMessage] = useState(null); // State to store error messages

  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch user info and populate the form
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userId) {
        try {
          const response = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });

          const userData = await response.json();
          if (response.ok) {
            setFirstName(userData.firstName || '');
            setLastName(userData.lastName || '');
            setLivingIn(userData.livingIn || '');
            setWentTo(userData.wentTo || '');
            setWorksAt(userData.worksAt || '');
            setBio(userData.bio || '');
            setProfilePictureBase64(userData.profilePicture || null);
            setImagePreview(userData.profilePicture || null);
          } else {
            console.error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserInfo();
  }, [userId]);

  // Form validation: Ensure all fields are filled
  useEffect(() => {
    if (firstName && lastName && livingIn && wentTo && worksAt && bio) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [firstName, lastName, livingIn, wentTo, worksAt, bio]);

  // Handle image file selection and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePictureBase64(reader.result);
        setImagePreview(reader.result); // Set the image preview
      };
      reader.readAsDataURL(file); // Convert file to Base64
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      console.error('userId is missing from the session.');
      return;
    }

    // Prepare profile data
    const profileData = {
      userId,
      firstName,
      lastName,
      livingIn,
      wentTo,
      worksAt,
      bio,
      profilePicture: profilePictureBase64, // Send Base64 encoded image
    };

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Profile updated successfully', result);
        router.push('/'); // Redirect to profile after update
      } else {
        console.error('Error updating profile:', result.error);
        setErrorMessage(result.error || 'Something went wrong.');
      }
    } catch (error) {
      console.error('An error occurred while updating the profile:', error);
      setErrorMessage('An error occurred while updating the profile.');
    }
  };

  // Loading state if session is being fetched
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  // Render the form only if the session is available
  if (session) {
    return (
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto p-8 bg-white shadow-lg rounded-lg space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800">Update Profile</h2>

        {/* Display error message */}
        {errorMessage && <div className="text-red-500 text-sm text-center">{errorMessage}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={firstName || 'Enter your first name'}
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
            placeholder={lastName || 'Enter your last name'}
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
            placeholder={livingIn || 'Enter where you live'}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Went To</label>
          <input
            type="text"
            value={wentTo}
            onChange={(e) => setWentTo(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={wentTo || 'Enter your school or university'}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Works At</label>
          <input
            type="text"
            value={worksAt}
            onChange={(e) => setWorksAt(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={worksAt || 'Enter your workplace'}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={bio || 'Enter something about yourself'}
            required
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
            <Image
              src={imagePreview}
              unoptimized 
              width={50}
              height={50}
              alt="Profile Preview"
              className="mx-auto w-32 h-32 rounded-full object-cover border border-gray-300"
            />
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isFormValid ? '' : 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!isFormValid}
        >
          Update Profile
        </button>
      </form>
    );
  }

  return null;
}

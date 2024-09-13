'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfileForm({ initialProfile }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [livingIn, setLivingIn] = useState( '');
  const [wentTo, setWentTo] = useState('');
  const [worksAt, setWorksAt] = useState('');
  const [bio, setBio] = useState('');
  const [profilePictureBase64, setProfilePictureBase64] = useState(null);
  const router =useRouter()
  const { data: session, status } = useSession();
  const userId=session?.user?.id
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePictureBase64(reader.result);
        console.log('Base64 Image:', reader.result); // Log Base64 string of the image
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
        router.push('/')
      } else {
        console.error('Error updating profile:', result.error);
      }
    } catch (error) {
      console.error('An error occurred while updating the profile:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>First Name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Last Name</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Living In</label>
        <input
          type="text"
          value={livingIn}
          onChange={(e) => setLivingIn(e.target.value)}
        />
      </div>

      <div>
        <label>Went To</label>
        <input
          type="text"
          value={wentTo}
          onChange={(e) => setWentTo(e.target.value)}
        />
      </div>

      <div>
        <label>Works At</label>
        <input
          type="text"
          value={worksAt}
          onChange={(e) => setWorksAt(e.target.value)}
        />
      </div>

      <div>
        <label>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>
      </div>

      <div>
        <label>Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <button type="submit">Update Profile</button>
    </form>
  );
}

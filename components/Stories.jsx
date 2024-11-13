'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function ActiveStories() {
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveStories = async () => {
      try {
        const response = await axios.get('/api/stories/active'); // Fetch active stories
        setStories(response.data); // Set the fetched stories to state
      } catch (error) {
        console.error('Error fetching active stories:', error);
        setError('Failed to load stories.'); // Set error state if fetching fails
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchActiveStories(); // Call the function to fetch stories
  }, []); // Empty dependency array means this runs once on component mount

  if (loading) return <p>Loading stories...</p>; // Show loading message
  if (error) return <p className="text-red-500">{error}</p>; // Show error message if any

  return (
    <div className="stories-container px-4 py-4">
      <h2 className="text-2xl font-bold mb-4">Stories</h2>
      <div className="flex space-x-4">
        {/* Create Story Section */}
        <Link href={'/stories'}>
          <div className="story-card relative w-40 h-56 rounded-lg overflow-hidden border-2 border-blue-500 bg-white shadow-lg">
            <img
              src={'/bg.png'} // Background image for create story
              alt="background"
              className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black opacity-30"></div>
            <div className="absolute bottom-0 left-0 p-2 text-white">
              <p className="font-semibold">Create Story</p>
            </div>
          </div>
        </Link>

        {/* Active Stories Section with Scrollable Feature */}
        <div className="flex overflow-x-auto space-x-4 py-2 scroll-smooth scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-300">
          {stories.map((story) => (
            <div key={story.id} className="story-card relative w-40 h-56 rounded-lg overflow-hidden border-2 border-blue-500 bg-white shadow-lg">
              <img
                src={story.imageUrl}
                alt={story.content}
                className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-black opacity-30"></div>
              <div className="absolute top-2 left-2 p-2 text-white">
                <h3 className="font-semibold">{story.user.username}</h3> {/* Username at the top */}
              </div>
              <div className="absolute bottom-0 left-0 p-2 text-white">
                <p className="font-semibold">{story.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

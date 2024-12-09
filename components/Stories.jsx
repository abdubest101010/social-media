'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick'; // Import react-slick for sliding effect
import Image from 'next/image';

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

  // Slider settings to enable the slide effect
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 6, // Show 6 stories for larger screens
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024, // Tablet view
        settings: {
          slidesToShow: 4, // Show 4 stories on tablets
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768, // Mobile view
        settings: {
          slidesToShow: 3, // Show 3 stories on mobile
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="stories-container px-4 py-4">
      <Slider {...sliderSettings}>
        {/* Create Story Section */}
        <div>
          <Link href="/stories/post">
            <div className="story-card relative w-40 h-56 rounded-lg overflow-hidden border-2 border-blue-500 bg-white shadow-lg">
              <Image
                src="/bg.png" // Background image for create story
                alt="background"
                width={160}
                height={224}
                className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-black opacity-30"></div>
              <div className="absolute bottom-0 left-0 p-2 text-white">
                <p className="font-semibold">Create Story</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Active Stories Section with Slide Effect */}
        {stories.map((story) => (
          <div key={story.id}>
            <div className="story-card relative w-40 h-56 rounded-lg overflow-hidden border-2 border-blue-500 bg-white shadow-lg">
              <Image
                src={story.imageUrl || ""}
                alt={story.content}
                width={160}
                height={224}
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
          </div>
        ))}
      </Slider>
    </div>
  );
}

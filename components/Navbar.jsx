'use client';

import React, { useEffect, useState, useRef } from 'react';
import { FaHome, FaUserFriends, FaRegNewspaper, FaBell, FaUsers, FaBars } from 'react-icons/fa';
import { BiSearch, BiMessageDots } from 'react-icons/bi';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);  // To toggle mobile menu

  const userId = session?.user?.id;

  const mobileMenuRef = useRef(null);  // Reference for mobile menu
  const userProfileRef = useRef(null);  // Reference for profile picture click area

  useEffect(() => {
    if (userId) {
      fetchUserInfo(userId);
    }
  }, [userId]);

  const fetchUserInfo = async (userId) => {
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });

      if (!res.ok) throw new Error('Failed to fetch user info');

      const data = await res.json();
      setUserInfo(data);

      // Redirect if the user needs to complete their profile
      if (!data.firstName || !data.lastName) {
        router.push('/profile');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleProfileClick = () => {
    if (userId) {
      router.push(`/user/${userId}`);
    }
  };

  // Close mobile menu if clicked outside of the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
        !userProfileRef.current?.contains(event.target) &&
        !event.target.closest('.menu-icon') // Ensures the menu doesn't close when clicking on the menu button
      ) {
        setIsMobileMenuOpen(false); // Close the mobile menu
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close the mobile menu when a link is clicked
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex mx-8 justify-between items-center px-4 py-2 bg-white shadow-md relative">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <p className="text-blue-600 font-bold text-xl">LAMASOCIAL</p>
      </div>

      {/* Mobile Hamburger Menu */}
      <div className="md:hidden flex items-center menu-icon">
        <FaBars size={24} className="text-gray-600" onClick={toggleMobileMenu} />
      </div>

      {/* Navigation Links for Desktop */}
      <div className="hidden md:flex space-x-6">
        <Link href="#" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
          <FaHome size={18} />
          <span>Homepage</span>
        </Link>
        <Link href="/request" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
          <FaUserFriends size={18} />
          <span>Friends</span>
        </Link>
        <Link href="#" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
          <FaRegNewspaper size={18} />
          <span>Stories</span>
        </Link>
      </div>

      {/* Search Bar (Hide when mobile menu is open) */}
      {!isMobileMenuOpen && (
        <div className="flex items-center border rounded-full px-3 py-1 bg-gray-100">
          <BiSearch className="text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none px-2 text-gray-600"
          />
        </div>
      )}

      {/* Icons for Desktop */}
      <div className="hidden md:flex items-center space-x-4 relative">
        <Link href="/notification" onClick={handleLinkClick}>
          <FaBell size={20} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
        </Link>
        <BiMessageDots size={20} onClick={handleLinkClick} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
        <FaUsers size={20} className="text-gray-600 hover:text-blue-500 cursor-pointer" />

        {/* User Profile Image */}
        {userInfo && (
          <div className="relative" ref={userProfileRef}>
            <img
              src={userInfo.profilePicture || '/default-avatar.png'}
              alt="User Profile"
              className="w-8 h-8 rounded-full cursor-pointer border border-gray-300"
              onClick={toggleDropdown}
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                <button
                  onClick={handleProfileClick}
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-500 w-full text-left"
                >
                  Profile
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-500 w-full text-left"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-0 left-0 w-full bg-white shadow-md p-4 md:hidden z-50"
        >
          <div className="flex flex-col space-y-4">
            <Link href="#" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
              <FaHome size={18} />
              <span>Homepage</span>
            </Link>
            <Link href="/request" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
              <FaUserFriends size={18} />
              <span>Friends</span>
            </Link>
            <Link href="#" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
              <FaRegNewspaper size={18} />
              <span>Stories</span>
            </Link>
            <Link href="/notification" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
              <FaBell size={18} />
              <span>Notifications</span>
            </Link>
            <Link href="/messages" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
              <BiMessageDots size={18} />
              <span>Messages</span>
            </Link>
            <Link href="/friends" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
              <FaUsers size={18} />
              <span>Friends</span>
            </Link>
            <div
              onClick={handleProfileClick}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 cursor-pointer"
            >
              <img
                src={userInfo?.profilePicture || '/default-avatar.png'}
                alt="User Profile"
                className="w-6 h-6 rounded-full"
              />
              <span>Profile</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-gray-600 hover:text-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;

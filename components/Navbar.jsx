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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userId = session?.user?.id;

  const mobileMenuRef = useRef(null);
  const userProfileRef = useRef(null);
  const dropdownRef = useRef(null); // Reference for the dropdown menu

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
      console.log(data)
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
      router.push(`/profile`);
    }
  };

  // Close mobile menu if clicked outside of the menu or dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
        !userProfileRef.current?.contains(event.target) &&
        !dropdownRef.current?.contains(event.target) && // Close dropdown if clicked outside
        !event.target.closest('.menu-icon')
      ) {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false); // Close dropdown when clicking outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex mx-8 justify-between items-center px-4 py-2 bg-white shadow-md relative">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link href='/' className="text-blue-600 font-bold text-xl">ABDUSOCIAL</Link>
      </div>

      {/* Mobile Hamburger Menu */}
      <div className="md:hidden flex items-center menu-icon">
        <FaBars size={24} className="text-gray-600" onClick={toggleMobileMenu} />
      </div>

      {/* Navigation Links for Desktop */}
      <div className="hidden md:flex space-x-6">
        <Link href="/" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
          <FaHome size={18} />
          <span>Homepage</span>
        </Link>
        <Link href="/Friends" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
          <FaUserFriends size={18} />
          <span>Friends</span>
        </Link>
        <Link href="/stories" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
          <FaRegNewspaper size={18} />
          <span>Stories</span>
        </Link>
      </div>

      {/* Icons for Desktop */}
      <div className="hidden md:flex items-center space-x-4 relative">
        <Link href="/notification" onClick={handleLinkClick}>
          <FaBell size={20} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
        </Link>
        <Link href={'/message'}>
          <BiMessageDots size={20} onClick={handleLinkClick} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
        </Link>
        <Link href={'/Friends'}>
          <FaUsers size={20} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
        </Link>

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
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
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
        <div ref={mobileMenuRef} className="absolute top-0 left-0 w-full bg-white shadow-md p-4 md:hidden z-50">
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
              <FaHome size={18} />
              <span>Homepage</span>
            </Link>
            <Link href="/Friends" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
              <FaUserFriends size={18} />
              <span>Friends</span>
            </Link>
            <Link href="/stories" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
              <FaRegNewspaper size={18} />
              <span>Stories</span>
            </Link>
            <Link href="/notification" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
              <FaBell size={18} />
              <span>Notifications</span>
            </Link>
            <Link href="/message" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500" onClick={handleLinkClick}>
              <BiMessageDots size={18} />
              <span>Messages</span>
            </Link>

            <div onClick={handleProfileClick} className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 cursor-pointer">
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

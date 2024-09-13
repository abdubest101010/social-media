import React from 'react';
import { FaHome, FaUserFriends, FaRegNewspaper, FaBell, FaUserCircle } from 'react-icons/fa';
import { BiSearch } from 'react-icons/bi';
import { BiMessageDots } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
const Navbar = () => {
  return (
    
    <div className="flex mx-8 justify-between items-center px-4 py-2 bg-white shadow-md">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <p className="text-blue-600 font-bold text-xl">LAMASOCIAL</p>
      </div>
      
      {/* Navigation Links */}
      <div className="hidden md:flex space-x-6">
        <a href="#" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500">
          <FaHome size={18} />
          <span>Homepage</span>
        </a>
        <a href="#" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500">
          <FaUserFriends size={18} />
          <span>Friends</span>
        </a>
        <a href="#" className="flex items-center space-x-1 text-gray-600 hover:text-blue-500">
          <FaRegNewspaper size={18} />
          <span>Stories</span>
        </a>
      </div>
      
      {/* Search Bar */}
      <div className="flex items-center border rounded-full px-3 py-1 bg-gray-100">
        <BiSearch className="text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none px-2 text-gray-600"
        />
      </div>
      
      {/* Icons */}
      <div className="flex items-center space-x-4">
        <FaBell size={20} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
        <BiMessageDots size={20} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
        
        <FaUsers size={20} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
        <FaUserCircle size={28} className="text-gray-600 hover:text-blue-500 cursor-pointer" />
      </div>
    </div>
  );
}

export default Navbar;

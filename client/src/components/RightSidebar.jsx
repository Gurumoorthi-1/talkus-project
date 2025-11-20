import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/img/assets'
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from "react-hot-toast";  

const RightSidebar = () => {

  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    setMsgImages(messages.filter(msg => msg.image).map(msg => msg.image));
  }, [messages]);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  const handleLogout = () => {
    logout(); 
    toast.success("Logged out successfully!");  
  };

  return (
    <div className="bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll max-md:hidden">

      {/* Profile pic */}
      <div className="pt-16 flex flex-col items-center gap-3">

        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt=""
          className="w-16 h-16 rounded-full object-cover border border-white/40"
        />

        
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">
            {selectedUser?.fullName || "Unknown User"}
          </h1>

          {isOnline && (
            <span className="w-3 h-3 rounded-full bg-green-500 border-2 border-[#8185B2]"></span>
          )}
        </div>

        {/* BIO */}
        <p className="text-sm opacity-80 text-center max-w-[240px]">
          {selectedUser?.bio || "No bio added yet"}
        </p>

      </div>

      <hr className="border-[#ffffff40] my-4" />

      {/* MEDIA SECTION */}
      <div className="px-5 text-xs">
        <p className="mb-2 font-medium opacity-90">Media</p>

        <div className="max-h-[230px] overflow-y-scroll grid grid-cols-2 gap-3 pr-1">
          {msgImages.map((url, index) => (
            <div 
              key={index} 
              onClick={() => window.open(url)} 
              className="cursor-pointer"
            >
              <img src={url} alt="" className="rounded-md w-full h-24 object-cover" />
            </div>
          ))}

          {msgImages.length === 0 && (
            <p className="col-span-2 text-center opacity-60 text-xs">
              No media shared yet.
            </p>
          )}
        </div>
      </div>

      {/* LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm py-2 px-20 rounded-full shadow-md cursor-pointer"
      >
        Logout
      </button>

    </div>
  );
};

export default RightSidebar;

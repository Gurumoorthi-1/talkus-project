import React, { useContext, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import assets from '../assets/img/assets'
import { ChatContext } from '../../context/ChatContext'

const HomePage = () => {
 
  const{selectedUser} = useContext(ChatContext)

  return (
    <div className="w-full h-screen sm:px-[15%] sm:py-[5%] relative overflow-hidden">

     
      <img
        src={assets.bgImage} 
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl"></div>

      <div className={`relative z-10 border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid grid-cols-1 ${
        selectedUser
          ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
          : 'md:grid-cols-2'
      }`}>
        <Sidebar />
        <ChatContainer/>
        <RightSidebar />
      </div>

    </div>
  )
}

export default HomePage;

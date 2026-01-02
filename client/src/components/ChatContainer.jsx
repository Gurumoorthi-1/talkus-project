import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/img/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { formatDateHeader } from "../../utils/formatDate";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);

  const { authUser, socket, onlineUsers } = useContext(AuthContext);

  const navigate = useNavigate();
  const scrollEnd = useRef();
  const [input, setInput] = useState("");

  const currentUserId = authUser?._id;




  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
  }, [selectedUser]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please choose a valid image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  if (!authUser) return null;

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">

      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img src={selectedUser.profilePic || assets.avatar_icon} className="w-8 rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} className="md:hidden max-w-7 cursor-pointer" />
        <img src={assets.help_icon} className="max-md:hidden max-w-5 cursor-pointer hover:scale-110 transition" onClick={() => navigate("/profile")} />
      </div>

      {/* Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-4 space-y-4">

        {messages.map((msg, index) => {
          const mine = msg.senderId === currentUserId;

          const messageTime = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          const showDate =
            index === 0 ||
            new Date(messages[index].createdAt).toDateString() !==
            new Date(messages[index - 1]?.createdAt).toDateString();

          return (
            <React.Fragment key={msg._id || index}>
              {showDate && (
                <div className="text-center text-gray-300 text-xs my-1">
                  {formatDateHeader(msg.createdAt)}
                </div>
              )}

              <div className={`flex items-end gap-3 ${mine ? "justify-end" : "justify-start"}`}>

                {!mine && (
                  <img src={selectedUser.profilePic || assets.avatar_icon} className="w-8 h-8 rounded-full" />
                )}

                <div className={`flex flex-col max-w-[260px] ${mine ? "items-end" : "items-start"}`}>

                  {msg.image ? (
                    <img src={msg.image} className="max-w-[250px] rounded-xl border border-gray-700" />
                  ) : (
                    <p
                      className={`p-3 md:text-sm break-all text-white rounded-xl
                      ${mine ? "bg-violet-500/40 rounded-br-none" : "bg-gray-700/40 rounded-bl-none"}`}
                    >
                      {msg.text}
                    </p>
                  )}

                  {/* Time + Tick */}
                  <div className="flex items-center gap-1 text-[10px] text-gray-300 mt-1">
                    <span>{messageTime}</span>

                    {mine && (
                      msg.status === "seen"
                        ? <span className="text-green-400 text-[12px]">✔✔</span>
                        : msg.status === "delivered"
                          ? <span className="text-gray-400 text-[12px]">✔✔</span>
                          : <span className="text-gray-400 text-[12px]">✔</span>
                    )}
                  </div>

                </div>
              </div>
            </React.Fragment>
          );
        })}

        <div ref={scrollEnd}></div>
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/10 px-3 rounded-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
            placeholder="Message..."
            className="flex-1 text-sm p-3 border-none outline-none text-white bg-transparent"
          />
          <input type="file" accept="image/*" id="imageFile" hidden onChange={handleSendImage} />
          <label htmlFor="imageFile">
            <img src={assets.gallery_icon} className="w-5 mr-2 cursor-pointer hover:scale-110" />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} className="w-7 cursor-pointer hover:scale-110" />
      </div>

    </div>
  ) : (
    <div className="flex flex-col items-center justify-center text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;

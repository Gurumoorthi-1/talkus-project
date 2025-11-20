import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { authUser, socket } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  // Fetch all users + unseen messages
  const getUsers = async () => {
    try {
      const res = await axios.get("/api/messages/users");
      if (res.data.success) {
        setUsers(res.data.users);
        setUnseenMessages(res.data.unseenMessages || {});
      }
    } catch (error) {
      console.log("Get users error:", error);
    }
  };

  // Fetch messages for selected user
  const getMessages = async (userId) => {
    try {
      const res = await axios.get(`/api/messages/${userId}`);
      if (res.data.success) {
        setMessages(res.data.messages);
        setUnseenMessages((prev) => ({ ...prev, [userId]: 0 }));
        socket?.emit("messagesSeen", { senderId: userId, receiverId: authUser._id });
      }
    } catch (error) {
      console.log("Get messages error:", error);
    }
  };

  // Send message
  const sendMessage = async (content) => {
    if (!selectedUser) return;
    try {
      const res = await axios.post(`/api/messages/send/${selectedUser._id}`, content);
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.newMessage]);
        socket?.emit("newMessage", res.data.newMessage);
      }
    } catch (error) {
      console.log("Send message error:", error);
    }
  };

  useEffect(() => { if (authUser) getUsers(); }, [authUser]);

  // Real-time new message listener
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (selectedUser?._id === message.senderId) {
        setMessages((prev) => [...prev, message]);
        socket.emit("messagesSeen", { senderId: message.senderId, receiverId: authUser._id });
      } else {
        setUnseenMessages((prev) => ({ ...prev, [message.senderId]: (prev[message.senderId] || 0) + 1 }));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser, authUser]);

  // Listen for seen updates
  useEffect(() => {
    if (!socket) return;

    const handleMessagesSeen = ({ senderId }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.senderId === authUser._id && msg.receiverId === senderId ? { ...msg, status: "seen" } : msg))
      );
    };

    socket.on("messagesSeen", handleMessagesSeen);
    return () => socket.off("messagesSeen", handleMessagesSeen);
  }, [socket, authUser]);

  return (
    <ChatContext.Provider
      value={{
        users,
        messages,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsers,
        getMessages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

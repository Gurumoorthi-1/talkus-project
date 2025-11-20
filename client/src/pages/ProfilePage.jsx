import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/img/assets";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [SelectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let body = { fullName: name, bio };

      if (SelectedImg) {
        const reader = new FileReader();
        const base64Image = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(SelectedImg);
        });

        body.profilePic = base64Image;
      }

      const success = await updateProfile(body);

      if (success) {
        toast.success("Profile updated successfully ");
        navigate("/");
      }

    } catch (err) {
      toast.error("Something went wrong! Try again.");
    }
  };

 
  const previewImg = SelectedImg
    ? URL.createObjectURL(SelectedImg)
    : authUser?.profilePic || assets.avatar_icon;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      <img src={assets.bgImage} className="absolute inset-0 w-full h-full object-cover" alt="background" />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative z-10 w-[95%] max-w-3xl bg-white/10 backdrop-blur-xl text-gray-200 
      border border-white/20 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-center">

        
        <div className="w-full flex md:hidden justify-center py-6">
          <img
            src={previewImg}
            alt="Mobile Preview"
            className="w-28 h-28 rounded-full object-cover border border-gray-300"
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-8 w-full md:w-2/3">
          <h3 className="text-xl font-semibold">Profile details</h3>

          <label htmlFor="avatar" className="flex items-center gap-4 cursor-pointer">
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={previewImg}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border border-gray-400"
            />
            <span className="text-sm text-gray-300">Upload profile image</span>
          </label>

          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your Name"
            className="p-3 border border-gray-500 bg-white/10 rounded-md outline-none"
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio..."
            required
            rows={4}
            className="p-3 border border-gray-500 bg-white/10 rounded-md outline-none"
          ></textarea>

          <button
            type="submit"
            className="py-3 bg-gradient-to-r from-purple-500 to-violet-700 rounded-full text-lg hover:opacity-90 transition"
          >
            Save
          </button>
        </form>

        <div className="hidden md:flex justify-center items-center w-1/3 p-6">
          <img
            src={previewImg}
            alt="Desktop Preview"
            className="w-40 h-40 rounded-full object-cover border border-gray-400"
          />
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;

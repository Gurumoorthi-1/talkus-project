import React, { useContext, useState, useEffect } from 'react'
import assets from '../assets/img/assets'
import { AuthContext } from '../../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'

const LoginPage = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const [currState, setcurrState] = useState(location.pathname === "/signup" ? "Sign up" : "Login")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login } = useContext(AuthContext)

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // First Step of Signup → Click Next
    if (currState === 'Sign up' && !isDataSubmitted) {
      setIsDataSubmitted(true)
      return;
    }

    const success = await login(
      currState === "Sign up" ? "signup" : "login",
      { fullName, email, password, bio }
    );

    if (success && currState === "Sign up") {
      navigate('/login');
      setIsDataSubmitted(false);
      setFullName("");
      setEmail("");
      setPassword("");
      setBio("");
    }
  }

  useEffect(() => {
    if (location.pathname === "/signup") {
      setcurrState("Sign up");
    } else {
      setcurrState("Login");
    }
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">

      {/* BG IMAGE */}
      <img
        src={assets.bgImage}
        className="absolute inset-0 w-full h-full object-cover"
        alt="background"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-2xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-20">

        {/* LOGO */}
        <img
          src={assets.logo_big}
          alt="logo"
          className="w-[min(28vw,200px)] drop-shadow-[0_0_35px_rgba(255,255,255,0.5)]"
        />

        {/* FORM */}
        <form
          onSubmit={onSubmitHandler}
          className="border-2 bg-white/10 backdrop-blur-xl text-white border-gray-600
          p-10 flex flex-col gap-6 rounded-2xl shadow-xl w-[90vw] max-w-[380px]"
        >

          <h2 className="font-medium text-2xl flex justify-between items-center">
            {currState}

            {isDataSubmitted && (
              <img
                onClick={() => setIsDataSubmitted(false)}
                src={assets.arrow_icon}
                alt="Back"
                className="w-5 cursor-pointer hover:opacity-80 transition"
              />
            )}
          </h2>

          {currState === "Sign up" && !isDataSubmitted && (
            <input
              onChange={(e) => setFullName(e.target.value)}
              value={fullName}
              type="text"
              placeholder="Full Name"
              required
              className="p-3 bg-white/20 border border-gray-400 rounded-md outline-none"
            />
          )}

          {!isDataSubmitted && (
            <>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email Address"
                required
                className="p-3 bg-white/20 border border-gray-400 rounded-md outline-none"
              />

              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Password"
                required
                className="p-3 bg-white/20 border border-gray-400 rounded-md outline-none"
              />
            </>
          )}

          {currState === "Sign up" && isDataSubmitted &&
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              rows={4}
              placeholder="Tell us about yourself..."
              required
              className="p-3 bg-white/20 border border-gray-400 rounded-md outline-none"
            />
          }

          <button className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 rounded-md cursor-pointer">
            {currState === "Sign up" ? "Create Account" : "Login Now"}
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" />
            <p>Agree to terms & privacy policy</p>
          </div>

          <p className="text-sm text-gray-300">
            {currState === "Sign up" ? (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => { navigate("/login"); setIsDataSubmitted(false) }}
                  className="text-violet-400 cursor-pointer"
                >
                  Login here
                </span>
              </>
            ) : (
              <>
                Create an account{" "}
                <span
                  onClick={() => { navigate("/signup"); setIsDataSubmitted(false) }}
                  className="text-violet-400 cursor-pointer"
                >
                  Click here
                </span>
              </>
            )}
          </p>

        </form>
      </div>
    </div>
  )
}

export default LoginPage

import React, { useState } from "react";
import { CircleDot, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthQuery } from "../reactQuery/hooks/useAuthQuery";
import { BiLoaderCircle } from "react-icons/bi";

const Login = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signinMutation } = useAuthQuery(navigate);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { Email, Password };
    // console.log(payload, "payload");
    signinMutation.mutate(payload, {
      onError: (error) => {
        console.error("Login error:", error);
      },
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 lg:px-16 xl:px-24">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <CircleDot className="w-8 h-8 text-[#16C47F]" />
            <span className="text-xl font-semibold">
              <span className="text-gray-900">Quick</span>
              <span className="text-[#16C47F]">Pipe</span>
              <span className="text-gray-900">.Ai</span>
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-8">Log in</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#16C47F] focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#16C47F] focus:border-transparent outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 cursor-pointer" />
                ) : (
                  <Eye className="w-5 h-5 cursor-pointer" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="px-8 py-3 bg-[#16C47F] hover:bg-[#FF9D23] text-white rounded-lg cursor-pointer transition"
              >
                {signinMutation?.isPending ? (
                  <BiLoaderCircle className="size-7 animate-spin" />
                ) : (
                  "Login"
                )}
              </button>
              <p className="text-sm text-gray-600 hover:text-[#FF9D23]">
                <Link to="/forgot">Forgot password?</Link>
              </p>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <span className="text-[#16C47F] hover:text-[#FF9D23] font-medium">
              <Link to="/signup">Sign up</Link>
            </span>
          </p>
        </div>
      </div>

      {/* Right side - Welcome Message */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#16C47F]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683311-eac922347aa1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80')] opacity-20 mix-blend-overlay"></div>
        </div>
        <div className="relative w-full flex items-center justify-center p-16">
          <div className="text-white max-w-md">
            <h2 className="text-4xl font-bold mb-6">Welcome Back!</h2>
            <p className="text-lg text-[#16C47F]">
              Unlock the power of effective outreach with our cutting-edge
              platform, and experience a surge in responses and engagement rates
              like never before.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

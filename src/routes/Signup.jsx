import  { useState } from 'react';
import { CircleDot, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthQuery } from '../reactQuery/hooks/useAuthQuery';
import { BiLoaderCircle } from "react-icons/bi";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    PhoneNumber:'',
    Password: '',
    agreeToTerms: false
  });
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signupMutation } = useAuthQuery(navigate);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'Password') {
      setPasswordError(value.length < 6 ? 'Password must be at least 6 characters' : '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.Password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    // Handle sign-up logic
    signupMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign Up Form */}
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

          <h1 className="text-2xl font-semibold text-gray-900 mb-8">Create a new account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className='flex gap-2'>
            
              <div>
                <input
                  type="text"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#16C47F] focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#16C47F] focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#16C47F] focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <input
                type="text"
                name="PhoneNumber"
                value={formData.PhoneNumber}
                onChange={handleChange}
                placeholder="Contact Number"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#16C47F] focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-[#16C47F] focus:border-transparent outline-none transition`}
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
              {passwordError && (
                <p className="mt-1 text-sm text-red-500">{passwordError}</p>
              )}
            </div>

            <div className="flex items-start space-x-2 mt-4">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1"
                required
              />
              <label className="text-sm text-gray-600">
                I agree to the QuickPipe{' '}
                <a href="#" className="text-[#16C47F] hover:text-[#FF9D23]">
                  Terms of Use
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#16C47F] hover:text-[#FF9D23]">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-8 py-3 flex justify-center cursor-pointer bg-[#16C47F] hover:bg-[#FF9D23] text-white rounded-lg transition mt-6"
            >
              {signupMutation?.isPending ? 
                ( <BiLoaderCircle className="size-7 animate-spin" /> ) : 
                ( "Join now" ) 
                }
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
           <span className="text-[#16C47F] hover:text-[#16C47F] font-medium"><Link to="/login"> Log in</Link>
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
            <h2 className="text-4xl font-bold mb-6">10,000+ clients are getting more replies!</h2>
            <p className="text-lg text-white">
              Unlock the power of effective outreach with our cutting-edge platform, 
              and experience a surge in responses and engagement rates like never before.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;



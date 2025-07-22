import { useState } from "react";
import { CircleDot, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthQuery } from "../reactQuery/hooks/useAuthQuery";
import { BiLoaderCircle } from "react-icons/bi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    PhoneNumber: "",
    Password: "",
    agreeToTerms: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasLowerCase: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Password validation function - matches backend regex
  const validatePassword = (password) => {
    const criteria = {
      minLength: password.length >= 8,
      hasLowerCase: /[a-z]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!#$%&()*+,-./:;<=>?@[\]^_{|}~]/.test(password),
    };

    setPasswordCriteria(criteria);

    const allCriteriaMet = Object.values(criteria).every(Boolean);
    return allCriteriaMet ? "" : "Please meet all password requirements";
  };
  const { signupMutation } = useAuthQuery(navigate);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "Password") {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
    if (!allCriteriaMet) {
      setPasswordError("Please meet all password requirements");
      return;
    }
    // Handle sign-up logic
    // console.log(formData);
    signupMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign Up Form */}
      <div className="w-full lg:w-1/2 py-16 flex flex-col items-center justify-center px-6 lg:px-16 xl:px-24">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            {/* <CircleDot className="w-8 h-8 text-[#16C47F]" /> */}
            <img src="src\assets\logo2.png" className="h-7" alt="Logo" />
            <span className="text-xl font-semibold">
              <span className="text-gray-900">Quick</span>
              <span className="text-[#16C47F]">Pipe</span>
              <span className="text-gray-900">.Ai</span>
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-8">
            Create a new account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
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

            <div className="overflow-none">
              <PhoneInput
                country={"us"}
                value={formData.PhoneNumber}
                className
                onChange={(phone) =>
                  setFormData((prev) => ({
                    ...prev,
                    PhoneNumber: phone.startsWith("+") ? phone : `+${phone}`,
                  }))
                }
                inputProps={{
                  name: "PhoneNumber",
                  required: true,
                  className:
                    "w-full px-4 py-3 pl-16 rounded-lg border border-gray-300  outline-none transition overflow-none",
                }}
                containerStyle={{
                  width: "100%",
                }}
                buttonStyle={{
                  border: "1px solid #d1d5db",
                  borderRight: "none",
                  // borderRadius: '0.5rem 0 0 0.5rem',
                  // backgroundColor: '#f9fafb'
                }}
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
                    passwordError ? "border-red-500" : "border-gray-300"
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

              {/* Password Requirements */}
              {formData.Password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordCriteria.minLength
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {passwordCriteria.minLength && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        passwordCriteria.minLength
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      At least 8 characters
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordCriteria.hasLowerCase
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {passwordCriteria.hasLowerCase && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        passwordCriteria.hasLowerCase
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      One lowercase letter (a-z)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordCriteria.hasUpperCase
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {passwordCriteria.hasUpperCase && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        passwordCriteria.hasUpperCase
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      One uppercase letter (A-Z)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordCriteria.hasNumber
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {passwordCriteria.hasNumber && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        passwordCriteria.hasNumber
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      One number (0-9)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordCriteria.hasSpecialChar
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {passwordCriteria.hasSpecialChar && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        passwordCriteria.hasSpecialChar
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      One special character (!#$%&*)
                    </span>
                  </div>
                </div>
              )}

              {/* {passwordError && (
                <p className="mt-1 text-sm text-red-500">{passwordError}</p>
              )} */}
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
                I agree to the QuickPipe{" "}
                <a href="#" className="text-[#16C47F] hover:text-[#FF9D23]">
                  Terms of Use
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#16C47F] hover:text-[#FF9D23]">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-8 py-3 flex justify-center cursor-pointer bg-[#16C47F] hover:bg-[#FF9D23] text-white rounded-lg transition mt-6"
            >
              {signupMutation?.isPending ? (
                <BiLoaderCircle className="size-7 animate-spin" />
              ) : (
                "Join now"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <span className="text-[#16C47F] hover:text-[#16C47F] font-medium">
              <Link to="/login"> Log in</Link>
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
            <h2 className="text-4xl font-bold mb-6">
              10,000+ clients are getting more replies!
            </h2>
            <p className="text-lg text-white">
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

export default SignUp;

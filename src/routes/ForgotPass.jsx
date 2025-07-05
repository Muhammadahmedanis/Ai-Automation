import { CircleDot } from 'lucide-react';
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthQuery } from '../reactQuery/hooks/useAuthQuery';

function Forgotpass() {
    const { forgotPasswordMutation } = useAuthQuery();
    const [email, setEmail] = useState('');
    const [isPending, setIspending] = useState(false);
    const haldleForgotPass = async () => {
        console.log({Email: email});
        forgotPasswordMutation.mutate({Email: email});
        setEmail('');
    }
    return (
        <div className='flex justify-center items-center min-h-screen'>
            <main id="content" role="main" className="w-full max-w-md p-6">
                <div className="bg-white shadow-lg mt-7 rounded-xl">
                    <div className="p-4 sm:p-7">
                        <div className="flex gap-2 flex-col items-center justify-center mb-4 text-2xl font-bold">
                        <div className="flex items-center gap-2 mb-4">
                            <CircleDot className="w-8 h-8 text-[#16C47F]" />
                            <span className="text-xl font-semibold">
                            <span className="text-gray-900">Quick</span>
                            <span className="text-[#16C47F]">Pipe</span>
                            <span className="text-gray-900">.Ai</span>
                            </span>
                        </div>
                            <h1 className="block text-lg font-bold text-gray-800">Forgot Password</h1>
                            <p className='text-[15px] text-center font-normal'>Enter your email and we'll send you a link to reset your password.</p>
                        </div>
                        <div>
                            <div className="grid gap-y-2">
                                <div>
                                    <label htmlFor="email" />
                                    <div className="relative">
                                        <input
                                            onChange={(e) => setEmail(e.target.value)}
                                            type="email"
                                            value={email}
                                            id="email"
                                            name="email"
                                            className="block w-full px-4 py-3 text-sm border-2 border-gray-400 outline-none rounded-md shadow-sm"
                                            placeholder="abc@gmail.com"
                                        />
                                    </div>
                                    <p className="hidden mt-2 text-xs text-red-600" id="confirm-new-password-error">
                                        Please include a password that complies with the rules to ensure security
                                    </p>
                                </div>
                                <button
                                    onClick={haldleForgotPass}
                                    type="submit"
                                    className="inline-flex items-center justify-center cursor-pointer gap-2 px-4 py-3 text-[15px] font-bold text-white transition-all bg-[#16C47F] hover:bg-[#FF9D23] border border-transparent rounded-md outline-none ">
                                    Reset Password
                                    {/* {isPending && <div className="w-7 h-7 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>} */}
                                </button>
                                <button
                                    className="inline-flex items-center cursor-pointer border-gray-200 justify-center gap-2 px-4 py-3 text-sm font-bold text-gray-700 transition-all border-2 bg-gray-200 hover:bg-gray-50 rounded-md">
                                    <Link to="/login">
                                        Back to Sign in
                                    </Link>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Forgotpass
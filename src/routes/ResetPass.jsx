import { CircleDot } from 'lucide-react';
import React, { useActionState, useState } from 'react';
import { FaRegEyeSlash } from 'react-icons/fa6';
import { LuEye } from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import { useAuthQuery } from '../reactQuery/hooks/useAuthQuery';

const ResetPass = () => {
    // const { token } = useParams();
    // const param = useParams();
    // const token = param["token"]
    const [passIcon, setPassIcon] = useState("password");
     const { resetPasswordMutation } = useAuthQuery();
    const [user, submitAction, isPending] = useActionState(async (previousState, formData) => {
        const newPassword = formData.get("newPassword");
        if (!newPassword) {
            return toast.error("Password is required")
        }
        console.log({NewPassword: newPassword});
        if (newPassword) {
            resetPasswordMutation.mutate({NewPassword: newPassword});
        }
       
    })

    const handlePass = () => {
        if (passIcon === "password") {
            setPassIcon("text");
        } else {
            setPassIcon("password")
        }
    }

    return (
        <div className='flex justify-center items-center min-h-screen '>
            <main id="content" role="main" className="w-full max-w-md p-6">
                <div className="bg-white     shadow-lg mt-7 rounded-xl">
                    <div className="p-4 sm:p-7">
                            <div className="flex flex-col items-center justify-center mb-4 text-2xl font-bold">
                            <div className="flex items-center gap-2 mb-8">
                                <CircleDot className="w-8 h-8 text-[#16C47F]" />
                                <span className="text-xl font-semibold">
                                <span className="text-gray-900">Quick</span>
                                <span className="text-[#16C47F]">Pipe</span>
                                <span className="text-gray-900">.Ai</span>
                                </span>
                            </div>
                            </div>
                        <div className="">
                            <form action={submitAction}>
                                <div className="grid gap-y-4">
                                    {/* <div>
                                        <label  htmlFor="new_password" />
                                        <div className="relative flex items-center mt-2">
                                            <span onClick={handlePass} className="absolute right-1">
                                                {passIcon === "password" ? <FaRegEyeSlash className="w-5 h-5 mx-3 cursor-pointer font-bold text-gray-400 dark:text-gray-500" /> : <LuEye className="w-5 h-5 mx-3 cursor-pointer text-gray-400 dark:text-gray-500" />}
                                            </span>
                                            <input
                                                type={passIcon === "password" ? "password" : "text"}
                                                id="old_password"
                                                name="oldPassword"
                                                className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                                aria-describedby="new-password-error"
                                                placeholder="Enter old password"
                                            />
                                        </div>
                                        <p className="hidden mt-2 text-xs text-red-600" id="new-password-error">
                                            Please include a password that complies with the rules to ensure security
                                        </p>
                                    </div> */}
                                    <div>
                                        <label htmlFor="confirm_new_password" />
                                        <div className="relative flex items-center mt-2">
                                            <span onClick={handlePass} className="absolute right-1">
                                                {passIcon === "password" ? <FaRegEyeSlash className="w-5 h-5 mx-3 cursor-pointer font-bold text-gray-400 dark:text-gray-500" /> : <LuEye className="w-5 h-5 mx-3 cursor-pointer text-gray-400 dark:text-gray-500" />}
                                            </span>
                                            <input
                                                type={passIcon === "password" ? "password" : "text"}
                                                id="confirm_new_password"
                                                name="newPassword"
                                                className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                                aria-describedby="confirm-new-password-error"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <p className="hidden mt-2 text-xs text-red-600" id="confirm-new-password-error">
                                            Please include a password that complies with the rules to ensure security
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center cursor-pointer justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition-all bg-[#16C47F] hover:bg-[#FF9D23] border border-transparent rounded-md  focus:outline-none focus:ring-2">
                                        Change my password
                                        {isPending && <div className="w-7 h-7 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default ResetPass;
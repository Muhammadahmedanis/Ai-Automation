import { CircleDot } from 'lucide-react';
import React, { useActionState, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthQuery } from '../reactQuery/hooks/useAuthQuery';
import { BiLoaderCircle } from "react-icons/bi";

// export const getData = (data) => {
//   console.log(data);
//   return data;
// };

const Otp = () => {
  const navigate = useNavigate()
  const { verifyOtpMutation } = useAuthQuery(navigate);
  const [otpNum, setOtpNum] = useState(["", "", "", "", "", ""]);
  const[disable, setDisable] = useState(false);

  const [user, submitAction, isPending] = useActionState(async (previousState, formData) => {
    const otp = otpNum.join('');
    const payload = {UserCode: otp, Login: true};
    console.log(payload);
    verifyOtpMutation.mutate(payload);
    if(payload){
      setOtpNum(["", "", "", "", "", ""]);
    }
  });

  const handleChange = (e, index) => {
    const value = e.target.value;
    const newOtp = [...otpNum];
    newOtp[index] = value;
    setOtpNum(newOtp);

    if (value && index < 5) {
      // Move focus to the next input when a digit is entered
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
    index == 5 && setDisable(true)
};


const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otpNum[index] === "") {
        if (index > 0) {
            document.getElementById(`otp-input-${index - 1}`).focus();
        }
    }
};

  return (
    <div className="flex items-center justify-center min-h-screen">
    <div className="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow">
      <header className="mb-4">
        <div className="text-center flex flex-col items-center text-xl font-bold">
        <div className="flex items-center gap-2 mb-4">
            <CircleDot className="w-8 h-8 text-[#16C47F]" />
            <span className="text-xl font-semibold">
            <span className="text-gray-900">Quick</span>
            <span className="text-[#16C47F]">Pipe</span>
            <span className="text-gray-900">.Ai</span>
            </span>
        </div>
        </div>
        <p className="text-[16px] text-slate-500">
          Enter the 6-digit verification code that was sent to your email.
        </p>
      </header>
      <form action={submitAction} id="otp-form">
        <div className="flex items-center justify-center gap-3">
          {otpNum.map((value, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              name='otp'
              value={value}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength="1"
              inputMode="numeric"
              className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-[#16C47F] focus:ring-2 focus:ring-indigo-100"
            />
          ))}
        </div>
        <div className="max-w-[260px] mx-auto mt-4">
          <button
            type='submit'
            disabled={verifyOtpMutation.isPending}  
            className={`w-full inline-flex gap-2 items-center cursor-pointer justify-center whitespace-nowrap rounded-lg ${!disable ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed' : 'bg-[#16C47F] hover:bg-[#FF9D23] '} px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 focus:outline-none focus:ring focus:ring-indigo-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 transition-colors duration-150`}>
                <div className='text-[17px]'> 
                {verifyOtpMutation?.isPending ? 
                ( <BiLoaderCircle className="size-7 animate-spin" /> ) : 
                ( "Verify Otp" ) 
                }
              </div>
          </button>
        </div>
      </form>
      
    </div>
    </div>
  );
};

export default Otp;
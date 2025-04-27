import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail, resendOTP, reset } from '../../features/auth/authSlice';
import { FaEnvelope, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );
  
  // Get email from location state or user object
  const email = location.state?.email || user?.email;
  
  useEffect(() => {
    // Redirect if no email is available
    if (!email) {
      toast.error('Email not found. Please register again.');
      navigate('/register');
    }
    
    // Redirect if user is already verified
    if (user && user.isVerified) {
      navigate('/dashboard');
    }
    
    // OTP expiration timer (5 minutes)
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Resend cooldown timer
    const resendTimer = setInterval(() => {
      setResendCountdown((prevTime) => {
        if (prevTime <= 1) {
          setResendDisabled(false);
          clearInterval(resendTimer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(resendTimer);
      dispatch(reset());
    };
  }, [email, user, navigate, dispatch]);
  
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    
    if (isSuccess && user) {
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    }
  }, [isError, isSuccess, message, user, navigate]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }
    
    if (timeLeft === 0) {
      toast.error('OTP has expired. Please request a new one.');
      return;
    }
    
    dispatch(verifyEmail({ email, otp }));
  };
  
  const handleResendOTP = () => {
    if (!email) {
      toast.error('Email not found. Please register again.');
      navigate('/register');
      return;
    }
    
    dispatch(resendOTP({ email }));
    setTimeLeft(300); // Reset the timer to 5 minutes
    setResendDisabled(true);
    setResendCountdown(60); // 60 seconds cooldown for resend
    toast.info('A new OTP has been sent to your email');
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <FaEnvelope className="inline-block mr-2" />
            Verify Email
          </h1>
          <p className="text-gray-600 mt-2">
            We've sent a verification code to <strong>{email}</strong>
          </p>
        </div>
        
        {isError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        <div className="mb-4 text-center">
          <div className="text-sm text-gray-600 mb-2">
            Enter the 6-digit code sent to your email
          </div>
          <div className="text-sm font-semibold text-gray-700 mb-4">
            Code expires in: <span className={timeLeft < 60 ? 'text-red-500' : 'text-green-500'}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 text-center text-2xl tracking-widest leading-tight focus:outline-none focus:shadow-outline"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
              placeholder="000000"
              required
              maxLength="6"
            />
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="inline-block animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendOTP}
            disabled={resendDisabled || isLoading}
            className={`text-primary hover:underline ${
              resendDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {resendDisabled
              ? `Resend code in ${resendCountdown}s`
              : 'Resend verification code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
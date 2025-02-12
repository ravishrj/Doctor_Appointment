"use client";

import React, { useRef, useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, googleAuth } from "../firebase/config";
import { signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { fireStore } from "../firebase/config";

const LoginForm = ({ onClose,setShowSignUpForm,setIsUserLoggedIn,setIsDoctorLoggedIn }) => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  // const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      const res = await signInWithEmailAndPassword(email, password);
      const user = res.user;

      if (user) {
        const userRef = doc(fireStore, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          localStorage.setItem("current-user", JSON.stringify(user));
          localStorage.setItem("user-Data", JSON.stringify(userData));
          sessionStorage.setItem("UserAuthentication", JSON.stringify(userData));
        }
        const userRole = userDoc.data().role;
        if(userRole=='Doctor')
        {
          setIsDoctorLoggedIn(true);
        }
        else{ setIsUserLoggedIn(true);}
       
        toast.success("Successfully logged in!");
        router.push("/");
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Login failed! Please check your credentials.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-80 relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-xl font-bold">&times;</button>
        <h2 className="text-xl font-bold mb-4 text-center">User Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" ref={emailRef} className="w-full p-2 border rounded" />
          <input type="password" placeholder="Password" ref={passwordRef} className="w-full p-2 border rounded" />
          <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Sign In</button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <button onClick={()=>{onClose;setShowSignUpForm(true);}} className="text-gray-600 hover:underline">Sign Up</button>
        </div>
        <button onClick={onClose} className="w-full text-center text-gray-600 mt-2">Cancel</button>
      </div>
    </div>
  );
};

export default LoginForm;

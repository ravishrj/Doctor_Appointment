"use client";

import { useState, useRef } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { doc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, fireStore } from "../firebase/config";
import { updateProfile, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SignUp = ({ onClose,setShowSignUpForm,setShowLoginForm, setIsUserLoggedIn,setIsDoctorLoggedIn }) => {
  const router = useRouter();
  const userNameRef = useRef("");
  const emailRef = useRef("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Patient"); // Default role: Patient

  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (password !== confirmPassword) {
  //     toast.error("Passwords do not match");
  //     return;
  //   }

  //   if (!emailRef.current.value || !password || !userNameRef.current.value) {
  //     toast.error("All fields are required");
  //     return;
  //   }

  //   try {
  //     const email = emailRef.current.value;
  //     const name = userNameRef.current.value;

  //     // 🔥 Check if user already exists in Firestore
  //     const usersRef = collection(fireStore, "users");
  //     const querySnapshot = await getDocs(query(usersRef, where("email", "==", email)));

  //     if (!querySnapshot.empty) {
  //       toast.error("User already exists with this email!");
  //       return;
  //     }

  //     // ✅ Create user with email and password
  //     const userCredential = await createUserWithEmailAndPassword(email, password);
  //     if (!userCredential) return;

  //     const user = userCredential.user;

  //     // ✅ Set display name
  //     await updateProfile(user, { displayName: name });

  //     // ✅ Store user data in Firestore
  //     await setDoc(doc(fireStore, "users", user.uid), {
  //       Name: name,
  //       email: user.email,
  //       role, // ✅ Store role (Doctor/Patient)
  //       createdAt: new Date(),
  //     });

  //     await signOut(auth); // Logout after registration
  //     localStorage.removeItem("current-user");
  //     sessionStorage.removeItem("user");
  //      setShowSignUpForm(false);
       
  //     toast.success("Sign-up successful! Please log in.");
  //     setShowLoginForm(true);
  //     // onClose(); // Close modal after signup
  //   } catch (error) {
  //     console.error("Error during sign-up:", error);
  //     toast.error("Sign-up failed! Please try again.");
  //   }
  // };

  const [loading, setLoading] = useState(false); // ✅ Loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
  
    if (!emailRef.current.value || !password || !userNameRef.current.value) {
      toast.error("All fields are required");
      return;
    }
  
    setLoading(true); // ✅ Start loading
  
    try {
      const email = emailRef.current.value;
      const name = userNameRef.current.value;
  
      // 🔥 Check if user already exists in Firestore
      const usersRef = collection(fireStore, "users");
      const querySnapshot = await getDocs(query(usersRef, where("email", "==", email)));
  
      if (!querySnapshot.empty) {
        toast.error("User already exists with this email!");
        setLoading(false); // ✅ Stop loading
        return;
      }
  
      // ✅ Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(email, password);
      if (!userCredential) return;
  
      const user = userCredential.user;
  
      // ✅ Set display name
      await updateProfile(user, { displayName: name });
  
      // ✅ Store user data in Firestore
      await setDoc(doc(fireStore, "users", user.uid), {
        Name: name,
        email: user.email,
        role, // ✅ Store role (Doctor/Patient)
        createdAt: new Date(),
      });
  
      await signOut(auth); // Logout after registration
      localStorage.removeItem("current-user");
      sessionStorage.removeItem("user");
  

      setIsDoctorLoggedIn(false);
        setIsUserLoggedIn(false);
        
      setShowSignUpForm(false);
      toast.success("Sign-up successful! Please log in.");
      setShowLoginForm(true);
    } catch (error) {
      console.error("Error during sign-up:", error);
      toast.error("Sign-up failed! Please try again.");
    } finally {
      setLoading(false); // ✅ Stop loading after completion
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
      <div className="flex justify-end">
    <button
      onClick={() => setShowSignUpForm(false)}
      className="text-2xl text-black font-bold"
    >
      &times;
    </button>
  </div>
        <h3 className="text-xl font-semibold text-center mb-4">Sign Up</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">User Name</label>
            <input
              ref={userNameRef}
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block font-medium">Email</label>
            <input
              ref={emailRef}
              type="email"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block font-medium">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium">Confirm Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Confirm password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* ✅ Role Selection */}
          <div>
            <label className="block font-medium">Role</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>

          {/* <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Sign Up
          </button> */}
          <button 
  type="submit" 
  className={`w-full text-white py-2 rounded-md ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`} 
  disabled={loading}
>
  {loading ? "Signing Up..." : "Sign Up"}
</button>



          <p className="text-center">
            Already have an account?{" "}
            <button className="text-blue-600 hover:underline" onClick={()=>{
              setShowSignUpForm(false);
              setShowLoginForm(true);
            }}>
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;

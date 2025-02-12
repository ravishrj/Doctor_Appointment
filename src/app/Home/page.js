"use client"
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { MenuButton } from '@headlessui/react';
import LoginForm from '../_components/sign-in/page';
import SignUp from '../_components/sign-up/page';
import { signOut } from "firebase/auth";
import { auth } from '../_components/firebase/config';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { fireStore } from '../_components/firebase/config';

import Book_appointment from '../_components/Book_appointment/page';
import Link from 'next/link';

const HomePage = () => {
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [showBookAppointment, setShowBookAppointment] = useState(false);
  const [doctors] = useState([
    { id: 1, name: 'Dr. Smith', specialization: 'Cardiologist', experience: '10 years', location: 'New York', email: 'smith123@gmail.com' },
    { id: 2, name: 'Dr. Adams', specialization: 'Dentist', experience: '8 years', location: 'Los Angeles', email: 'adams123@gmail.com' },
    { id: 3, name: 'Dr. Johnson', specialization: 'Neurologist', experience: '12 years', location: 'Chicago', email: 'johnson123@gmail.com' },
  ]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [currentUser, setCurrentUser] = useState(null);

  const formatDate = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    const userL = JSON.parse(localStorage.getItem("current-user"));
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, update the state and local storage
        const userData = {
          uid: user.uid,
          displayName: user.displayName || "User",
          email: user.email,
          role: user.role,
        };
        console.log("userData", userData);
        setCurrentUser(userData);
        if (userData.role == 'Doctor') {

          setIsDoctorLoggedIn(true);
        }
        else
          setIsUserLoggedIn(true);

        localStorage.setItem("current-user", JSON.stringify(userData));
      } else {
        // User is signed out

        setCurrentUser(null);

        localStorage.removeItem("current-user");
      }
    });
    console.log("currentUser", currentUser);
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const userL = JSON.parse(localStorage.getItem("current-user"));
    const userFullData = JSON.parse(localStorage.getItem("user-Data"));
    if (userL && userFullData) {
      const userData = {
        uid: userL.uid,
        displayName: userL.displayName || "User",
        email: userL.email,
        role: userFullData.role,
      };
      console.log("userData", userData);
      if (userData.role == 'Doctor') {

        setIsDoctorLoggedIn(true);
      }
      else
        setIsUserLoggedIn(true);
      setCurrentUser(userData);

    } else {
      setCurrentUser(null);
      setIsUserLoggedIn(false);
      setIsDoctorLoggedIn(false);
      localStorage.removeItem("current-user");
      localStorage.removeItem("user-Data");
    }

    console.log("currentUser", currentUser);
  }, []);

  const handleSignOut = () => {
    //router.push("/userLoginDashboard");
    signOut(auth)
      .then(() => {
        // Remove user session info from sessionStorage
        sessionStorage.removeItem("UserAuthentication");
        localStorage.removeItem("current-user");
        localStorage.removeItem("user-Data");


        // setLogin(false);
        // setAuthClose(false);
        // setUserData("");
        // setCurrentUser(""),

        //   setLoadedComponent("signin");
        setIsDoctorLoggedIn(false);
        setIsUserLoggedIn(false);
        setShowAppointments(false);
        setShowBookAppointment(false);
        toast.success("You have successfully signed out.");
      })
      .catch((error) => {
        // Show error message if sign-out fails
        console.error("Sign-out error: ", error);
        toast.error("An error occurred while signing out. Please try again.");
      });
  };
  const handleBookNow = () => {
    if (!isDoctorLoggedIn && !isUserLoggedIn) {
      toast.error("patient and doctor not Logged in");
      return;
    }
    setShowBookAppointment(true);
  }

  return (
    <div className="min-h-screen bg-cover bg-center p-5" style={{ backgroundImage: "url('/img/background.jpg')" }}>
      {/* Navigation Bar */}

      {/* <nav className=" text-white py-4 px-6 flex items-center justify-between rounded-lg shadow-md">
        <h1 className="text-xl font-bold">Doctor Booking</h1>




        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Bars3Icon className="w-6 h-6" />
        </button>


        {(isUserLoggedIn) && (
          <button className="hover:underline" onClick={() => setShowAppointments(true)}>
            Appointments
          </button>
        )}


        <Menu as="div" className="relative">
          <MenuButton className="hover:underline">
            {isDoctorLoggedIn || isUserLoggedIn   ? 'Logout' : 'Login'}
          </MenuButton>
          <Transition>
            <Menu.Items className="absolute right-0 mt-2 w-40 bg-white text-black shadow-md rounded-lg p-2">
              {!isDoctorLoggedIn && !isUserLoggedIn ? (
                <>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setShowLoginForm(true)}
                        className={`block w-full text-left px-4 py-2 ${active ? 'bg-gray-200' : ''}`}
                      >
                        User/Doctor Login
                      </button>
                    )}
                  </Menu.Item>
                </>
              ) : (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={`block w-full text-left px-4 py-2 ${active ? 'bg-gray-200' : ''}`}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              )}
            </Menu.Items>
          </Transition>
        </Menu>
      </nav>



      {showLoginForm && <LoginForm onClose={() => setShowLoginForm(false)} setShowSignUpForm={setShowSignUpForm} setIsUserLoggedIn={setIsUserLoggedIn} setIsDoctorLoggedIn={setIsDoctorLoggedIn} />}
      {showSignUpForm && <SignUp onClose={() => setShowLoginForm(false)} setShowSignUpForm={setShowSignUpForm} setShowLoginForm={setShowLoginForm} />}


      {isMobileMenuOpen && (
        <div className="md:hidden bg-white text-black shadow-md p-4 mt-2 rounded-lg">


          {!isDoctorLoggedIn && !isUserLoggedIn ? (
            <>

              <button onClick={() => setShowLoginForm(true)} className="block w-full text-left px-4 py-2">
                User/Doctor Login
              </button>
            </>
          ) : (
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2"
            >
              Logout
            </button>
          )}
        </div>
      )}



      {isMobileMenuOpen && (
        <div className="md:hidden bg-white text-black shadow-md p-4 mt-2 rounded-lg">
          <button onClick={() => setShowAppointments(!showAppointments)} className="block w-full text-left px-4 py-2">Appointments</button>
        </div>
      )}

 */}
<nav className="text-white py-4 px-6 flex items-center justify-between rounded-lg shadow-md">
  <Link href={"/"} className="text-xl font-bold">Doctor Booking</Link>

  {/* Mobile Menu Button */}
  <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
    <Bars3Icon className="w-6 h-6" />
  </button>

  {/* Appointments Button (Visible Only After Login) */}
  {isUserLoggedIn && (
    <button className="hidden md:block hover:underline" onClick={() => setShowAppointments(true)}>
      Appointments
    </button>
  )}

  {/* Desktop Login/Logout (Hidden in Mobile) */}
  <div className="hidden md:flex gap-4">
    {isDoctorLoggedIn || isUserLoggedIn ? (
      <button onClick={handleSignOut} className="mr-14 px-5 py-2 border border-gray-300 shadow-md rounded-lg text-gray-800 font-semibold hover:bg-gray-200 transition-all">
        Logout
      </button>
    ) : (
      <>
        <button 
  onClick={() => setShowLoginForm(true)} 
  className="px-5 py-2 border border-gray-800 shadow-md rounded-lg text-gray-800 font-semibold hover:bg-gray-200 hover:text-gray-900 transition-all"
>
  Login
</button>

<button 
  onClick={() => setShowSignUpForm(true)} 
  className="mr-14 px-5 py-2 border border-gray-800 shadow-md rounded-lg text-gray-900 font-semibold hover:bg-gray-200 transition-all"
>
  Sign Up
</button>

      </>
    )}
  </div>
</nav>

{/* Mobile Dropdown Menu */}
{isMobileMenuOpen && (
  <div className="md:hidden bg-white text-black shadow-md p-4 mt-2 rounded-lg">
    {/* User/Doctor Login (Only in Mobile Menu) */}
    {!isDoctorLoggedIn && !isUserLoggedIn ? (
      <>
        <button onClick={() => setShowLoginForm(true)} className="block w-full text-left px-4 py-2">
          User/Doctor Login
        </button>
        <button onClick={() => setShowSignUpForm(true)} className="block w-full text-left px-4 py-2">
          Sign Up
        </button>
      </>
    ) : (
      <button onClick={handleSignOut} className="block w-full text-left px-4 py-2">
        Logout
      </button>
    )}

    {/* Appointments (Only in Mobile Menu) */}
    {isUserLoggedIn && (
      <button onClick={() => setShowAppointments(!showAppointments)} className="block w-full text-left px-4 py-2">
        Appointments
      </button>
    )}
  </div>
)}

{/* Login & Signup Forms */}
{showLoginForm && (
  <LoginForm
    onClose={() => setShowLoginForm(false)}
    setShowSignUpForm={setShowSignUpForm}
    setIsUserLoggedIn={setIsUserLoggedIn}
    setIsDoctorLoggedIn={setIsDoctorLoggedIn}
  />
)}

{showSignUpForm && (
  <SignUp
    onClose={() => setShowSignUpForm(false)}
    setShowSignUpForm={setShowSignUpForm}
    setShowLoginForm={setShowLoginForm}
    setIsDoctorLoggedIn={setIsDoctorLoggedIn}
    setIsUserLoggedIn={setIsUserLoggedIn}
  />
)}



{!showBookAppointment &&  <div className="flex justify-center items-center p-4">
        <div className="text-center  p-6 rounded-2xl shadow-lg">
          <p className="text-lg md:text-xl font-bold text-gray-200">
            Patient can book an appointment or doctor can see their appointments by clicking below.
          </p>
          <button 
  onClick={handleBookNow} 
  className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-full shadow-md transition-all"
>
  {currentUser?.role === "Doctor" ? "Check My Bookings" : "Booking info"}
</button>

        </div>
      </div>}
     



      {showBookAppointment && <Book_appointment isDoctorLoggedIn={isDoctorLoggedIn} currentUser={currentUser} isUserLoggedIn={isUserLoggedIn} showAppointments={showAppointments} />}




    </div>
  );
}
export default HomePage;





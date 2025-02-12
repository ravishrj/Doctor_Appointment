
"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { fireStore } from "../firebase/config";
import DoctorAppointments from "../Doctor appointment/page";

const Book_appointment = ({ isDoctorLoggedIn, currentUser, isUserLoggedIn, showAppointments }) => {
  const [doctors] = useState([
    { id: 1, name: "Dr. Smith", specialization: "Cardiologist", experience: "10 years", location: "New York", email: "smith123@gmail.com" },
    { id: 2, name: "Dr. Adams", specialization: "Dentist", experience: "8 years", location: "Los Angeles", email: "adams123@gmail.com" },
    { id: 3, name: "Dr. Johnson", specialization: "Neurologist", experience: "12 years", location: "Chicago", email: "johnson123@gmail.com" },
  ]);
  
  const [searchQuery, setSearchQuery] = useState(""); // 🔹 Search query state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [appointments, setAppointments] = useState([]);

  // 🔹 Filter doctors dynamically based on search input
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookAppointment = async (doctor) => {
    if (!isUserLoggedIn) {
      alert("Please log in as a user to book an appointment.");
      return;
    }
    if (!selectedDate) {
      alert("Please select a date before booking an appointment.");
      return;
    }

    const newAppointment = {
      doctor: doctor.name,
      doctorId: doctor.id,
      doctorEmail: doctor.email,
      user: currentUser.displayName || "User",
      userId: currentUser.uid,
      date:selectedDate.toLocaleDateString("en-CA") // YYYY-MM-DD format
      ,
      time: selectedTime,
    };

    try {
      await addDoc(collection(fireStore, "appointments"), newAppointment);
      setAppointments([...appointments, newAppointment]);
      toast.success(`Appointment booked with ${doctor.name} on ${newAppointment.date} at ${newAppointment.time}`);
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Error booking appointment. Try again.");
    }
  };

  const fetchAppointmentsForUser = async () => {
    if (!currentUser || !isUserLoggedIn) return;

    const q = query(collection(fireStore, "appointments"), where("userId", "==", currentUser.uid));

    try {
      const querySnapshot = await getDocs(q);
      const fetchedAppointments = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments.");
    }
  };

  useEffect(() => {
    if (isUserLoggedIn) fetchAppointmentsForUser();
  }, [isUserLoggedIn, currentUser]);

  return (
    <>
      {!isDoctorLoggedIn ? (
        <>
          {/* 🔹 Search Bar */}
          <div className="w-full mb-4 flex justify-center">
            <input
              type="text"
              placeholder="Search by Name or Specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-2/3 px-3 py-2 border rounded-lg shadow-sm text-black focus:outline-none"
            />
          </div>

          {/* 🔹 Main Content */}
          <div className="mt-6 flex flex-col md:flex-row gap-6">
            
            {/* 🔹 Doctor List */}
            <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-2/3">
              <h2 className="text-xl font-semibold text-center md:text-left">Available Doctors</h2>

              {/* 🔹 Show "No Results Found" if search doesn't match */}
              {filteredDoctors.length === 0 ? (
                <p className="text-center text-gray-500 mt-4">No doctors found.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {filteredDoctors.map((doctor) => (
                    <li key={doctor.id} className="p-3 bg-gray-100 rounded-lg flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                      <div>
                        <span className="font-bold">{doctor.name}</span> - {doctor.specialization} ({doctor.experience}, {doctor.location})
                      </div>
                      <button 
                        onClick={() => handleBookAppointment(doctor)} 
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2 md:mt-0"
                      >
                        Book Now
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 🔹 Calendar View & Time Selection */}
            <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-1/3">
              <h2 className="text-xl mx-auto font-semibold text-center md:text-left">Select Date & Time</h2>
              <Calendar 
                onChange={setSelectedDate} 
                value={selectedDate} 
                className="mt-4 mx-auto p-2 border rounded-lg w-full"
              />
              <select 
                onChange={(e) => setSelectedTime(e.target.value)} 
                className="mt-3 w-full p-2 border rounded-lg"
              >
                {["10:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"].map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 🔹 Appointments Section */}
          {showAppointments && (
            <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-center md:text-left">Your Appointments</h2>
              <ul className="mt-4 space-y-2">
                {appointments.map((appointment, index) => (
                  <li 
                    key={appointment.id || index} 
                    className="p-3 bg-gray-100 rounded-lg text-center md:text-left"
                  >
                    <span className="font-bold">{appointment.date} at {appointment.time}</span> 
                    - Doctor: {appointment.doctor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <>
          <DoctorAppointments isDoctorLoggedIn={isDoctorLoggedIn} currentUser={currentUser} />
        </>
      )}
    </>
  );
};

export default Book_appointment;


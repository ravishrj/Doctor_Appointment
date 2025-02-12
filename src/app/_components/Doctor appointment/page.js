

// "use client";
// import { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import { fireStore } from "../firebase/config";

// const DoctorAppointments = ({ isDoctorLoggedIn, currentUser }) => {
//   const [patients, setPatients] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchPatientsForDoctor = async (doctorEmail) => {
//     setLoading(true); // Start loading

//     const q = query(collection(fireStore, "appointments"), where("doctorEmail", "==", doctorEmail));
//     try {
//       const querySnapshot = await getDocs(q);

//       // Fetching full patient details instead of just names
//       const fetchedPatients = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         name: doc.data().user,
//         email: doc.data().userEmail,
//         time: doc.data().time,
//         date: doc.data().date,
//       }));

//       setPatients(fetchedPatients);
//     } catch (error) {
//       console.error("Error fetching patients:", error);
//       toast.error("Failed to fetch patients.");
//     } finally {
//       setLoading(false); // Stop loading
//     }
//   };

//   useEffect(() => {
//     if (isDoctorLoggedIn && currentUser?.email) {
//       fetchPatientsForDoctor(currentUser.email);
//     }
//   }, [isDoctorLoggedIn, currentUser?.email]);

//   return (
//     <div className="min-h-screen p-5">
//       <h1 className="text-2xl font-bold text-blue-600 text-center mb-4">
//         Doctor's Appointments
//       </h1>

//       <div className="bg-white p-5 rounded-lg shadow-md">
//         {loading ? (
//           <div className="flex justify-center py-4">
//             <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-opacity-75"></div>
//           </div>
//         ) : patients.length === 0 ? (
//           <p className="text-gray-600 text-center">No Appointments Found.</p>
//         ) : (
//           <ul className="space-y-3">
//             {patients.map((patient) => (
//               <li key={patient.id} className="p-3 bg-gray-100 rounded-lg shadow">
//                 <p className="font-semibold text-gray-800">{patient.name}</p>
//                 <p className="text-gray-600">{patient.email}</p>
//                 <p className="text-gray-500">Date: {patient.date} | Time: {patient.time}</p>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DoctorAppointments;


"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { collection, query, where, getDocs } from "firebase/firestore";
import { fireStore } from "../firebase/config";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const DoctorAppointments = ({ isDoctorLoggedIn, currentUser }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  // Fetch appointments for the logged-in doctor
  const fetchAppointmentsForDoctor = async (doctorEmail) => {
    setLoading(true);
    const q = query(collection(fireStore, "appointments"), where("doctorEmail", "==", doctorEmail));
    try {
      const querySnapshot = await getDocs(q);
      const fetchedAppointments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().user,
        email: doc.data().userEmail,
        date: doc.data().date,
        time: doc.data().time,
      }));
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments when doctor logs in
  useEffect(() => {
    if (isDoctorLoggedIn && currentUser?.email) {
      fetchAppointmentsForDoctor(currentUser.email);
    }
  }, [isDoctorLoggedIn, currentUser?.email]);

  // Filter appointments when date is selected
  useEffect(() => {
    const formattedDate = selectedDate.toLocaleDateString("en-CA");
    setFilteredAppointments(appointments.filter((apt) => apt.date === formattedDate));
  }, [selectedDate, appointments]);

  return (
    <div className="min-h-screen p-5">
      <h1 className="text-2xl font-bold text-blue-600 text-center mb-4">
        Doctor's Appointments
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar View */}
        <div className="bg-white p-5 rounded-lg shadow-md lg:8/12  md:w-7/12 sm: w-11/12">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select a Date</h2>
          <Calendar onChange={setSelectedDate} value={selectedDate} className="border rounded-lg" />
        </div>

        {/* Appointments for Selected Date */}
        <div className="bg-white p-5 rounded-lg shadow-md w-8/12 sm: w-11/12">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Appointments for {selectedDate.toDateString()}
          </h2>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-opacity-75"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <p className="text-gray-600 text-center">No appointments for this day.</p>
          ) : (
            <ul className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <li key={appointment.id} className="p-3 bg-gray-100 rounded-lg shadow">
                  <p className="font-semibold text-gray-800">{appointment.name}</p>
                  <p className="text-gray-600">{appointment.email}</p>
                  <p className="text-gray-500">Time: {appointment.time}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;

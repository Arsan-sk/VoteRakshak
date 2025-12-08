// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [booth, setBooth] = useState(null);

  useEffect(() => {
    // ✅ Check login session
    const session = JSON.parse(localStorage.getItem("sessionUser"));
    if (!session) {
      navigate("/login"); // redirect if not logged in
      return;
    }

    // Load user details from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const storedUser = users[session.aadhar];
    if (!storedUser) {
      navigate("/login"); // no such user
      return;
    }

    setUser(storedUser);

    // Booth info saved when searching in FindBooth
    const boothInfo = JSON.parse(localStorage.getItem("booth_" + session.aadhar));
    setBooth(boothInfo || null);
  }, [navigate]);

  if (!user) return null; // while loading / redirecting

  return (
    <div className="flex flex-col items-center p-10 text-white bg-[#111714] min-h-screen">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="bg-[#1c2620] border border-[#3d5245] rounded-xl p-6 w-full max-w-2xl flex flex-col items-center">
        {/* Profile photo */}
        <div className="w-32 h-32 rounded-full bg-cover bg-center border-4 border-[#38e07b] mb-6"
          style={{
            backgroundImage: user.photo
              ? `url(${user.photo})`
              : `url("https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=38e07b&color=111714")`,
          }}
        ></div>

        {/* User details */}
        <h2 className="text-2xl font-bold mb-2">
          {user.firstName} {user.middleName} {user.lastName}
        </h2>
        <p className="text-[#9eb7a8] mb-4">Aadhaar: {user.aadhar}</p>

        <div className="grid grid-cols-2 gap-4 w-full text-sm text-[#cfe6d0]">
          <div className="bg-[#0f1612] p-3 rounded-md">
            <strong>First Name:</strong> {user.firstName}
          </div>
          <div className="bg-[#0f1612] p-3 rounded-md">
            <strong>Middle Name:</strong> {user.middleName || "—"}
          </div>
          <div className="bg-[#0f1612] p-3 rounded-md">
            <strong>Last Name:</strong> {user.lastName}
          </div>
          <div className="bg-[#0f1612] p-3 rounded-md">
            <strong>Age:</strong> {user.age}
          </div>
        </div>

        {/* Booth Info */}
        {booth ? (
          <div className="mt-6 w-full text-left">
            <h3 className="text-xl font-bold mb-2">Polling Booth Details</h3>
            <p className="mb-3">{booth.address}</p>
            <iframe
              src={booth.map}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Polling Booth Map"
              className="rounded-md"
            ></iframe>
          </div>
        ) : (
          <p className="mt-6 text-red-400">
            Booth details not assigned. Please check <b>Find Booth</b> page.
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;

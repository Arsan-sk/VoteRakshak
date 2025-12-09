import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    aadhar: "",
  });
  const [fingerprint, setFingerprint] = useState("");
  const [fpImage, setFpImage] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const [aadhar, setAadhar] = useState("");
  const [imageBase64, setImageBase64] = useState("");

  // =================== SecuGen API ===================
  function callSGIFPGetData(successCall, failCall) {
    const uri = "https://localhost:8000/SGIFPCapture";
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        const fpobject = JSON.parse(xmlhttp.responseText);
        successCall(fpobject);
      } else if (xmlhttp.status === 404) {
        failCall(xmlhttp.status);
      }
    };
    xmlhttp.onerror = function () {
      failCall(xmlhttp.status);
    };
    xmlhttp.open("POST", uri, true);
    xmlhttp.send();
  }

  function captureFingerprint() {
    callSGIFPGetData(
      (result) => {
        if (result.ErrorCode === 0) {
          if (result.BMPBase64?.length > 0) {
            setFpImage("data:image/bmp;base64," + result.BMPBase64);
          }
          setFingerprint(result.TemplateBase64);
          setStatus("✅ Fingerprint captured successfully");
        } else {
          setStatus("❌ Error capturing fingerprint: " + result.ErrorCode);
        }
      },
      () => setStatus("❌ Check if SGIBioSrv is running on port 8000")
    );
  }

  // =================== Register ===================
  function registerUser() {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.age ||
      !form.aadhar ||
      !fingerprint
    ) {
      setStatus("❌ Please fill all fields and capture fingerprint.");
      return;
    }

    const userData = { ...form, fingerprint };
    localStorage.setItem("registeredUser", JSON.stringify(userData));
    setStatus("✅ User registered successfully");
    navigate("/login");
  }

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-[#111714] text-white">

        <div className="bg-[#1a201d] p-8 rounded-xl shadow-lg w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="p-2 rounded bg-[#222b25] border border-[#29382f] text-white"
            />
            <input
              type="text"
              placeholder="Middle Name"
              value={form.middleName}
              onChange={(e) => setForm({ ...form, middleName: e.target.value })}
              className="p-2 rounded bg-[#222b25] border border-[#29382f] text-white"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="p-2 rounded bg-[#222b25] border border-[#29382f] text-white"
            />
            <input
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="p-2 rounded bg-[#222b25] border border-[#29382f] text-white"
            />
            <input
              type="text"
              placeholder="Aadhar Number"
              value={form.aadhar}
              onChange={(e) => setForm({ ...form, aadhar: e.target.value })}
              className="p-2 rounded bg-[#222b25] border border-[#29382f] text-white"
            />
          </div>

          {/* Fingerprint Section */}
          <div className="mt-6 text-center">
            <button
              onClick={captureFingerprint}
              className="bg-[#38e07b] text-black px-4 py-2 rounded-full font-bold hover:bg-[#2dbb64]"
            >
              Capture Fingerprint
            </button>
            {fpImage && (
              <img
                src={fpImage}
                alt="Fingerprint"
                className="mt-4 mx-auto border border-gray-600 rounded"
                width={120}
                height={160}
              />
            )}
          </div>

          {/* Status */}
          {status && (
            <div className="mt-4 p-2 text-center text-sm bg-[#222b25] rounded">
              {status}
            </div>
          )}

          {/* Submit */}
          <div className="mt-6 text-center">
            <button
              onClick={registerUser}
              className="bg-[#38e07b] text-black px-6 py-2 rounded-full font-bold hover:bg-[#2dbb64]"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
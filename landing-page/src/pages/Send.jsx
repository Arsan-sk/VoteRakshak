// AppA.jsx
import React, { useState } from "react";
import axios from "axios";

export default function Send() {
  const [aadhar, setAadhar] = useState("");
  const [imageBase64, setImageBase64] = useState("");

  // Convert uploaded image to base64
  const convertToBase64 = (file) => {
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const sendData = async () => {
    await axios.post("http://localhost:5000/api/send-user-data", {
      aadhar_number: aadhar,
      base64_image: imageBase64
    });
    alert("Sent to server!");
  };

  return (
    <div>
      <h2>React App A - Send user data</h2>

      <input
        type="text"
        placeholder="Enter Aadhar Number"
        value={aadhar}
        onChange={(e) => setAadhar(e.target.value)}
      />

      <input
        type="file"
        onChange={(e) => convertToBase64(e.target.files[0])}
      />

      <button onClick={sendData}>Send to Server</button>
    </div>
  );
}

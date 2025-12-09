// // src/pages/FindBooth.jsx
// import React, { useState } from "react";

// const boothAddresses = [
//   {
//     address: "Community Hall, Sector 12, Mumbai, Maharashtra",
//     map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.116101382!2d72.74110155786015!3d19.082197839329365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63f7a8e8bcd%3A0x74b9f8c8e4e9b3d1!2sMumbai!5e0!3m2!1sen!2sin!4v1705339296922"
//   },
//   {
//     address: "Govt. School, Sector 5, New Delhi",
//     map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.23357387265!2d77.0688975607997!3d28.527280344208827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3a0b743f4db%3A0xc0b8f1d2d7c8d913!2sNew%20Delhi!5e0!3m2!1sen!2sin!4v1705339352045"
//   },
//   {
//     address: "Town Hall, MG Road, Bengaluru, Karnataka",
//     map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.937563559688!2d77.58585717515917!3d12.97159871462264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b8c56b%3A0x8079b0437f6f6b8d!2sBangalore!5e0!3m2!1sen!2sin!4v1705339398446"
//   }
// ];

// const FindBooth = () => {
//   const [aadhar, setAadhar] = useState("");
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState("");

//   const handleSearch = () => {
//     setError("");
//     setResult(null);

//     const users = JSON.parse(localStorage.getItem("users") || "{}");
//     const found = Object.values(users).find((user) => user.aadhar === aadhar);

//     if (found) {
//       const booth = boothAddresses[Math.floor(Math.random() * boothAddresses.length)];
//       setResult(booth);
//     } else {
//       setError("❌ Aadhar number not found. Please register first.");
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center p-10 text-white bg-[#111714] min-h-screen">
//       <h1 className="text-3xl font-bold mb-6">Find Your Polling Booth</h1>
//       <div className="bg-[#1c2620] border border-[#3d5245] rounded-xl p-6 w-full max-w-md">
//         <label className="block mb-2">Enter Aadhar Number</label>
//         <input
//           type="text"
//           value={aadhar}
//           onChange={(e) => setAadhar(e.target.value)}
//           className="w-full p-2 mb-4 rounded-md text-black"
//           placeholder="Enter your Aadhar Number"
//         />
//         <button
//           onClick={handleSearch}
//           className="w-full py-2 bg-[#38e07b] text-[#111714] rounded-md font-bold"
//         >
//           Find Booth
//         </button>
//       </div>

//       {error && <p className="mt-4 text-red-400">{error}</p>}

//       {result && (
//         <div className="mt-6 bg-[#1c2620] border border-[#3d5245] rounded-xl p-6 w-full max-w-2xl">
//           <h2 className="text-xl font-bold mb-2">Your Booth</h2>
//           <p className="mb-4">{result.address}</p>
//           <iframe
//             src={result.map}
//             width="100%"
//             height="300"
//             style={{ border: 0 }}
//             allowFullScreen=""
//             loading="lazy"
//             referrerPolicy="no-referrer-when-downgrade"
//             title="Polling Booth Map"
//           ></iframe>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FindBooth;



// src/pages/FindBooth.jsx
import React, { useState } from "react";

const boothAddresses = [
  {
    address: "Community Hall, Sector 12, Mumbai, Maharashtra",
    map:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.116101382!2d72.74110155786015!3d19.082197839329365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63f7a8e8bcd%3A0x74b9f8c8e4e9b3d1!2sMumbai!5e0!3m2!1sen!2sin!4v1705339296922",
  },
  {
    address: "Govt. School, Sector 5, New Delhi",
    map:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.23357387265!2d77.0688975607997!3d28.527280344208827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3a0b743f4db%3A0xc0b8f1d2d7c8d913!2sNew%20Delhi!5e0!3m2!1sen!2sin!4v1705339352045",
  },
  {
    address: "Town Hall, MG Road, Bengaluru, Karnataka",
    map:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.937563559688!2d77.58585717515917!3d12.97159871462264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b8c56b%3A0x8079b0437f6f6b8d!2sBangalore!5e0!3m2!1sen!2sin!4v1705339398446",
  },
];

function normalizeAadhaar(value) {
  if (!value && value !== 0) return "";
  return value.toString().replace(/\D/g, ""); // keep only digits
}

const FindBooth = () => {
  const [aadhar, setAadhar] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);

  const tryParse = (raw) => {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  };

  const findInObject = (obj, normalizedAadhaar) => {
    if (!obj) return null;
    // If object is an array
    if (Array.isArray(obj)) {
      return obj.find((u) => normalizeAadhaar(u?.aadhar) === normalizedAadhaar);
    }
    // If it's a single user record with an 'aadhar' field
    if (obj && typeof obj === "object" && obj.aadhar) {
      return normalizeAadhaar(obj.aadhar) === normalizedAadhaar ? obj : null;
    }
    // If it's a mapping (username -> user record)
    const values = Object.values(obj);
    return values.find((u) => normalizeAadhaar(u?.aadhar) === normalizedAadhaar);
  };

  const handleSearch = () => {
    setError("");
    setResult(null);
    setDebugInfo(null);

    const normalized = normalizeAadhaar(aadhar);
    if (!normalized || normalized.length < 4) {
      setError("Please enter a valid Aadhaar number (at least a few digits).");
      return;
    }

    // 1) Try common keys
    const commonKeys = ["users", "registeredUser", "user", "usersList"];
    for (const key of commonKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = tryParse(raw);
      const found = findInObject(parsed, normalized);
      if (found) {
        const booth = boothAddresses[Math.floor(Math.random() * boothAddresses.length)];
        setResult({ booth, sourceKey: key, user: found });
        return;
      }
    }

    // 2) Try scanning ALL localStorage JSON values (fallback)
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      const parsed = tryParse(raw);
      if (!parsed) continue;
      const found = findInObject(parsed, normalized);
      if (found) {
        const booth = boothAddresses[Math.floor(Math.random() * boothAddresses.length)];
        setResult({ booth, sourceKey: key, user: found });
        return;
      }
    }

    // Not found -> show helpful debug info
    setError("Aadhaar number not found. Please register first.");
    setDebugInfo({
      normalized,
      scannedLocalStorageKeys: keys,
      tip:
        "If you recently registered, ensure the Register component stored the record under 'users' or 'registeredUser'. " +
        "Also ensure Aadhaar saved without spaces or special characters.",
    });
  };

  return (
    <div className="flex flex-col items-center justify-start p-10 text-white bg-[#111714] min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Find Your Polling Booth</h1>

      <div className="bg-[#1c2620] border border-[#3d5245] rounded-xl p-6 w-full max-w-md">
        <label className="block mb-2 text-sm text-[#cfe6d0]">Enter Aadhaar Number</label>
        <input
          type="text"
          value={aadhar}
          onChange={(e) => setAadhar(e.target.value)}
          className="w-full p-2 mb-4 rounded-md text-black"
          placeholder="e.g. 1234 5678 9012"
        />
        <button
          onClick={handleSearch}
          className="w-full py-2 bg-[#38e07b] text-[#111714] rounded-md font-bold"
        >
          Find Booth
        </button>
      </div>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {result && (
        <div className="mt-6 bg-[#1c2620] border border-[#3d5245] rounded-xl p-6 w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-2">Polling Booth Found</h2>
          <p className="mb-2 text-sm text-[#cfe6d0]">
            (Matched from <b>{result.sourceKey}</b> in localStorage)
          </p>
          <p className="mb-4">{result.booth.address}</p>
          <div className="mb-4">
            <iframe
              src={result.booth.map}
              width="100%"
              height="320"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Polling Booth Map"
            ></iframe>
          </div>
          <div className="text-sm text-[#9eb7a8]">
            <div><strong>Registered name:</strong> {result.user.firstName ?? result.user.username ?? "—"}</div>
            <div><strong>Stored Aadhaar:</strong> {result.user.aadhar}</div>
          </div>
        </div>
      )}

      {debugInfo && (
        <details className="mt-6 bg-[#0f1612] border border-[#2b3a2f] p-4 rounded text-sm text-[#a9c8b4] max-w-2xl">
          <summary className="cursor-pointer font-medium">Debug info (click to expand)</summary>
          <pre className="whitespace-pre-wrap mt-2 text-xs">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default FindBooth;

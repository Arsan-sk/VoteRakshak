import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [aadhar, setAadhar] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [fpImage, setFpImage] = useState("");
  const [status, setStatus] = useState("");


  const navigate = useNavigate();

  // ================= SecuGen API =================
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

  function matchScore(template1, template2, succFunction, failFunction) {
    if (!template1 || !template2) {
      alert("Please capture fingerprint first!");
      return;
    }
    const uri = "https://localhost:8000/SGIMatchScore";
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        const fpobject = JSON.parse(xmlhttp.responseText);
        succFunction(fpobject);
      } else if (xmlhttp.status === 404) {
        failFunction(xmlhttp.status);
      }
    };
    xmlhttp.onerror = function () {
      failFunction(xmlhttp.status);
    };
    const params =
      "template1=" +
      encodeURIComponent(template1) +
      "&template2=" +
      encodeURIComponent(template2) +
      "&templateFormat=ISO";
    xmlhttp.open("POST", uri, false);
    xmlhttp.send(params);
  }

  // ================= Login =================
  function loginUser() {
    const stored = JSON.parse(localStorage.getItem("registeredUser"));
    if (!stored) {
      setStatus("❌ No registered user found.");
      return;
    }
    if (stored.aadhar !== aadhar) {
      setStatus("❌ Invalid Aadhar number.");
      return;
    }
    if (!fingerprint) {
      setStatus("❌ Capture fingerprint before logging in.");
      return;
    }

    // Compare captured fingerprint with stored one
    matchScore(
      stored.fingerprint,
      fingerprint,
      (result) => {
        if (result.ErrorCode === 0 && result.MatchingScore >= 60) {
          setStatus("✅ Login successful! You can Proceed to vote...");
          setTimeout(() => {
            const sendData = async () => {
              await axios.post("http://localhost:5000/api/send-user-data", {
                aadhar_number: aadhar,
                base64_image: fpImage
              });
              alert("Sent to server!");
            };
            sendData();
          }, 1000);
        } else {
          setStatus("❌ Fingerprint mismatch. Score: " + result.MatchingScore);
        }
      },
      () => setStatus("❌ Fingerprint match failed (service error).")
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#111714] text-white">
      <div className="bg-[#1a201d] p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {/* Aadhar Input */}
        <input
          type="text"
          placeholder="Aadhar Number"
          value={aadhar}
          onChange={(e) => setAadhar(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-[#222b25] border border-[#29382f] text-white"
        />

        {/* Fingerprint */}
        <div className="text-center">
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

        {/* Login button */}
        <div className="mt-6 text-center">
          <button
            onClick={loginUser}
            className="bg-[#38e07b] text-black px-6 py-2 rounded-full font-bold hover:bg-[#2dbb64]"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;


// // src/pages/Login.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const [aadhar, setAadhar] = useState("");
//   const [status, setStatus] = useState("");
//   const navigate = useNavigate();

//   // ===== SecuGen fingerprint helpers =====
//   let template_1 = "";
//   let template_2 = "";

//   function ErrorFunc(status) {
//     alert("Check if SGIBioSrv is running.");
//   }

//   function CallSGIFPGetData(successCall, failCall) {
//     const uri = "https://localhost:8000/SGIFPCapture";
//     const xmlhttp = new XMLHttpRequest();
//     xmlhttp.onreadystatechange = function () {
//       if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
//         const fpobject = JSON.parse(xmlhttp.responseText);
//         successCall(fpobject);
//       } else if (xmlhttp.status === 404) {
//         failCall(xmlhttp.status);
//       }
//     };
//     xmlhttp.onerror = function () {
//       failCall(xmlhttp.status);
//     };
//     xmlhttp.open("POST", uri, true);
//     xmlhttp.send();
//   }

//   function captureFP2() {
//     CallSGIFPGetData(SuccessFunc2, ErrorFunc);
//   }

//   function SuccessFunc2(result) {
//     if (result.ErrorCode === 0) {
//       if (result?.BMPBase64?.length > 0) {
//         document.getElementById("login-fp-img").src =
//           "data:image/bmp;base64," + result.BMPBase64;
//       }
//       template_2 = result.TemplateBase64;
//       setStatus("Fingerprint captured successfully");
//     } else {
//       alert("Fingerprint Capture ErrorCode " + result.ErrorCode);
//     }
//   }

//   function matchScore(templateStored, succFunction, failFunction) {
//     if (!templateStored || !template_2) {
//       alert("Please capture fingerprint first.");
//       return;
//     }
//     template_1 = templateStored;
//     const uri = "https://localhost:8000/SGIMatchScore";
//     const xmlhttp = new XMLHttpRequest();
//     xmlhttp.onreadystatechange = function () {
//       if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
//         const fpobject = JSON.parse(xmlhttp.responseText);
//         succFunction(fpobject);
//       } else if (xmlhttp.status === 404) {
//         failFunction(xmlhttp.status);
//       }
//     };
//     xmlhttp.onerror = function () {
//       failFunction(xmlhttp.status);
//     };
//     const params =
//       "template1=" +
//       encodeURIComponent(template_1) +
//       "&template2=" +
//       encodeURIComponent(template_2) +
//       "&templateFormat=ISO";
//     xmlhttp.open("POST", uri, false);
//     xmlhttp.send(params);
//   }

//   // ===== Login flow =====
//   const handleLogin = () => {
//     if (!aadhar) {
//       setStatus("Please enter Aadhaar number.");
//       return;
//     }

//     const normalizedAadhar = aadhar.replace(/\D/g, "");
//     const users = JSON.parse(localStorage.getItem("users") || "{}");
//     const user = users[normalizedAadhar];

//     if (!user) {
//       setStatus("❌ User not found. Please register first.");
//       return;
//     }

//     if (!template_2) {
//       setStatus("Please capture fingerprint before login.");
//       return;
//     }

//     // Compare fingerprints
//     matchScore(
//       user.template,
//       (res) => {
//         if (res.ErrorCode === 0 && res.MatchingScore >= 60) {
//           // ✅ Save session
//           localStorage.setItem(
//             "sessionUser",
//             JSON.stringify({ aadhar: normalizedAadhar })
//           );
//           setStatus(`✅ Login successful (score ${res.MatchingScore})`);
//           navigate("/profile");
//         } else {
//           setStatus(
//             `❌ Fingerprint mismatch (score ${res.MatchingScore})`
//           );
//         }
//       },
//       () => {
//         setStatus("Fingerprint match failed (service error).");
//       }
//     );
//   };

//   return (
//     <div className="flex flex-col items-center justify-center p-10 text-white bg-[#111714] min-h-screen">
//       <h1 className="text-3xl font-bold mb-6">Login</h1>
//       <div className="bg-[#1c2620] border border-[#3d5245] rounded-xl p-6 w-full max-w-md">
//         <label className="block mb-2">Aadhaar Number</label>
//         <input
//           type="text"
//           value={aadhar}
//           onChange={(e) => setAadhar(e.target.value)}
//           className="w-full p-2 mb-4 rounded-md text-black"
//           placeholder="Enter your Aadhaar Number"
//         />

//         <div className="flex flex-col items-center mb-4">
//           <img
//             id="login-fp-img"
//             alt="Fingerprint"
//             className="w-32 h-40 border-2 border-gray-700 mb-2"
//           />
//           <button
//             onClick={captureFP2}
//             className="py-2 px-4 bg-[#38e07b] text-[#111714] rounded-md font-bold"
//           >
//             Capture Fingerprint
//           </button>
//         </div>

//         <button
//           onClick={handleLogin}
//           className="w-full py-2 bg-[#38e07b] text-[#111714] rounded-md font-bold"
//         >
//           Login
//         </button>

//         {status && (
//           <p className="mt-4 text-center text-sm text-[#cfe6d0]">{status}</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Login;

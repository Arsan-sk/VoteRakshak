// import React, { useState, useEffect } from 'react';
// import { AlertCircle, Vote, Shield, CheckCircle, Loader, BarChart3 } from 'lucide-react';

// const TestVote = () => {
//   const [formData, setFormData] = useState({
//     userId: '',
//     party: '',
//     biometricHash: ''
//   });
//   const [status, setStatus] = useState('ready');
//   const [message, setMessage] = useState('');
//   const [transactionHash, setTransactionHash] = useState('');
//   const [votingStatus, setVotingStatus] = useState(null);
//   const [results, setResults] = useState({ parties: [], votes: [] });
//   const [contract, setContract] = useState(null);

//   // Contract Configuration - Replace these with your deployed contract details
//   const CONTRACT_ADDRESS = "0x0169702144FD18aEE87675515DED3978E720e30C"; // Replace with your contract address
//   const CONTRACT_ABI = [
//     "function castVote(string memory _userId, string memory _party, string memory _biometricHash) external returns (bool)",
//     "function getVote(string memory _userId) external view returns (string memory, string memory, string memory, uint256)",
//     "function getPartyVoteCount(string memory _party) external view returns (uint256)",
//     "function getAllParties() external view returns (string[] memory)",
//     "function getTotalVotes() external view returns (uint256)",
//     "function getVotingStatus() external view returns (bool, uint256, uint256, uint256)",
//     "function getResults() external view returns (string[] memory, uint256[] memory)",
//     "function hasVoted(string memory) external view returns (bool)",
//     "function owner() external view returns (address)",
//     "function votingActive() external view returns (bool)"
//   ];

//   // RPC Configuration
//   const RPC_URL = "http://127.0.0.1:8545"; // Replace with your RPC URL
//   const PRIVATE_KEY = "14593352dfc287735660d85b1ee8cbbe3c18972cd89dd8b455504185ea4ac27f"; // In production, this should be on your backend

//   useEffect(() => {
//     initializeContract();
//     fetchVotingStatus();
//     fetchResults();
//   }, []);

//   const initializeContract = async () => {
//     try {
//       // Check if ethers is available
//       if (typeof window.ethers === 'undefined') {
//         console.log('Loading ethers.js...');
//         // Dynamically load ethers.js
//         const script = document.createElement('script');
//         script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js';
//         script.onload = () => initializeContract();
//         document.head.appendChild(script);
//         return;
//       }

//       const { ethers } = window;
      
//       // Create provider and wallet
//       const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
//       const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
      
//       // Create contract instance
//       const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
//       setContract(contractInstance);
      
//       console.log('✅ Contract initialized successfully');
//     } catch (error) {
//       console.error('❌ Failed to initialize contract:', error);
//       setStatus('error');
//       setMessage('Failed to connect to blockchain');
//     }
//   };

//   const fetchVotingStatus = async () => {
//     if (!contract) return;
    
//     try {
//       const [active, startTime, endTime, totalVotes] = await contract.getVotingStatus();
//       setVotingStatus({
//         active,
//         startTime: startTime.toNumber(),
//         endTime: endTime.toNumber(),
//         totalVotes: totalVotes.toNumber()
//       });
//     } catch (error) {
//       console.error('Failed to fetch voting status:', error);
//     }
//   };

//   const fetchResults = async () => {
//     if (!contract) return;
    
//     try {
//       const [parties, votes] = await contract.getResults();
//       setResults({
//         parties,
//         votes: votes.map(v => v.toNumber())
//       });
//     } catch (error) {
//       console.error('Failed to fetch results:', error);
//     }
//   };

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const generateBiometricHash = () => {
//     const timestamp = Date.now();
//     const randomStr = Math.random().toString(36).substring(7);
//     return `bio_${timestamp}_${randomStr}`;
//   };

//   const checkIfVoted = async (userId) => {
//     if (!contract) return false;
    
//     try {
//       return await contract.hasVoted(userId);
//     } catch (error) {
//       console.error('Error checking vote status:', error);
//       return false;
//     }
//   };

//   const handleSubmitVote = async (e) => {
//     e.preventDefault();
    
//     if (!contract) {
//       setStatus('error');
//       setMessage('Contract not initialized. Please refresh the page.');
//       return;
//     }

//     if (!formData.userId || !formData.party) {
//       setStatus('error');
//       setMessage('Please fill in all required fields');
//       return;
//     }

//     setStatus('processing');
//     setMessage('Checking voting eligibility...');
    
//     try {
//       // Check if user has already voted
//       const hasVotedAlready = await checkIfVoted(formData.userId);
//       if (hasVotedAlready) {
//         setStatus('error');
//         setMessage('This user ID has already voted!');
//         return;
//       }

//       setMessage('Processing vote and saving to blockchain...');
      
//       // Generate biometric hash if not provided
//       const biometricHash = formData.biometricHash || generateBiometricHash();
      
//       // Submit vote to blockchain
//       const transaction = await contract.castVote(
//         formData.userId,
//         formData.party,
//         biometricHash
//       );
      
//       setMessage('Transaction submitted! Waiting for confirmation...');
      
//       // Wait for transaction confirmation
//       const receipt = await transaction.wait();
      
//       if (receipt.status === 1) {
//         setStatus('success');
//         setMessage('Vote successfully recorded on blockchain!');
//         setTransactionHash(receipt.transactionHash);
        
//         // Refresh data
//         await fetchVotingStatus();
//         await fetchResults();
        
//         // Clear form after successful submission
//         setTimeout(() => {
//           setFormData({ userId: '', party: '', biometricHash: '' });
//           setStatus('ready');
//           setMessage('');
//           setTransactionHash('');
//         }, 5000);
//       } else {
//         throw new Error('Transaction failed');
//       }
//     } catch (error) {
//       setStatus('error');
//       setMessage(`Failed to record vote: ${error.message}`);
//       console.error('Voting error:', error);
//     }
//   };

//   const parties = [
//     'Democratic Party',
//     'Republican Party',
//     'Green Party',
//     'Libertarian Party',
//     'Independent'
//   ];

//   const formatTime = (timestamp) => {
//     if (!timestamp) return 'N/A';
//     return new Date(timestamp * 1000).toLocaleString();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       {/* Load ethers.js */}
//       <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js"></script>
      
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
//           <div className="text-center mb-8">
//             <div className="flex justify-center mb-4">
//               <div className="bg-indigo-100 p-3 rounded-full">
//                 <Vote className="h-8 w-8 text-indigo-600" />
//               </div>
//             </div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">
//               Biometric Voting System
//             </h1>
//             <p className="text-gray-600">
//               Secure blockchain-based voting with biometric authentication
//             </p>
//           </div>

//           {/* Voting Status */}
//           {votingStatus && (
//             <div className={`border rounded-lg p-4 mb-6 ${
//               votingStatus.active ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
//             }`}>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className={`font-medium ${
//                     votingStatus.active ? 'text-green-800' : 'text-red-800'
//                   }`}>
//                     Voting Status: {votingStatus.active ? 'ACTIVE' : 'INACTIVE'}
//                   </h3>
//                   <p className="text-sm text-gray-600 mt-1">
//                     Total Votes Cast: {votingStatus.totalVotes}
//                   </p>
//                 </div>
//                 <div className="text-right text-sm text-gray-600">
//                   <p>Start: {formatTime(votingStatus.startTime)}</p>
//                   <p>End: {formatTime(votingStatus.endTime)}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Security Badge */}
//           <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
//             <div className="flex items-center">
//               <Shield className="h-5 w-5 text-green-600 mr-2" />
//               <span className="text-green-800 font-medium">
//                 Blockchain Secured | Contract: {CONTRACT_ADDRESS.slice(0, 10)}...
//               </span>
//             </div>
//           </div>

//           {/* Voting Form */}
//           <div className="space-y-6">
//             <div>
//               <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
//                 Voter ID *
//               </label>
//               <input
//                 type="text"
//                 id="userId"
//                 name="userId"
//                 value={formData.userId}
//                 onChange={handleInputChange}
//                 placeholder="Enter your unique voter ID"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                 disabled={status === 'processing' || !votingStatus?.active}
//               />
//             </div>

//             <div>
//               <label htmlFor="party" className="block text-sm font-medium text-gray-700 mb-2">
//                 Select Party *
//               </label>
//               <select
//                 id="party"
//                 name="party"
//                 value={formData.party}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                 disabled={status === 'processing' || !votingStatus?.active}
//               >
//                 <option value="">Choose a party...</option>
//                 {parties.map((party, index) => (
//                   <option key={index} value={party}>
//                     {party}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label htmlFor="biometricHash" className="block text-sm font-medium text-gray-700 mb-2">
//                 Biometric Hash (Auto-generated if empty)
//               </label>
//               <input
//                 type="text"
//                 id="biometricHash"
//                 name="biometricHash"
//                 value={formData.biometricHash}
//                 onChange={handleInputChange}
//                 placeholder="Biometric hash will be auto-generated"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
//                 disabled={status === 'processing'}
//               />
//             </div>

//             <button
//               onClick={handleSubmitVote}
//               disabled={status === 'processing' || !votingStatus?.active || !contract}
//               className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//             >
//               {status === 'processing' ? (
//                 <>
//                   <Loader className="animate-spin h-5 w-5 mr-2" />
//                   Recording Vote...
//                 </>
//               ) : (
//                 <>
//                   <Vote className="h-5 w-5 mr-2" />
//                   Cast Vote
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Status Messages */}
//           {message && (
//             <div className={`mt-6 p-4 rounded-md ${
//               status === 'success' ? 'bg-green-50 border border-green-200' :
//               status === 'error' ? 'bg-red-50 border border-red-200' :
//               'bg-blue-50 border border-blue-200'
//             }`}>
//               <div className="flex items-center">
//                 {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mr-2" />}
//                 {status === 'error' && <AlertCircle className="h-5 w-5 text-red-600 mr-2" />}
//                 {status === 'processing' && <Loader className="animate-spin h-5 w-5 text-blue-600 mr-2" />}
//                 <span className={`font-medium ${
//                   status === 'success' ? 'text-green-800' :
//                   status === 'error' ? 'text-red-800' :
//                   'text-blue-800'
//                 }`}>
//                   {message}
//                 </span>
//               </div>
              
//               {transactionHash && (
//                 <div className="mt-2 text-sm text-green-700">
//                   <strong>Transaction Hash:</strong>
//                   <code className="ml-1 bg-green-100 px-1 rounded break-all">{transactionHash}</code>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Results Section */}
//         {results.parties.length > 0 && (
//           <div className="bg-white rounded-lg shadow-xl p-8">
//             <div className="flex items-center mb-6">
//               <BarChart3 className="h-6 w-6 text-indigo-600 mr-2" />
//               <h2 className="text-2xl font-bold text-gray-800">Live Results</h2>
//             </div>
            
//             <div className="space-y-4">
//               {results.parties.map((party, index) => (
//                 <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                   <span className="font-medium text-gray-800">{party}</span>
//                   <div className="flex items-center">
//                     <div className="w-32 bg-gray-200 rounded-full h-4 mr-4">
//                       <div 
//                         className="bg-indigo-600 h-4 rounded-full" 
//                         style={{ 
//                           width: votingStatus?.totalVotes ? 
//                             `${(results.votes[index] / votingStatus.totalVotes) * 100}%` : 
//                             '0%' 
//                         }}
//                       ></div>
//                     </div>
//                     <span className="font-bold text-indigo-600 min-w-12">
//                       {results.votes[index]} votes
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div className="text-center mt-6 text-sm text-gray-500">
//           <p>🔒 Powered by Blockchain Technology | 🔐 Biometrically Secured</p>
//           <p className="mt-1">Contract Address: {CONTRACT_ADDRESS}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TestVote;




import React, { useState, useEffect } from 'react';
import { AlertCircle, Vote, Shield, CheckCircle, Loader, BarChart3, Network } from 'lucide-react';
import {ethers} from 'ethers';

const TestVote = () => {
  const [formData, setFormData] = useState({
    userId: '',
    party: '',
    biometricHash: ''
  });
  const [status, setStatus] = useState('ready');
  const [message, setMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [votingStatus, setVotingStatus] = useState(null);
  const [results, setResults] = useState({ parties: [], votes: [] });
  const [contract, setContract] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');



    const [fingerprint, setFingerprint] = useState("");
    const [fpImage, setFpImage] = useState("");
  // ============================================
  // REPLACE THESE WITH YOUR GANACHE DETAILS
  // ============================================
  const GANACHE_RPC_URL = "http://127.0.0.1:8545"; // Your Ganache RPC URL
  const CONTRACT_ADDRESS = "0xd994509e8C9245328402BD8f57b627D78D10A607"; // Your deployed contract address
  const PRIVATE_KEY = "0xdd72eadfd6fcc38fd15983922c0daa43498a43e7e96372c78b995bd46d0325dc"; // Your Ganache private key (without 0x)
  
  // Contract ABI - matches your deployed contract
  const CONTRACT_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "userId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "party",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "VoteCast",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_userId",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_party",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_biometricHash",
          "type": "string"
        }
      ],
      "name": "castVote",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_durationInSeconds",
          "type": "uint256"
        }
      ],
      "name": "startVoting",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "endVoting",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getVotingStatus",
      "outputs": [
        {
          "internalType": "bool",
          "name": "active",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalVotes",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "hasVoted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getResults",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "parties",
          "type": "string[]"
        },
        {
          "internalType": "uint256[]",
          "name": "voteCounts",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "votingActive",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  useEffect(() => {
    initializeBlockchainConnection();
  }, []);

  const initializeBlockchainConnection = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Load ethers.js if not available
      if (typeof window.ethers === 'undefined') {
        console.log('Loading ethers.js...');
        await loadEthers();
      }

      const { ethers } = window;
      
      // Connect to Ganache
      console.log('Connecting to Ganache at:', GANACHE_RPC_URL);
      const provider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
      
      // Test connection
      await provider.getNetwork();
      
      // Create wallet
      const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
      console.log('Connected with address:', wallet.address);
      
      // Create contract instance
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
      setContract(contractInstance);
      
      setConnectionStatus('connected');
      console.log('✅ Successfully connected to Ganache blockchain');
      
      // Load initial data
      await Promise.all([
        fetchVotingStatus(contractInstance),
        fetchResults(contractInstance)
      ]);
      
    } catch (error) {
      setConnectionStatus('error');
      console.error('❌ Failed to connect to Ganache:', error);
      setStatus('error');
      setMessage(`Failed to connect to blockchain: ${error.message}`);
    }
  };

  const loadEthers = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  };

  const fetchVotingStatus = async (contractInstance = contract) => {
    if (!contractInstance) return;
    
    try {
      const [active, startTime, endTime, totalVotes] = await contractInstance.getVotingStatus();
      setVotingStatus({
        active,
        startTime: startTime.toNumber(),
        endTime: endTime.toNumber(),
        totalVotes: totalVotes.toNumber()
      });
    } catch (error) {
      console.error('Failed to fetch voting status:', error);
    }
  };

  const fetchResults = async (contractInstance = contract) => {
    if (!contractInstance) return;
    
    try {
      const [parties, votes] = await contractInstance.getResults();
      setResults({
        parties,
        votes: votes.map(v => v.toNumber())
      });
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateBiometricHash = () => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    return `bio_${timestamp}_${randomStr}`;
  };

  const checkIfVoted = async (userId) => {
    if (!contract) return false;
    
    try {
      return await contract.hasVoted(userId);
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  };

  const startVotingPeriod = async () => {
    if (!contract) return;
    
    try {
      setMessage('Starting voting period...');
      const duration = 86400; // 24 hours
      const tx = await contract.startVoting(duration);
      await tx.wait();
      setMessage('Voting period started successfully!');
      await fetchVotingStatus();
    } catch (error) {
      console.error('Failed to start voting:', error);
      setMessage(`Failed to start voting: ${error.message}`);
    }
  };


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




  const handleSubmitVote = async (e) => {
    e.preventDefault();
    
    if (!contract) {
      setStatus('error');
      setMessage('Not connected to blockchain. Please refresh the page.');
      return;
    }

    if (!formData.userId || !formData.party) {
      setStatus('error');
      setMessage('Please fill in all required fields');
      return;
    }

    if (!votingStatus?.active) {
      setStatus('error');
      setMessage('Voting is not currently active. Please start voting period first.');
      return;
    }

    setStatus('processing');
    setMessage('Checking voting eligibility...');
    
    try {
      // Check if user has already voted
      const hasVotedAlready = await checkIfVoted(formData.userId);
      if (hasVotedAlready) {
        setStatus('error');
        setMessage('This user ID has already voted!');
        return;
      }

      setMessage('Processing vote and saving to Ganache blockchain...');
      
      // Generate biometric hash if not provided
      const biometricHash = formData.biometricHash || generateBiometricHash();
      
      // Submit vote to blockchain
      console.log('Submitting vote:', { userId: formData.userId, party: formData.party, biometricHash });
      
      const transaction = await contract.castVote(
        formData.userId,
        formData.party,
        biometricHash,
        {
          gasLimit: 2000000000 
        }
      );
      
      setMessage('Transaction submitted! Waiting for confirmation...');
      
      // Wait for transaction confirmation
      const receipt = await transaction.wait();
      
      if (receipt.status === 1) {
        setStatus('success');
        setMessage('Vote successfully recorded on Ganache blockchain!');
        setTransactionHash(receipt.transactionHash);
        setBlockNumber(receipt.blockNumber);
        
        // Refresh data
        await fetchVotingStatus();
        await fetchResults();
        
        // Clear form after successful submission
        setTimeout(() => {
          setFormData({ userId: '', party: '', biometricHash: '' });
          setStatus('ready');
          setMessage('');
          setTransactionHash('');
          setBlockNumber('');
        }, 5000);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      setStatus('error');
      let errorMessage = error.message;
      
      // Handle common Ganache errors
      if (error.message.includes('revert')) {
        errorMessage = 'Transaction reverted. Check if voting is active and user hasn\'t voted.';
      } else if (error.message.includes('gas')) {
        errorMessage = 'Transaction failed due to gas issues. Check Ganache settings.';
      }
      
      setMessage(`Failed to record vote: ${errorMessage}`);
      console.error('Voting error:', error);
    }
  };

  const parties = [
    'Democratic Party',
    'Republican Party',
    'Green Party',
    'Libertarian Party',
    'Independent'
  ];

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-800 bg-green-50 border-green-200';
      case 'connecting': return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'error': return 'text-red-800 bg-red-50 border-red-200';
      default: return 'text-gray-800 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Vote className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Biometric Enabled Decentralized Voting System
            </h1>
            <p className="text-gray-600">
              Biometric voting on local Ganache blockchain
            </p>
          </div>

          {/* Connection Status */}
          <div className={`border rounded-lg p-4 mb-6 ${getConnectionStatusColor()}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {connectionStatus === 'connected' && 'Connected to Ganache'}
                  {connectionStatus === 'connecting' && 'Connecting to Ganache...'}
                  {connectionStatus === 'error' && 'Connection Failed'}
                  {connectionStatus === 'disconnected' && 'Disconnected'}
                </span>
              </div>
              <div className="text-sm">
                <p>RPC: {GANACHE_RPC_URL}</p>
                <p>Contract: {CONTRACT_ADDRESS.slice(0, 10)}...</p>
              </div>
            </div>
          </div>

          {/* Voting Status */}
          {votingStatus && (
            <div className={`border rounded-lg p-4 mb-6 ${
              votingStatus.active ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${
                    votingStatus.active ? 'text-green-800' : 'text-orange-800'
                  }`}>
                    Voting Status: {votingStatus.active ? 'ACTIVE' : 'INACTIVE'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Total Votes Cast: {votingStatus.totalVotes}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>Start: {formatTime(votingStatus.startTime)}</p>
                  <p>End: {formatTime(votingStatus.endTime)}</p>
                </div>
              </div>
              
              {!votingStatus.active && (
                <div className="mt-4">
                  <button
                    onClick={startVotingPeriod}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    Start Voting Period (24 hours)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Voting Form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                Voter ID *
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                placeholder="Enter your unique voter ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={status === 'processing' || connectionStatus !== 'connected'}
              />
            </div>

            <div>
              <label htmlFor="party" className="block text-sm font-medium text-gray-700 mb-2">
                Select Party *
              </label>
              <select
                id="party"
                name="party"
                value={formData.party}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={status === 'processing' || connectionStatus !== 'connected'}
              >
                <option value="">Choose a party...</option>
                {parties.map((party, index) => (
                  <option key={index} value={party}>
                    {party}
                  </option>
                ))}
              </select>
            </div>

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






{/* 
            <div>
              <label htmlFor="biometricHash" className="block text-sm font-medium text-gray-700 mb-2">
                Biometric Hash (Auto-generated if empty)
              </label>
              <input
                type="text"
                id="biometricHash"
                name="biometricHash"
                value={formData.biometricHash}
                onChange={handleInputChange}
                placeholder="Biometric hash will be auto-generated"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                disabled={status === 'processing'}
              />
            </div> */}

            <button
              onClick={handleSubmitVote}
              disabled={status === 'processing' || connectionStatus !== 'connected' || !votingStatus?.active}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {status === 'processing' ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Recording Vote...
                </>
              ) : (
                <>
                  <Vote className="h-5 w-5 mr-2" />
                  Scan to Cast Vote
                </>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {message && (
            <div className={`mt-6 p-4 rounded-md ${
              status === 'success' ? 'bg-green-50 border border-green-200' :
              status === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center">
                {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mr-2" />}
                {status === 'error' && <AlertCircle className="h-5 w-5 text-red-600 mr-2" />}
                {status === 'processing' && <Loader className="animate-spin h-5 w-5 text-blue-600 mr-2" />}
                <span className={`font-medium ${
                  status === 'success' ? 'text-green-800' :
                  status === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {message}
                </span>
              </div>
              
              {transactionHash && (
                <div className="mt-2 text-sm text-green-700 space-y-1">
                  <div>
                    <strong>Transaction Hash:</strong>
                    <code className="ml-1 bg-green-100 px-1 rounded break-all">{transactionHash}</code>
                  </div>
                  {blockNumber && (
                    <div>
                      <strong>Block Number:</strong>
                      <code className="ml-1 bg-green-100 px-1 rounded">{blockNumber}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Section */}
        {results.parties && results.parties.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center mb-6">
              <BarChart3 className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">Live Results</h2>
            </div>
            
            <div className="space-y-4">
              {results.parties.map((party, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800">{party}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-4 mr-4">
                      <div 
                        className="bg-indigo-600 h-4 rounded-full transition-all duration-500" 
                        style={{ 
                          width: votingStatus?.totalVotes && votingStatus.totalVotes > 0 ? 
                            `${(results.votes[index] / votingStatus.totalVotes) * 100}%` : 
                            '0%' 
                        }}
                      ></div>
                    </div>
                    <span className="font-bold text-indigo-600 min-w-16">
                      {results.votes[index]} votes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>🔒 Running on Ganache Local Blockchain | 🔐 Biometrically Secured</p>
          <p className="mt-1">Contract: {CONTRACT_ADDRESS}</p>
        </div>
      </div>
    </div>
  );
};

export default TestVote;
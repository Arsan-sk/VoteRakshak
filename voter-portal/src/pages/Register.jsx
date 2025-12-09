/**
 * Voter Registration Page with SecuGen Fingerprint Integration
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerVoter } from '../utils/api';

function Register() {
    const [form, setForm] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        age: '',
        aadhar: '',
        phone: '',
        photo: '',
    });
    const [fingerprint, setFingerprint] = useState('');
    const [fpImage, setFpImage] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // SecuGen API Integration
    function callSGIFPGetData(successCall, failCall) {
        const uri = 'https://localhost:8000/SGIFPCapture';
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
        xmlhttp.open('POST', uri, true);
        xmlhttp.send();
    }

    function captureFingerprint() {
        setStatus('Capturing fingerprint...');
        callSGIFPGetData(
            (result) => {
                if (result.ErrorCode === 0) {
                    if (result.BMPBase64?.length > 0) {
                        setFpImage('data:image/bmp;base64,' + result.BMPBase64);
                    }
                    setFingerprint(result.TemplateBase64);
                    setStatus('✅ Fingerprint captured successfully');
                } else {
                    setStatus('❌ Error capturing fingerprint: ' + result.ErrorCode);
                }
            },
            () => setStatus('❌ Check if SGIBioSrv is running on port 8000')
        );
    }

    async function handleRegister(e) {
        e.preventDefault();

        if (!fingerprint) {
            setStatus('❌ Please capture fingerprint first');
            return;
        }

        setLoading(true);
        setStatus('Registering voter...');

        try {
            const result = await registerVoter({
                ...form,
                fingerprintTemplate: fingerprint,
            });

            setStatus('✅ Registration successful!');

            // Store token
            localStorage.setItem('voterToken', result.token);
            localStorage.setItem('voterAadhar', form.aadhar);

            // Navigate to profile after 2 seconds
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (error) {
            setStatus('❌ ' + (error.response?.data?.error || 'Registration failed'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Voter Registration</h1>
                    <p className="text-green-300">VoteRakshak E-Voting System</p>
                </div>

                {/* Registration Form */}
                <div className="bg-gray-800 rounded-2xl p-8 border border-green-600 shadow-2xl">
                    <form onSubmit={handleRegister} className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="First Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Middle Name
                                </label>
                                <input
                                    type="text"
                                    value={form.middleName}
                                    onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Middle Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Last Name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Age and Aadhaar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Age *
                                </label>
                                <input
                                    type="number"
                                    value={form.age}
                                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Age"
                                    min="18"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Aadhaar Number *
                                </label>
                                <input
                                    type="text"
                                    value={form.aadhar}
                                    onChange={(e) => setForm({ ...form, aadhar: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="12-digit Aadhaar"
                                    pattern="[0-9]{12}"
                                    maxLength="12"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="10-digit phone number"
                                pattern="[0-9]{10}"
                                maxLength="10"
                            />
                        </div>

                        {/* Fingerprint Section */}
                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Biometric Registration</h3>

                            <div className="flex flex-col items-center space-y-4">
                                <button
                                    type="button"
                                    onClick={captureFingerprint}
                                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                                >
                                    📷 Capture Fingerprint
                                </button>

                                {fpImage && (
                                    <div className="bg-gray-700 p-4 rounded-lg border border-green-500">
                                        <img
                                            src={fpImage}
                                            alt="Fingerprint"
                                            className="mx-auto border-2 border-green-500 rounded"
                                            width={150}
                                            height={200}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className={`p-4 rounded-lg border ${status.includes('✅')
                                    ? 'bg-green-900/50 border-green-500 text-green-200'
                                    : status.includes('❌')
                                        ? 'bg-red-900/50 border-red-500 text-red-200'
                                        : 'bg-blue-900/50 border-blue-500 text-blue-200'
                                }`}>
                                {status}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !fingerprint}
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 px-6 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;

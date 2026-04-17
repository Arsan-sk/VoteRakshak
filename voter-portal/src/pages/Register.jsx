/**
 * Student Voter Registration Page — Phase 2
 * Roll number replaces Aadhaar. Adds dept, year, phone, image fields.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const DEPARTMENTS = [
    { code: 'CO',  name: 'Computer Engineering' },
    { code: 'AI',  name: 'Artificial Intelligence & ML' },
    { code: 'DS',  name: 'Data Science' },
    { code: 'ECS', name: 'Electronics & Computer Science' },
    { code: 'ME',  name: 'Mechanical Engineering' },
    { code: 'CE',  name: 'Civil Engineering' },
    { code: 'EE',  name: 'Electrical Engineering' },
];

function Register() {
    const [form, setForm] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        rollNumber: '',
        phone: '',
        department: '',
        year: '',
        imageUrl: '',
        pin: '',
        confirmPin: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [fingerprint, setFingerprint] = useState('');
    const [fpImage, setFpImage] = useState('');
    const [fpStatus, setFpStatus] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // ── Fingerprint capture (SecuGen) ─────────────────────────
    function captureFingerprint() {
        setFpStatus('Scanning fingerprint...');
        const uri = 'https://localhost:8443/SGIFPCapture';
        const xhr = new XMLHttpRequest();
        const timeout = setTimeout(() => {
            xhr.abort();
            setFpStatus('⏱️ Scan timeout. Service may not be responding.');
        }, 15000);
        
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                clearTimeout(timeout);
                if (xhr.status === 200) {
                    try {
                        const result = JSON.parse(xhr.responseText);
                        if (result.ErrorCode === 0) {
                            if (result.BMPBase64?.length > 0) setFpImage('data:image/bmp;base64,' + result.BMPBase64);
                            setFingerprint(result.TemplateBase64);
                            setFpStatus('✅ Fingerprint captured');
                        } else {
                            setFpStatus('❌ Scanner Error ' + result.ErrorCode + ' — try again');
                        }
                    } catch (e) {
                        setFpStatus('❌ Invalid response from scanner — try again');
                    }
                } else if (xhr.status === 0) {
                    setFpStatus('❌ Cannot reach SGIBioSrv on port 8443. Connection closed or service not running.');
                } else {
                    setFpStatus('❌ Scanner service error (' + xhr.status + ') — try again');
                }
            }
        };
        xhr.onerror = () => {
            clearTimeout(timeout);
            setFpStatus('❌ ERR_CONNECTION_CLOSED (error 54) — SGI service may have crashed. Restart it.');
        };
        xhr.onabort = () => {
            clearTimeout(timeout);
        };
        try {
            xhr.open('POST', uri, true);
            xhr.send();
        } catch (err) {
            clearTimeout(timeout);
            setFpStatus('❌ Cannot start scan: ' + err.message);
        }
    }

    // ── Image file to base64 ──────────────────────────────────
    function handleImageFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setImagePreview(ev.target.result);
            setForm(f => ({ ...f, imageUrl: ev.target.result }));
        };
        reader.readAsDataURL(file);
    }

    // ── Registration submit ───────────────────────────────────
    async function handleRegister(e) {
        e.preventDefault();

        if (!form.rollNumber || !form.department || !form.year || !form.pin) {
            setStatus('❌ Please fill all required fields including PIN');
            return;
        }
        if (!/^\d{4}$/.test(form.pin)) {
            setStatus('❌ PIN must be exactly 4 digits');
            return;
        }
        if (form.pin !== form.confirmPin) {
            setStatus('❌ PINs do not match');
            return;
        }

        setLoading(true);
        setStatus('Registering student...');

        try {
            const payload = {
                firstName: form.firstName,
                middleName: form.middleName,
                lastName: form.lastName,
                rollNumber: form.rollNumber.toUpperCase(),
                phone: form.phone,
                department: form.department,
                year: form.year,
                imageUrl: form.imageUrl || null,
                fingerprintTemplate: fingerprint || null,
                pin: form.pin,
            };

            const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Registration failed');

            localStorage.setItem('voterToken', data.token);
            localStorage.setItem('voterRollNumber', data.user.rollNumber);
            localStorage.setItem('voterId', data.user.id);

            setStatus('✅ Registration successful! Redirecting...');
            setTimeout(() => navigate('/profile'), 1800);
        } catch (err) {
            setStatus('❌ ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    const inputCls = 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all';
    const labelCls = 'block text-sm font-medium text-gray-300 mb-1.5';

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-900 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <span className="text-4xl">🗳️</span>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">VoteRakshak</h1>
                    </div>
                    <p className="text-indigo-300 text-lg font-medium">Student Voter Registration — Phase 2</p>
                </div>

                <div className="bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 border border-indigo-700/50 shadow-2xl">
                    <form onSubmit={handleRegister} className="space-y-5">

                        {/* Name Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelCls}>First Name *</label>
                                <input type="text" className={inputCls} placeholder="First Name"
                                    value={form.firstName}
                                    onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                            </div>
                            <div>
                                <label className={labelCls}>Middle Name</label>
                                <input type="text" className={inputCls} placeholder="Middle Name"
                                    value={form.middleName}
                                    onChange={e => setForm({ ...form, middleName: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Last Name *</label>
                                <input type="text" className={inputCls} placeholder="Last Name"
                                    value={form.lastName}
                                    onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                            </div>
                        </div>

                        {/* Roll Number + Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Roll Number *</label>
                                <input type="text" className={inputCls} placeholder="e.g. 23EC59"
                                    value={form.rollNumber}
                                    onChange={e => setForm({ ...form, rollNumber: e.target.value.toUpperCase() })}
                                    required />
                                <p className="text-xs text-gray-500 mt-1">Format: YYDEPTSRNO (e.g. 23CO12)</p>
                            </div>
                            <div>
                                <label className={labelCls}>Phone Number *</label>
                                <input type="tel" className={inputCls} placeholder="10-digit mobile"
                                    value={form.phone} pattern="[0-9]{10}" maxLength="10"
                                    onChange={e => setForm({ ...form, phone: e.target.value })} required />
                            </div>
                        </div>

                        {/* PIN */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>4-Digit PIN *</label>
                                <input type="password" className={inputCls} placeholder="Choose a 4-digit PIN"
                                    value={form.pin} maxLength={4} inputMode="numeric" pattern="\d{4}"
                                    onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                    required />
                                <p className="text-xs text-gray-500 mt-1">You'll use this to login later</p>
                            </div>
                            <div>
                                <label className={labelCls}>Confirm PIN *</label>
                                <input type="password" className={inputCls} placeholder="Re-enter your PIN"
                                    value={form.confirmPin} maxLength={4} inputMode="numeric" pattern="\d{4}"
                                    onChange={e => setForm({ ...form, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                    required />
                            </div>
                        </div>

                        {/* Department + Year */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Department *</label>
                                <select className={inputCls} value={form.department}
                                    onChange={e => setForm({ ...form, department: e.target.value })} required>
                                    <option value="">Select Department</option>
                                    {DEPARTMENTS.map(d => (
                                        <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Year *</label>
                                <select className={inputCls} value={form.year}
                                    onChange={e => setForm({ ...form, year: e.target.value })} required>
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                        </div>

                        {/* Profile Image */}
                        <div>
                            <label className={labelCls}>Profile Image *</label>
                            <div className="flex gap-3 items-start">
                                <div className="flex-1 space-y-2">
                                    <input type="file" accept="image/*" className="hidden" id="imageFileInput"
                                        onChange={handleImageFile} />
                                    <label htmlFor="imageFileInput"
                                        className="block w-full text-center cursor-pointer px-4 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors">
                                        📂 Upload Photo
                                    </label>
                                    <p className="text-xs text-gray-500 text-center">— or paste a URL below —</p>
                                    <input type="url" className={inputCls} placeholder="https://your-photo-url.com/photo.jpg"
                                        value={form.imageUrl}
                                        onChange={e => { setForm({ ...form, imageUrl: e.target.value }); setImagePreview(e.target.value); }} />
                                </div>
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview"
                                        className="w-24 h-24 rounded-lg border-2 border-indigo-500 object-cover flex-shrink-0" />
                                )}
                            </div>
                        </div>

                        {/* Biometric Section */}
                        <div className="border-t border-gray-700 pt-5">
                            <h3 className="text-base font-semibold text-white mb-3">🔐 Biometric Registration</h3>
                            <div className="flex flex-col items-center gap-4">
                                <button type="button" onClick={captureFingerprint}
                                    className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2">
                                    👆 Scan Fingerprint
                                </button>
                                {fpStatus && (
                                    <p className={`text-sm ${fpStatus.includes('✅') ? 'text-green-400' : fpStatus.includes('❌') ? 'text-red-400' : 'text-blue-400'}`}>
                                        {fpStatus}
                                    </p>
                                )}
                                {fpImage && (
                                    <img src={fpImage} alt="Fingerprint" className="border-2 border-green-500 rounded" width={130} height={180} />
                                )}
                                {!fingerprint && (
                                    <p className="text-xs text-gray-500">Fingerprint is optional in development mode (FINGERPRINT_REQUIRED=false)</p>
                                )}
                            </div>
                        </div>

                        {/* Status */}
                        {status && (
                            <div className={`p-4 rounded-lg border text-sm font-medium ${status.includes('✅') ? 'bg-green-900/40 border-green-600 text-green-300' : status.includes('❌') ? 'bg-red-900/40 border-red-600 text-red-300' : 'bg-blue-900/40 border-blue-600 text-blue-300'}`}>
                                {status}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 pt-2">
                            <button type="button" onClick={() => navigate('/')}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-bold transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-bold transition-colors">
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-gray-500 text-sm mt-4">
                    Already registered?{' '}
                    <button onClick={() => navigate('/profile')} className="text-indigo-400 hover:underline">View Profile</button>
                </p>
            </div>
        </div>
    );
}

export default Register;

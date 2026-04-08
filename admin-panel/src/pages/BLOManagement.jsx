/**
 * BLO Management Page — Admin Panel Phase 2
 * Lists BLOs, shows booth assignments, allows reassignment (blocked during active election)
 */

import { useState, useEffect } from 'react';
import { getBLOs, reassignBLO, getAllElections } from '../utils/api';

const BOOTH_OPTIONS = [
    { id: 'BOOTH_001', name: 'CO Booth', dept: 'CO' },
    { id: 'BOOTH_002', name: 'AI/ML Booth', dept: 'AI' },
    { id: 'BOOTH_003', name: 'DS Booth', dept: 'DS' },
    { id: 'BOOTH_004', name: 'ECS Booth', dept: 'ECS' },
    { id: 'BOOTH_005', name: 'ME Booth', dept: 'ME' },
    { id: 'BOOTH_006', name: 'CE Booth', dept: 'CE' },
    { id: 'BOOTH_007', name: 'EE Booth', dept: 'EE' },
];

function BLOManagement() {
    const [blos, setBlos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeElection, setActiveElection] = useState(null);
    const [msg, setMsg] = useState('');
    const [reassigning, setReassigning] = useState({});

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const [bloRes, elecRes] = await Promise.all([getBLOs(), getAllElections()]);
            setBlos(bloRes.data.blos || []);
            const active = (elecRes.data.elections || []).find(e => e.status === 'active');
            setActiveElection(active || null);
        } finally {
            setLoading(false);
        }
    }

    async function handleReassign(bloId, newBoothId) {
        setReassigning(prev => ({ ...prev, [bloId]: true }));
        try {
            await reassignBLO(bloId, newBoothId);
            setMsg('✅ BLO reassigned successfully');
            await loadData();
        } catch (err) {
            setMsg('❌ ' + (err.response?.data?.error || 'Reassignment failed'));
        } finally {
            setReassigning(prev => ({ ...prev, [bloId]: false }));
        }
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">BLO Management</h1>
                <p className="page-subtitle">Booth Liaison Officer assignments · 7 active booths</p>
            </div>

            <div className="page-content">
                {activeElection && (
                    <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
                        ⚠️ An election is currently active — BLO reassignment is disabled until the election ends.
                    </div>
                )}
                {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

                {loading ? <div className="spinner" /> : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>BLO</th>
                                    <th>Username</th>
                                    <th>Current Booth</th>
                                    <th>Department</th>
                                    <th>Reassign</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blos.map(blo => (
                                    <tr key={blo.id}>
                                        <td style={{ fontWeight: '600' }}>{blo.display_name}</td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{blo.username}</td>
                                        <td>{blo.booths?.name || '—'}</td>
                                        <td>{blo.booths?.department ? <span className="badge badge-dept">{blo.booths.department}</span> : '—'}</td>
                                        <td>
                                            <select
                                                className="input"
                                                defaultValue={blo.booth_id}
                                                disabled={!!activeElection || reassigning[blo.id]}
                                                onChange={e => { if (e.target.value !== blo.booth_id) handleReassign(blo.id, e.target.value); }}
                                                style={{ width: '160px', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                                            >
                                                {BOOTH_OPTIONS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

export default BLOManagement;

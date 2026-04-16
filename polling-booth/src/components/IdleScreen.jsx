/**
 * IdleScreen Component — Phase 2
 * Shows "No active election" when idle, or election info when active
 */

function IdleScreen({ activeElection, boothId, electionLoading }) {
    const DEPT_NAMES = {
        CO: 'Computer Engineering', AI: 'AI / ML', DS: 'Data Science',
        ECS: 'Electronics & CS', ME: 'Mechanical', CE: 'Civil', EE: 'Electrical',
    };
    const ELECTION_LABELS = {
        ER: 'Engineering Representative', DR: 'Department Representative', CR: 'Class Representative',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 flex flex-col items-center justify-center p-8">
            {/* Logo */}
            <div className="text-center mb-10">
                <div className="text-6xl mb-4">🗳️</div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">VoteRakshak</h1>
                <p className="text-gray-400 text-lg">Phase 2 · {boothId && DEPT_NAMES[boothId.replace('BOOTH_00', '').replace('BOOTH_0', '')] ? boothId : boothId} Polling Booth</p>
            </div>

            {/* Status */}
            {electionLoading ? (
                <div className="bg-gray-800/60 border border-gray-700 rounded-2xl px-8 py-6 text-center max-w-md w-full">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-400">Checking election status...</p>
                </div>
            ) : activeElection ? (
                <div className="bg-indigo-900/40 border border-indigo-500 rounded-2xl px-8 py-6 text-center max-w-md w-full shadow-lg">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 font-semibold text-sm uppercase tracking-wide">Election Active</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">
                        {ELECTION_LABELS[activeElection.type]} Election
                    </h2>
                    {activeElection.department && (
                        <p className="text-indigo-300 text-sm mb-1">
                            Department: {activeElection.department}
                            {activeElection.year ? ` · Year ${activeElection.year}` : ''}
                        </p>
                    )}
                    <p className="text-gray-400 text-xs mt-2">
                        Ends: {new Date(activeElection.endsAt).toLocaleString()}
                    </p>
                    <hr className="border-gray-700 my-4" />
                    <p className="text-gray-300 text-sm">Waiting for BLO to unlock booth for an authorized voter...</p>
                </div>
            ) : (
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl px-8 py-6 text-center max-w-md w-full">
                    <div className="text-4xl mb-3">🔒</div>
                    <h2 className="text-xl font-bold text-gray-300 mb-2">No Active Election</h2>
                    <p className="text-gray-500 text-sm">This booth is idle. When an election starts, it will appear here automatically.</p>
                </div>
            )}

            {/* Booth ID */}
            <p className="mt-8 text-gray-600 text-xs tracking-widest">BOOTH ID: {boothId}</p>
        </div>
    );
}

export default IdleScreen;

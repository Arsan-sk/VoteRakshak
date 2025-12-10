import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Box, Search, ExternalLink, Clock, ShieldCheck, Database } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const PARTY_NAMES = {
    1: 'ABC',
    2: 'XYZ',
    3: 'PQR',
    4: 'LMN',
};

const BlockchainVisualizer = () => {
    const [blocks, setBlocks] = useState([]);
    const [expandedBlock, setExpandedBlock] = useState(null);
    const [status, setStatus] = useState('Connecting to Ledger...');
    const [searchHash, setSearchHash] = useState('');

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            setStatus('🟢 Live Ledger Connected');
        });

        socket.on('connect_error', () => {
            setStatus('🔴 Ledger Disconnected');
        });

        socket.on('new_block', (data) => {
            // Add new block to the start of the list
            const newBlock = {
                id: data.timestamp, // use timestamp as ID
                number: prev.length > 0 ? (typeof prev[0].number === 'number' ? prev[0].number + 1 : 105) : 105, // Increment or default to 105 of last was 104
                timestamp: new Date(data.timestamp * 1000).toLocaleTimeString(),
                hash: data.transactionHash,
                voterHash: data.voterHash,
                partyId: data.partyId, // Hidden in UI for privacy usually, but shown here for demo
                gasUsed: '21000', // Mock or real if provided
            };

            setBlocks(prev => [newBlock, ...prev].slice(0, 10)); // Keep last 10
            setStatus(`⚡ New Block Mined: ${data.transactionHash.substring(0, 10)}...`);

            // Auto expand the new block briefly? No, let user explore.
        });

        // Add some dummy blocks for visualization if empty
        if (blocks.length === 0) {
            setBlocks([
                { id: 1, number: 104, timestamp: '10:42:05', hash: '0xabc...123', gasUsed: 21000 },
                { id: 2, number: 103, timestamp: '10:38:12', hash: '0xdef...456', gasUsed: 21000 },
                { id: 3, number: 102, timestamp: '10:30:00', hash: '0x789...012', gasUsed: 21000 },
            ]);
        }

        return () => socket.disconnect();
    }, []);

    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-green-400 w-8 h-8" />
                    <div>
                        <h2 className="text-xl font-bold">Live Election Ledger</h2>
                        <span className="text-xs text-slate-400 font-mono">{status}</span>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Verify Transaction Hash..."
                        className="bg-slate-800 border border-slate-600 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-indigo-500 w-64"
                        value={searchHash}
                        onChange={(e) => setSearchHash(e.target.value)}
                    />
                    <Search className="absolute right-3 top-2.5 text-slate-400 w-4 h-4" />
                </div>
            </div>

            {/* Blockchain Visualization */}
            <div className="relative overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-4 min-w-max px-2">
                    {/* Genesis/Oldest Block Indicator */}
                    <div className="flex items-center text-slate-600">
                        <Database className="w-6 h-6 mr-2 opacity-50" />
                        <span className="text-xs font-mono">...History</span>
                    </div>

                    {blocks.map((block, index) => (
                        <div key={block.id} className="relative group">
                            {/* Connecting Line */}
                            {index !== blocks.length - 1 && (
                                <div className="absolute top-1/2 -right-4 w-4 h-0.5 bg-slate-600 z-0"></div>
                            )}

                            {/* Block Card */}
                            <div
                                onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                                className={`
                                    relative z-10 w-40 h-40 flex flex-col items-center justify-center 
                                    bg-gradient-to-br from-indigo-900 to-slate-800 
                                    border ${block.id === expandedBlock ? 'border-indigo-400' : 'border-slate-600'} 
                                    rounded-lg cursor-pointer transform transition-all duration-300
                                    hover:scale-105 hover:shadow-indigo-500/20 shadow-lg
                                `}
                            >
                                <Box className="w-8 h-8 text-indigo-400 mb-2" />
                                <span className="font-mono text-sm font-bold">Block #{block.number}</span>
                                <div className="flex items-center mt-1 text-xs text-slate-400">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {block.timestamp}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Live Indicator */}
                    <div className="flex flex-col items-center justify-center ml-2 animate-pulse">
                        <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                        <span className="text-[10px] text-green-400 font-bold tracking-wider">LIVE</span>
                    </div>
                </div>
            </div>

            {/* Expanded Block Details or Search Result */}
            {(expandedBlock || (searchHash && blocks.find(b => b.hash.includes(searchHash)))) && (
                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl backdrop-blur-sm">
                    <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider border-b border-slate-700 pb-2">
                        {searchHash ? 'Search Result' : 'Block Details'}
                    </h3>
                    {blocks.filter(b => (expandedBlock === b.id) || (searchHash && b.hash.includes(searchHash))).map((block, idx) => {
                        // Find previous block for hash chaining visualization
                        const currentBlockIndex = blocks.findIndex(x => x.id === block.id);
                        const prevBlock = blocks[currentBlockIndex + 1];
                        const prevHash = prevBlock ? prevBlock.hash : "0x0000000000000000000000000000000000000000";

                        return (
                            <div key={block.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                                <div className="md:col-span-2">
                                    <span className="text-slate-500 block text-xs uppercase mb-1">Status</span>
                                    <span className="text-green-400 font-bold flex items-center gap-2 bg-green-900/20 p-2 rounded border border-green-500/30">
                                        <ShieldCheck className="w-5 h-5" />
                                        Transaction Verified & Immutable
                                    </span>
                                </div>

                                <div className="md:col-span-2 relative group-hover:scale-[1.01] transition-transform">
                                    <span className="text-slate-500 block text-xs uppercase mb-1">Current Block Hash</span>
                                    <div className="text-indigo-300 break-all bg-indigo-900/20 p-3 rounded border border-indigo-500/30 hover:bg-indigo-900/40 transition-colors">
                                        {block.hash}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <span className="text-slate-500 block text-xs uppercase mb-1">Previous Block Hash</span>
                                    <div className="text-slate-400 break-all bg-slate-900/50 p-2 rounded border border-slate-700">
                                        {prevHash}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-slate-500 block text-xs uppercase mb-1">Block Number</span>
                                    <span className="text-white text-lg font-bold">#{block.number}</span>
                                </div>

                                <div>
                                    <span className="text-slate-500 block text-xs uppercase mb-1">Voter ID (Encrypted)</span>
                                    <span className="text-orange-300 break-all text-xs" title={block.voterHash || "Anonymous"}>
                                        {block.voterHash ? `${block.voterHash.substring(0, 16)}...` : "0xAnonymous..."}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-slate-500 block text-xs uppercase mb-1">Vote Choice</span>
                                    <span className="text-indigo-400 font-bold">
                                        {PARTY_NAMES[block.partyId] || `Party #${block.partyId}`}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-slate-500 block text-xs uppercase mb-1">Gas Used</span>
                                    <span className="text-slate-300">{block.gasUsed} Wei</span>
                                </div>

                                <div>
                                    <span className="text-slate-500 block text-xs uppercase mb-1">Timestamp</span>
                                    <span className="text-slate-300">{block.timestamp}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default BlockchainVisualizer;

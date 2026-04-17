import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Port map: BOOTH_ID → port
const BOOTH_PORTS = {
    BOOTH_001: 5175,
    BOOTH_002: 5177,
    BOOTH_003: 5178,
    BOOTH_004: 5179,
    BOOTH_005: 5180,
    BOOTH_006: 5181,
    BOOTH_007: 5182,
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const boothId = env.VITE_BOOTH_ID || 'BOOTH_001';
    const port = BOOTH_PORTS[boothId] || 5175;

    console.log(`\n🏢 Starting Polling Booth — ${boothId} on port ${port}\n`);

    return {
        plugins: [react()],
        server: {
            port,
            strictPort: true,
            host: '0.0.0.0', // Listen on all interfaces for network access
            middlewareMode: false,
        },
        preview: {
            port,
            host: '0.0.0.0',
        },
        define: {
            __BOOTH_ID__: JSON.stringify(boothId),
        },
    };
});

import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',testMatch:'**/*.spec.mjs',timeout:90000,workers:1,reporter:'list',
 use:{baseURL:process.env.E2E_BASE_URL||'http://127.0.0.1:8791',viewport:{width:1440,height:950},screenshot:'only-on-failure',trace:'retain-on-failure',launchOptions:{args:['--no-sandbox']}},
 webServer:process.env.E2E_BASE_URL?undefined:{command:'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 8791 --strictPort',url:'http://127.0.0.1:8791',reuseExistingServer:false},
});

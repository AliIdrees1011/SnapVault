// ═══════════════════════════════════════════════
//  config.js — SnapVault Environment Config
//  STEP 1: Set LOCAL_API for local development
//  STEP 2: Set AZURE_API after deploying backend
// ═══════════════════════════════════════════════

const LOCAL_API = 'http://localhost:8000';
const AZURE_API = '';   // ← paste your Azure App Service URL here after deploy
                        //   e.g. 'https://snapvault-api.azurewebsites.net'

// Auto-detect: if AZURE_API is set, use it; otherwise use local
const API_URL = AZURE_API || LOCAL_API;

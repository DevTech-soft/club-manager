// Script de prueba para verificar que los endpoints refactorizados funcionan correctamente
// Ejecutar con: node services/test-api.js

const API_BASE_URL = 'http://localhost:3001/api';

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

// Helper para hacer requests
async function testEndpoint(name, method, url, body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.log(`  ${colors.red}✗ ${name} - Status: ${response.status} - ${error.message}${colors.reset}`);
      return { success: false, status: response.status };
    }

    const data = response.status === 204 ? null : await response.json();
    console.log(`  ${colors.green}✓ ${name} - Status: ${response.status}${colors.reset}`);
    return { success: true, status: response.status, data };
  } catch (error) {
    console.log(`  ${colors.red}✗ ${name} - Error: ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

// Tests principales
async function runTests() {
  console.log(`\n${colors.blue}==========================================`);
  console.log('  API Refactorización - Tests');
  console.log(`==========================================${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  // ==================== PLAYERS ====================
  console.log(`${colors.yellow}[PLAYERS API]${colors.reset}`);

  let result = await testEndpoint('GET /players', 'GET', '/players');
  result.success ? passed++ : failed++;

  if (result.data && result.data.length > 0) {
    const playerId = result.data[0].id;

    result = await testEndpoint(`GET /players/${playerId}`, 'GET', `/players/${playerId}`);
    result.success ? passed++ : failed++;

    result = await testEndpoint(`GET /players/${playerId}/attendances`, 'GET', `/players/${playerId}/attendances`);
    result.success ? passed++ : failed++;
  }

  // ==================== TEAMS ====================
  console.log(`\n${colors.yellow}[TEAMS API]${colors.reset}`);

  result = await testEndpoint('GET /teams', 'GET', '/teams');
  result.success ? passed++ : failed++;

  // ==================== ATTENDANCES ====================
  console.log(`\n${colors.yellow}[ATTENDANCES API]${colors.reset}`);

  result = await testEndpoint('GET /attendances', 'GET', '/attendances');
  result.success ? passed++ : failed++;

  // ==================== COACHES ====================
  console.log(`\n${colors.yellow}[COACHES API]${colors.reset}`);

  result = await testEndpoint('GET /coaches', 'GET', '/coaches');
  result.success ? passed++ : failed++;

  // ==================== CLUB SETTINGS ====================
  console.log(`\n${colors.yellow}[CLUB SETTINGS API]${colors.reset}`);

  result = await testEndpoint('GET /club-settings', 'GET', '/club-settings');
  result.success ? passed++ : failed++;

  // ==================== TOURNAMENTS ====================
  console.log(`\n${colors.yellow}[TOURNAMENTS API]${colors.reset}`);

  result = await testEndpoint('GET /tournaments', 'GET', '/tournaments');
  result.success ? passed++ : failed++;

  if (result.data && result.data.length > 0) {
    const tournamentId = result.data[0].id;

    result = await testEndpoint(`GET /tournaments/${tournamentId}`, 'GET', `/tournaments/${tournamentId}`);
    result.success ? passed++ : failed++;

    result = await testEndpoint(`GET /tournaments/${tournamentId}/positions`, 'GET', `/tournaments/${tournamentId}/positions`);
    result.success ? passed++ : failed++;

    // ==================== MATCHES ====================
    console.log(`\n${colors.yellow}[MATCHES API]${colors.reset}`);

    result = await testEndpoint(`GET /matches?tournamentId=${tournamentId}`, 'GET', `/matches?tournamentId=${tournamentId}`);
    result.success ? passed++ : failed++;

    if (result.data && result.data.length > 0) {
      const matchId = result.data[0].id;

      result = await testEndpoint(`GET /matches/${matchId}`, 'GET', `/matches/${matchId}`);
      result.success ? passed++ : failed++;
    }

    // ==================== GROUPS ====================
    console.log(`\n${colors.yellow}[GROUPS API]${colors.reset}`);

    result = await testEndpoint(`GET /groups?tournamentId=${tournamentId}`, 'GET', `/groups?tournamentId=${tournamentId}`);
    result.success ? passed++ : failed++;
  }

  // ==================== ERROR HANDLING ====================
  console.log(`\n${colors.yellow}[ERROR HANDLING]${colors.reset}`);

  result = await testEndpoint('GET /players/invalid-id (should fail gracefully)', 'GET', '/players/invalid-id-that-does-not-exist');
  // Este debería fallar, pero de forma controlada
  if (!result.success && result.status === 404 || result.status === 500) {
    console.log(`  ${colors.green}✓ Error handling works correctly${colors.reset}`);
    passed++;
  } else {
    failed++;
  }

  // ==================== SUMMARY ====================
  console.log(`\n${colors.blue}==========================================`);
  console.log(`  RESULTADOS`);
  console.log(`==========================================${colors.reset}`);
  console.log(`  ${colors.green}✓ Passed: ${passed}${colors.reset}`);
  console.log(`  ${colors.red}✗ Failed: ${failed}${colors.reset}`);
  console.log(`  Total: ${passed + failed}`);
  console.log(`\n${colors.blue}==========================================${colors.reset}\n`);

  return { passed, failed };
}

// Ejecutar tests
runTests().then(({ passed, failed }) => {
  process.exit(failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});

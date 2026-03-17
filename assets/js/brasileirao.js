const main = document.querySelector('main');

const REFRESH_INTERVAL_MS = 60_000;
const STANDINGS_ENDPOINT = 'https://site.api.espn.com/apis/v2/sports/soccer/bra.1/standings';

let previousPositions = new Map();
let lastUpdatedAt = null;
let updateMode = 'fallback';

const fallbackStandings = [
  ['Palmeiras', 0], ['Flamengo', 1], ['Atlético-MG', 2], ['Fluminense', 3], ['Grêmio', 4],
  ['Botafogo', 5], ['Athletico-PR', 6], ['Fortaleza', 7], ['São Paulo', 8], ['Bragantino', 9],
  ['Cruzeiro', 10], ['Internacional', 11], ['Corinthians', 12], ['Bahia', 13], ['Vasco', 14],
  ['Santos', 15], ['Cuiabá', 16], ['Goiás', 17], ['Juventude', 18], ['Vitória', 19]
].map(([name, index]) => ({
  team: { displayName: name, logos: [{ href: 'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo-500.png' }] },
  stats: [
    { name: 'points', value: 44 - index },
    { name: 'gamesPlayed', value: 24 },
    { name: 'wins', value: Math.max(5, 14 - Math.floor(index / 2)) },
    { name: 'ties', value: 6 - Math.min(5, Math.floor(index / 4)) },
    { name: 'losses', value: Math.min(12, 3 + Math.floor(index / 2)) },
    { name: 'goalsFor', value: Math.max(12, 34 - index) },
    { name: 'goalsAgainst', value: 12 + index },
    { name: 'goalDifference', value: 22 - index * 2 },
    { name: 'winPercent', value: Math.max(20, 70 - index * 2.2) }
  ]
}));

const pageTemplate = `
  <section class="table-wrapper">
    <div class="table-header">
      <div>
        <h1>Tabela do Brasileirão Série A</h1>
        <p id="update-status">Carregando classificação...</p>
      </div>
      <button id="refresh-button" type="button">Atualizar agora</button>
    </div>

    <div class="table-scroll">
      <table class="standings-table" aria-live="polite">
        <thead>
          <tr>
            <th>#</th>
            <th>Time</th>
            <th>PTS</th>
            <th>J</th>
            <th>V</th>
            <th>E</th>
            <th>D</th>
            <th>GP</th>
            <th>GC</th>
            <th>SG</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody id="standings-body"></tbody>
      </table>
    </div>
  </section>
`;

main.innerHTML = pageTemplate;

const statusElement = document.getElementById('update-status');
const tableBody = document.getElementById('standings-body');
const refreshButton = document.getElementById('refresh-button');

function formatPct(value) {
  if (!Number.isFinite(value)) return '-';
  return `${value.toFixed(1)}%`;
}

function getStat(stats, keys) {
  const stat = stats.find((item) => keys.includes(item.name));
  return stat?.value ?? '-';
}

function getPositionChange(current, teamName) {
  const previous = previousPositions.get(teamName);
  if (!previous || previous === current) return '';

  if (current < previous) return '⬆';
  if (current > previous) return '⬇';
  return '';
}

function updateStatusLabel(message) {
  statusElement.textContent = message;
}

function updateLastSyncLabel(mode = 'live') {
  if (!lastUpdatedAt) return;

  const now = Date.now();
  const diffInSeconds = Math.floor((now - lastUpdatedAt) / 1000);
  const modeText = mode === 'fallback' ? 'modo simulado' : 'modo ao vivo';

  if (diffInSeconds < 60) {
    updateStatusLabel(`Atualizado agora (${modeText}) · próxima atualização em ${Math.max(1, 60 - diffInSeconds)}s`);
    return;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  updateStatusLabel(`Última atualização há ${diffInMinutes} min (${modeText})`);
}

function renderTable(standings) {
  const fragment = document.createDocumentFragment();

  standings.forEach((team, index) => {
    const row = document.createElement('tr');
    const teamName = team.team?.displayName ?? 'Time';
    const position = index + 1;
    const stats = team.stats ?? [];
    const changeSymbol = getPositionChange(position, teamName);

    row.innerHTML = `
      <td class="position-cell">${position} <span class="position-change">${changeSymbol}</span></td>
      <td class="team-cell">
        <img src="${team.team?.logos?.[0]?.href ?? ''}" alt="Escudo ${teamName}" loading="lazy" />
        <span>${teamName}</span>
      </td>
      <td>${getStat(stats, ['points'])}</td>
      <td>${getStat(stats, ['gamesPlayed'])}</td>
      <td>${getStat(stats, ['wins'])}</td>
      <td>${getStat(stats, ['ties', 'draws'])}</td>
      <td>${getStat(stats, ['losses'])}</td>
      <td>${getStat(stats, ['pointsFor', 'goalsFor'])}</td>
      <td>${getStat(stats, ['pointsAgainst', 'goalsAgainst'])}</td>
      <td>${getStat(stats, ['pointDifferential', 'goalDifference'])}</td>
      <td>${formatPct(Number(getStat(stats, ['winPercent'])))}</td>
    `;

    fragment.appendChild(row);
    previousPositions.set(teamName, position);
  });

  tableBody.innerHTML = '';
  tableBody.appendChild(fragment);
}

function simulateFallbackUpdate() {
  const simulated = fallbackStandings.map((team) => ({
    ...team,
    stats: team.stats.map((stat) => ({ ...stat }))
  }));

  const luckyTeam = simulated[Math.floor(Math.random() * 6)];
  luckyTeam.stats.find((s) => s.name === 'points').value += 1;
  luckyTeam.stats.find((s) => s.name === 'wins').value += 1;
  luckyTeam.stats.find((s) => s.name === 'gamesPlayed').value += 1;
  luckyTeam.stats.find((s) => s.name === 'goalsFor').value += 1;
  luckyTeam.stats.find((s) => s.name === 'goalDifference').value += 1;

  simulated.sort((a, b) => getStat(b.stats, ['points']) - getStat(a.stats, ['points']));
  return simulated;
}

async function loadStandings() {
  updateStatusLabel('Atualizando tabela...');
  refreshButton.disabled = true;

  try {
    const response = await fetch(STANDINGS_ENDPOINT);
    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);

    const data = await response.json();
    const entries = data?.children?.[0]?.standings?.entries ?? [];
    if (!entries.length) throw new Error('Sem classificação disponível');

    renderTable(entries);
    lastUpdatedAt = Date.now();
    updateMode = 'live';
    updateLastSyncLabel(updateMode);
    return;
  } catch (error) {
    console.warn('Falha no modo ao vivo, usando simulação local:', error.message);
  } finally {
    refreshButton.disabled = false;
  }

  const simulatedData = simulateFallbackUpdate();
  renderTable(simulatedData);
  lastUpdatedAt = Date.now();
  updateMode = 'fallback';
  updateLastSyncLabel(updateMode);
}

refreshButton.addEventListener('click', loadStandings);

loadStandings();
setInterval(() => updateLastSyncLabel(updateMode), 1000);
setInterval(loadStandings, REFRESH_INTERVAL_MS);

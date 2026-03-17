// ========================================
// SES Intelligence Tool — app.js
// ========================================

const STATE = {
  claudeKey: '',
  newsKey: '',
  aiArticles: [],
  searchArticles: [],
};

// ===== DEMO NEWS DATA (NewsAPIがない場合のフォールバック) =====
const DEMO_NEWS = [
  {
    title: "三菱UFJ銀行、生成AI活用で融資審査を自動化へ — 2025年度中に本格導入",
    description: "三菱UFJ銀行は生成AIを活用した融資審査システムの本格導入を発表。従来比で審査時間を70%短縮できるとし、中小企業向け融資の拡大を見込む。システム開発にはNTTデータと富士通が参画する見通し。",
    url: "https://example.com/news/1",
    urlToImage: null,
    source: { name: "日経新聞" },
    publishedAt: new Date().toISOString(),
    category: "金融 / AI",
    emoji: "🏦"
  },
  {
    title: "経済産業省、DX推進指標を改定 — SIerへの影響が拡大",
    description: "経済産業省はDX推進指標を全面改定し、2024年度から企業のDX成熟度評価方法を刷新する。特にSIerの役割を「開発ベンダー」から「変革パートナー」へ位置づけることを推奨し、SIerのビジネスモデル転換が加速する見込みだ。",
    url: "https://example.com/news/2",
    urlToImage: null,
    source: { name: "IT media" },
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    category: "DX / 政策",
    emoji: "📊"
  },
  {
    title: "日本生命、基幹システム刷新プロジェクトに約500億円投資 — クラウド移行を加速",
    description: "日本生命保険は老朽化した基幹システムの全面刷新を決定。AWS/Azureへのクラウド移行を中心に約500億円を投資し、2027年度までの完了を目指す。NTTデータ、日立製作所などが受注競争に参入している。",
    url: "https://example.com/news/3",
    urlToImage: null,
    source: { name: "日本経済新聞" },
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    category: "生保 / クラウド",
    emoji: "🏢"
  },
  {
    title: "GitHub Copilot採用企業が国内で急増 — エンジニア生産性40%向上の報告も",
    description: "GitHub Copilotの国内採用企業が2024年に急増し、大手SIerを中心に開発生産性の向上報告が相次いでいる。一方でAI活用スキルを持つエンジニアの不足が深刻化しており、人材獲得競争が激化している。",
    url: "https://example.com/news/4",
    urlToImage: null,
    source: { name: "TechCrunch Japan" },
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    category: "AI / 開発",
    emoji: "💻"
  },
  {
    title: "東京電力HD、スマートグリッド整備にAI活用 — 電力需給予測システムを刷新",
    description: "東京電力ホールディングスは電力需給予測にAIを活用した新システムの導入を開始。再生可能エネルギーの出力変動への対応力を高め、2025年度中に全エリアへの展開を予定。システム開発は日立製作所が担当する。",
    url: "https://example.com/news/5",
    urlToImage: null,
    source: { name: "電気新聞" },
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    category: "電力 / AI",
    emoji: "⚡"
  },
  {
    title: "トヨタ自動車、SDV開発加速でソフトウェアエンジニアを5000人採用計画",
    description: "トヨタ自動車はソフトウェア定義型自動車(SDV)の開発加速に向け、2026年までにソフトウェアエンジニアを5000人採用する計画を発表。SES企業を含む外部リソースの活用も検討しており、自動車×ITの人材需要が急拡大する見通し。",
    url: "https://example.com/news/6",
    urlToImage: null,
    source: { name: "自動車新聞" },
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    category: "自動車 / DX",
    emoji: "🚗"
  },
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  setDate();
  loadKeys();

  if (!STATE.claudeKey) {
    showApiModal();
  } else {
    initApp();
  }

  // Event listeners
  document.getElementById('saveApiBtn').addEventListener('click', saveKeys);
  document.getElementById('settingsBtn').addEventListener('click', showApiModal);
  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  document.getElementById('refreshAiNews').addEventListener('click', loadAiPickup);
  document.getElementById('closeAnalysis').addEventListener('click', closeAnalysisModal);
  document.getElementById('analysisModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('analysisModal')) closeAnalysisModal();
  });

  document.querySelectorAll('.quick-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('searchInput').value = btn.dataset.q;
      handleSearch();
    });
  });
});

function setDate() {
  const el = document.getElementById('headerDate');
  const now = new Date();
  const opts = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
  el.textContent = now.toLocaleDateString('ja-JP', opts);
}

function loadKeys() {
  STATE.claudeKey = localStorage.getItem('ses_claude_key') || '';
  STATE.newsKey = localStorage.getItem('ses_news_key') || '';
  if (STATE.claudeKey) document.getElementById('claudeKeyInput').value = STATE.claudeKey;
  if (STATE.newsKey) document.getElementById('newsKeyInput').value = STATE.newsKey;
}

function saveKeys() {
  const ck = document.getElementById('claudeKeyInput').value.trim();
  const nk = document.getElementById('newsKeyInput').value.trim();
  if (!ck) { alert('Claude APIキーを入力してください'); return; }
  STATE.claudeKey = ck;
  STATE.newsKey = nk;
  localStorage.setItem('ses_claude_key', ck);
  if (nk) localStorage.setItem('ses_news_key', nk);
  document.getElementById('apiModal').classList.add('hidden');
  initApp();
}

function showApiModal() {
  document.getElementById('apiModal').classList.remove('hidden');
}

async function initApp() {
  await Promise.all([
    loadAiPickup(),
    generateTodayTopics(),
  ]);
}

// ===== NEWS FETCH =====
async function fetchNews(query) {
  if (!STATE.newsKey) {
    // フィルタリングしてデモデータ返す
    const q = query.toLowerCase();
    return DEMO_NEWS.filter(n =>
      !query ||
      n.title.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q)
    ).slice(0, 6);
  }

  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=jp&sortBy=publishedAt&pageSize=10&apiKey=${STATE.newsKey}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.status !== 'ok' || !data.articles?.length) return DEMO_NEWS.slice(0, 4);
    return data.articles;
  } catch {
    return DEMO_NEWS.slice(0, 4);
  }
}

// ===== AI PICKUP =====
async function loadAiPickup() {
  const grid = document.getElementById('aiNewsGrid');
  grid.innerHTML = '<div class="card skeleton-card"></div><div class="card skeleton-card"></div><div class="card skeleton-card"></div>';

  const queries = ['IT DX AI 2025', '生保 金融 システム', '製造業 電力 デジタル'];
  const q = queries[Math.floor(Math.random() * queries.length)];
  const articles = STATE.newsKey
    ? await fetchNews(q)
    : DEMO_NEWS;

  STATE.aiArticles = articles;
  grid.innerHTML = '';

  articles.slice(0, 6).forEach((article, i) => {
    const card = createCard(article, true, i);
    grid.appendChild(card);
  });
}

// ===== USER SEARCH =====
async function handleSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;

  const grid = document.getElementById('searchNewsGrid');
  grid.innerHTML = '<div class="card skeleton-card"></div><div class="card skeleton-card"></div><div class="card skeleton-card"></div>';

  const articles = await fetchNews(q);
  STATE.searchArticles = articles;
  grid.innerHTML = '';

  if (!articles.length) {
    grid.innerHTML = `<div class="empty-state"><span class="empty-icon">🔍</span><p>「${q}」に関するニュースが見つかりませんでした。</p></div>`;
    return;
  }

  articles.slice(0, 8).forEach((article, i) => {
    const card = createCard(article, false, i);
    grid.appendChild(card);
  });
}

// ===== CREATE CARD =====
function createCard(article, isAi, index) {
  const card = document.createElement('div');
  card.className = 'card new';
  card.style.animationDelay = `${index * 0.06}s`;

  const title = article.title || 'タイトルなし';
  const desc = article.description || '内容なし';
  const source = article.source?.name || 'Unknown';
  const emoji = article.emoji || '📰';
  const category = article.category || 'IT / ニュース';
  const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ja-JP') : '';

  card.innerHTML = `
    ${article.urlToImage
      ? `<img class="card-img" src="${article.urlToImage}" alt="" onerror="this.style.display='none'" loading="lazy"/>`
      : `<div class="card-img-placeholder">${emoji}</div>`
    }
    <div class="card-body">
      ${isAi ? `<div class="ai-badge">AI PICKUP</div>` : ''}
      <div class="card-category">${category}</div>
      <div class="card-title">${title}</div>
      <div class="card-summary">${desc}</div>
      <div class="card-footer">
        <span class="card-source">📰 ${source} · ${date}</span>
        <span class="card-action">影響分析を見る →</span>
      </div>
    </div>
  `;

  card.addEventListener('click', () => openAnalysis(article));
  return card;
}

// ===== TODAY'S TOPICS =====
async function generateTodayTopics() {
  const chips = document.getElementById('topicChips');

  try {
    const prompt = `あなたはSES（システムエンジニアリングサービス）企業の営業責任者のアシスタントです。
今日の日付: ${new Date().toLocaleDateString('ja-JP')}

今日の営業で話せそうな旬のトピックを3つ、日本語で生成してください。
IT、AI、DX、金融、生保、製造業、電力などに関連するものを優先してください。

以下のJSONのみで返してください（他のテキスト不要）:
{"topics": ["トピック1（10字以内）", "トピック2（10字以内）", "トピック3（10字以内）"]}`;

    const response = await callClaude(prompt, 150);
    const json = JSON.parse(response.replace(/```json|```/g, '').trim());

    chips.innerHTML = '';
    (json.topics || []).forEach(topic => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = topic;
      chips.appendChild(chip);
    });
  } catch {
    chips.innerHTML = `
      <span class="chip">金融DX加速</span>
      <span class="chip">AIコード生成</span>
      <span class="chip">SIer再編</span>
    `;
  }
}

// ===== ANALYSIS MODAL =====
async function openAnalysis(article) {
  const modal = document.getElementById('analysisModal');
  const content = document.getElementById('analysisContent');
  modal.classList.remove('hidden');

  content.innerHTML = `
    <div class="analysis-loading">
      <div class="spinner"></div>
      <p>AI分析中... しばらくお待ちください</p>
    </div>
  `;

  const title = article.title || '';
  const desc = article.description || '';
  const source = article.source?.name || '';

  const prompt = `あなたはSES（システムエンジニアリングサービス）企業の営業戦略アドバイザーです。
以下のニュース記事を分析し、営業活動に役立つインサイトを提供してください。

【記事タイトル】${title}
【記事概要】${desc}
【出典】${source}

以下の構造でJSONのみを返してください（他のテキスト・マークダウン不要）:

{
  "summary": "記事の要約（3〜4文）",
  "industry_impacts": [
    {"name": "金融", "impact": "影響の説明（2文以内）"},
    {"name": "生保", "impact": "影響の説明（2文以内）"},
    {"name": "製造", "impact": "影響の説明（2文以内）"},
    {"name": "電力・ガス", "impact": "影響の説明（2文以内）"}
  ],
  "it_impact": "IT業界・DX・AIへの影響（3〜4文）",
  "ses_impact": "SES業界への影響（案件増減、システム刷新、AI導入、エンジニア需要の観点で3〜5文）",
  "sales_talks": [
    "営業トーク例1（20〜40字の自然な会話形式）",
    "営業トーク例2（20〜40字の自然な会話形式）",
    "営業トーク例3（20〜40字の自然な会話形式）"
  ],
  "future_prediction": "2〜3年後のIT業界・SIerへの影響予測（4〜5文）"
}`;

  try {
    const raw = await callClaude(prompt, 1500);
    const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
    renderAnalysis(content, article, json);
  } catch (err) {
    content.innerHTML = `
      <div class="error-state">
        <strong>AI分析に失敗しました</strong><br>
        APIキーを確認するか、しばらく後に再試行してください。<br>
        <small>${err.message}</small>
      </div>
    `;
  }
}

function renderAnalysis(container, article, data) {
  const title = article.title || '';
  const source = article.source?.name || '';

  container.innerHTML = `
    <div class="analysis-header">
      <div class="analysis-title">${title}</div>
      <div class="analysis-source">📰 ${source}</div>
    </div>

    <div class="analysis-section">
      <div class="analysis-section-label"><span class="num">①</span> ニュース要約</div>
      <p>${data.summary || ''}</p>
    </div>

    <div class="analysis-section">
      <div class="analysis-section-label"><span class="num">②</span> 業界への影響</div>
      <div class="section-impact-grid">
        ${(data.industry_impacts || []).map(i => `
          <div class="industry-chip">
            <div class="name">🏷 ${i.name}</div>
            <div class="detail">${i.impact}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="analysis-section">
      <div class="analysis-section-label"><span class="num">③</span> IT業界への影響</div>
      <p>${data.it_impact || ''}</p>
    </div>

    <div class="analysis-section">
      <div class="analysis-section-label"><span class="num">④</span> SES業界への影響</div>
      <p>${data.ses_impact || ''}</p>
    </div>

    <div class="analysis-section">
      <div class="analysis-section-label"><span class="num">⑤</span> 営業トーク例</div>
      ${(data.sales_talks || []).map(t => `<div class="talk-example">💬 ${t}</div>`).join('')}
    </div>

    <div class="analysis-section">
      <div class="analysis-section-label"><span class="num">⑥</span> 将来予測（2〜3年後）</div>
      <div class="future-box">🔮 ${data.future_prediction || ''}</div>
    </div>
  `;
}

function closeAnalysisModal() {
  document.getElementById('analysisModal').classList.add('hidden');
}

// ===== CLAUDE API CALL =====
async function callClaude(prompt, maxTokens = 1000) {
  if (!STATE.claudeKey) throw new Error('APIキーが設定されていません');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': STATE.claudeKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.content.map(b => b.text || '').join('');
}

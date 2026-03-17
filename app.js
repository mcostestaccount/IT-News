// ========================================
// SES Intelligence Tool — app.js
// AI: OpenRouter (完全無料・クレカ不要)
// News: GNews API (無料100件/日)
// ========================================

const STATE = {
  openrouterKey: '',
  newsKey: '',
};

// ===== デモニュースデータ（GNews APIなし時のフォールバック） =====
const DEMO_NEWS = [
  {
    title: "三菱UFJ銀行、生成AI活用で融資審査を自動化へ — 2025年度中に本格導入",
    description: "三菱UFJ銀行は生成AIを活用した融資審査システムの本格導入を発表。従来比で審査時間を70%短縮できるとし、中小企業向け融資の拡大を見込む。システム開発にはNTTデータと富士通が参画する見通し。",
    url: "https://example.com/news/1", urlToImage: null,
    source: { name: "日経新聞" }, publishedAt: new Date().toISOString(),
    category: "金融 / AI", emoji: "🏦"
  },
  {
    title: "経済産業省、DX推進指標を改定 — SIerへの影響が拡大",
    description: "経済産業省はDX推進指標を全面改定し、企業のDX成熟度評価方法を刷新する。特にSIerの役割を「開発ベンダー」から「変革パートナー」へ位置づけることを推奨し、ビジネスモデル転換が加速する見込みだ。",
    url: "https://example.com/news/2", urlToImage: null,
    source: { name: "IT media" }, publishedAt: new Date(Date.now() - 3600000).toISOString(),
    category: "DX / 政策", emoji: "📊"
  },
  {
    title: "日本生命、基幹システム刷新プロジェクトに約500億円投資 — クラウド移行を加速",
    description: "日本生命保険は老朽化した基幹システムの全面刷新を決定。AWS/Azureへのクラウド移行を中心に約500億円を投資し、2027年度までの完了を目指す。NTTデータ、日立製作所などが受注競争に参入している。",
    url: "https://example.com/news/3", urlToImage: null,
    source: { name: "日本経済新聞" }, publishedAt: new Date(Date.now() - 7200000).toISOString(),
    category: "生保 / クラウド", emoji: "🏢"
  },
  {
    title: "GitHub Copilot採用企業が国内で急増 — エンジニア生産性40%向上の報告も",
    description: "GitHub Copilotの国内採用企業が急増し、大手SIerを中心に開発生産性の向上報告が相次いでいる。一方でAI活用スキルを持つエンジニアの不足が深刻化しており、人材獲得競争が激化している。",
    url: "https://example.com/news/4", urlToImage: null,
    source: { name: "TechCrunch Japan" }, publishedAt: new Date(Date.now() - 10800000).toISOString(),
    category: "AI / 開発", emoji: "💻"
  },
  {
    title: "東京電力HD、スマートグリッド整備にAI活用 — 電力需給予測システムを刷新",
    description: "東京電力ホールディングスは電力需給予測にAIを活用した新システムの導入を開始。再生可能エネルギーの出力変動への対応力を高め、2025年度中に全エリアへの展開を予定。システム開発は日立製作所が担当する。",
    url: "https://example.com/news/5", urlToImage: null,
    source: { name: "電気新聞" }, publishedAt: new Date(Date.now() - 14400000).toISOString(),
    category: "電力 / AI", emoji: "⚡"
  },
  {
    title: "トヨタ自動車、SDV開発加速でソフトウェアエンジニアを5000人採用計画",
    description: "トヨタ自動車はソフトウェア定義型自動車(SDV)の開発加速に向け、2026年までにソフトウェアエンジニアを5000人採用する計画を発表。SES企業を含む外部リソースの活用も検討しており、自動車×ITの人材需要が急拡大する見通し。",
    url: "https://example.com/news/6", urlToImage: null,
    source: { name: "自動車新聞" }, publishedAt: new Date(Date.now() - 18000000).toISOString(),
    category: "自動車 / DX", emoji: "🚗"
  },
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  setDate();
  loadKeys();

  if (!STATE.openrouterKey) {
    showApiModal();
  } else {
    initApp();
  }

  // Listeners
  document.getElementById('saveApiBtn').addEventListener('click', saveKeys);
  document.getElementById('settingsBtn').addEventListener('click', showApiModal);
  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });
  document.getElementById('refreshAiNews').addEventListener('click', loadAiPickup);
  document.getElementById('closeAnalysis').addEventListener('click', closeAnalysisModal);
  document.getElementById('analysisModal').addEventListener('click', e => {
    if (e.target === document.getElementById('analysisModal')) closeAnalysisModal();
  });
  document.querySelectorAll('.quick-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('searchInput').value = btn.dataset.q;
      handleSearch();
    });
  });

  // 👁 目玉ボタン
  document.querySelectorAll('.btn-toggle-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
});

function setDate() {
  const el = document.getElementById('headerDate');
  el.textContent = new Date().toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric', weekday:'short' });
}

function loadKeys() {
  STATE.openrouterKey = localStorage.getItem('ses_openrouter_key') || '';
  STATE.newsKey       = localStorage.getItem('ses_news_key') || '';
  if (STATE.openrouterKey) document.getElementById('openrouterKeyInput').value = STATE.openrouterKey;
  if (STATE.newsKey)       document.getElementById('newsKeyInput').value = STATE.newsKey;
}

function saveKeys() {
  const ok = document.getElementById('openrouterKeyInput').value.trim();
  const nk = document.getElementById('newsKeyInput').value.trim();
  if (!ok) { alert('OpenRouter APIキーを入力してください'); return; }
  STATE.openrouterKey = ok;
  STATE.newsKey = nk;
  localStorage.setItem('ses_openrouter_key', ok);
  if (nk) localStorage.setItem('ses_news_key', nk);
  document.getElementById('apiModal').classList.add('hidden');
  initApp();
}

function showApiModal() {
  document.getElementById('apiModal').classList.remove('hidden');
}

async function initApp() {
  loadAiPickup();
  generateTodayTopics();
}

// ===== NEWS FETCH =====
async function fetchNews(query) {
  if (!STATE.newsKey) {
    const q = query.toLowerCase();
    const filtered = DEMO_NEWS.filter(n =>
      !query || n.title.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)
    );
    return (filtered.length ? filtered : DEMO_NEWS).slice(0, 6);
  }
  try {
    // GNews API — CORS対応・無料・クレカ不要
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=ja&country=jp&max=10&apikey=${STATE.newsKey}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (!data.articles?.length) return DEMO_NEWS.slice(0, 4);
    return data.articles.map(a => ({
      title: a.title, description: a.description, url: a.url,
      urlToImage: a.image, source: { name: a.source?.name || 'GNews' },
      publishedAt: a.publishedAt,
    }));
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
  const articles = STATE.newsKey ? await fetchNews(q) : DEMO_NEWS;
  grid.innerHTML = '';
  articles.slice(0, 6).forEach((a, i) => grid.appendChild(createCard(a, true, i)));
}

// ===== USER SEARCH =====
async function handleSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  const grid = document.getElementById('searchNewsGrid');
  grid.innerHTML = '<div class="card skeleton-card"></div><div class="card skeleton-card"></div><div class="card skeleton-card"></div>';
  const articles = await fetchNews(q);
  grid.innerHTML = '';
  if (!articles.length) {
    grid.innerHTML = `<div class="empty-state"><span class="empty-icon">🔍</span><p>「${q}」に関するニュースが見つかりませんでした。</p></div>`;
    return;
  }
  articles.slice(0, 8).forEach((a, i) => grid.appendChild(createCard(a, false, i)));
}

// ===== CREATE CARD =====
function createCard(article, isAi, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.animationDelay = `${index * 0.06}s`;
  const title    = article.title || 'タイトルなし';
  const desc     = article.description || '';
  const source   = article.source?.name || '';
  const emoji    = article.emoji || '📰';
  const category = article.category || 'IT / ニュース';
  const date     = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ja-JP') : '';
  card.innerHTML = `
    ${article.urlToImage
      ? `<img class="card-img" src="${article.urlToImage}" alt="" onerror="this.style.display='none'" loading="lazy"/>`
      : `<div class="card-img-placeholder">${emoji}</div>`}
    <div class="card-body">
      ${isAi ? `<div class="ai-badge">AI PICKUP</div>` : ''}
      <div class="card-category">${category}</div>
      <div class="card-title">${title}</div>
      <div class="card-summary">${desc}</div>
      <div class="card-footer">
        <span class="card-source">📰 ${source}${date ? ' · ' + date : ''}</span>
        <span class="card-action">影響分析を見る →</span>
      </div>
    </div>`;
  card.addEventListener('click', () => openAnalysis(article));
  return card;
}

// ===== TODAY TOPICS =====
async function generateTodayTopics() {
  const chips = document.getElementById('topicChips');
  try {
    const prompt = `あなたはSES企業の営業責任者のアシスタントです。
今日（${new Date().toLocaleDateString('ja-JP')}）の営業で話せる旬のトピックを3つ、日本語で生成してください。
IT・AI・DX・金融・生保・製造業・電力などに関連するものを優先してください。
JSONのみ返してください（他テキスト不要）:
{"topics": ["トピック1（10字以内）", "トピック2（10字以内）", "トピック3（10字以内）"]}`;
    const raw  = await callAI(prompt, 200);
    const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
    chips.innerHTML = '';
    (json.topics || []).forEach(t => {
      const span = document.createElement('span');
      span.className = 'chip'; span.textContent = t;
      chips.appendChild(span);
    });
  } catch {
    chips.innerHTML = `<span class="chip">金融DX加速</span><span class="chip">AIコード生成</span><span class="chip">SIer再編</span>`;
  }
}

// ===== ANALYSIS MODAL =====
async function openAnalysis(article) {
  const modal   = document.getElementById('analysisModal');
  const content = document.getElementById('analysisContent');
  modal.classList.remove('hidden');
  content.innerHTML = `<div class="analysis-loading"><div class="spinner"></div><p>AI分析中... しばらくお待ちください</p></div>`;

  const prompt = `あなたはSES（システムエンジニアリングサービス）企業の営業戦略アドバイザーです。
以下のニュース記事を分析し、SES営業に役立つインサイトを提供してください。

【記事タイトル】${article.title || ''}
【記事概要】${article.description || ''}
【出典】${article.source?.name || ''}

以下の構造でJSONのみを返してください（他テキスト・マークダウン不要）:
{
  "summary": "記事の要約（3〜4文）",
  "industry_impacts": [
    {"name": "金融", "impact": "影響の説明（2文以内）"},
    {"name": "生保", "impact": "影響の説明（2文以内）"},
    {"name": "製造", "impact": "影響の説明（2文以内）"},
    {"name": "電力・ガス", "impact": "影響の説明（2文以内）"}
  ],
  "it_impact": "IT業界・DX・AIへの影響（3〜4文）",
  "ses_impact": "SES業界への影響（案件増減・システム刷新・AI導入・エンジニア需要の観点で3〜5文）",
  "sales_talks": [
    "営業トーク例1（20〜40字の自然な会話形式）",
    "営業トーク例2（20〜40字の自然な会話形式）",
    "営業トーク例3（20〜40字の自然な会話形式）"
  ],
  "future_prediction": "2〜3年後のIT業界・SIerへの影響予測（4〜5文）"
}`;

  try {
    const raw  = await callAI(prompt, 1500);
    const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
    renderAnalysis(content, article, json);
  } catch (err) {
    content.innerHTML = `<div class="error-state"><strong>AI分析に失敗しました</strong><br>APIキーを確認するか、しばらく後に再試行してください。<br><small>${err.message}</small></div>`;
  }
}

function renderAnalysis(container, article, data) {
  container.innerHTML = `
    <div class="analysis-header">
      <div class="analysis-title">${article.title || ''}</div>
      <div class="analysis-source">📰 ${article.source?.name || ''}</div>
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
          </div>`).join('')}
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
    </div>`;
}

function closeAnalysisModal() {
  document.getElementById('analysisModal').classList.add('hidden');
}

// ===== OPENROUTER API =====
// 完全無料・クレカ不要
// 使用モデル: deepseek/deepseek-chat-v3-0324:free (高品質・無料)
// フォールバック: meta-llama/llama-4-scout:free
async function callAI(prompt, maxTokens = 1000) {
  if (!STATE.openrouterKey) throw new Error('OpenRouter APIキーが設定されていません');

  const models = [
    'deepseek/deepseek-chat-v3-0324:free',
    'meta-llama/llama-4-scout:free',
    'google/gemma-3-27b-it:free',
  ];

  let lastError;
  for (const model of models) {
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STATE.openrouterKey}`,
          'HTTP-Referer': window.location.href,
          'X-Title': 'SES Intelligence Tool',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        // レート制限の場合は次モデルへ
        if (resp.status === 429) { lastError = new Error('レート制限中'); continue; }
        throw new Error(err.error?.message || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (e) {
      lastError = e;
      if (!e.message.includes('レート制限')) throw e; // 429以外はすぐ投げる
    }
  }
  throw lastError || new Error('全モデルが使用できませんでした');
}

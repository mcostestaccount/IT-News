// ================================================
// SES Intelligence Tool — app.js
// APIキー不要・完全無料版
// ニュース: RSS → rss2json.com (無料・CORS対応)
// AI分析:  ルールベースエンジン（キーワード解析）
// ================================================

// ===== RSSソース定義 =====
const RSS_SOURCES = {
  it: [
    { name:'ITmedia NEWS',   url:'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml',    emoji:'💻' },
    { name:'ZDNet Japan',    url:'https://japan.zdnet.com/index.rdf',                     emoji:'🖥' },
    { name:'@IT',            url:'https://rss.itmedia.co.jp/rss/2.0/ait.xml',             emoji:'⚙' },
    { name:'TechCrunch JP',  url:'https://jp.techcrunch.com/feed/',                       emoji:'🚀' },
  ],
  finance: [
    { name:'FinTech Journal',url:'https://www.financialtechnology.co.jp/feed/',            emoji:'🏦' },
    { name:'ITmedia FinTech',url:'https://rss.itmedia.co.jp/rss/2.0/pcuser.xml',          emoji:'💳' },
    { name:'日経 金融',      url:'https://www.nikkei.com/rss/finance.rdf',                emoji:'📈' },
  ],
  mfg: [
    { name:'MONOist',        url:'https://rss.itmedia.co.jp/rss/2.0/monoist.xml',         emoji:'🏭' },
    { name:'スマートジャパン',url:'https://rss.itmedia.co.jp/rss/2.0/smartjapan.xml',     emoji:'⚡' },
    { name:'EE Times JP',    url:'https://eetimes.itmedia.co.jp/index.rdf',               emoji:'🔌' },
  ],
  dx: [
    { name:'EnterpriseZine', url:'https://enterprisezine.jp/rss/20',                      emoji:'🔄' },
    { name:'IT Leaders',     url:'https://it.impressbm.co.jp/rss/20',                     emoji:'📊' },
    { name:'BCN+R',          url:'https://www.bcnretail.com/rss/news.xml',                emoji:'🧩' },
  ],
};

// rss2json.com — 無料・CORS対応・APIキー不要（1日150件まで）
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

// ===== SES向けキーワード分析エンジン =====
const KEYWORD_DB = {
  finance:    ['銀行','金融','証券','保険','生命保険','損保','フィンテック','FinTech','SWIFT','決済','送金','融資','ローン','資産','投資','株','為替','信託','信金','信組','メガバンク','みずほ','三菱UFJ','三井住友','りそな','第一生命','日本生命','住友生命','明治安田','東京海上','損保ジャパン'],
  mfg:        ['製造','工場','生産','自動車','トヨタ','ホンダ','日産','電力','東電','関電','中電','東北電','九電','ガス','東ガス','大ガス','鉄鋼','化学','素材','半導体','電機','パナソニック','ソニー','日立','東芝','富士通','NEC','三菱電機','川崎重工','IHI','重工'],
  dx:         ['DX','デジタルトランスフォーメーション','AI','人工知能','機械学習','ディープラーニング','ChatGPT','生成AI','クラウド','AWS','Azure','GCP','IoT','ビッグデータ','データ分析','RPA','自動化','デジタル化','システム刷新','モダナイゼーション','マイグレーション'],
  ses:        ['SIer','SES','システム開発','エンジニア','SE','ITエンジニア','アウトソーシング','派遣','受託','オフショア','アジャイル','DevOps','スクラム','PMO','プロジェクトマネジメント','要件定義','保守運用'],
  risk:       ['サイバー','セキュリティ','情報漏洩','ランサムウェア','不正アクセス','脆弱性','インシデント','コンプライアンス','規制','法改正','GDPR','個人情報'],
  infra:      ['クラウド','サーバー','ネットワーク','インフラ','データセンター','マルチクラウド','ハイブリッドクラウド','コンテナ','Kubernetes','Docker','マイクロサービス'],
};

// スコアリング：記事タイトル＋本文から業界関連度を数値化
function scoreArticle(text) {
  const t = text.toLowerCase();
  const scores = {};
  for (const [cat, words] of Object.entries(KEYWORD_DB)) {
    scores[cat] = words.filter(w => t.includes(w.toLowerCase())).length;
  }
  return scores;
}

// タグ生成
function getTags(scores) {
  const map = { finance:'金融・生保', mfg:'製造・電力', dx:'DX・AI', ses:'SIer・SES', risk:'セキュリティ', infra:'インフラ' };
  return Object.entries(scores)
    .filter(([,v]) => v > 0)
    .sort((a,b) => b[1]-a[1])
    .slice(0,3)
    .map(([k]) => map[k] || k);
}

// ===== ルールベースAI分析エンジン =====
function generateAnalysis(article) {
  const text   = (article.title + ' ' + article.description).replace(/<[^>]+>/g,'');
  const scores = scoreArticle(text);
  const title  = article.title || '';

  // ──① 要約──
  const summary = buildSummary(text, title);

  // ──② 業界への影響──
  const industryImpacts = buildIndustryImpacts(text, scores);

  // ──③ IT業界への影響──
  const itImpact = buildItImpact(text, scores);

  // ──④ SES業界への影響──
  const sesImpact = buildSesImpact(text, scores);

  // ──⑤ 営業トーク例──
  const salesTalks = buildSalesTalks(text, scores, title);

  // ──⑥ 将来予測──
  const futurePrediction = buildFuture(text, scores);

  return { summary, industryImpacts, itImpact, sesImpact, salesTalks, futurePrediction };
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function buildSummary(text, title) {
  const hasDX    = /DX|デジタル|AI|人工知能|クラウド/.test(text);
  const hasInvest= /投資|億円|整備|刷新|構築|導入|採用/.test(text);
  const hasEngineer = /エンジニア|開発者|SE|人材/.test(text);

  let s = `このニュースは、${title.slice(0,30)}に関する動向を伝えています。`;
  if (hasDX)     s += '特にデジタル技術・AI活用が注目される内容で、業界全体のDX推進に関係しています。';
  if (hasInvest) s += 'システム投資・整備への動きが含まれており、ITベンダーへの需要拡大が見込まれます。';
  if (hasEngineer) s += 'エンジニア・人材に関する話題も含まれ、SES業界の案件動向に直結します。';
  return s;
}

function buildIndustryImpacts(text, scores) {
  const industries = [
    {
      name: '金融・銀行',
      score: scores.finance,
      high: 'DX投資が活発化しており、基幹システム刷新・クラウド移行案件の増加が見込まれます。特にAPI連携やセキュリティ強化への需要が高まっています。',
      mid:  'フィンテックの波及により、既存業務のデジタル化ニーズが顕在化しつつあります。',
      low:  '直接的な影響は限定的ですが、業界横断的なDX促進の流れの一部です。',
    },
    {
      name: '生命保険・損保',
      score: scores.finance,
      high: '契約管理・査定システムの刷新ニーズが高く、クラウド移行プロジェクトが継続的に発生しています。AI活用による業務効率化投資も加速中です。',
      mid:  'デジタル保険商品への対応やモバイルアプリ開発の需要が出てきています。',
      low:  '中長期的に規制対応・コスト削減のためのIT投資が見込まれます。',
    },
    {
      name: '製造・自動車',
      score: scores.mfg,
      high: 'スマートファクトリー・IoT化への投資が加速しており、MES・ERPの刷新案件が増加しています。SDV（ソフトウェア定義型自動車）関連の開発需要も急拡大中です。',
      mid:  'サプライチェーン可視化やEDI刷新へのニーズが高まっています。',
      low:  '省エネ・環境対応のためのシステム整備が中長期的に続く見込みです。',
    },
    {
      name: '電力・ガス',
      score: scores.mfg,
      high: '電力自由化後の競争激化により、スマートグリッド・需給管理システムへの投資が拡大しています。老朽化インフラの刷新案件が相次いで発生しています。',
      mid:  '再生可能エネルギー対応のための制御システム改修ニーズがあります。',
      low:  '規制対応・DX化の流れで段階的なIT投資が続く見込みです。',
    },
  ];

  return industries.map(ind => ({
    name: ind.name,
    impact: ind.score >= 2 ? ind.high : ind.score === 1 ? ind.mid : ind.low,
    level: ind.score >= 2 ? 'high' : ind.score === 1 ? 'mid' : 'low',
  }));
}

function buildItImpact(text, scores) {
  const hasDX    = /DX|デジタル/.test(text);
  const hasAI    = /AI|人工知能|機械学習|生成AI|ChatGPT/.test(text);
  const hasCloud = /クラウド|AWS|Azure|GCP/.test(text);
  const hasInfra = /インフラ|サーバー|ネットワーク|データセンター/.test(text);
  const hasSec   = /セキュリティ|サイバー|不正|漏洩/.test(text);

  const parts = [];
  if (hasAI)    parts.push('AI・機械学習の実装案件が増加しており、AI活用スキルを持つエンジニアの需要が高まっています。');
  if (hasCloud) parts.push('クラウド移行・マルチクラウド管理の案件が継続的に発生しており、クラウドアーキテクト・エンジニアへの需要が旺盛です。');
  if (hasDX)    parts.push('業務システムのDX化・モダナイゼーション需要が加速しており、レガシーシステム刷新プロジェクトが各業界で本格化しています。');
  if (hasSec)   parts.push('セキュリティ強化・ゼロトラスト導入の需要が高まり、セキュリティエンジニアの引き合いが増えています。');
  if (hasInfra) parts.push('インフラ刷新・クラウドネイティブ化の案件が継続発生しており、インフラエンジニアの需要が底堅く推移しています。');

  if (parts.length === 0) {
    parts.push('IT業界全体のデジタル化投資の流れの中で、システム開発・運用保守の需要は引き続き堅調です。業界横断的なDX促進の恩恵を受ける形でIT案件が増加しています。');
  }
  return parts.join('また、');
}

function buildSesImpact(text, scores) {
  const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
  const hasAI    = /AI|人工知能|機械学習|生成AI/.test(text);
  const hasCloud = /クラウド|AWS|Azure/.test(text);
  const hasRefresh = /刷新|リプレイス|移行|構築|再構築|更新/.test(text);
  const hasEngineer = /エンジニア|SE|技術者|人材不足|採用/.test(text);

  let s = '';
  if (hasRefresh) s += '【案件増加】基幹システム刷新・クラウド移行プロジェクトが増加しており、SES企業への引き合いが高まっています。設計〜テスト工程を含む中長期案件が期待できます。';
  if (hasAI)      s += '【AI導入支援】AI・機械学習の実装・運用保守案件が新たに生まれており、AI活用スキルを持つエンジニアの単価上昇と需要増が見込まれます。';
  if (hasCloud)   s += '【クラウド案件】クラウドへの移行・最適化案件が継続発生しています。AWS/Azure認定エンジニアの需要が特に高く、高単価案件の獲得チャンスです。';
  if (hasEngineer)s += '【人材需要】技術者不足が深刻化しており、SES企業へのアウトソーシング需要が拡大しています。顧客との長期パートナーシップ構築の好機です。';

  if (!s) s = '【全体傾向】業界全体のDX化・IT投資拡大の流れの中で、SES企業への案件依頼は引き続き堅調に推移しています。保守運用からDX推進支援へのシフトを意識した営業戦略が有効です。';
  return s;
}

function buildSalesTalks(text, scores, title) {
  const keyword = title.slice(0, 20);
  const hasDX    = /DX|デジタル/.test(text);
  const hasAI    = /AI|人工知能|生成AI/.test(text);
  const hasCloud = /クラウド|AWS|Azure/.test(text);
  const hasInvest= /億円|投資|刷新/.test(text);

  const pool = [
    `「最近、${keyword}の話題が業界でよく出ていますね。御社でも同様のご検討はありますか？」`,
    `「今まさにIT投資が活発な時期で、${hasDX?'DX推進':'システム刷新'}の引き合いが増えています。何かお困りの点はありますか？」`,
    hasAI    ? `「生成AIの活用、御社でも検討されていますか？最近、私どもでも${pick(['PoC支援','実装案件','活用研修'])}のご相談が増えてきまして」` : null,
    hasCloud ? `「クラウド移行の件ですが、エンジニア確保でお困りの企業様が最近多くて。御社の状況はいかがですか？」` : null,
    hasInvest? `「業界全体でIT投資が加速していますね。人手の確保だけでなく、技術力のある会社を探しているとよく聞きます」` : null,
    `「${pick(['金融','製造','電力','生保'])}系のお客様から最近よくご相談いただくのですが、御社もこのあたりの業界への展開はお考えですか？」`,
    `「エンジニア不足が続いていますが、御社の採用状況はいかがですか？もし補強が必要でしたらご相談ください」`,
  ].filter(Boolean);

  // シャッフルして3つ選ぶ
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

function buildFuture(text, scores) {
  const hasAI    = /AI|人工知能|生成AI/.test(text);
  const hasCloud = /クラウド|AWS|Azure/.test(text);
  const hasDX    = /DX|デジタル/.test(text);
  const hasMfg   = scores.mfg >= 2;
  const hasFin   = scores.finance >= 2;

  const parts = [];
  if (hasAI)  parts.push('今後2〜3年でAI活用は「検討フェーズ」から「実装・運用フェーズ」に移行し、AI導入後の保守・改善を担うエンジニア需要が爆発的に拡大するとみられます。');
  if (hasCloud) parts.push('クラウドネイティブ化・マルチクラウド管理の複雑化により、専門スキルを持つインフラエンジニアの単価上昇と長期案件化が進む見通しです。');
  if (hasDX)  parts.push('DX推進の加速によりレガシーシステムの刷新需要が高まり続けており、2〜3年は大型リプレイスプロジェクトが各業界で相次ぐでしょう。SIer・SES企業にとっては大きな商機です。');
  if (hasFin) parts.push('金融・生保業界では規制対応とDXの両立が求められ続けるため、高度なセキュリティ要件を満たせるエンジニアへの引き合いが高水準で推移する見込みです。');
  if (hasMfg) parts.push('製造・電力業界のスマート化投資は今後も継続的に行われ、OTとITを跨ぐ複合スキルを持つエンジニアが希少価値を持つ存在になるでしょう。');

  if (parts.length === 0) {
    parts.push('業界全体のIT化・DX化投資は今後も継続的に拡大する見込みで、SES業界にとっては中長期的に追い風の環境が続くでしょう。特に上流工程（要件定義・設計）を担える人材の希少性がさらに高まると予想されます。');
  }
  return parts.join(' ');
}

// ===== RSS取得 =====
async function fetchRSS(rssUrl) {
  try {
    const url = `${RSS2JSON}${encodeURIComponent(rssUrl)}&count=10`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.status !== 'ok') throw new Error(data.message || 'RSS fetch error');
    return data.items || [];
  } catch (e) {
    console.warn('RSS fetch failed:', rssUrl, e.message);
    return [];
  }
}

async function fetchTabNews(tabKey) {
  const sources = RSS_SOURCES[tabKey] || RSS_SOURCES.it;
  // 複数ソースを並列取得して結合
  const results = await Promise.all(
    sources.map(async src => {
      const items = await fetchRSS(src.url);
      return items.map(item => ({
        title:       item.title || '',
        description: (item.description || item.content || '').replace(/<[^>]+>/g,'').slice(0,160),
        url:         item.link || item.url || '#',
        urlToImage:  item.enclosure?.link || item.thumbnail || null,
        source:      { name: src.name },
        publishedAt: item.pubDate || new Date().toISOString(),
        emoji:       src.emoji,
      }));
    })
  );
  const all = results.flat();
  // SES関連スコアが高い順に並べ替えてから返す
  return all
    .filter(a => a.title.trim())
    .map(a => ({ ...a, _score: Object.values(scoreArticle(a.title + ' ' + a.description)).reduce((s,v)=>s+v,0) }))
    .sort((a,b) => b._score - a._score)
    .slice(0, 12);
}

// キーワード検索：全ソースを横断して検索
async function searchNews(query) {
  const allSources = Object.values(RSS_SOURCES).flat();
  const results = await Promise.all(
    allSources.map(async src => {
      const items = await fetchRSS(src.url);
      return items.map(item => ({
        title:       item.title || '',
        description: (item.description || item.content || '').replace(/<[^>]+>/g,'').slice(0,160),
        url:         item.link || item.url || '#',
        urlToImage:  item.enclosure?.link || item.thumbnail || null,
        source:      { name: src.name },
        publishedAt: item.pubDate || new Date().toISOString(),
        emoji:       src.emoji,
      }));
    })
  );
  const q = query.toLowerCase();
  return results.flat()
    .filter(a => a.title && (a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)))
    .slice(0, 10);
}

// ===== CARD生成 =====
function createCard(article, index = 0) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.animationDelay = `${index * 0.055}s`;

  const title   = article.title || 'タイトルなし';
  const desc    = article.description || '';
  const srcName = article.source?.name || '';
  const emoji   = article.emoji || '📰';
  const date    = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('ja-JP', {month:'numeric',day:'numeric'})
    : '';
  const scores  = scoreArticle(title + ' ' + desc);
  const tags    = getTags(scores);

  card.innerHTML = `
    ${article.urlToImage
      ? `<img class="card-img" src="${article.urlToImage}" alt="" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="card-img-ph">${emoji}</div>`}
    <div class="card-body">
      <div class="card-meta">
        <span class="card-source-badge">${srcName}</span>
        <span class="card-date">${date}</span>
      </div>
      <div class="card-title">${title}</div>
      <div class="card-summary">${desc || '記事の詳細はリンクよりご確認ください。'}</div>
      <div class="card-footer">
        <div class="card-tags">${tags.map(t=>`<span class="card-tag">${t}</span>`).join('')}</div>
        <span class="card-action">影響分析 →</span>
      </div>
    </div>`;

  card.addEventListener('click', () => openAnalysis(article));
  return card;
}

// ===== 分析モーダル =====
function openAnalysis(article) {
  const modal   = document.getElementById('analysisModal');
  const content = document.getElementById('analysisContent');
  modal.classList.remove('hidden');

  content.innerHTML = `<div class="analysis-loading"><div class="spinner"></div><p>記事を分析中...</p></div>`;

  // 非同期っぽく見せるため少し遅延
  setTimeout(() => {
    const data = generateAnalysis(article);
    renderAnalysis(content, article, data);
  }, 600);
}

function renderAnalysis(container, article, d) {
  const levelLabel = l => l === 'high' ? '<span class="impact-level impact-high">影響大</span>'
                       : l === 'mid'  ? '<span class="impact-level impact-mid">影響中</span>'
                       :                '<span class="impact-level impact-low">影響小</span>';
  container.innerHTML = `
    <div class="analysis-header">
      <div class="analysis-title">${article.title || ''}</div>
      <div class="analysis-source">📰 ${article.source?.name || ''} &nbsp;·&nbsp; <a href="${article.url}" target="_blank" rel="noopener" style="color:var(--accent)">記事を開く ↗</a></div>
    </div>

    <div class="analysis-section">
      <div class="section-label"><span class="num">①</span>ニュース要約</div>
      <p>${d.summary}</p>
    </div>

    <div class="analysis-section">
      <div class="section-label"><span class="num">②</span>業界への影響</div>
      <div class="impact-grid">
        ${d.industryImpacts.map(i => `
          <div class="industry-chip">
            <div class="name">🏷 ${i.name} ${levelLabel(i.level)}</div>
            <div class="detail">${i.impact}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="analysis-section">
      <div class="section-label"><span class="num">③</span>IT業界への影響</div>
      <p>${d.itImpact}</p>
    </div>

    <div class="analysis-section">
      <div class="section-label"><span class="num">④</span>SES業界への影響</div>
      <p>${d.sesImpact}</p>
    </div>

    <div class="analysis-section">
      <div class="section-label"><span class="num">⑤</span>営業トーク例</div>
      ${d.salesTalks.map(t => `<div class="talk-box">💬 ${t}</div>`).join('')}
    </div>

    <div class="analysis-section">
      <div class="section-label"><span class="num">⑥</span>将来予測（2〜3年後）</div>
      <div class="future-box">🔮 ${d.futurePrediction}</div>
    </div>`;
}

function closeAnalysisModal() {
  document.getElementById('analysisModal').classList.add('hidden');
}

// ===== 今日の営業ネタ =====
function generateTodayTopics() {
  const today = new Date();
  const seed  = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
  const pool  = [
    '金融DX加速','生成AI実装','SIer再編','クラウド移行','スマート工場',
    'セキュリティ強化','電力デジタル化','自動車OTA','保険システム刷新','AI人材不足',
    'レガシー刷新','基幹システムPJ','エンジニア単価上昇','ゼロトラスト','データ活用',
  ];
  // 日付ベースで3つ固定選択（毎日変わる）
  const idx = seed % pool.length;
  const picks = [pool[idx % pool.length], pool[(idx+5) % pool.length], pool[(idx+9) % pool.length]];
  const chips = document.getElementById('topicChips');
  chips.innerHTML = picks.map(p => `<span class="chip">${p}</span>`).join('');
}

// ===== 左パネル更新 =====
let currentTab = 'it';
async function loadLeftPanel(tabKey = currentTab) {
  currentTab = tabKey;
  const grid = document.getElementById('aiNewsGrid');
  grid.innerHTML = '<div class="card skeleton-card"></div><div class="card skeleton-card"></div><div class="card skeleton-card"></div>';

  const articles = await fetchTabNews(tabKey);
  grid.innerHTML = '';

  if (!articles.length) {
    grid.innerHTML = `<div class="fetch-error">ニュースの取得に失敗しました。しばらく後に更新ボタンを押してください。</div>`;
    return;
  }
  articles.forEach((a, i) => grid.appendChild(createCard(a, i)));
}

// ===== 検索 =====
async function handleSearch() {
  const q    = document.getElementById('searchInput').value.trim();
  if (!q) return;
  const grid = document.getElementById('searchNewsGrid');
  grid.innerHTML = '<div class="card skeleton-card"></div><div class="card skeleton-card"></div><div class="card skeleton-card"></div>';

  const articles = await searchNews(q);
  grid.innerHTML = '';
  if (!articles.length) {
    grid.innerHTML = `<div class="empty-state"><span class="empty-icon">🔍</span><p>「${q}」に関するニュースが見つかりませんでした。<br>別のキーワードをお試しください。</p></div>`;
    return;
  }
  articles.forEach((a, i) => grid.appendChild(createCard(a, i)));
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // 日付
  document.getElementById('headerDate').textContent =
    new Date().toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric', weekday:'short' });

  generateTodayTopics();
  loadLeftPanel('it');

  // タブ
  document.getElementById('sourceTabs').addEventListener('click', e => {
    const btn = e.target.closest('.stab');
    if (!btn) return;
    document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadLeftPanel(btn.dataset.src);
  });

  // 検索
  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });
  document.querySelectorAll('.quick-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('searchInput').value = btn.dataset.q;
      handleSearch();
    });
  });

  // 更新
  document.getElementById('refreshLeft').addEventListener('click', () => loadLeftPanel(currentTab));
  document.getElementById('refreshAll').addEventListener('click', () => {
    loadLeftPanel(currentTab);
    generateTodayTopics();
  });

  // モーダル
  document.getElementById('closeAnalysis').addEventListener('click', closeAnalysisModal);
  document.getElementById('analysisModal').addEventListener('click', e => {
    if (e.target === document.getElementById('analysisModal')) closeAnalysisModal();
  });
});

// ================================================
// SES Intelligence Tool — app.js  v3
// APIキー完全不要版
// ニュース: RSS → rss2json.com (無料・CORS対応)
// 分析: コンテキスト推論エンジン（多段階シナリオ生成）
// ================================================

// ===== RSSソース =====
const RSS_SOURCES = {
  it: [
    { name:'ITmedia NEWS',    url:'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml', emoji:'💻' },
    { name:'ZDNet Japan',     url:'https://japan.zdnet.com/index.rdf',                 emoji:'🖥' },
    { name:'@IT',             url:'https://rss.itmedia.co.jp/rss/2.0/ait.xml',         emoji:'⚙' },
    { name:'EnterpriseZine',  url:'https://enterprisezine.jp/rss/20',                  emoji:'📊' },
  ],
  finance: [
    { name:'ITmedia NEWS',    url:'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml', emoji:'🏦' },
    { name:'ZDNet Japan',     url:'https://japan.zdnet.com/index.rdf',                 emoji:'💳' },
    { name:'EnterpriseZine',  url:'https://enterprisezine.jp/rss/20',                  emoji:'📈' },
  ],
  mfg: [
    { name:'MONOist',         url:'https://rss.itmedia.co.jp/rss/2.0/monoist.xml',     emoji:'🏭' },
    { name:'スマートジャパン',url:'https://rss.itmedia.co.jp/rss/2.0/smartjapan.xml',  emoji:'⚡' },
    { name:'ITmedia NEWS',    url:'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml', emoji:'🔌' },
  ],
  dx: [
    { name:'EnterpriseZine',  url:'https://enterprisezine.jp/rss/20',                  emoji:'🔄' },
    { name:'ITmedia NEWS',    url:'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml', emoji:'🤖' },
    { name:'ZDNet Japan',     url:'https://japan.zdnet.com/index.rdf',                 emoji:'☁' },
  ],
};

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

// ===== キーワード辞書（分析エンジン用） =====
const KW = {
  ai:       ['AI','人工知能','機械学習','ディープラーニング','生成AI','ChatGPT','LLM','Copilot','自動化','予測','推論'],
  cloud:    ['クラウド','AWS','Azure','GCP','SaaS','PaaS','IaaS','マルチクラウド','コンテナ','Kubernetes','サーバーレス'],
  dx:       ['DX','デジタルトランスフォーメーション','デジタル化','IT投資','システム刷新','モダナイゼーション','レガシー','基幹','ERP','SAP'],
  security: ['セキュリティ','サイバー','ランサムウェア','不正アクセス','情報漏洩','ゼロトラスト','脆弱性','インシデント','CSIRT'],
  finance:  ['銀行','金融','証券','保険','生命保険','損保','フィンテック','決済','融資','みずほ','三菱UFJ','三井住友','りそな','第一生命','日本生命','住友生命','明治安田','東京海上','損保ジャパン'],
  mfg:      ['製造','工場','生産','自動車','トヨタ','ホンダ','日産','電力','東電','関電','ガス','東ガス','鉄鋼','化学','半導体','パナソニック','ソニー','日立','富士通','NEC','三菱電機'],
  ses:      ['SIer','SES','システム開発','エンジニア','SE','アウトソーシング','派遣','受託','PMO','アジャイル','DevOps'],
  infra:    ['インフラ','サーバー','ネットワーク','データセンター','オンプレ','移行','マイグレーション'],
  invest:   ['億円','投資','予算','拡大','増加','強化','推進','導入','採用','整備','構築','刷新'],
  talent:   ['エンジニア不足','人材不足','採用','育成','スキル','資格','研修','リスキリング','人手'],
};

function matchKW(text, keys) {
  const t = text;
  return keys.reduce((acc, key) => {
    const words = KW[key] || [];
    const matched = words.filter(w => t.includes(w));
    if (matched.length) acc[key] = matched;
    return acc;
  }, {});
}

// テキストから主語（企業・組織）を抽出
function extractSubject(text) {
  const orgs = ['トヨタ','ホンダ','日産','ソニー','パナソニック','日立','富士通','NEC','三菱','東芝',
    'みずほ','三菱UFJ','三井住友','りそな','第一生命','日本生命','東京電力','関西電力','NTT','KDDI',
    'ソフトバンク','楽天','LINE','メルカリ','サイバーエージェント','経済産業省','金融庁','総務省',
    'Amazon','Google','Microsoft','Apple','Meta','OpenAI'];
  return orgs.find(o => text.includes(o)) || null;
}

// ===== 多段階シナリオ分析エンジン =====
function generateAnalysis(article) {
  const raw  = (article.title + ' ' + article.description).replace(/<[^>]+>/g, '');
  const hits = matchKW(raw, Object.keys(KW));
  const subj = extractSubject(raw);
  const title = article.title || '';

  return {
    summary:          buildSummary(raw, title, hits, subj),
    industryImpacts:  buildIndustryImpacts(raw, hits, subj),
    itImpact:         buildItImpact(raw, hits, subj, title),
    sesImpact:        buildSesImpact(raw, hits, subj, title),
    salesTalks:       buildSalesTalks(raw, hits, subj, title),
    futurePrediction: buildFuture(raw, hits, subj),
  };
}

// ① 要約
function buildSummary(text, title, hits, subj) {
  const who   = subj ? `${subj}が` : '業界全体で';
  const what  = hits.dx    ? 'デジタル変革・システム刷新' :
                hits.ai    ? 'AI・機械学習の活用' :
                hits.cloud ? 'クラウド移行・基盤整備' :
                hits.security ? 'セキュリティ強化' : 'IT投資拡大';
  const scale = hits.invest ? `（${hits.invest.matched?.[0] || '大規模'}の投資が伴う）` : '';

  return `${who}${what}${scale}に関する動きを伝えるニュースです。`
    + (hits.finance ? '金融・保険業界のIT需要に直接関わる内容で、' : '')
    + (hits.mfg     ? '製造・電力業界のデジタル化動向に関わる内容で、' : '')
    + 'SES営業の観点では'
    + (hits.invest  ? '案件化・予算化の兆候として注目に値します。' : '中長期的な案件動向を読む材料として重要です。');
}

// ② 業界影響
function buildIndustryImpacts(text, hits, subj) {
  const isFinance = hits.finance?.length >= 1;
  const isMfg     = hits.mfg?.length >= 1;
  const isDX      = hits.dx?.length >= 1;
  const isAI      = hits.ai?.length >= 1;

  return [
    {
      name: '金融・銀行',
      level: isFinance ? 'high' : isDX || isAI ? 'mid' : 'low',
      impact: isFinance
        ? `${hits.finance[0]}をはじめとした金融機関でのIT投資が加速。勘定系・チャネル系の刷新、AIによる審査自動化など大型案件が継続発生している。特にクラウド移行とセキュリティ強化は必須テーマとなっており、専門エンジニアへの需要が急増している。`
        : isDX ? '直接の言及はないが、金融業界全体のDX化の流れに沿った動きであり、バックオフィスのデジタル化・ペーパーレス化案件への波及が見込まれる。'
        : '直接的な影響は限定的だが、業界横断的なIT投資拡大の恩恵は金融セクターにも及ぶ。',
    },
    {
      name: '生命保険・損保',
      level: isFinance ? 'high' : isAI ? 'mid' : 'low',
      impact: isFinance
        ? '生保・損保各社で契約管理・査定システムの刷新が相次いでおり、クラウドファーストでの再構築が主流になっている。AIによる顧客対応自動化・リスク評価精度向上への投資も活発で、要件定義から実装まで幅広い人材需要が続いている。'
        : isAI ? 'AI活用による保険引受・保険金査定の自動化ニーズが顕在化しつつあり、PoC〜本格実装フェーズへの移行が進んでいる。'
        : '中長期的には保険業界のシステム老朽化対応が避けられず、段階的な刷新投資が続く見通し。',
    },
    {
      name: '製造・自動車',
      level: isMfg ? 'high' : isDX ? 'mid' : 'low',
      impact: isMfg
        ? `${subj || 'トヨタ・日立等の大手'}に代表されるスマートファクトリー化投資が加速。MES・ERP・SCMの刷新に加え、SDV（ソフトウェア定義型自動車）関連のソフト開発需要が爆発的に増加している。OTとITを跨ぐ複合スキルを持つエンジニアが特に引く手あまたの状況。`
        : isDX ? '製造業のDX化は避けられない潮流であり、生産管理・品質管理のデジタル化案件が継続発生している。'
        : '省エネ・カーボンニュートラル対応のため設備・制御システムの更新需要が中長期的に続く。',
    },
    {
      name: '電力・ガス',
      level: isMfg ? 'high' : isDX ? 'mid' : 'low',
      impact: isMfg
        ? '電力自由化後の競争激化とスマートグリッド普及により、需給管理・顧客管理システムの刷新が急務となっている。再生可能エネルギーの出力変動に対応するためのAI制御システム導入も活発で、老朽化インフラ刷新案件が相次いでいる。'
        : isDX ? 'エネルギー管理のデジタル化・省エネ最適化AIへの投資が進んでおり、関連ITシステムの整備需要が見込まれる。'
        : '規制対応・セキュリティ強化のためのIT整備は継続的に発生する見込み。',
    },
  ];
}

// ③ IT業界への影響（現在→近未来→構造変化の3段階）
function buildItImpact(text, hits, subj, title) {
  const parts = [];

  // 【現在起きていること】
  parts.push('【現在の動き】');
  if (hits.ai)       parts.push(`AIの実用化が「実験フェーズ」から「本番運用フェーズ」へ移行しており、${hits.ai.slice(0,2).join('・')}などの技術を使った業務自動化・意思決定支援システムの開発案件が急増している。`);
  if (hits.cloud)    parts.push(`${hits.cloud.slice(0,2).join('・')}を軸としたクラウド移行が加速しており、オンプレからの完全移行・ハイブリッド構成案件が引き続き大量発生している。`);
  if (hits.dx)       parts.push(`レガシーシステムのモダナイゼーション需要が高まっており、${hits.dx.slice(0,2).join('・')}関連の刷新プロジェクトが各業界で同時進行している。`);
  if (hits.security) parts.push(`サイバー攻撃の高度化を受けてセキュリティ投資が急拡大しており、ゼロトラスト設計やSOC構築の案件が増加している。`);
  if (parts.length === 1) parts.push('IT投資全体が拡大しており、システム開発・運用保守の需要が底堅く推移している。');

  // 【次に起きること】
  parts.push('\n【次に起きること】');
  if (hits.ai && hits.invest)  parts.push('PoC段階だったAIプロジェクトが本格予算化される企業が増え、実装・保守・改善を担う長期案件として具体化していく見込み。');
  if (hits.cloud)              parts.push('クラウド移行の完了後、次フェーズとして「クラウド最適化・コスト削減」「マルチクラウド管理」への需要が続く構造になっている。');
  if (hits.dx)                 parts.push('基幹システム刷新が終わると、今度はデータ活用・分析基盤の整備フェーズに移行するため、データエンジニア・アナリストへの需要が高まる。');
  if (!hits.ai && !hits.cloud) parts.push('IT人材不足が深刻化しており、社内調達が難しくなった企業からSES・アウトソーシングへのシフトが加速する見通し。');

  // 【構造的変化】
  parts.push('\n【業界構造への影響】');
  parts.push(hits.ai
    ? 'AIが定型開発業務を代替するにつれ、単純コーディングの価値は下がる一方、上流工程（要件定義・アーキテクチャ設計）とAI活用スキルを持つエンジニアの希少価値が急騰している。SIerには「AIを使って開発を効率化できる会社かどうか」が選定基準になりつつある。'
    : 'IT人材の需給ギャップは今後も拡大が続く見通しで、高スキル人材を確保できるSIer・SES企業への案件集中が進むと予想される。');

  return parts.join('');
}

// ④ SES業界への影響（現状→シナリオ→アクション提言）
function buildSesImpact(text, hits, subj, title) {
  const parts = [];

  parts.push('【今まさに起きていること】\n');
  if (hits.invest) parts.push(`${subj ? subj + 'など' : '各社で'}IT予算が積み増されており、SES企業への発注・増員依頼が増加中。特に設計〜実装フェーズを担える中上流エンジニアの引き合いが強い。`);
  if (hits.ai)     parts.push('AI案件が急増しているが、社内に実装スキルがある企業は少なく、外部調達（SES・受託）へのニーズが高まっている。Python・MLOps・プロンプトエンジニアリングスキルを持つエンジニアは既に品薄状態。');
  if (hits.cloud)  parts.push('クラウド移行案件の増加でインフラエンジニアが不足。AWS/Azure認定保有者の単価が上昇しており、SES企業にとっては単価交渉のチャンス。');
  if (hits.security) parts.push('セキュリティ強化案件はどの業界でも発生しており、SES企業にとっては新規顧客開拓の切り口になりやすいテーマ。');
  if (parts.length === 1) parts.push('IT案件全体が堅調に推移しており、SES企業への需要は安定して高い水準が続いている。');

  parts.push('\n\n【このまま進むとどうなるか】\n');
  if (hits.ai && hits.dx) parts.push('AIとDXが同時進行することで、企業が必要とするITスキルが急速に高度化・多様化していく。「とにかく開発人員が欲しい」から「特定スキルを持つ専門家が欲しい」へ、顧客ニーズが変わる。スキルのないエンジニアは案件にアサインされにくくなり、SES企業間でもエンジニア品質による差別化が加速する。');
  else if (hits.invest)  parts.push('IT投資が続く限りSES市場は好調だが、投資が落ち着いたフェーズでは運用保守への移行が進む。今のうちに「開発→保守」まで一貫して担える体制を整えた企業が顧客からの信頼を獲得しやすい。');
  else parts.push('人材不足が続く限りSES需要は安定しているが、単価競争に陥るリスクもある。専門性・上流対応力の強化が中長期的な差別化ポイントになる。');

  parts.push('\n\n【SES営業が取るべきアクション】\n');
  const actions = [];
  if (hits.ai)      actions.push('AI案件対応ができるエンジニアを積極的にアピール。「生成AI活用支援」「AI実装PoC」を新しい売り文句として営業資料に組み込む');
  if (hits.cloud)   actions.push('クラウド認定資格保有者をリスト化して顧客に提示できるよう準備。移行フェーズで関係構築し、運用保守フェーズへの継続受注を狙う');
  if (hits.finance) actions.push('金融・生保顧客へのアプローチを強化。業界特有のコンプライアンス対応経験があるエンジニアの存在は大きな差別化ポイント');
  if (hits.mfg)     actions.push('製造業顧客との関係強化。スマートファクトリー・IoT案件は長期化しやすく、粘り強い関係構築が受注につながりやすい');
  if (actions.length === 0) actions.push('顧客の業界動向を先読みしてIT課題を先に提示する「課題提起型営業」にシフトすることで、顧客からの信頼と案件獲得率が向上する');
  actions.forEach((a, i) => parts.push(`${i+1}. ${a}\n`));

  return parts.join('');
}

// ⑤ 営業トーク例（文脈に沿った会話形式）
function buildSalesTalks(text, hits, subj, title) {
  const company = subj || '大手各社';
  const topic   = title.slice(0, 25).replace(/[「」]/g,'');

  const allTalks = [
    hits.ai ? `「最近、${company}さんのようなAI活用の話題をよく耳にします。実は弊社でも生成AI実装の支援が増えていて、御社でも何か検討されていることはありますか？」` : null,
    hits.cloud ? `「クラウド移行の案件、最近あちこちで話が出ていますね。御社の基幹システムもそのあたりご検討中でしょうか？もしエンジニア確保でお困りでしたらご相談ください」` : null,
    hits.dx ? `「${topic}の話、ちょうど先日もお客様との話で出まして。DX推進って、結局人が足りなくて止まっているケースが多いんですよね。御社はいかがですか？」` : null,
    hits.finance ? `「金融系のシステム案件、今かなり活発ですよね。コンプライアンス対応の経験があるエンジニアを探している企業さんが多くて。御社でも何かお困りのことはないですか？」` : null,
    hits.security ? `「サイバー攻撃の件、最近本当に多いですよね。セキュリティ対応できるエンジニアが足りないって声をよく聞きます。御社の状況はいかがでしょうか？」` : null,
    hits.invest ? `「${company}さんがIT投資を拡大というニュース、ご覧になりましたか？こういう動きがあると、しばらくしてからエンジニアの引き合いが増えるんですよね。先手で動きませんか？」` : null,
    `「最近${topic}みたいな話題が多くて、業界全体がIT人材の取り合いになってきていますよね。弊社では今ちょうどご紹介できる方がいるのですが、タイミング的にいかがでしょうか」`,
    `「正直な話、今エンジニア採用って本当に難しくなっていますよね。${subj ? subj + 'さんのような' : '御社の'}案件であれば、弊社のエンジニアと親和性が高そうで、ぜひご提案させていただきたいんですが」`,
  ].filter(Boolean);

  // ランダムに3つ選ぶ（ただし null を除外済み）
  const shuffled = allTalks.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// ⑥ 将来予測（2〜3年シナリオ）
function buildFuture(text, hits, subj) {
  const parts = [];

  parts.push('【1年以内】');
  if (hits.ai)      parts.push('生成AIの実装案件が本格化し、「AIエンジニア」という職種が当たり前になる。AIを使った開発効率化が進み、工数見積もりの概念自体が変わり始める。');
  if (hits.cloud)   parts.push('クラウド移行を完了した企業が増え、次の課題である「クラウドコスト最適化」「データ活用基盤整備」フェーズの案件が増加する。');
  if (hits.dx)      parts.push('DX推進部署を持つ企業が増え、外部ITベンダーとの協業モデルが一般化する。SESにも「戦略的パートナー」としての役割が求められ始める。');
  if (parts.length === 1) parts.push('IT人材不足が深刻化し、SES・アウトソーシング市場が拡大する。単価の上昇トレンドが継続する。');

  parts.push('\n【2〜3年後】');
  if (hits.ai && hits.invest) parts.push('AIが業務自動化を加速させ、定型業務はほぼ自動化される業種が出始める。一方でAIを監視・改善する上位職種への需要が爆発。SES企業は「AIネイティブな開発体制」を持てるかどうかで生き残りが決まる。');
  else if (hits.dx) parts.push('DXの「やってみた」フェーズが終わり、成果が出ている企業と出ていない企業に二極化が進む。IT投資の質が問われるようになり、成果にコミットできるSIer・SES企業に案件が集中する。');
  else parts.push('IT人材の需給ギャップが拡大し続けるなか、スキルを持つエンジニアの単価上昇が続く。SES企業は「エンジニアの質」と「提案力」で差別化できるかが勝負になる。');

  parts.push('\n【SES企業への示唆】');
  parts.push(hits.ai
    ? 'AIスキルを持つエンジニアの確保・育成が最優先課題。「AI案件対応可能」という看板を早期に掲げた企業が顧客からの引き合いを独占する可能性が高い。今すぐ社内エンジニアのリスキリング投資を始めることが、2〜3年後の競争力を決める。'
    : 'スペシャリスト化・上流対応化・特定業界への特化、いずれかの方向性を明確にすることが生き残りの鍵。汎用的な「人月提供」モデルは価格競争に陥るリスクが高まっている。');

  return parts.join('');
}

// ===== RSS取得 =====
async function fetchRSS(rssUrl, count = 15) {
  try {
    const resp = await fetch(`${RSS2JSON}${encodeURIComponent(rssUrl)}&count=${count}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.status !== 'ok') throw new Error(data.message || 'error');
    return data.items || [];
  } catch (e) {
    console.warn('RSS:', rssUrl, e.message);
    return [];
  }
}

function normalizeItem(item, src) {
  return {
    title:       (item.title || '').trim(),
    description: (item.description || item.content || '').replace(/<[^>]+>/g,'').trim().slice(0, 200),
    url:         item.link || item.url || '#',
    urlToImage:  item.enclosure?.link || item.thumbnail || null,
    source:      { name: src.name },
    publishedAt: item.pubDate || new Date().toISOString(),
    emoji:       src.emoji,
  };
}

async function fetchTabNews(tabKey) {
  const sources = RSS_SOURCES[tabKey] || RSS_SOURCES.it;
  const results = await Promise.all(sources.map(async src => {
    const items = await fetchRSS(src.url, 15);
    return items.map(i => normalizeItem(i, src));
  }));
  const all = results.flat().filter(a => a.title);
  // SES関連スコア順にソート
  return all
    .map(a => ({ ...a, _sc: Object.values(matchKW(a.title+' '+a.description, Object.keys(KW))).reduce((s,v)=>s+v.length,0) }))
    .sort((a,b) => b._sc - a._sc)
    .slice(0, 12);
}

// ===== キーワード検索 =====
// 複合キーワード（スペース区切り）を AND 検索で対応
// ヒットしなければ OR 検索にフォールバック
async function searchNews(query) {
  // 全ソース横断で取得
  const allSources = Object.values(RSS_SOURCES).flat()
    .filter((s, i, arr) => arr.findIndex(x => x.url === s.url) === i); // URL重複除去

  const results = await Promise.all(allSources.map(async src => {
    const items = await fetchRSS(src.url, 20); // 検索時は多めに取得
    return items.map(i => normalizeItem(i, src));
  }));

  const all = results.flat().filter(a => a.title);

  // キーワード分割（スペース・全角スペース・「、」対応）
  const keywords = query.split(/[\s　、,]+/).map(k => k.toLowerCase()).filter(Boolean);

  // AND検索：全キーワードを含む記事
  const haystack = (a) => (a.title + ' ' + a.description).toLowerCase();
  let matched = all.filter(a => keywords.every(k => haystack(a).includes(k)));

  // AND検索でヒットなし → OR検索（1つでも含む）
  if (matched.length === 0) {
    matched = all.filter(a => keywords.some(k => haystack(a).includes(k)));
  }

  // スコア順ソートして返す
  return matched
    .map(a => {
      const h = haystack(a);
      const score = keywords.reduce((s, k) => s + (h.split(k).length - 1), 0);
      return { ...a, _sc: score };
    })
    .sort((a,b) => b._sc - a._sc)
    .slice(0, 10);
}

// ===== カード生成 =====
function getTags(text) {
  const tagMap = { ai:'AI・生成AI', cloud:'クラウド', dx:'DX', security:'セキュリティ', finance:'金融・生保', mfg:'製造・電力', ses:'SIer・SES' };
  const hits = matchKW(text, Object.keys(tagMap));
  return Object.keys(hits).slice(0,3).map(k => tagMap[k]);
}

function createCard(article, index = 0) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.animationDelay = `${index * 0.055}s`;

  const title   = article.title || 'タイトルなし';
  const desc    = article.description || '';
  const srcName = article.source?.name || '';
  const emoji   = article.emoji || '📰';
  const date    = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('ja-JP',{month:'numeric',day:'numeric'}) : '';
  const tags    = getTags(title + ' ' + desc);

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
  setTimeout(() => {
    const data = generateAnalysis(article);
    renderAnalysis(content, article, data);
  }, 500);
}

function renderAnalysis(container, article, d) {
  const lv = l => l === 'high'
    ? '<span class="impact-level impact-high">影響大</span>'
    : l === 'mid'
    ? '<span class="impact-level impact-mid">影響中</span>'
    : '<span class="impact-level impact-low">影響小</span>';

  container.innerHTML = `
    <div class="analysis-header">
      <div class="analysis-title">${article.title||''}</div>
      <div class="analysis-source">📰 ${article.source?.name||''} &nbsp;·&nbsp;
        <a href="${article.url}" target="_blank" rel="noopener" style="color:var(--accent)">記事を開く ↗</a>
      </div>
    </div>

    <div class="analysis-section">
      <div class="section-label"><span class="num">①</span>ニュース要約</div>
      <p>${d.summary}</p>
    </div>

    <div class="analysis-section">
      <div class="section-label"><span class="num">②</span>業界への影響</div>
      <div class="impact-grid">
        ${d.industryImpacts.map(i=>`
          <div class="industry-chip">
            <div class="name">🏷 ${i.name} ${lv(i.level)}</div>
            <div class="detail">${i.impact}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="analysis-section">
      <div class="section-label"><span class="num">③</span>IT業界への影響</div>
      <div class="analysis-narrative">${d.itImpact.replace(/\n/g,'<br>')}</div>
    </div>

    <div class="analysis-section">
      <div class="section-label"><span class="num">④</span>SES業界への影響</div>
      <div class="analysis-narrative">${d.sesImpact.replace(/\n/g,'<br>')}</div>
    </div>

    <div class="analysis-section">
      <div class="section-label"><span class="num">⑤</span>営業トーク例</div>
      ${d.salesTalks.map(t=>`<div class="talk-box">💬 ${t}</div>`).join('')}
    </div>

    <div class="analysis-section">
      <div class="section-label"><span class="num">⑥</span>将来予測（1〜3年シナリオ）</div>
      <div class="future-box">${d.futurePrediction.replace(/\n/g,'<br>')}</div>
    </div>`;
}

function closeAnalysisModal() {
  document.getElementById('analysisModal').classList.add('hidden');
}

// ===== 今日の営業ネタ =====
function generateTodayTopics() {
  const d    = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate();
  const pool = ['金融DX加速','生成AI実装','SIer再編','クラウド移行','スマート工場','セキュリティ強化',
    '電力デジタル化','自動車OTA','保険システム刷新','AI人材不足','レガシー刷新','エンジニア単価上昇',
    'ゼロトラスト','データ活用','リスキリング'];
  const i = seed % pool.length;
  const picks = [pool[i % pool.length], pool[(i+5) % pool.length], pool[(i+9) % pool.length]];
  document.getElementById('topicChips').innerHTML = picks.map(p=>`<span class="chip">${p}</span>`).join('');
}

// ===== INIT =====
let currentTab = 'it';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('headerDate').textContent =
    new Date().toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'short'});

  generateTodayTopics();
  loadLeftPanel('it');

  document.getElementById('sourceTabs').addEventListener('click', e => {
    const btn = e.target.closest('.stab');
    if (!btn) return;
    document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadLeftPanel(btn.dataset.src);
  });

  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key==='Enter') handleSearch(); });
  document.querySelectorAll('.quick-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('searchInput').value = btn.dataset.q;
      handleSearch();
    });
  });

  document.getElementById('refreshLeft').addEventListener('click', () => loadLeftPanel(currentTab));
  document.getElementById('refreshAll').addEventListener('click', () => { loadLeftPanel(currentTab); generateTodayTopics(); });
  document.getElementById('closeAnalysis').addEventListener('click', closeAnalysisModal);
  document.getElementById('analysisModal').addEventListener('click', e => {
    if (e.target === document.getElementById('analysisModal')) closeAnalysisModal();
  });
});

async function loadLeftPanel(tabKey) {
  currentTab = tabKey;
  const grid = document.getElementById('aiNewsGrid');
  grid.innerHTML = '<div class="card skeleton-card"></div><div class="card skeleton-card"></div><div class="card skeleton-card"></div>';
  const articles = await fetchTabNews(tabKey);
  grid.innerHTML = '';
  if (!articles.length) {
    grid.innerHTML = `<div class="fetch-error">ニュースの取得に失敗しました。しばらく後に更新ボタンを押してください。</div>`;
    return;
  }
  articles.forEach((a,i) => grid.appendChild(createCard(a,i)));
}

async function handleSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  const grid = document.getElementById('searchNewsGrid');
  grid.innerHTML = '<div class="card skeleton-card"></div><div class="card skeleton-card"></div><div class="card skeleton-card"></div>';
  const articles = await searchNews(q);
  grid.innerHTML = '';
  if (!articles.length) {
    grid.innerHTML = `<div class="empty-state"><span class="empty-icon">🔍</span><p>「${q}」のニュースが見つかりませんでした。<br>別のキーワードをお試しください。</p></div>`;
    return;
  }
  articles.forEach((a,i) => grid.appendChild(createCard(a,i)));
}

// analysis-narrative スタイル追加（動的）
const style = document.createElement('style');
style.textContent = `
  .analysis-narrative {
    font-size:14px; line-height:1.9; color:var(--text-main);
    white-space:pre-wrap;
  }
  .analysis-narrative br + br { display:block; content:''; margin-top:6px; }
`;
document.head.appendChild(style);

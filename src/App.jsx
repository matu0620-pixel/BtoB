import React, { useState, useEffect, useRef } from "react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea,
} from "recharts";

/* ============================== DESIGN TOKENS ============================== */
const C = {
  bg: "#f3f6f4", ink: "#16202b", ink2: "#2c3742", brand: "#0e5a51", brand2: "#13776b",
  save: "#157f63", muted: "#717b84", faint: "#9aa3ab", hair: "#e4e9e7", card: "#ffffff",
  tint: "#eef4f2", terra: "#b4542f", terraBg: "#f7ece6", warm: "#f7f7f3",
};
const FONT = "'Meiryo UI','Meiryo',sans-serif";
const SHADOW = "0 1px 2px rgba(20,32,40,.03), 0 12px 32px -20px rgba(20,32,40,.22)";
const PC = { telecom: "#0e5a51", power: "#13776b", supply: "#2f9c8a", cloud: "#1f4e63", maint: "#5aa896", logi: "#3a7d93" };

/* ============================== DATA ============================== */
const COMPANY = "株式会社グリーンフィールド";
const TOTAL_SPEND = 486_000_000, POTENTIAL = 50_600_000, VENDOR_COUNT = 142;
const REV = 6_800_000_000, SGA = 1_890_000_000, OP = 544_000_000;
const SGA_RATE = (SGA / REV) * 100, OP_RATE = (OP / REV) * 100;

const MONTHLY = [
  { m: "25.4", v: 3820 }, { m: "5", v: 3910 }, { m: "6", v: 4150 }, { m: "7", v: 4020 },
  { m: "8", v: 4280 }, { m: "9", v: 4310 }, { m: "10", v: 3990 }, { m: "11", v: 4120 },
  { m: "12", v: 4450 }, { m: "26.1", v: 4200 }, { m: "2", v: 4380 }, { m: "3", v: 3970 },
];
const FUTURE_LABELS = ["26.4", "5", "6", "7", "8", "9", "10", "11", "12", "27.1", "2", "3"];
const CATEGORIES = [
  { name: "クラウド・SaaS", v: 98_000_000 }, { name: "物流・配送", v: 87_000_000 },
  { name: "オフィス賃料・設備", v: 76_000_000 }, { name: "通信・回線", v: 62_000_000 },
  { name: "電力・ガス", v: 54_000_000 }, { name: "人材・採用", v: 45_000_000 },
  { name: "広告・販促", v: 38_000_000 }, { name: "保守・保険", v: 26_000_000 },
];
const TOP_VENDORS = [
  { name: "Amazon Web Services", v: 61_200_000, flag: true }, { name: "ヤマト運輸 / 法人契約", v: 48_500_000 },
  { name: "東京電力エナジーパートナー", v: 39_800_000, flag: true }, { name: "NTTコミュニケーションズ", v: 33_400_000, flag: true },
  { name: "リクルートスタッフィング", v: 28_900_000 }, { name: "セールスフォース・ジャパン", v: 21_600_000 },
];
const SGA_PEERS = [
  { name: "D社", rate: 19.4 }, { name: "A社", rate: 22.1 }, { name: "B社", rate: 23.8 },
  { name: "業界中央値", rate: 24.5, median: true }, { name: "C社", rate: 26.2 },
  { name: "自社", rate: 27.8, self: true }, { name: "E社", rate: 29.6 },
];
const POS_PEERS = [
  { name: "A社", x: 52, y: 9.8 }, { name: "B社", x: 88, y: 7.2 }, { name: "C社", x: 41, y: 6.1 },
  { name: "D社", x: 120, y: 11.5 }, { name: "E社", x: 35, y: 5.2 }, { name: "F社", x: 74, y: 8.6 },
];
const IND_AVG_MARGIN = 8.1;

const PLANS = [
  { id: "cloud", cat: "クラウド・SaaS", current: 98_000_000, saving: 14_200_000, rate: 14.5, effort: "中",
    focus: "コスト ／ 移行リスク低減", market: [78_000_000, 95_000_000], best: "AWS最適化（Savings Plans適用）",
    reason: "リザーブド/Savings Plans未適用。機能が重複するSaaS契約を3件検出。年間コミット割引の適用余地が大。",
    req: { must: ["既存ワークロードの移行性を確保できること", "コスト最適化（RI/Savings Plans/コミット）の提案", "可用性・セキュリティ水準を維持できること"],
           want: ["重複SaaSの統合提案", "使用量可視化・FinOps支援", "移行支援体制の提供"] },
    candidates: [
      { name: "現契約：AWS（オンデマンド中心）", base: true, est: 98_000_000, rating: 4.2, reviews: 0, tags: ["従量課金", "構築済み環境"], match: 0 },
      { name: "AWS最適化（Savings Plans適用）", est: 83_800_000, rating: 4.6, reviews: 218, tags: ["1年コミット", "移行リスク低", "即効性"], match: 96, rec: true },
      { name: "Google Cloud + SaaS統合", est: 83_800_000, rating: 4.4, reviews: 164, tags: ["重複SaaS削減", "移行支援あり"], match: 88 },
      { name: "国内クラウド併用（さくら等）", est: 88_200_000, rating: 4.1, reviews: 92, tags: ["国内DC", "円建て安定"], match: 79 },
    ] },
  { id: "logi", cat: "物流・配送", current: 87_000_000, saving: 11_500_000, rate: 13.2, effort: "高",
    focus: "コスト ／ リードタイム維持", market: [70_000_000, 85_000_000], best: "配送最適化（ボリューム再交渉）",
    reason: "配送ボリュームに対する単価が市場平均を約11%上回る。単価再交渉または地域ハブ活用で改善余地あり。",
    req: { must: ["全国配送に対応できること", "現行のリードタイムを維持できること", "運賃・単価の透明性があること"],
           want: ["積載効率化・共同配送の提案", "CO2排出量の可視化", "繁忙期の供給保証"] },
    candidates: [
      { name: "現契約：ヤマト / 佐川 併用", base: true, est: 87_000_000, rating: 4.1, reviews: 0, tags: ["全国配送", "実績豊富"], match: 0 },
      { name: "配送最適化（ボリューム再交渉）", est: 75_500_000, rating: 4.5, reviews: 143, tags: ["単価再交渉", "事業者継続", "移行不要"], match: 91, rec: true },
      { name: "地域物流ハブ活用", est: 72_800_000, rating: 4.2, reviews: 78, tags: ["地域特化", "要拠点調整"], match: 80 },
      { name: "共同配送プラットフォーム", est: 78_900_000, rating: 4.0, reviews: 61, tags: ["積載効率化", "CO2削減"], match: 75 },
    ] },
  { id: "telecom", cat: "通信・回線", current: 62_000_000, saving: 9_800_000, rate: 15.8, effort: "低",
    focus: "コスト ／ 移行のしやすさ", market: [48_000_000, 58_000_000], best: "法人特化プランS",
    reason: "同等品質で月額単価が低い法人特化プランを複数検出。違約金なしで切替可能、即効性が高い。",
    req: { must: ["本社および全拠点（本社＋5拠点）に対応できること", "既存電話番号を継続利用できること", "移行に伴う通信断が発生しない、または最小化できること", "違約金が発生しない、または負担に関する提案があること"],
           want: ["24時間の障害対応窓口", "複数回線の一括請求・統合管理", "障害時の復旧目標（SLA）の明示"] },
    candidates: [
      { name: "現契約：NTTコミュニケーションズ", base: true, est: 62_000_000, rating: 4.0, reviews: 0, tags: ["全国対応"], match: 0 },
      { name: "法人特化プランS", est: 52_200_000, rating: 4.6, reviews: 204, tags: ["法人特化", "24hサポート", "違約金なし"], match: 94, rec: true },
      { name: "回線統合・一括請求プラン", est: 54_800_000, rating: 4.3, reviews: 117, tags: ["回線統合", "一括請求"], match: 87 },
      { name: "格安法人回線", est: 50_100_000, rating: 3.9, reviews: 88, tags: ["最安水準", "サポート簡易"], match: 72 },
    ] },
  { id: "power", cat: "電力・ガス", current: 54_000_000, saving: 7_600_000, rate: 14.1, effort: "低",
    focus: "コスト ／ 供給の安定性", market: [44_000_000, 52_000_000], best: "新電力A（高圧）",
    reason: "高圧電力の単価が新電力より割高。切替手続代行あり、違約金なしで移行できる候補が中心。",
    req: { must: ["高圧電力に対応できること", "切替手続き（廃止・新規）の代行が可能なこと", "供給安定性および需給ひっ迫時の対応方針が明確なこと", "違約金が発生しない契約形態であること"],
           want: ["再生可能エネルギー／CO2フリーメニューの提供", "使用量の可視化・レポート提供", "デマンド管理の助言"] },
    candidates: [
      { name: "現契約：東京電力EP", base: true, est: 54_000_000, rating: 3.8, reviews: 0, tags: ["標準プラン"], match: 0 },
      { name: "新電力A（高圧）", est: 46_400_000, rating: 4.4, reviews: 156, tags: ["切替代行", "違約金なし", "即効性"], match: 93, rec: true },
      { name: "再エネ重視プラン", est: 47_900_000, rating: 4.3, reviews: 99, tags: ["RE100対応", "CO2フリー"], match: 85 },
      { name: "市場連動プラン", est: 45_200_000, rating: 3.7, reviews: 54, tags: ["変動リスクあり", "最安水準"], match: 68 },
    ] },
  { id: "supply", cat: "備品・消耗品", current: 18_000_000, saving: 4_100_000, rate: 22.8, effort: "低",
    focus: "コスト ／ 発注工数の削減", market: [13_000_000, 16_000_000], best: "一括購買プラットフォーム",
    reason: "複数商社への個別発注で交渉力が分散。発注一元化でボリューム割引が効く。削減率が最も高い領域。",
    req: { must: ["主要拠点へ翌々日以内に納品できること", "Web発注による発注の一元化が可能なこと", "月次請求の一本化に対応できること"],
           want: ["カタログ・品番互換の提供", "部門別の予算アラート・利用分析", "既存利用品番との互換提案"] },
    candidates: [
      { name: "現契約：複数文具・備品商社", base: true, est: 18_000_000, rating: 3.9, reviews: 0, tags: ["個別発注"], match: 0 },
      { name: "一括購買プラットフォーム", est: 13_900_000, rating: 4.5, reviews: 187, tags: ["発注一元化", "ボリューム割引"], match: 92, rec: true },
      { name: "大手通販法人（翌日配送）", est: 14_600_000, rating: 4.4, reviews: 240, tags: ["翌日配送", "カタログ豊富"], match: 88 },
      { name: "サブスク型備品", est: 15_200_000, rating: 4.0, reviews: 63, tags: ["定額制", "在庫管理不要"], match: 76 },
    ] },
  { id: "maint", cat: "保守・保険", current: 26_000_000, saving: 3_400_000, rate: 13.0, effort: "中",
    focus: "コスト ／ 保守品質の維持", market: [21_000_000, 25_000_000], best: "保守契約の統合",
    reason: "保守・損保契約が個別最適で乱立。契約統合で管理工数とコストの双方を削減。",
    req: { must: ["現行の保守水準（対応時間）を維持できること", "契約の一本化・窓口統合が可能なこと", "障害時の復旧目標を明示できること"],
           want: ["予防保守・点検計画の提供", "保険の補償範囲の見直し提案", "複数拠点の一括管理"] },
    candidates: [
      { name: "現契約：個別契約（保守 / 損保）", base: true, est: 26_000_000, rating: 3.9, reviews: 0, tags: ["個別最適"], match: 0 },
      { name: "保守契約の統合", est: 22_600_000, rating: 4.3, reviews: 71, tags: ["契約一本化", "管理工数減"], match: 89, rec: true },
      { name: "包括保険プラン", est: 23_100_000, rating: 4.2, reviews: 58, tags: ["補償拡充", "一括見直し"], match: 84 },
      { name: "マルチベンダ保守", est: 23_800_000, rating: 4.0, reviews: 44, tags: ["対応速度向上"], match: 73 },
    ] },
];
const PLANS_BY_SAVING = [...PLANS].sort((a, b) => b.saving - a.saving);
const EVAL = [["コスト", 40, "年間コスト、削減額・削減率、料金体系の妥当性"], ["品質・安定性", 25, "サービス品質、供給・通信の安定性、実績"],
  ["移行容易性", 20, "移行負荷、通信断／供給断の有無、違約金、リードタイム"], ["サポート体制・SLA", 15, "対応窓口・時間、障害対応、復旧目標の明確さ"]];
const SCHED = [["RFP発行", "2026年5月27日"], ["質問受付期限", "2026年6月10日"], ["提案書 提出期限", "2026年6月24日 17:00"],
  ["一次評価・絞り込み", "2026年7月1日"], ["提案プレゼンテーション", "2026年7月8日"], ["最終選定・内示", "2026年7月15日"],
  ["契約締結（予定）", "2026年8月3日"], ["切替・移行開始", "2026年9月1日"]];

/* ============================== HELPERS ============================== */
function jy(n) {
  const oku = Math.floor(n / 1e8), man = Math.floor((n % 1e8) / 1e4);
  if (oku > 0 && man > 0) return `${oku}億${man.toLocaleString()}万円`;
  if (oku > 0) return `${oku}億円`;
  return `${man.toLocaleString()}万円`;
}
const yc = (n) => "¥" + n.toLocaleString();
const manRange = ([lo, hi]) => `${(lo / 1e4).toLocaleString()}–${(hi / 1e4).toLocaleString()}万円`;
const effortColor = (e) => e === "低" ? { fg: C.save, bg: C.tint } : e === "中" ? { fg: "#9a7b1f", bg: "#f6efd9" } : { fg: C.terra, bg: C.terraBg };
function computeImpact(sel) {
  const chosen = PLANS.filter((p) => sel[p.id]);
  const cut = chosen.reduce((s, p) => s + p.saving, 0);
  return { cut, chosen, newSgaRate: ((SGA - cut) / REV) * 100, newOp: OP + cut, newOpRate: ((OP + cut) / REV) * 100 };
}
function useIsMobile(bp = 760) {
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth < bp : false);
  useEffect(() => { const on = () => setM(window.innerWidth < bp); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, [bp]);
  return m;
}

/* ============================== PRIMITIVES ============================== */
function Card({ children, style, ...p }) {
  return <div {...p} style={{ background: C.card, border: `1px solid ${C.hair}`, borderRadius: 12, boxShadow: SHADOW, padding: 22, ...style }}>{children}</div>;
}
function Kicker({ children, color = C.brand, style }) {
  return <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color, fontWeight: 600, ...style }}>{children}</div>;
}
function SecTitle({ kicker, title, sub, right }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {kicker && <Kicker style={{ marginBottom: 5 }}>{kicker}</Kicker>}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: `1px solid ${C.hair}`, paddingBottom: 10 }}>
        <div><h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: C.ink, letterSpacing: ".02em" }}>{title}</h2>
          {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: C.muted, fontWeight: 400 }}>{sub}</p>}</div>
        {right}
      </div>
    </div>
  );
}
function Pill({ children, fg, bg, bd }) {
  return <span style={{ fontSize: 10.5, fontWeight: 600, color: fg, background: bg, border: bd ? `1px solid ${bd}` : "none", padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", letterSpacing: ".02em" }}>{children}</span>;
}
function Bar({ pct, color = C.brand, h = 6 }) {
  return <div style={{ height: h, background: "#edf1ef", borderRadius: h }}><div style={{ width: `${pct}%`, height: "100%", borderRadius: h, background: color, transition: "width .5s" }} /></div>;
}
function Stars({ r }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ color: "#caa53e", fontSize: 12, letterSpacing: 1 }}>{"★".repeat(Math.round(r))}<span style={{ color: C.hair }}>{"★".repeat(5 - Math.round(r))}</span></span><span style={{ fontSize: 11.5, fontWeight: 700, color: C.ink }}>{r.toFixed(1)}</span></span>;
}
function Switch({ on }) {
  return <div style={{ width: 38, height: 22, borderRadius: 999, background: on ? C.save : "#cfd6d3", position: "relative", transition: "background .2s", flexShrink: 0 }}><div style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} /></div>;
}

/* ============================== ANOMALY ALERTS ============================== */
const ANOMALIES = [
  { id: "a1", sev: "高", type: "単価急騰", vendor: "Amazon Web Services", cat: "クラウド・SaaS", msg: "前月比 +18% の単価上昇。リザーブド/Savings Plans 未適用の可能性。", impact: 1_800_000 },
  { id: "a2", sev: "高", type: "重複請求", vendor: "セールスフォース・ジャパン", cat: "クラウド・SaaS", msg: "同一ライセンスの二重課金を検出（2契約が並走）。", impact: 960_000 },
  { id: "a3", sev: "中", type: "契約外請求", vendor: "NTTコミュニケーションズ", cat: "通信・回線", msg: "契約レンジ外のオプション料金を3ヶ月連続で計上。", impact: 420_000 },
  { id: "a4", sev: "中", type: "二重発注", vendor: "文具商社B", cat: "備品・消耗品", msg: "同一品目を別部署が重複発注（今月）。", impact: 180_000 },
  { id: "a5", sev: "低", type: "単価乖離", vendor: "ヤマト運輸 / 法人契約", cat: "物流・配送", msg: "一部地域の配送単価が相場上限を超過。", impact: 650_000 },
];
function AlertsPanel() {
  const [dismissed, setDismissed] = useState([]);
  const items = ANOMALIES.filter((a) => !dismissed.includes(a.id));
  if (items.length === 0) return null;
  const total = items.reduce((s, a) => s + a.impact, 0);
  const sevC = (x) => x === "高" ? { fg: C.terra, bg: C.terraBg } : x === "中" ? { fg: "#9a7b1f", bg: "#f6efd9" } : { fg: C.muted, bg: C.warm };
  return (
    <Card className="fade" style={{ marginBottom: 18, borderColor: "#ecd9d0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.terra }} />
          <span style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>検出されたアラート</span>
          <Pill fg={C.terra} bg={C.terraBg}>{items.length}件</Pill>
        </div>
        <span style={{ fontSize: 12, color: C.muted }}>想定年間インパクト計 <b style={{ color: C.terra }}>{jy(total)}</b></span>
      </div>
      {items.map((a, i) => { const sc = sevC(a.sev); return (
        <div key={a.id} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "11px 0", borderTop: i ? `1px solid ${C.hair}` : "none" }}>
          <Pill fg={sc.fg} bg={sc.bg}>{a.sev}</Pill>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{a.type}<span style={{ color: C.muted, fontWeight: 400 }}>　/　{a.vendor}・{a.cat}</span></div>
            <div style={{ fontSize: 11.5, color: C.ink2, lineHeight: 1.6, marginTop: 2 }}>{a.msg}</div>
          </div>
          <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.terra }}>{jy(a.impact)}</div>
            <button onClick={() => setDismissed((d) => [...d, a.id])} style={{ marginTop: 3, border: "none", background: "none", color: C.faint, fontSize: 11, cursor: "pointer", fontFamily: FONT, textDecoration: "underline" }}>確認済みにする</button>
          </div>
        </div>); })}
    </Card>
  );
}

/* ============================== DASHBOARD ============================== */
function Dashboard() {
  const mob = useIsMobile();
  const maxCat = Math.max(...CATEGORIES.map((c) => c.v)), maxVen = Math.max(...TOP_VENDORS.map((v) => v.v));
  const kpis = [
    { label: "年間間接費", val: jy(TOTAL_SPEND), sub: "請求書 3,847件を集計", accent: C.ink },
    { label: "削減ポテンシャル", val: jy(POTENTIAL), sub: "間接費の約 10.4%", accent: C.save },
    { label: "分析対象取引先", val: `${VENDOR_COUNT}社`, sub: "うち切替推奨 24社", accent: C.brand },
    { label: "切替推奨カテゴリ", val: "6領域", sub: "削減プランを参照", accent: C.terra },
  ];
  return (
    <div>
      <AlertsPanel />
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(4,1fr)", gap: mob ? 10 : 14, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <Card key={i} className="fade" style={{ padding: mob ? "15px" : "18px", animationDelay: `${i * 55}ms` }}>
            <Kicker color={C.muted} style={{ fontSize: 9.5 }}>{k.label}</Kicker>
            <div style={{ fontSize: mob ? 20 : 25, fontWeight: 500, color: k.accent, margin: "8px 0 3px", letterSpacing: ".01em" }}>{k.val}</div>
            <div style={{ fontSize: 11, color: C.faint }}>{k.sub}</div>
          </Card>
        ))}
      </div>
      <Card className="fade" style={{ marginBottom: 18, animationDelay: "220ms" }}>
        <SecTitle kicker="Monthly trend" title="月次経費推移（実績）" sub="2025年度 ／ 電子請求書データを自動集計（単位：万円）" right={!mob && <Pill fg={C.brand} bg={C.tint}>年間 +6.2%</Pill>} />
        <div style={{ height: mob ? 205 : 245 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY} margin={{ top: 4, right: 6, left: -12, bottom: 0 }}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.brand} stopOpacity={0.22} /><stop offset="100%" stopColor={C.brand} stopOpacity={0.01} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="2 4" stroke={C.hair} vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: C.faint }} axisLine={{ stroke: C.hair }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.faint }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} width={42} />
              <Tooltip formatter={(v) => [`${v.toLocaleString()} 万円`, "経費"]} contentStyle={{ borderRadius: 10, border: `1px solid ${C.hair}`, fontSize: 12, fontFamily: FONT }} />
              <Area type="monotone" dataKey="v" stroke={C.brand} strokeWidth={2} fill="url(#g)" dot={{ r: 2, fill: C.brand }} activeDot={{ r: 4.5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 18 }}>
        <Card className="fade" style={{ animationDelay: "300ms" }}>
          <SecTitle kicker="By category" title="カテゴリ別内訳" sub="勘定科目をAIで自動分類" />
          {CATEGORIES.map((c, i) => (
            <div key={i} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}><span style={{ color: C.ink2, fontWeight: 500 }}>{c.name}</span><span style={{ color: C.ink, fontWeight: 700 }}>{jy(c.v)}</span></div>
              <Bar pct={(c.v / maxCat) * 100} h={5} />
            </div>
          ))}
        </Card>
        <Card className="fade" style={{ animationDelay: "360ms" }}>
          <SecTitle kicker="Top vendors" title="主要取引先 TOP6" sub="支払金額順 ／ ◆は削減余地検出" />
          {TOP_VENDORS.map((v, i) => (
            <div key={i} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}><span style={{ color: C.ink2, fontWeight: 500 }}>{v.flag && <span style={{ color: C.terra, marginRight: 5, fontSize: 9 }}>◆</span>}{v.name}</span><span style={{ color: C.ink, fontWeight: 700 }}>{jy(v.v)}</span></div>
              <Bar pct={(v.v / maxVen) * 100} h={5} color={v.flag ? C.terra : "#c4cdc9"} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ============================== CHAT ============================== */
const CHAT_CATS = [...PLANS_BY_SAVING.map((p) => ({ label: p.cat, value: p.id })), { label: "おまかせ全体診断", value: "all" }];
const POLICY_OPTS = [{ label: "事業者の変更もOK", value: "switch" }, { label: "現事業者と再交渉を優先", value: "reneg" }, { label: "まだ決めていない", value: "undecided" }];
const PRIORITY_OPTS = [{ label: "とにかくコスト", value: "cost" }, { label: "品質・安定性", value: "quality" }, { label: "サポート重視", value: "support" }, { label: "移行のしやすさ", value: "easy" }];
const RESULT_OPTS = [{ label: "＋ この施策を提案書に追加", value: "add" }, { label: "切替先候補を全部見る", value: "seeall" }, { label: "別カテゴリを診断", value: "again" }];
const EASY_TAGS = ["移行リスク低", "違約金なし", "事業者継続", "移行不要", "切替代行", "即効性"];
const renegMatch = (c) => c.tags.some((t) => /再交渉|事業者継続|統合|一本化/.test(t));
function rankCandidates(plan, priority, policy) {
  let list = plan.candidates.filter((c) => !c.base).slice();
  if (priority === "cost") list.sort((a, b) => a.est - b.est);
  else if (priority === "quality" || priority === "support") list.sort((a, b) => b.rating - a.rating);
  else list.sort((a, b) => EASY_TAGS.filter((t) => b.tags.includes(t)).length - EASY_TAGS.filter((t) => a.tags.includes(t)).length || b.rating - a.rating);
  if (policy === "reneg") list = [...list.filter(renegMatch), ...list.filter((c) => !renegMatch(c))];
  return list;
}
function matchCat(text) {
  const t = text.toLowerCase();
  if (/通信|回線|電話|ntt/.test(t)) return "telecom";
  if (/クラウド|saas|aws|サーバ/.test(t)) return "cloud";
  if (/電力|電気|ガス|光熱/.test(t)) return "power";
  if (/物流|配送|運送|宅配/.test(t)) return "logi";
  if (/備品|文具|消耗/.test(t)) return "supply";
  if (/保守|保険|メンテ/.test(t)) return "maint";
  return null;
}
function MarketBar({ planId }) {
  const plan = PLANS.find((p) => p.id === planId);
  const [lo, hi] = plan.market, max = Math.max(hi, plan.current) * 1.12;
  return (
    <div style={{ background: C.warm, border: `1px solid ${C.hair}`, borderRadius: 10, padding: "12px 14px", marginTop: 4 }}>
      <Kicker color={C.muted} style={{ fontSize: 9, marginBottom: 9 }}>{plan.cat}：年間相場との比較</Kicker>
      <div style={{ position: "relative", height: 26 }}>
        <div style={{ position: "absolute", top: 10, left: `${(lo / max) * 100}%`, width: `${((hi - lo) / max) * 100}%`, height: 6, background: "#cfe3dd", borderRadius: 4 }} />
        <div style={{ position: "absolute", top: 3, left: `${(plan.current / max) * 100}%`, width: 2.5, height: 20, background: C.terra, borderRadius: 2 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: C.muted }}>相場 <b style={{ color: C.brand }}>{manRange(plan.market)}</b></span><span style={{ color: C.terra, fontWeight: 700 }}>● 自社 {jy(plan.current)}</span></div>
    </div>
  );
}
function ChatCand({ c, plan, top }) {
  return (
    <div style={{ border: `1px solid ${top ? C.save : C.hair}`, borderRadius: 11, padding: "11px 13px", marginTop: 8, position: "relative", background: "#fff" }}>
      {top && <div style={{ position: "absolute", top: -9, left: 12 }}><Pill fg="#fff" bg={C.save}>★ 推奨</Pill></div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginTop: top ? 4 : 0 }}><span style={{ fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.4 }}>{c.name}</span><span style={{ fontSize: 13.5, fontWeight: 700, color: C.save, whiteSpace: "nowrap" }}>−{jy(plan.current - c.est)}</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0" }}><Stars r={c.rating} /><span style={{ fontSize: 10.5, color: C.faint }}>口コミ {c.reviews}件</span></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{c.tags.slice(0, 3).map((t, i) => <span key={i} style={{ fontSize: 10, color: C.ink2, background: C.tint, padding: "2px 8px", borderRadius: 5, fontWeight: 500 }}>{t}</span>)}</div>
    </div>
  );
}
function Chat({ sel, setSel, goTab, setPlanId }) {
  const mob = useIsMobile();
  const [msgs, setMsgs] = useState([{ role: "bot", kind: "text", text: "こんにちは。BtoBプラットフォーム生産性UpのAI分析アシスタントです。請求書データをもとに、コスト削減の余地を一緒に診断します。まず、どの経費を見てみますか？" }]);
  const [quick, setQuick] = useState(CHAT_CATS);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [ctx, setCtx] = useState({ step: "category" });
  const endRef = useRef(null);
  useEffect(() => { if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight; }, [msgs, typing]);
  const advance = (step, value) => {
    setTyping(false);
    if (step === "category") {
      if (value === "all") {
        const top = PLANS_BY_SAVING.slice(0, 3);
        setMsgs((m) => [...m, { role: "bot", kind: "text", text: `全${PLANS.length}領域を診断しました。削減インパクトの大きい順はこちらです。合計で年間 約${jy(POTENTIAL)} の余地があります。` }, { role: "bot", kind: "toplist", plans: top }, { role: "bot", kind: "text", text: "まずはどの領域を深掘りしますか？" }]);
        setCtx({ step: "category" }); setQuick(CHAT_CATS.filter((c) => c.value !== "all"));
      } else {
        const plan = PLANS.find((p) => p.id === value), over = Math.round(((plan.current - plan.market[1]) / plan.market[1]) * 100);
        setMsgs((m) => [...m, { role: "bot", kind: "market", planId: value }, { role: "bot", kind: "text", text: `御社の${plan.cat}は年間 ${jy(plan.current)}。相場上限を約${over}%上回っており、削減余地があります。切替の方針はいかがしますか？` }]);
        setCtx({ step: "policy", planId: value }); setQuick(POLICY_OPTS);
      }
    } else if (step === "policy") {
      setCtx((c) => ({ ...c, step: "priority", policy: value }));
      setMsgs((m) => [...m, { role: "bot", kind: "text", text: "承知しました。切替先を選ぶうえで、最も重視する点はどれですか？" }]); setQuick(PRIORITY_OPTS);
    } else if (step === "priority") {
      const plan = PLANS.find((p) => p.id === ctx.planId), ranked = rankCandidates(plan, value, ctx.policy);
      const intro = { cost: "コストを最優先", quality: "品質・安定性を重視", support: "サポート体制を重視", easy: "移行のしやすさを重視" }[value];
      setMsgs((m) => [...m, { role: "bot", kind: "text", text: `${intro}して並べ替えました。${plan.cat}は年間 約${jy(plan.saving)} の削減が見込めます。おすすめの切替先はこちらです。` }, { role: "bot", kind: "result", planId: ctx.planId, ranked }]);
      setCtx((c) => ({ ...c, step: "result" })); setQuick(RESULT_OPTS);
    } else if (step === "result") {
      if (value === "add") { setSel((s) => ({ ...s, [ctx.planId]: true })); setMsgs((m) => [...m, { role: "bot", kind: "text", text: "提案書に追加しました。「経営インパクト分析」「経営サマリー」「RFP」に反映されます。他の領域も診断しますか？" }]); setCtx({ step: "category" }); setQuick(CHAT_CATS); }
      else if (value === "seeall") { setPlanId(ctx.planId); goTab("candidates"); }
      else { setMsgs((m) => [...m, { role: "bot", kind: "text", text: "どの経費を診断しますか？" }]); setCtx({ step: "category" }); setQuick(CHAT_CATS); }
    }
  };
  const pick = (opt) => { const step = ctx.step; setMsgs((m) => [...m, { role: "user", text: opt.label }]); setQuick([]); setTyping(true); setTimeout(() => advance(step, opt.value), 620); };
  const send = () => {
    const text = input.trim(); if (!text) return; setInput("");
    setMsgs((m) => [...m, { role: "user", text }]); setQuick([]); setTyping(true);
    const cat = matchCat(text);
    if (cat) setTimeout(() => advance("category", cat), 620);
    else setTimeout(() => { setTyping(false); setMsgs((m) => [...m, { role: "bot", kind: "text", text: "恐れ入ります。下のボタンから選ぶか、「通信」「クラウド」「電力」「物流」「備品」「保守」などの経費名でお知らせください。" }]); setQuick(CHAT_CATS); }, 520);
  };
  return (
    <div>
      <SecTitle kicker="AI diagnosis" title="AI診断チャット" sub="対話で要件を絞り込み、相場比較から最適な切替先候補までご案内します" />
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div ref={endRef} style={{ height: mob ? "56vh" : 430, overflowY: "auto", padding: 18, background: "#fbfcfb" }}>
          {msgs.map((m, i) => {
            if (m.role === "user") return <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}><div style={{ background: C.brand, color: "#fff", fontSize: 13, fontWeight: 400, padding: "9px 14px", borderRadius: "13px 13px 3px 13px", maxWidth: "80%", lineHeight: 1.5 }}>{m.text}</div></div>;
            const plan = m.planId ? PLANS.find((p) => p.id === m.planId) : null;
            return (
              <div key={i} style={{ display: "flex", gap: 9, marginBottom: 12, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: C.brand, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>B</div>
                <div style={{ maxWidth: "84%" }}>
                  {m.kind === "text" && <div style={{ background: "#fff", border: `1px solid ${C.hair}`, fontSize: 13, color: C.ink2, padding: "10px 14px", borderRadius: "3px 13px 13px 13px", lineHeight: 1.65 }}>{m.text}</div>}
                  {m.kind === "market" && <MarketBar planId={m.planId} />}
                  {m.kind === "toplist" && (
                    <div style={{ background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 11, padding: "6px 13px" }}>
                      {m.plans.map((p, j) => (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: j ? `1px solid ${C.hair}` : "none" }}>
                          <span style={{ color: C.brand, fontWeight: 700, fontSize: 12, minWidth: 14 }}>{j + 1}</span>
                          <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: C.ink }}>{p.cat}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.save }}>−{jy(p.saving)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.kind === "result" && (
                    <div style={{ background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 11, padding: 13 }}>
                      <Kicker color={C.muted} style={{ fontSize: 9 }}>{plan.cat} 年間削減見込</Kicker>
                      <div style={{ fontSize: 21, fontWeight: 600, color: C.save, margin: "3px 0 4px" }}>−{jy(plan.saving)} <span style={{ fontSize: 11.5, color: C.faint, fontWeight: 500 }}>／ 削減率 {plan.rate}%</span></div>
                      {m.ranked.slice(0, 3).map((c, j) => <ChatCand key={j} c={c} plan={plan} top={j === 0} />)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {typing && (
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: C.brand, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>B</div>
              <div style={{ background: "#fff", border: `1px solid ${C.hair}`, padding: "11px 14px", borderRadius: 11, display: "flex", gap: 4 }}>{[0, 1, 2].map((d) => <span key={d} className="tdot" style={{ width: 6, height: 6, borderRadius: "50%", background: C.faint, animationDelay: `${d * 0.18}s` }} />)}</div>
            </div>
          )}
        </div>
        {quick.length > 0 && !typing && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 14px 4px", borderTop: `1px solid ${C.hair}` }}>
            {quick.map((o, i) => <button key={i} onClick={() => pick(o)} style={{ border: `1px solid ${C.brand}`, background: "#fff", color: C.brand, fontFamily: FONT, fontSize: 12, fontWeight: 500, padding: "7px 13px", borderRadius: 999, cursor: "pointer" }}>{o.label}</button>)}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, padding: 14 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="自由入力もできます（例：通信費を見たい）" style={{ flex: 1, border: `1px solid ${C.hair}`, borderRadius: 10, padding: "10px 13px", fontSize: 13, fontFamily: FONT, outline: "none", color: C.ink, background: "#fff" }} />
          <button onClick={send} style={{ border: "none", background: C.brand, color: "#fff", fontFamily: FONT, fontSize: 13, fontWeight: 600, padding: "0 18px", borderRadius: 10, cursor: "pointer" }}>送信</button>
        </div>
      </Card>
    </div>
  );
}

/* ============================== IMPACT ============================== */
function ScatterTip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return <div style={{ background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 9, padding: "8px 11px", fontSize: 12, fontFamily: FONT }}><div style={{ fontWeight: 700, color: C.ink }}>{d.name}</div><div style={{ color: C.muted }}>売上 {d.x}億 ・ 営業利益率 {d.y.toFixed(1)}%</div></div>;
}
function Impact({ sel, setSel }) {
  const mob = useIsMobile();
  const { cut, newSgaRate, newOp, newOpRate } = computeImpact(sel);
  const dOp = newOpRate - OP_RATE;
  const toggle = (id) => setSel((s) => ({ ...s, [id]: !s[id] }));
  const preset = (mode) => {
    if (mode === "all") setSel(Object.fromEntries(PLANS.map((p) => [p.id, true])));
    else if (mode === "none") setSel(Object.fromEntries(PLANS.map((p) => [p.id, false])));
    else if (mode === "low") setSel(Object.fromEntries(PLANS.map((p) => [p.id, p.effort === "低"])));
    else if (mode === "lowmid") setSel(Object.fromEntries(PLANS.map((p) => [p.id, p.effort !== "高"])));
  };
  const maxRate = Math.max(...SGA_PEERS.map((p) => p.rate));
  const selfSeries = [{ name: "自社（現状）", x: 68, y: OP_RATE, proj: false }, { name: "自社（試算後）", x: 68, y: newOpRate, proj: true }];
  const SelfDot = (props) => { const { cx, cy, payload } = props; if (cx == null) return null; return payload.proj ? <g><circle cx={cx} cy={cy} r={10} fill={C.save} fillOpacity={0.16} /><circle cx={cx} cy={cy} r={6.5} fill={C.save} stroke="#fff" strokeWidth={2} /></g> : <circle cx={cx} cy={cy} r={6.5} fill={C.terra} stroke="#fff" strokeWidth={2} />; };
  const opMax = Math.max(newOp, OP) * 1.08;
  const monthlyCut = cut / 12 / 1e4;
  const fc = [];
  MONTHLY.forEach((d, i) => fc.push({ m: d.m, actual: d.v, baseline: i === 11 ? d.v : null, reduced: i === 11 ? d.v : null }));
  FUTURE_LABELS.forEach((lab, i) => { const base = 4180 + i * 14; fc.push({ m: lab, actual: null, baseline: Math.round(base), reduced: Math.round(base - monthlyCut) }); });

  return (
    <div>
      <Card className="fade" style={{ marginBottom: 18 }}>
        <SecTitle kicker="Benchmark" title="業界ベンチマーク：売上対比 販管費率" sub="同業他社（匿名）との比較。バーが短いほど効率的" />
        {SGA_PEERS.slice().sort((a, b) => a.rate - b.rate).map((p, i) => {
          const col = p.self ? C.terra : p.median ? "#caa53e" : "#c4cdc9";
          return (
            <div key={i} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}><span style={{ color: p.self ? C.terra : C.ink2, fontWeight: p.self || p.median ? 700 : 500 }}>{p.self ? "自社" : p.median ? "業界中央値" : p.name}</span><span style={{ color: p.self ? C.terra : C.ink, fontWeight: 700 }}>{p.rate}%</span></div>
              <Bar pct={(p.rate / maxRate) * 100} h={7} color={col} />
            </div>
          );
        })}
        <div style={{ marginTop: 14, background: C.terraBg, borderRadius: 10, padding: "12px 14px", fontSize: 12, color: C.ink2, lineHeight: 1.7, borderLeft: `3px solid ${C.terra}` }}>自社の販管費率 <b style={{ color: C.terra }}>27.8%</b> は業界中央値 <b>24.5%</b> を <b style={{ color: C.terra }}>3.3pt</b> 上回ります。中央値まで圧縮すれば理論上 <b>約2.2億円</b> の余地。うち実行可能な削減として <b style={{ color: C.save }}>{jy(POTENTIAL)}</b> を特定済みです。</div>
      </Card>

      <Card className="fade" style={{ marginBottom: 18, animationDelay: "90ms" }}>
        <SecTitle kicker="Simulation" title="収益インパクト試算（施策の積み上げ）" sub="実施する施策をON/OFFすると、販管費率・営業利益率がリアルタイムに変化します" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {[["low", "難易度・低のみ"], ["lowmid", "低＋中"], ["all", "すべて実施"], ["none", "クリア"]].map(([k, lab]) => (
            <button key={k} onClick={() => preset(k)} style={{ border: `1px solid ${C.hair}`, background: "#fff", color: C.ink2, fontFamily: FONT, fontSize: 11.5, fontWeight: 500, padding: "6px 12px", borderRadius: 999, cursor: "pointer" }}>{lab}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {PLANS_BY_SAVING.map((p) => {
            const on = !!sel[p.id], ec = effortColor(p.effort);
            return (
              <div key={p.id} onClick={() => toggle(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", border: `1px solid ${on ? C.save : C.hair}`, background: on ? C.tint : "#fff", borderRadius: 11, cursor: "pointer", transition: "all .2s" }}>
                <Switch on={on} />
                <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 7 }}><span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{p.cat}</span><Pill fg={ec.fg} bg={on ? "#fff" : ec.bg}>{p.effort}</Pill></div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: on ? C.save : C.faint, whiteSpace: "nowrap" }}>−{jy(p.saving)}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginBottom: 7, display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ color: C.muted, fontWeight: 500 }}>削減額の積み上げ</span><span style={{ fontWeight: 700, color: C.save }}>{jy(cut)} <span style={{ color: C.faint, fontWeight: 500 }}>／ 最大 {jy(POTENTIAL)}</span></span></div>
        <div style={{ display: "flex", height: 26, borderRadius: 7, overflow: "hidden", background: "#edf1ef", marginBottom: 22 }}>
          {PLANS_BY_SAVING.map((p) => <div key={p.id} title={`${p.cat} −${jy(p.saving)}`} style={{ width: `${(p.saving / POTENTIAL) * 100}%`, height: "100%", background: sel[p.id] ? PC[p.id] : "transparent", borderRight: "1px solid rgba(255,255,255,.7)", transition: "background .3s" }} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 22 }}>
          {[["販管費率", SGA_RATE, newSgaRate, C.brand, "−", (SGA_RATE - newSgaRate)], ["営業利益率", OP_RATE, newOpRate, C.save, "+", dOp]].map(([lab, a, b, col, sg, d], i) => (
            <div key={i} style={{ background: C.warm, border: `1px solid ${C.hair}`, borderRadius: 11, padding: 16 }}>
              <Kicker color={C.muted} style={{ fontSize: 9.5, marginBottom: 9 }}>{lab}</Kicker>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}><span style={{ fontSize: 19, fontWeight: 500, color: C.faint }}>{a.toFixed(1)}%</span><span style={{ color: C.faint }}>→</span><span style={{ fontSize: 25, fontWeight: 600, color: col }}>{b.toFixed(1)}%</span><Pill fg={C.save} bg={C.tint}>{sg}{Math.abs(d).toFixed(1)}pt</Pill></div>
            </div>
          ))}
        </div>
        <Kicker color={C.muted} style={{ fontSize: 9.5, marginBottom: 8 }}>営業利益の改善イメージ</Kicker>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}><span style={{ color: C.ink2 }}>現状</span><span style={{ fontWeight: 700, color: C.ink }}>{jy(OP)}</span></div><div style={{ height: 24, background: "#edf1ef", borderRadius: 6 }}><div style={{ width: `${(OP / opMax) * 100}%`, height: "100%", borderRadius: 6, background: C.brand }} /></div></div>
          <div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}><span style={{ color: C.ink2 }}>試算後</span><span style={{ fontWeight: 700, color: C.save }}>{jy(newOp)}</span></div><div style={{ height: 24, background: "#edf1ef", borderRadius: 6, display: "flex", overflow: "hidden" }}><div style={{ width: `${(OP / opMax) * 100}%`, height: "100%", background: C.brand, transition: "width .5s" }} /><div style={{ width: `${(cut / opMax) * 100}%`, height: "100%", background: `repeating-linear-gradient(45deg,${C.save},${C.save} 6px,#2f9c8a 6px,#2f9c8a 12px)`, transition: "width .5s" }} /></div></div>
        </div>
      </Card>

      <Card className="fade" style={{ marginBottom: 18, animationDelay: "150ms" }}>
        <SecTitle kicker="Forecast" title="削減後の月次推移予測" sub="実績(〜26.3) + 今後12ヶ月の予測。緑が削減実施後（選択中の施策を反映）" />
        <div style={{ height: mob ? 225 : 265 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fc} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={C.hair} vertical={false} />
              <ReferenceArea x1="26.4" x2="3" fill={C.brand} fillOpacity={0.035} />
              <XAxis dataKey="m" tick={{ fontSize: 9, fill: C.faint }} axisLine={{ stroke: C.hair }} tickLine={false} interval={mob ? 2 : 1} />
              <YAxis tick={{ fontSize: 10, fill: C.faint }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} width={42} domain={[3000, 4600]} />
              <Tooltip formatter={(v, n) => [`${Number(v).toLocaleString()} 万円`, n === "actual" ? "実績" : n === "baseline" ? "削減なし(予測)" : "削減後(予測)"]} contentStyle={{ borderRadius: 9, border: `1px solid ${C.hair}`, fontSize: 12, fontFamily: FONT }} />
              <Line type="monotone" dataKey="actual" stroke={C.ink} strokeWidth={2.2} dot={{ r: 1.8 }} connectNulls={false} name="actual" />
              <Line type="monotone" dataKey="baseline" stroke={C.faint} strokeWidth={1.8} strokeDasharray="5 4" dot={false} connectNulls={false} name="baseline" />
              <Line type="monotone" dataKey="reduced" stroke={C.save} strokeWidth={2.4} dot={{ r: 1.8 }} connectNulls={false} name="reduced" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11.5, color: C.muted, marginTop: 6 }}><span><span style={{ color: C.ink }}>—</span> 実績</span><span><span style={{ color: C.faint }}>--</span> 削減なし（予測）</span><span><span style={{ color: C.save }}>—</span> 削減後（予測）</span><span style={{ marginLeft: "auto", fontWeight: 700, color: C.save }}>年間効果 −{jy(cut)}</span></div>
      </Card>

      <Card className="fade" style={{ animationDelay: "210ms" }}>
        <SecTitle kicker="Positioning" title="業界ポジショニング" sub="売上高 × 営業利益率。緑の点線が削減実施による自社の移動" />
        <div style={{ height: mob ? 275 : 315 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 14, left: -8, bottom: 14 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={C.hair} />
              <XAxis type="number" dataKey="x" name="売上高" unit="億" domain={[20, 140]} tick={{ fontSize: 10, fill: C.faint }} axisLine={{ stroke: C.hair }} tickLine={false} label={{ value: "売上高（億円）", position: "insideBottom", offset: -8, fontSize: 10.5, fill: C.muted }} />
              <YAxis type="number" dataKey="y" name="営業利益率" unit="%" domain={[3, 13]} tick={{ fontSize: 10, fill: C.faint }} axisLine={false} tickLine={false} width={40} />
              <ZAxis range={[70, 70]} />
              <ReferenceLine y={IND_AVG_MARGIN} stroke={C.faint} strokeDasharray="4 4" label={{ value: "業界平均 8.1%", position: "right", fontSize: 9.5, fill: C.faint }} />
              <Tooltip content={<ScatterTip />} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={POS_PEERS} fill="#c4cdc9" />
              <Scatter data={selfSeries} shape={<SelfDot />} line={{ stroke: C.save, strokeWidth: 2, strokeDasharray: "5 5" }} lineJointType="monotone" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11.5, color: C.muted, marginTop: 4 }}><span><span style={{ color: C.terra }}>●</span> 自社（現状）</span><span><span style={{ color: C.save }}>●</span> 自社（試算後）</span><span><span style={{ color: "#c4cdc9" }}>●</span> 同業他社</span></div>
      </Card>
    </div>
  );
}

/* ============================== PLANS ============================== */
function Plans({ onSelect }) {
  const mob = useIsMobile();
  return (
    <div>
      <Card className="fade" style={{ marginBottom: 22, background: C.tint, borderColor: "#d6e6e0", boxShadow: "none" }}>
        <Kicker>AI Proposal Summary</Kicker>
        <div style={{ fontSize: mob ? 17 : 21, fontWeight: 500, margin: "8px 0 6px", lineHeight: 1.5, color: C.ink }}>年間 <span style={{ color: C.save, fontWeight: 700 }}>{jy(POTENTIAL)}</span> の削減ポテンシャルを検出しました</div>
        <p style={{ margin: 0, fontSize: 12.5, color: C.ink2, lineHeight: 1.75 }}>請求書データの単価・数量・契約条件を市場ベンチマークと照合し、削減余地の大きい6領域を抽出。各領域で事業者データベースから切替候補を提示します。まずは難易度「低」かつ即効性の高い領域からの着手を推奨します。</p>
      </Card>
      <SecTitle kicker="Cost reduction plans" title="コスト削減プラン" sub="削減見込額の大きい順 ／ カードをタップで切替先候補へ" />
      <div style={{ display: "grid", gap: 13 }}>
        {PLANS_BY_SAVING.map((p, i) => {
          const ec = effortColor(p.effort);
          return (
            <Card key={p.id} className="fade" onClick={() => onSelect(p.id)} style={{ padding: 16, cursor: "pointer", display: "flex", flexWrap: "wrap", gap: mob ? 12 : 16, alignItems: "center", transition: "transform .15s", animationDelay: `${i * 45}ms` }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", border: `1.5px solid ${C.brand}`, color: C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}><span style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{p.cat}</span><Pill fg={ec.fg} bg={ec.bg}>難易度：{p.effort}</Pill></div>
                <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{p.reason}</p>
              </div>
              <div style={{ textAlign: mob ? "left" : "right", whiteSpace: "nowrap", flexShrink: 0 }}><div style={{ fontSize: 10.5, color: C.faint }}>現状 {jy(p.current)}</div><div style={{ fontSize: 19, fontWeight: 600, color: C.save, lineHeight: 1.2 }}>−{jy(p.saving)}</div><div style={{ fontSize: 11.5, fontWeight: 700, color: C.save }}>削減率 {p.rate}% ›</div></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== CANDIDATES ============================== */
function Candidates({ planId, setPlanId }) {
  const plan = PLANS.find((p) => p.id === planId) || PLANS[0];
  return (
    <div>
      <SecTitle kicker="Switching candidates" title="切替先 事業者候補" sub="事業者データベースから現契約と比較" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {PLANS.map((p) => { const on = p.id === plan.id; return <button key={p.id} onClick={() => setPlanId(p.id)} style={{ border: `1px solid ${on ? C.brand : C.hair}`, background: on ? C.brand : C.card, color: on ? "#fff" : C.ink2, fontSize: 12, fontWeight: 500, padding: "7px 14px", borderRadius: 999, cursor: "pointer", fontFamily: FONT }}>{p.cat}</button>; })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
        {plan.candidates.map((c, i) => (
          <div key={i} className="fade" style={{ background: c.base ? C.warm : C.card, border: `1px solid ${c.rec ? C.save : C.hair}`, borderRadius: 12, padding: 18, boxShadow: c.base ? "none" : SHADOW, position: "relative", animationDelay: `${i * 55}ms` }}>
            {c.rec && <div style={{ position: "absolute", top: -10, left: 16 }}><Pill fg="#fff" bg={C.save}>★ 推奨</Pill></div>}
            {c.base && <div style={{ position: "absolute", top: -10, left: 16 }}><Pill fg={C.muted} bg="#fff" bd={C.hair}>現契約</Pill></div>}
            <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink, marginTop: 4, marginBottom: 10, minHeight: 40 }}>{c.name}</div>
            {!c.base && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><Stars r={c.rating} /><span style={{ fontSize: 10.5, color: C.faint }}>口コミ {c.reviews}件</span></div>}
            <div style={{ borderTop: `1px solid ${C.hair}`, paddingTop: 12, marginBottom: 12 }}><Kicker color={C.muted} style={{ fontSize: 9 }}>想定年間コスト</Kicker><div style={{ fontSize: 19, fontWeight: 600, color: C.ink, marginTop: 3 }}>{jy(c.est)}</div>{!c.base && <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, background: C.tint, padding: "4px 10px", borderRadius: 8 }}><span style={{ fontSize: 13, fontWeight: 700, color: C.save }}>−{jy(plan.current - c.est)}</span><span style={{ fontSize: 10.5, color: C.save, fontWeight: 500 }}>/ 年</span></div>}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: c.base ? 0 : 14 }}>{c.tags.map((t, j) => <span key={j} style={{ fontSize: 10.5, color: C.ink2, background: C.tint, padding: "3px 9px", borderRadius: 6, fontWeight: 500 }}>{t}</span>)}</div>
            {!c.base && (<><div style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.muted, marginBottom: 5 }}><span>適合度（自社要件マッチ）</span><span style={{ fontWeight: 700, color: C.brand }}>{c.match}%</span></div><Bar pct={c.match} h={5} /></div><button style={{ width: "100%", border: "none", borderRadius: 9, padding: "9px 0", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: FONT, background: c.rec ? C.save : C.tint, color: c.rec ? "#fff" : C.brand }}>提案書に追加して比較 ›</button></>)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== SUMMARY ============================== */
function Summary({ sel, goTab }) {
  const mob = useIsMobile();
  const { cut, chosen, newOpRate, newSgaRate } = computeImpact(sel);
  const dOp = newOpRate - OP_RATE;
  const remaining = PLANS.filter((p) => !sel[p.id]).sort((a, b) => b.saving - a.saving);
  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div>
      <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={() => goTab("rfp")} style={{ border: `1px solid ${C.brand}`, background: "#fff", color: C.brand, fontFamily: FONT, fontSize: 12.5, fontWeight: 600, padding: "9px 16px", borderRadius: 10, cursor: "pointer" }}>この内容でRFPを作成 ›</button>
        <button onClick={() => window.print()} style={{ border: "none", background: C.brand, color: "#fff", fontFamily: FONT, fontSize: 12.5, fontWeight: 600, padding: "9px 18px", borderRadius: 10, cursor: "pointer", boxShadow: SHADOW }}>⤓ 印刷 / PDF保存</button>
      </div>
      <div id="sheet" style={{ background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 14, padding: mob ? 22 : 38, boxShadow: SHADOW }}>
        <div style={{ borderBottom: `1.5px solid ${C.brand}`, paddingBottom: 16, marginBottom: 22 }}>
          <Kicker>Executive Summary</Kicker>
          <h1 style={{ margin: "6px 0 4px", fontSize: mob ? 20 : 25, fontWeight: 600, color: C.ink, letterSpacing: ".02em" }}>経営サマリー：間接費 最適化提案</h1>
          <div style={{ fontSize: 12.5, color: C.muted }}>{COMPANY} 御中　／　作成日 {today}　／　データ：請求書データ × 発注先DB</div>
        </div>
        <div style={{ background: C.tint, borderRadius: 12, padding: mob ? 18 : 24, marginBottom: 24, borderLeft: `3px solid ${C.brand}` }}>
          <Kicker color={C.muted} style={{ fontSize: 9.5 }}>選択中の施策による効果（年間）</Kicker>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", margin: "8px 0 4px" }}><span style={{ fontSize: mob ? 30 : 38, fontWeight: 600, color: C.save, lineHeight: 1 }}>−{jy(cut)}</span><span style={{ fontSize: 13.5, color: C.ink2 }}>営業利益率 {OP_RATE.toFixed(1)}% → <b style={{ color: C.save }}>{newOpRate.toFixed(1)}%</b>（+{dOp.toFixed(1)}pt）</span></div>
          <div style={{ fontSize: 12, color: C.muted }}>販管費率 {SGA_RATE.toFixed(1)}% → {newSgaRate.toFixed(1)}% ／ 対象施策 {chosen.length} 件</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 26 }}>
          {[["年間間接費", jy(TOTAL_SPEND)], ["特定した削減余地", jy(POTENTIAL)], ["選択中の削減額", jy(cut)], ["分析取引先数", `${VENDOR_COUNT}社`]].map(([l, v], i) => (
            <div key={i} style={{ border: `1px solid ${C.hair}`, borderRadius: 11, padding: "12px 14px" }}><Kicker color={C.muted} style={{ fontSize: 9 }}>{l}</Kicker><div style={{ fontSize: mob ? 16 : 18, fontWeight: 600, color: C.ink, marginTop: 5 }}>{v}</div></div>
          ))}
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: "0 0 12px" }}>実施対象の施策と推奨切替先</h3>
        {chosen.length === 0 ? (
          <div style={{ background: C.warm, borderRadius: 10, padding: 16, fontSize: 12.5, color: C.muted, marginBottom: 24 }}>「経営インパクト分析」または「AI診断チャット」で実施する施策を選択すると、ここに反映されます。</div>
        ) : (
          <div style={{ border: `1px solid ${C.hair}`, borderRadius: 11, overflow: "hidden", marginBottom: 24 }}>
            {chosen.map((p, i) => { const ec = effortColor(p.effort); return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderTop: i ? `1px solid ${C.hair}` : "none", flexWrap: "wrap" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: PC[p.id], flexShrink: 0 }} />
                <div style={{ flex: "1 1 200px", minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{p.cat}</div><div style={{ fontSize: 11, color: C.muted }}>推奨切替先：{p.best}</div></div>
                <Pill fg={ec.fg} bg={ec.bg}>難易度 {p.effort}</Pill><span style={{ fontSize: 14.5, fontWeight: 700, color: C.save, whiteSpace: "nowrap" }}>−{jy(p.saving)}</span>
              </div>); })}
          </div>
        )}
        {remaining.length > 0 && (<><h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: "0 0 10px" }}>推奨：次の一手（未実施の余地）</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{remaining.map((p) => <span key={p.id} style={{ fontSize: 11.5, color: C.ink2, background: C.warm, border: `1px solid ${C.hair}`, borderRadius: 8, padding: "6px 11px", fontWeight: 500 }}>{p.cat} <span style={{ color: C.save, fontWeight: 700 }}>−{jy(p.saving)}</span></span>)}</div></>)}
        <div style={{ marginTop: 26, paddingTop: 16, borderTop: `1px solid ${C.hair}`, fontSize: 10, color: C.faint, lineHeight: 1.7 }}>※ 本資料はモック（デモ）です。金額・取引先・他社比較はすべてサンプルです。Powered by BtoBプラットフォーム生産性Up（請求書データ × 発注先DB 連携想定）。</div>
      </div>
    </div>
  );
}

/* ============================== RFP ============================== */
function renderRfp(doc, autoTable, chosen, company, todayStr) {
  const yen = (n) => "¥" + n.toLocaleString();
  const manRange = (m) => (m[0] / 1e4).toLocaleString() + "–" + (m[1] / 1e4).toLocaleString() + "万円";
  const EVAL = [["コスト", "40", "年間コスト、削減額・削減率、料金体系の妥当性"], ["品質・安定性", "25", "サービス品質、供給・通信の安定性、実績"], ["移行容易性", "20", "移行負荷、通信断／供給断の有無、違約金、リードタイム"], ["サポート体制・SLA", "15", "対応窓口・時間、障害対応、復旧目標の明確さ"]];
  const SCHED = [["RFP発行", "2026年5月27日"], ["質問受付期限", "2026年6月10日"], ["提案書 提出期限", "2026年6月24日 17:00"], ["一次評価・絞り込み", "2026年7月1日"], ["提案プレゼンテーション", "2026年7月8日"], ["最終選定・内示", "2026年7月15日"], ["契約締結（予定）", "2026年8月3日"], ["切替・移行開始", "2026年9月1日"]];
  const ASKS = ["料金体系：初期費用／月額／従量／手数料の内訳と算定根拠", "移行計画：スケジュール・体制・想定リスクと対策（通信断・供給断の有無を含む）", "サポート体制・SLA：窓口、対応時間、障害時対応、復旧目標", "契約条件：最低契約期間、違約金、更新条件、解約条件", "実績・導入事例：同規模・同業種での導入実績", "セキュリティ・コンプライアンス体制", "貴社の担当体制および当社との連絡フロー"];
  const NOTES = ["本書および本件に関して知り得た情報は秘密として取り扱ってください。", "提案書の作成・提出に要する費用は、提案者のご負担となります。", "評価・選定の結果およびその理由は、原則として開示いたしません。", "本RFPは契約の締結を確約するものではありません。"];
  const teal = [14, 90, 81], teal2 = [19, 119, 107], ink = [22, 32, 43], ink2 = [44, 55, 66],
    save = [21, 128, 99], muted = [113, 123, 132], faint = [150, 158, 165], hair = [214, 220, 217],
    terra = [180, 84, 47], tint = [238, 244, 242], warm = [244, 247, 245];
  const mL = 16, mR = 16, pageW = 210, cW = pageW - mL - mR, bottom = 276;
  let y = 0;
  const F = (s) => doc.setFont("JP", "normal").setFontSize(s);
  const col = (c) => doc.setTextColor(c[0], c[1], c[2]);
  function txt(str, x, yy, o) { o = o || {}; F(o.size || 10); col(o.rgb || ink); doc.text(str, x, yy, { align: o.align || "left", maxWidth: o.maxW, lineHeightFactor: o.lh || 1.3 }); }
  function ensure(h) { if (y + h > bottom) { doc.addPage(); y = 24; } }
  function hrule(yy, c, w) { c = c || hair; doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(w || 0.2); doc.line(mL, yy, pageW - mR, yy); }

  // ---------- COVER ----------
  doc.setFillColor(teal[0], teal[1], teal[2]); doc.rect(0, 0, 3.5, 297, "F");
  txt("RFP-2026-001", pageW - mR, 20, { align: "right", size: 9.5, rgb: muted });
  txt("REQUEST FOR PROPOSAL", mL + 6, 44, { size: 10, rgb: teal });
  txt("提案依頼書", mL + 6, 62, { size: 30, rgb: ink });
  txt("間接費最適化に伴う取引先選定について", mL + 6, 74, { size: 13.5, rgb: ink2 });
  doc.setDrawColor(ink[0], ink[1], ink[2]); doc.setLineWidth(0.5); doc.line(mL + 6, 82, mL + 6 + 46, 82);
  const meta = [["発行者", company + " 経営企画部"], ["発行日", todayStr], ["文書番号", "RFP-2026-001"], ["提出期限", "2026年6月24日（火）17:00 必着"], ["対象領域", chosen.length + "領域（後掲スコープ参照）"], ["データ出典", "請求書データ ／ 発注先DB"]];
  let my = 96;
  meta.forEach(([k, v]) => { txt(k, mL + 6, my, { size: 10, rgb: muted }); txt(v, mL + 44, my, { size: 10.5, rgb: ink }); hrule(my + 3, hair, 0.2); my += 9.5; });
  // confidential box
  const by = my + 6, bh = 22;
  doc.setFillColor(tint[0], tint[1], tint[2]); doc.rect(mL + 6, by, cW - 12, bh, "F");
  doc.setFillColor(teal[0], teal[1], teal[2]); doc.rect(mL + 6, by, 1.4, bh, "F");
  txt("本書の取扱いについて", mL + 12, by + 7, { size: 10, rgb: teal });
  txt("本書および関連資料は秘密情報です。提案目的以外での使用・第三者への開示を禁じます。本書は発注を確約するものではありません。", mL + 12, by + 13, { size: 9, rgb: ink2, maxW: cW - 24, lh: 1.4 });

  // ---------- helpers for content ----------
  function sectionHead(no, title, kick) {
    ensure(20); y += 4;
    txt(kick || "SECTION", mL, y, { size: 8, rgb: teal }); y += 6.5;
    F(22); col(teal); doc.text(no, mL, y);
    F(14.5); col(ink); doc.text(title, mL + (no.length > 1 ? 14 : 10), y);
    y += 3; doc.setDrawColor(ink[0], ink[1], ink[2]); doc.setLineWidth(0.5); doc.line(mL, y, pageW - mR, y); y += 7;
  }
  function para(str) { F(10); const lines = doc.splitTextToSize(str, cW); ensure(lines.length * 5 + 2); col(ink2); doc.text(lines, mL, y, { lineHeightFactor: 1.45 }); y += lines.length * 5.0 + 3; }
  function bullets(items, rgb) {
    items.forEach((it) => {
      F(9.8); const lines = doc.splitTextToSize(it, cW - 6); ensure(lines.length * 4.8 + 1.5);
      doc.setFillColor(rgb[0], rgb[1], rgb[2]); doc.rect(mL + 0.5, y - 2.6, 1.6, 1.6, "F");
      col(ink); doc.text(lines, mL + 5, y, { lineHeightFactor: 1.4 }); y += lines.length * 4.8 + 1.6;
    });
  }
  const table = (head, body, colStyles, opts) => {
    opts = opts || {};
    autoTable(doc, {
      startY: y, margin: { left: mL, right: mR },
      head: [head], body,
      styles: { font: "JP", fontStyle: "normal", fontSize: 8.6, cellPadding: 1.9, textColor: ink, lineColor: hair, lineWidth: 0.1, overflow: "linebreak" },
      headStyles: { fillColor: teal, textColor: [255, 255, 255], fontSize: 8.4, lineWidth: 0, halign: "left" },
      alternateRowStyles: { fillColor: [246, 249, 248] },
      columnStyles: colStyles || {},
      theme: "striped",
      didParseCell: (d) => { if (opts.totalRow && d.section === "body" && d.row.index === body.length - 1) { d.cell.styles.fillColor = warm; d.cell.styles.textColor = ink; } },
    });
    y = doc.lastAutoTable.finalY + 6;
  };

  // sections start on page 2
  doc.addPage(); y = 24;

  // 1 背景
  sectionHead("01", "本依頼の背景と目的");
  para("当社は2025年度の間接費を電子請求書データの分析により、販管費率が業界中央値（24.5%）を3.3ポイント上回る27.8%であることを把握しました。全社で年間 約5,060万円 の削減ポテンシャルを特定しています。");
  const totCur = chosen.reduce((s, p) => s + p.current, 0), totSav = chosen.reduce((s, p) => s + p.saving, 0);
  para("本提案依頼書（RFP）は、下記スコープに掲げる領域（合計年間 約" + Math.round(totSav / 1e4).toLocaleString() + "万円の削減見込）について、最適な取引先を選定するため、貴社からのご提案を依頼するものです。");

  // 2 スコープ
  sectionHead("02", "調達対象範囲（スコープ）");
  const scopeBody = chosen.map((p) => [p.cat, yen(p.current), manRange(p.market), yen(p.current - p.saving), yen(p.saving), p.rate + "%"]);
  scopeBody.push(["合　計", yen(totCur), "—", yen(totCur - totSav), yen(totSav), (totSav / totCur * 100).toFixed(1) + "%"]);
  table(["対象領域", "現状コスト", "年間相場", "目標コスト", "削減額", "削減率"], scopeBody,
    { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } }, { totalRow: true });

  // 3 要件
  sectionHead("03", "領域別の要件");
  chosen.forEach((p, i) => {
    ensure(14);
    F(11.5); col(ink); doc.text((i + 1) + ". " + p.cat, mL, y);
    F(9.5); col(muted); doc.text("｜ 重視点：" + p.focus, mL + doc.getTextWidth((i + 1) + ". " + p.cat) + 3, y);
    y += 6;
    F(9.5); col(terra); doc.text("必須要件", mL, y); y += 5; bullets(p.req.must, terra);
    y += 1; F(9.5); col(teal); doc.text("歓迎要件", mL, y); y += 5; bullets(p.req.want, teal);
    y += 4;
  });

  // 4 依頼事項
  sectionHead("04", "提案に含めていただきたい事項");
  ASKS.forEach((t, i) => {
    F(9.8); const lines = doc.splitTextToSize(t, cW - 8); ensure(lines.length * 4.8 + 1.5);
    col(teal); doc.text(("0" + (i + 1)).slice(-2), mL, y);
    col(ink); doc.text(lines, mL + 7, y, { lineHeightFactor: 1.4 }); y += lines.length * 4.8 + 1.8;
  });

  // 5 評価
  sectionHead("05", "評価基準と配点");
  const evb = EVAL.map((r) => r.slice()); evb.push(["合　計", "100", "—"]);
  table(["評価項目", "配点", "主な評価の観点"], evb, { 1: { halign: "center", cellWidth: 18 }, 0: { cellWidth: 38 } }, { totalRow: true });

  // 6 スケジュール
  sectionHead("06", "選定スケジュール");
  table(["区分", "日程"], SCHED, { 0: { cellWidth: 70 } });

  // 7 提出・留意
  sectionHead("07", "提出方法・留意事項");
  bullets(["提出方法：電子データ（PDF）をメール添付にて提出。様式は自由ですが「4.」を網羅してください。", "提出先：経営企画部 調達企画グループ（rfp@greenfield.example.co.jp）"].concat(NOTES), teal);

  // 付録A 候補
  sectionHead("A", "参考候補事業者リスト（発注先DB抽出）", "APPENDIX");
  chosen.forEach((p) => {
    ensure(20);
    F(11); col(ink); doc.text("■ " + p.cat, mL, y); y += 3;
    const cs = p.candidates.filter((c) => !c.base);
    const body = cs.map((c) => [c.name, yen(c.est), yen(p.current - c.est), "★ " + c.rating, c.tags.join("／")]);
    table(["候補事業者", "想定年間", "削減額", "評価", "主な特徴"], body,
      { 1: { halign: "right", cellWidth: 26 }, 2: { halign: "right", cellWidth: 24 }, 3: { halign: "center", cellWidth: 16 }, 0: { cellWidth: 42 } });
  });

  // footer on all pages
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    F(7.5); col(faint);
    doc.text("BtoBプラットフォーム生産性Up ／ 本書はサンプル（モック）です。金額・取引先・他社比較はサンプルであり、実在の事業者・契約とは関係ありません。", mL, 289);
    doc.text(String(i) + " / " + total, pageW - mR, 289, { align: "right" });
  }
}

let _libP = null;
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => { const sc = document.createElement("script"); sc.src = src; sc.onload = () => resolve(); sc.onerror = () => reject(new Error(src)); document.head.appendChild(sc); });
}
function loadPdfLibs() {
  const ready = () => window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API && window.jspdf.jsPDF.API.autoTable;
  if (ready()) return Promise.resolve(window.jspdf);
  if (_libP) return _libP;
  _libP = (async () => {
    if (!(window.jspdf && window.jspdf.jsPDF)) {
      try { await loadScriptOnce("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"); }
      catch (e) { await loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"); }
    }
    if (!(window.jspdf.jsPDF.API && window.jspdf.jsPDF.API.autoTable)) {
      try { await loadScriptOnce("https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"); }
      catch (e) { await loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"); }
    }
    return window.jspdf;
  })().catch((e) => { _libP = null; throw e; });
  return _libP;
}
let _fontP = null;
function loadJpFont() {
  if (_fontP) return _fontP;
  _fontP = fetch("/fonts/ipag.ttf").then((r) => { if (!r.ok) throw new Error("font fetch failed"); return r.arrayBuffer(); }).then((buf) => {
    const bytes = new Uint8Array(buf); let bin = ""; const CH = 0x8000;
    for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(bin);
  }).catch((e) => { _fontP = null; throw e; });
  return _fontP;
}

function RfpDoc({ sel, goTab }) {
  const mob = useIsMobile();
  const chosen = PLANS.filter((p) => sel[p.id]).sort((a, b) => b.saving - a.saving);
  const [busy, setBusy] = useState(false);
  const downloadPdf = async () => {
    if (busy || chosen.length === 0) return;
    setBusy(true);
    try {
      await loadPdfLibs();
      const fontB64 = await loadJpFont();
      const JsPDF = window.jspdf.jsPDF;
      const doc = new JsPDF({ unit: "mm", format: "a4" });
      doc.addFileToVFS("ipag.ttf", fontB64);
      doc.addFont("ipag.ttf", "JP", "normal");
      doc.setFont("JP");
      const autoTableFn = (d, opts) => d.autoTable(opts);
      const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
      renderRfp(doc, autoTableFn, chosen, COMPANY, today);
      doc.save("提案依頼書_RFP.pdf");
    } catch (e) {
      alert("PDFの生成に失敗しました。通信環境をご確認のうえ、再度お試しください。");
    } finally {
      setBusy(false);
    }
  };
  const totCur = chosen.reduce((s, p) => s + p.current, 0);
  const totSav = chosen.reduce((s, p) => s + p.saving, 0);
  const totTgt = totCur - totSav;
  const totRate = totCur ? ((totSav / totCur) * 100).toFixed(1) : "0";
  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });

  const secHead = (no, title, kick = "SECTION") => (
    <div style={{ marginTop: 26, marginBottom: 14 }}>
      <Kicker style={{ fontSize: 8.5 }}>{kick}</Kicker>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, borderBottom: `1.5px solid ${C.ink}`, paddingBottom: 8, marginTop: 2 }}>
        <span style={{ fontSize: 24, fontWeight: 300, color: C.brand, lineHeight: 1 }}>{no}</span>
        <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.ink, letterSpacing: ".03em" }}>{title}</h2>
      </div>
    </div>
  );
  const th = { textAlign: "left", fontSize: 9.5, fontWeight: 500, color: C.muted, letterSpacing: ".03em", padding: "6px 8px", borderBottom: `1.4px solid ${C.brand}` };
  const tdS = { padding: "7px 8px", borderBottom: `1px solid ${C.hair}`, fontSize: 10.5, color: C.ink };
  const numR = { textAlign: "right", fontVariantNumeric: "tabular-nums" };

  return (
    <div>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: C.muted }}>選択中の <b style={{ color: C.ink }}>{chosen.length}</b> 施策（合計削減見込 <b style={{ color: C.save }}>{jy(totSav)}</b>）を反映しています。</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => goTab("impact")} style={{ border: `1px solid ${C.hair}`, background: "#fff", color: C.ink2, fontFamily: FONT, fontSize: 12, fontWeight: 500, padding: "9px 14px", borderRadius: 10, cursor: "pointer" }}>施策を選び直す</button>
          <button onClick={downloadPdf} disabled={chosen.length === 0 || busy} style={{ border: "none", background: (chosen.length && !busy) ? C.brand : "#c4cdc9", color: "#fff", fontFamily: FONT, fontSize: 12.5, fontWeight: 600, padding: "9px 20px", borderRadius: 10, cursor: (chosen.length && !busy) ? "pointer" : "default", boxShadow: SHADOW }}>{busy ? "PDF生成中…" : "⤓ PDFをダウンロード"}</button>
        </div>
      </div>

      {chosen.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 13 }}>
          実施対象の施策が選択されていません。<br />「経営インパクト分析」または「AI診断チャット」で施策を選ぶと、RFPが自動生成されます。
        </Card>
      ) : (
        <div id="rfp-sheet" style={{ background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 14, padding: mob ? 24 : "44px 48px", boxShadow: SHADOW, maxWidth: 820, margin: "0 auto", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: C.brand }} />
          {/* cover head */}
          <div style={{ float: "right", fontSize: 11, letterSpacing: ".1em", color: C.muted, fontWeight: 500 }}>RFP-2026-001</div>
          <Kicker style={{ letterSpacing: ".3em" }}>Request for Proposal</Kicker>
          <h1 style={{ fontSize: mob ? 30 : 38, fontWeight: 300, letterSpacing: ".18em", color: C.ink, margin: "16px 0 8px" }}>提案依頼書</h1>
          <div style={{ fontSize: mob ? 13 : 15, fontWeight: 500, color: C.ink2, marginBottom: 18 }}>間接費最適化に伴う取引先選定について</div>
          <div style={{ borderTop: `1.4px solid ${C.ink}`, width: 120, marginBottom: 18 }} />
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: "8px 30px", fontSize: 11.5 }}>
            {[["発行者", `${COMPANY} 経営企画部`], ["発行日", today], ["文書番号", "RFP-2026-001"], ["提出期限", "2026年6月24日（火）17:00 必着"], ["対象領域", `${chosen.length}領域（後掲スコープ参照）`], ["データ出典", "請求書データ ／ 発注先DB"]].map(([k, v], i) => (
              <div key={i} style={{ display: "flex", padding: "7px 0", borderBottom: `1px solid ${C.hair}` }}><span style={{ width: 76, color: C.muted, flexShrink: 0 }}>{k}</span><span style={{ color: C.ink, fontWeight: 500 }}>{v}</span></div>
            ))}
          </div>

          {/* 1 背景 */}
          {secHead("01", "本依頼の背景と目的")}
          <p style={{ fontSize: 10.5, color: C.ink2, lineHeight: 1.85, margin: "0 0 8px" }}>当社は2025年度の間接費を電子請求書データの分析により、販管費率が業界中央値（24.5%）を3.3pt上回る<b style={{ color: C.brand }}>27.8%</b>であることを把握しました。全社で年間 <b style={{ color: C.brand }}>約5,060万円</b> の削減ポテンシャルを特定しています。</p>
          <p style={{ fontSize: 10.5, color: C.ink2, lineHeight: 1.85, margin: 0 }}>本提案依頼書（RFP）は、下記スコープに掲げる領域（合計年間 約{jy(totSav)}の削減見込）について、最適な取引先を選定するため、貴社からのご提案を依頼するものです。</p>

          {/* 2 スコープ */}
          {secHead("02", "調達対象範囲（スコープ）")}
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead><tr><th style={{ ...th, width: "24%" }}>対象領域</th><th style={{ ...th, ...numR }}>現状コスト</th><th style={{ ...th, ...numR }}>年間相場</th><th style={{ ...th, ...numR }}>目標コスト</th><th style={{ ...th, ...numR }}>削減額</th><th style={{ ...th, ...numR, width: "13%" }}>削減率</th></tr></thead>
            <tbody>
              {chosen.map((p) => (<tr key={p.id}><td style={tdS}>{p.cat}</td><td style={{ ...tdS, ...numR }}>{yc(p.current)}</td><td style={{ ...tdS, ...numR }}>{manRange(p.market)}</td><td style={{ ...tdS, ...numR }}>{yc(p.current - p.saving)}</td><td style={{ ...tdS, ...numR, color: C.save, fontWeight: 700 }}>{yc(p.saving)}</td><td style={{ ...tdS, ...numR }}>{p.rate}%</td></tr>))}
              <tr style={{ background: C.warm }}><td style={{ ...tdS, fontWeight: 700, borderTop: `1.5px solid ${C.ink}`, borderBottom: "none" }}>合　計</td><td style={{ ...tdS, ...numR, fontWeight: 700, borderTop: `1.5px solid ${C.ink}`, borderBottom: "none" }}>{yc(totCur)}</td><td style={{ ...tdS, borderTop: `1.5px solid ${C.ink}`, borderBottom: "none", textAlign: "right" }}>—</td><td style={{ ...tdS, ...numR, fontWeight: 700, borderTop: `1.5px solid ${C.ink}`, borderBottom: "none" }}>{yc(totTgt)}</td><td style={{ ...tdS, ...numR, fontWeight: 700, color: C.save, borderTop: `1.5px solid ${C.ink}`, borderBottom: "none" }}>{yc(totSav)}</td><td style={{ ...tdS, ...numR, fontWeight: 700, borderTop: `1.5px solid ${C.ink}`, borderBottom: "none" }}>{totRate}%</td></tr>
            </tbody>
          </table>

          {/* 3 要件 */}
          {secHead("03", "領域別の要件")}
          {chosen.map((p, i) => (
            <div key={p.id} style={{ marginBottom: 14, pageBreakInside: "avoid" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                <span style={{ width: 17, height: 17, border: `1.2px solid ${C.brand}`, color: C.brand, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>{i + 1}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{p.cat}</span><span style={{ fontSize: 10.5, color: C.muted }}>｜ 重視点：{p.focus}</span>
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: C.terra, letterSpacing: ".06em", marginBottom: 2 }}>必須要件</div>
              {p.req.must.map((m, j) => <div key={j} style={{ position: "relative", paddingLeft: 14, fontSize: 10, color: C.ink, lineHeight: 1.7 }}><span style={{ position: "absolute", left: 2, top: 7, width: 4, height: 4, background: C.terra }} />{m}</div>)}
              <div style={{ fontSize: 9.5, fontWeight: 700, color: C.brand, letterSpacing: ".06em", margin: "6px 0 2px" }}>歓迎要件</div>
              {p.req.want.map((w, j) => <div key={j} style={{ position: "relative", paddingLeft: 14, fontSize: 10, color: C.ink, lineHeight: 1.7 }}><span style={{ position: "absolute", left: 2, top: 7, width: 4, height: 4, background: C.brand }} />{w}</div>)}
            </div>
          ))}

          {/* 4 提案依頼事項 */}
          {secHead("04", "提案に含めていただきたい事項")}
          {["料金体系：初期費用／月額／従量／手数料の内訳と算定根拠", "移行計画：スケジュール・体制・想定リスクと対策", "サポート体制・SLA：窓口、対応時間、障害時対応、復旧目標", "契約条件：最低契約期間、違約金、更新・解約条件", "実績・導入事例：同規模・同業種での導入実績", "セキュリティ・コンプライアンス体制", "貴社の担当体制および当社との連絡フロー"].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: `1px solid ${C.hair}`, fontSize: 10, color: C.ink }}><span style={{ color: C.brand, fontWeight: 700, minWidth: 18 }}>{String(i + 1).padStart(2, "0")}</span><span style={{ lineHeight: 1.6 }}>{t}</span></div>
          ))}

          {/* 5 評価 */}
          {secHead("05", "評価基準と配点")}
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead><tr><th style={{ ...th, width: "26%" }}>評価項目</th><th style={{ ...th, textAlign: "center", width: "12%" }}>配点</th><th style={th}>主な評価の観点</th></tr></thead>
            <tbody>
              {EVAL.map(([it, pt, vp], i) => (<tr key={i}><td style={tdS}>{it}</td><td style={{ ...tdS, textAlign: "center" }}>{pt}</td><td style={tdS}>{vp}</td></tr>))}
              <tr style={{ background: C.warm }}><td style={{ ...tdS, fontWeight: 700, borderTop: `1.5px solid ${C.ink}`, borderBottom: "none" }}>合　計</td><td style={{ ...tdS, textAlign: "center", fontWeight: 700, borderTop: `1.5px solid ${C.ink}`, borderBottom: "none" }}>100</td><td style={{ ...tdS, borderTop: `1.5px solid ${C.ink}`, borderBottom: "none" }}>—</td></tr>
            </tbody>
          </table>

          {/* 6 スケジュール */}
          {secHead("06", "選定スケジュール")}
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead><tr><th style={{ ...th, width: "40%" }}>区分</th><th style={th}>日程</th></tr></thead>
            <tbody>{SCHED.map(([k, d], i) => (<tr key={i}><td style={tdS}>{k}</td><td style={tdS}>{d}</td></tr>))}</tbody>
          </table>

          {/* 7 提出 + 8 留意 */}
          {secHead("07", "提出方法・留意事項")}
          {["提出方法：電子データ（PDF）をメール添付にて提出。様式は自由ですが「4.」を網羅してください。", "提出先：経営企画部 調達企画グループ（rfp@greenfield.example.co.jp）", "本書および知り得た情報は秘密として取り扱ってください。", "提案書の作成費用は提案者のご負担となります。", "本RFPは契約の締結を確約するものではありません。"].map((t, i) => (
            <div key={i} style={{ position: "relative", paddingLeft: 14, fontSize: 10, color: C.ink, lineHeight: 1.75, padding: "3px 0 3px 14px" }}><span style={{ position: "absolute", left: 2, top: 9, width: 4, height: 4, background: C.brand }} />{t}</div>
          ))}

          {/* 付録A 候補 */}
          {secHead("A", "参考候補事業者リスト", "APPENDIX")}
          {chosen.map((p) => (
            <div key={p.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}><span style={{ width: 15, height: 15, background: C.brand, color: "#fff", fontSize: 8.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>{p.cat[0]}</span><span style={{ fontSize: 11.5, fontWeight: 700, color: C.ink }}>{p.cat}</span></div>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead><tr><th style={{ ...th, width: "30%" }}>候補事業者</th><th style={{ ...th, ...numR }}>想定年間</th><th style={{ ...th, ...numR }}>削減額</th><th style={{ ...th, textAlign: "center", width: "13%" }}>評価</th><th style={th}>主な特徴</th></tr></thead>
                <tbody>{p.candidates.filter((c) => !c.base).map((c, j) => (<tr key={j}><td style={tdS}>{c.name}</td><td style={{ ...tdS, ...numR }}>{yc(c.est)}</td><td style={{ ...tdS, ...numR, color: C.save }}>{yc(p.current - c.est)}</td><td style={{ ...tdS, textAlign: "center" }}>★ {c.rating}</td><td style={{ ...tdS, fontSize: 9.5 }}>{c.tags.join("／")}</td></tr>))}</tbody>
              </table>
            </div>
          ))}
          <div style={{ marginTop: 22, paddingTop: 14, borderTop: `1px solid ${C.hair}`, fontSize: 9, color: C.faint, lineHeight: 1.7 }}>※ 本書はBtoBプラットフォーム生産性Upのモックによる自動生成サンプルです。金額・取引先・他社比較はサンプルであり、実在の事業者・契約とは関係ありません。支出データ：電子請求書データ（FY2025）／候補：事業者データベース。</div>
        </div>
      )}
    </div>
  );
}

/* ============================== TRACKING ============================== */
const STAGES = ["未着手", "交渉中", "契約", "効果実現"];
const STAGE_COL = ["#c4cdc9", "#caa53e", C.brand2, C.save];
function Tracking({ stages, setStages }) {
  const mob = useIsMobile();
  const move = (id, d) => setStages((s) => ({ ...s, [id]: Math.max(0, Math.min(3, s[id] + d)) }));
  const sumBy = (st) => PLANS.filter((p) => stages[p.id] === st).reduce((a, p) => a + p.saving, 0);
  const cntBy = (st) => PLANS.filter((p) => stages[p.id] === st).length;
  const realized = sumBy(3), committed = sumBy(2), progress = sumBy(1);
  const total = POTENTIAL;
  const kpis = [
    { l: "年間削減見込", v: jy(total), c: C.ink }, { l: "実現済み", v: jy(realized), c: C.save },
    { l: "確定（契約済）", v: jy(committed), c: C.brand2 }, { l: "進行中（交渉中）", v: jy(progress), c: "#caa53e" },
  ];
  return (
    <div>
      <SecTitle kicker="Execution & tracking" title="削減トラッキング" sub="施策のステージを進めると、実現額・進捗がリアルタイムに更新されます" />
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(4,1fr)", gap: mob ? 10 : 14, marginBottom: 18 }}>
        {kpis.map((k, i) => (
          <Card key={i} className="fade" style={{ padding: mob ? "14px" : "16px", animationDelay: `${i * 50}ms` }}>
            <Kicker color={C.muted} style={{ fontSize: 9.5 }}>{k.l}</Kicker>
            <div style={{ fontSize: mob ? 18 : 22, fontWeight: 600, color: k.c, marginTop: 7 }}>{k.v}</div>
          </Card>
        ))}
      </div>
      <Card className="fade" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}><span style={{ color: C.muted, fontWeight: 500 }}>削減見込に対する進捗</span><span style={{ fontWeight: 700, color: C.save }}>実現率 {(realized / total * 100).toFixed(0)}%</span></div>
        <div style={{ display: "flex", height: 26, borderRadius: 7, overflow: "hidden", background: "#edf1ef" }}>
          {[[realized, C.save], [committed, C.brand2], [progress, "#caa53e"]].map(([v, c], i) => v > 0 ? <div key={i} style={{ width: `${v / total * 100}%`, background: c, transition: "width .4s" }} /> : null)}
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11.5, color: C.muted, marginTop: 10 }}>
          {STAGES.map((st, i) => <span key={i}><span style={{ color: STAGE_COL[i] }}>●</span> {st} {cntBy(i)}件</span>)}
        </div>
      </Card>
      <div style={{ display: "grid", gap: 12 }}>
        {PLANS_BY_SAVING.map((p) => {
          const st = stages[p.id];
          return (
            <Card key={p.id} className="fade" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: PC[p.id] }} /><span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{p.cat}</span><Pill fg="#fff" bg={STAGE_COL[st]}>{STAGES[st]}</Pill></div>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.save }}>−{jy(p.saving)}</span>
              </div>
              <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
                {STAGES.map((sl, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ height: 6, borderRadius: 6, background: i <= st ? STAGE_COL[st] : "#edf1ef", transition: "background .3s" }} />
                    <div style={{ fontSize: 9.5, color: i === st ? C.ink : C.faint, fontWeight: i === st ? 700 : 400, marginTop: 5 }}>{sl}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => move(p.id, -1)} disabled={st === 0} style={{ border: `1px solid ${C.hair}`, background: "#fff", color: st === 0 ? C.faint : C.ink2, width: 34, height: 30, borderRadius: 8, cursor: st === 0 ? "default" : "pointer", fontFamily: FONT, fontSize: 13 }}>◀</button>
                <button onClick={() => move(p.id, 1)} disabled={st === 3} style={{ border: "none", background: st === 3 ? "#c4cdc9" : C.brand, color: "#fff", padding: "0 14px", height: 30, borderRadius: 8, cursor: st === 3 ? "default" : "pointer", fontFamily: FONT, fontSize: 12, fontWeight: 600 }}>{st === 3 ? "完了" : "次のステージへ ▶"}</button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== COMPARE (auto scoring) ============================== */
const SHORT = ["コスト", "品質", "移行", "サポート"];
function Compare({ sel }) {
  const mob = useIsMobile();
  const chosen = PLANS.filter((p) => sel[p.id]);
  const pool = chosen.length ? chosen : PLANS;
  const [catId, setCatId] = useState(pool[0].id);
  const [w, setW] = useState({ cost: 40, quality: 25, migration: 20, support: 15 });
  const plan = PLANS.find((p) => p.id === catId) || PLANS[0];
  const cs = plan.candidates.filter((c) => !c.base);
  const maxSav = Math.max(...cs.map((c) => plan.current - c.est));
  const tw = (w.cost + w.quality + w.migration + w.support) || 1;
  const rows = cs.map((c) => {
    const sav = plan.current - c.est;
    const cost = Math.round(sav / maxSav * 100);
    const quality = Math.round(c.rating / 5 * 100);
    const easyN = EASY_TAGS.filter((t) => c.tags.includes(t)).length;
    const migration = Math.min(98, 55 + easyN * 16);
    let support = Math.round(c.rating / 5 * 100);
    if (c.tags.some((t) => /サポート|24h/.test(t))) support += 6;
    if (c.tags.some((t) => /簡易/.test(t))) support -= 12;
    support = Math.max(40, Math.min(99, support));
    const total = (cost * w.cost + quality * w.quality + migration * w.migration + support * w.support) / tw;
    return { c, sav, cost, quality, migration, support, total };
  }).sort((a, b) => b.total - a.total);
  const WL = [["cost", "コスト"], ["quality", "品質・安定性"], ["migration", "移行容易性"], ["support", "サポート"]];
  const th = { fontSize: 9.5, fontWeight: 500, color: C.muted, padding: "8px", borderBottom: `1.4px solid ${C.brand}`, textAlign: "center", whiteSpace: "nowrap" };
  const tdc = { fontSize: 12, padding: "9px 8px", borderBottom: `1px solid ${C.hair}`, textAlign: "center", color: C.ink2, fontVariantNumeric: "tabular-nums" };
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {pool.map((p) => { const on = p.id === catId; return <button key={p.id} onClick={() => setCatId(p.id)} style={{ border: `1px solid ${on ? C.brand : C.hair}`, background: on ? C.brand : "#fff", color: on ? "#fff" : C.ink2, fontSize: 12, fontWeight: 500, padding: "7px 14px", borderRadius: 999, cursor: "pointer", fontFamily: FONT }}>{p.cat}</button>; })}
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 6 }}><Kicker color={C.muted} style={{ fontSize: 9.5 }}>評価配点（合計 {tw}）</Kicker><span style={{ fontSize: 11, color: C.faint }}>スライダーで配点を変えると順位が再計算されます</span></div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: "12px 24px" }}>
          {WL.map(([k, lab]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, color: C.ink2, width: 92, flexShrink: 0 }}>{lab}</span>
              <input className="wt" type="range" min="0" max="60" step="5" value={w[k]} onChange={(e) => setW((x) => ({ ...x, [k]: Number(e.target.value) }))} style={{ flex: 1, background: `linear-gradient(90deg,${C.brand} 0%,${C.brand} ${w[k] / 60 * 100}%,#dfe6e3 ${w[k] / 60 * 100}%,#dfe6e3 100%)` }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.brand, width: 26, textAlign: "right" }}>{w[k]}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{ overflowX: "auto" }}>
        <SecTitle kicker="Auto scoring" title={`${plan.cat}：提案の自動採点`} sub="各提案を配点で重み付けし、総合スコア順にランキング（100点満点）" />
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
          <thead><tr><th style={{ ...th, textAlign: "left" }}>提案（事業者）</th>{SHORT.map((l) => <th key={l} style={th}>{l}</th>)}<th style={th}>総合</th><th style={th}>順位</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ background: i === 0 ? C.tint : "transparent" }}>
                <td style={{ ...tdc, textAlign: "left", fontWeight: i === 0 ? 700 : 500, color: C.ink }}>{r.c.name}{i === 0 ? <span style={{ marginLeft: 7 }}><Pill fg="#fff" bg={C.save}>推奨</Pill></span> : null}</td>
                <td style={tdc}>{r.cost}</td><td style={tdc}>{r.quality}</td><td style={tdc}>{r.migration}</td><td style={tdc}>{r.support}</td>
                <td style={{ ...tdc, fontWeight: 700, color: C.ink }}>{r.total.toFixed(1)}</td>
                <td style={tdc}>{i === 0 ? <span style={{ color: C.save, fontWeight: 700 }}>1</span> : i + 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 14, background: C.tint, borderLeft: `3px solid ${C.brand}`, borderRadius: 10, padding: "11px 14px", fontSize: 12, color: C.ink2, lineHeight: 1.7 }}>現在の配点では <b style={{ color: C.ink }}>{rows[0].c.name}</b> が総合 <b style={{ color: C.save }}>{rows[0].total.toFixed(1)}点</b> で最有力です（年間削減 約{jy(rows[0].sav)}）。配点を変更すると評価順位が即座に再計算されます。</div>
      </Card>
    </div>
  );
}

/* ============================== RFP HUB ============================== */
function RfpHub(props) {
  const [mode, setMode] = useState("doc");
  const seg = (on) => ({ border: `1px solid ${on ? C.brand : C.hair}`, background: on ? C.brand : "#fff", color: on ? "#fff" : C.ink2, fontFamily: FONT, fontSize: 12.5, fontWeight: on ? 700 : 500, padding: "8px 16px", borderRadius: 999, cursor: "pointer" });
  return (
    <div>
      <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <button onClick={() => setMode("doc")} style={seg(mode === "doc")}>提案依頼書（RFP）</button>
        <button onClick={() => setMode("compare")} style={seg(mode === "compare")}>提案比較・採点</button>
      </div>
      {mode === "doc" ? <RfpDoc {...props} /> : <Compare sel={props.sel} />}
    </div>
  );
}

/* ============================== APP ============================== */
export default function App() {
  const mob = useIsMobile();
  const [tab, setTab] = useState("dashboard");
  const [planId, setPlanId] = useState("telecom");
  const [sel, setSel] = useState(Object.fromEntries(PLANS.map((p) => [p.id, true])));
  const [stages, setStages] = useState({ cloud: 0, logi: 0, telecom: 2, power: 1, supply: 3, maint: 0 });
  const tabs = [
    { id: "dashboard", label: "ダッシュボード" }, { id: "chat", label: "AI診断チャット" }, { id: "impact", label: "経営インパクト分析" },
    { id: "plans", label: "削減プラン" }, { id: "candidates", label: "切替先候補" }, { id: "tracking", label: "実行管理" }, { id: "summary", label: "経営サマリー" }, { id: "rfp", label: "RFP・提案比較" },
  ];
  const goCandidates = (id) => { setPlanId(id); setTab("candidates"); };
  const pad = mob ? 16 : 30;
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, color: C.ink2 }}>
      <style>{`
        *{box-sizing:border-box;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
        .fade{animation:fadeUp .5s both;}
        .noscroll::-webkit-scrollbar{display:none;} .noscroll{scrollbar-width:none;}
        @keyframes blink{0%,80%,100%{opacity:.25;}40%{opacity:1;}}
        .tdot{animation:blink 1.2s infinite both;}
        input[type=range].wt{ -webkit-appearance:none; appearance:none; height:5px; border-radius:5px; outline:none; cursor:pointer; }
        input[type=range].wt::-webkit-slider-thumb{ -webkit-appearance:none; appearance:none; width:16px;height:16px;border-radius:50%;background:#0e5a51;border:3px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.25);cursor:pointer; }
        input[type=range].wt::-moz-range-thumb{ width:14px;height:14px;border-radius:50%;background:#0e5a51;border:3px solid #fff;cursor:pointer; }
        @media print{ .no-print{display:none!important;} body{background:#fff;} #sheet,#rfp-sheet{box-shadow:none!important;border:none!important;max-width:none!important;} @page{margin:14mm;} }
      `}</style>

      <header className="no-print" style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(243,246,244,.92)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.hair}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: `13px ${pad}px`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>B</div>
            <div><div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, letterSpacing: ".01em" }}>BtoBプラットフォーム生産性<span style={{ color: C.brand2 }}>Up</span></div>{!mob && <div style={{ fontSize: 9.5, color: C.muted, marginTop: -1, letterSpacing: ".04em" }}>経費分析・コスト最適化プラットフォーム</div>}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6 }}><Pill fg={C.brand} bg={C.tint}>請求書データ連携</Pill><Pill fg={C.brand2} bg={C.tint}>発注先DB連携</Pill></div>
            {!mob && <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, borderLeft: `1px solid ${C.hair}`, paddingLeft: 12 }}>{COMPANY}</div>}
          </div>
        </div>
        <div className="noscroll" style={{ maxWidth: 1200, margin: "0 auto", padding: `0 ${pad}px`, display: "flex", gap: 2, overflowX: "auto" }}>
          {tabs.map((t) => { const on = tab === t.id; return <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 13, fontWeight: on ? 700 : 400, color: on ? C.brand : C.muted, padding: "11px 13px", borderBottom: `2px solid ${on ? C.brand : "transparent"}`, marginBottom: -1, whiteSpace: "nowrap", letterSpacing: ".02em" }}>{t.label}</button>; })}
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: `${mob ? 18 : 28}px ${pad}px 64px` }}>
        {tab === "dashboard" && <Dashboard />}
        {tab === "chat" && <Chat sel={sel} setSel={setSel} goTab={setTab} setPlanId={setPlanId} />}
        {tab === "impact" && <Impact sel={sel} setSel={setSel} />}
        {tab === "plans" && <Plans onSelect={goCandidates} />}
        {tab === "candidates" && <Candidates planId={planId} setPlanId={setPlanId} />}
        {tab === "tracking" && <Tracking stages={stages} setStages={setStages} />}
        {tab === "summary" && <Summary sel={sel} goTab={setTab} />}
        {tab === "rfp" && <RfpHub sel={sel} goTab={setTab} />}
      </main>

      <footer className="no-print" style={{ maxWidth: 1200, margin: "0 auto", padding: `0 ${pad}px 40px`, fontSize: 10.5, color: C.faint, lineHeight: 1.7 }}>※ 本画面はモック（デモ）です。表示中の金額・取引先・評価・他社比較はすべてサンプルデータです。実運用では電子請求書データのAPI連携、発注先データベース連携を前提とします。</footer>
    </div>
  );
}

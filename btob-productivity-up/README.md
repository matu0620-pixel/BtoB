# BtoBプラットフォーム生産性Up

経費分析・コスト最適化プラットフォーム（請求書データ × 発注先DB を想定したデモ）。
Vite + React 構成。GitHub にプッシュして Vercel に接続すれば、そのまま Web アプリとして公開できます。

> ⚠️ 本アプリはモック（デモ）です。表示している金額・取引先・評価・他社比較はすべてサンプルであり、実在の事業者・契約とは関係ありません。

---

## 主な機能

- ダッシュボード（KPI・月次推移・カテゴリ/取引先内訳・**異常検知アラート**）
- AI 診断チャット（対話で相場比較 → 候補ランク付け）
- 経営インパクト分析（業界ベンチマーク・施策積み上げ試算・削減後予測・ポジショニング）
- 削減プラン／切替先候補
- **実行管理**（施策パイプライン＋削減実績トラッキング）
- 経営サマリー（印刷 / PDF 保存）
- **RFP・提案比較**（提案依頼書の生成・印刷／配点で順位が変わる自動採点）

> RFPタブの「PDFをダウンロード」ボタンは、RFP本紙をクライアント側でPDF化して保存します（`html2pdf.js` を cdnjs から動的読込）。生成時に通信が必要です。納品レベルの精緻なPDFが必要な場合はサーバ側生成（WeasyPrint 等）に本データを渡す構成を推奨します。

---

## ローカルで動かす

事前に Node.js 18 以上が必要です。

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

ビルド確認:

```bash
npm run build
npm run preview
```

---

## GitHub へプッシュ

```bash
git init
git add .
git commit -m "initial: BtoBプラットフォーム生産性Up"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/btob-productivity-up.git
git push -u origin main
```

---

## Vercel でデプロイ

1. https://vercel.com にログイン →「Add New… → Project」
2. 上記の GitHub リポジトリを Import
3. Framework Preset は **Vite** が自動検出されます（手動なら以下）
   - Build Command: `npm run build`（または `vite build`）
   - Output Directory: `dist`
   - Install Command: `npm install`
4. 「Deploy」を押すと `https://<プロジェクト名>.vercel.app` で公開されます

以降は GitHub の `main` に push するたびに自動で再デプロイされます。

---

## 技術スタック / 構成

- React 18 + Vite 5
- recharts（グラフ）
- スタイルは全てインラインスタイル＋単一の `<style>`（外部CSSフレームワーク不要）
- ルーティングはタブ state のみ（SPA。`vercel.json` 等の追加設定は不要）
- フォントは Meiryo UI 優先（Windows 以外では端末標準ゴシックにフォールバック）

```
btob-productivity-up/
├─ index.html
├─ package.json
├─ vite.config.js
├─ .gitignore
└─ src/
   ├─ main.jsx     … エントリポイント
   ├─ index.css    … 最小リセット
   └─ App.jsx      … アプリ本体（全機能）
```

## カスタマイズの入口（App.jsx 内）

- `C` … カラートークン（ティール/インク/ヘアライン等）
- `COMPANY` / `PLANS` / `CATEGORIES` / `ANOMALIES` … 表示データ
- `FONT` … フォント指定
- 実データ連携時は、`PLANS` などのサンプルデータを API 取得値に差し替える想定です。

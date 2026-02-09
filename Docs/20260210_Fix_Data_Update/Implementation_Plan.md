# データ更新スクリプトのPuppeteer移行計画

## 現状の課題
- 既存のデータ更新スクリプト（`scripts/update-data.js`）がエラー（404）で失敗している。
- 宝くじ公式サイトのURL変更、および新サイト（みずほ銀行）がJavaScriptによる動的描画を採用しているため、従来の単純なHTML取得（Fetch API + 正規表現）ではデータが取得できない。

## 提案する解決策
- **ヘッドレスブラウザ（Puppeteer）の導入**:
    - ブラウザをプログラムから操作できるライブラリ「Puppeteer」を使用し、JavaScriptが実行された後の完全なHTMLからデータを抽出する。
    - これにより、みずほ銀行公式サイト（または他の公式サイト）から確実に最新の当選番号を取得可能にする。

## 変更内容

### [Loto6 Predictor]
#### [MODIFY] [`package.json`](file:///c:/Users/Administrator/.gemini/antigravity/scratch/20260207_Loto6_Predictor/package.json)
- `puppeteer` を `devDependencies` に追加。

#### [MODIFY] [`scripts/update-data.js`](file:///c:/Users/Administrator/.gemini/antigravity/scratch/20260207_Loto6_Predictor/scripts/update-data.js)
- `fetch` の代わりに `puppeteer` を使用してブラウザを起動。
- みずほ銀行のロト6ページにアクセスし、当選番号の要素（セレクタ）を特定してデータを抽出するロジックに書き換え。

#### [MODIFY] [`.github/workflows/update-data.yml`](file:///c:/Users/Administrator/.gemini/antigravity/scratch/20260207_Loto6_Predictor/.github/workflows/update-data.yml)
- Puppeteerを実行するために必要な依存関係（ブラウザ等）をインストールするステップを追加する場合があるが、`ubuntu-latest` 環境なら基本的には `npm install` だけで動作するはず。念のため確認。

## 検証計画

### 自動テスト
- なし（スクリプト実行自体がテスト）

### 手動検証
1. **ローカル実行**:
   - `npm install` でPuppeteerをインストール。
   - `node scripts/update-data.js` を実行し、第2074回以降の最新データが取得できるかコンソールで確認。
   - `public/data/loto6_history.json` が更新されることを確認。

2. **GitHub Actionsでの検証**:
   - 変更をプッシュ。
   - GitHub Actionsの「Run workflow」を手動実行し、成功するか確認。

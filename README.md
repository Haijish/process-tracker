# Process Tracker

PBTセルフケアの静的PWAプロトタイプです。iPhoneではSafariからホーム画面に追加して使います。

## Google Sheets連携の設定

Google Cloudで作った値は、アプリ開発者が一度だけ設定します。

1. `google-config.example.js` を `google-config.js` という名前で複製します。
2. `YOUR_CLIENT_ID.apps.googleusercontent.com` をGoogle CloudのOAuth Client IDに置き換えます。
3. `YOUR_API_KEY` をGoogle CloudのAPI keyに置き換えます。
4. `google-config.js` は公開リポジトリに含めないでください。

`google-config.js` の形:

```js
window.PROCESS_TRACKER_GOOGLE_CONFIG = {
  clientId: "YOUR_CLIENT_ID.apps.googleusercontent.com",
  apiKey: "YOUR_API_KEY",
  discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  scopes: "https://www.googleapis.com/auth/drive.file",
};
```

API keyはフロントエンドから見える前提です。Google Cloud側でHTTP referrer制限とGoogle Sheets APIへのAPI制限を必ず設定してください。

設定後、アプリの「設定」画面で「Google Sheets」パネルを使います。

1. `連携` を押す。
2. Googleの許可画面で本人のアカウントを選ぶ。
3. Drive内に `Process Tracker` スプレッドシートが作成される。
4. `未同期を同期` を押すと、未同期のEMA記録だけが `EMA` シートに追記される。

同期前には確認ダイアログを出します。ユーザーのEMA記録がGoogle Sheetsへ送られるためです。

## iPhoneで無料利用する

1. `pbt-honshitsu-app` フォルダをGitHub Pagesなどの無料ホスティングに公開します。
2. iPhoneのSafariで公開URLを開きます。
3. 共有ボタンから「ホーム画面に追加」を選びます。
4. 追加したアイコンから起動します。

GitHub Pagesで公開する手順は [docs/github-pages.md](docs/github-pages.md) にまとめています。

データはブラウザ内のローカル保存領域に保存されます。端末変更やブラウザデータ削除に備えて、設定画面からJSONを書き出してください。

Google Sheets連携を使う場合は、各ユーザーが自分のGoogleアカウントで連携します。アプリは本人のGoogle Drive内に `Process Tracker` スプレッドシートを作り、未同期のEMA記録だけを追記します。

## 解析について

このMVPの「ローカル探索分析」は、AR(1)残差とShadow比較による軽量版です。研究用のtsBorutaそのものではありません。

本番精度に寄せる場合は、記録データをJSON/CSVで書き出し、Rで次の流れを実行します。

1. 個人ごと、各プロセスごとに `forecast::auto.arima()` を当てる。
2. ARIMA残差を取り出す。
3. 残差データを `Boruta::Boruta()` に渡す。
4. `Confirmed` / `Tentative` / `Rejected` をアプリに戻す。

## 無料運用での注意

iPhoneのPWAはホーム画面アプリとして使えますが、バックグラウンドで任意時刻のローカル通知を安定して予約する用途には制限があります。厳密なランダム通知を毎日届けるには、Web Push用の通知サーバーか、ネイティブiOSアプリ化が必要です。

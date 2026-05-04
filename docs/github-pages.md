# GitHub Pagesで公開する

このアプリは静的PWAなので、GitHub Pagesで無料公開できます。公開URLをLINEなどで送れば、各ユーザーが自分のiPhoneで開けます。

## 1. GitHubにリポジトリを作る

GitHubで新しいリポジトリを作ります。

- Repository name: `process-tracker`
- Visibility: 最初は `Private` でもよいですが、無料でシンプルに公開するなら `Public`
- README追加: しない
- .gitignore追加: しない

作成後、表示される `https://github.com/ユーザー名/process-tracker.git` を控えます。

## 2. このフォルダをGitHubへ送る

このフォルダは、実キー入りの `google-config.js` と論文抽出テキストを公開しない設定にしています。

GitHubのリポジトリを作ったら、次の形でアップロードします。

```bash
git remote add origin https://github.com/ユーザー名/process-tracker.git
git push -u origin main
```

## 3. GitHub Pagesを有効にする

GitHubのリポジトリ画面で設定します。

1. `Settings` を開く
2. `Pages` を開く
3. `Build and deployment` の `Source` を `GitHub Actions` にする

このリポジトリには公開用ワークフローが入っています。`main` にpushされると自動で公開されます。

## 4. Googleの値をGitHub Secretsに入れる

`google-config.js` は公開リポジトリへ直接入れず、公開処理の中で自動生成します。

GitHubのリポジトリ画面で次の2つを追加します。

1. `Settings`
2. `Secrets and variables`
3. `Actions`
4. `New repository secret`

追加する名前:

- `PROCESS_TRACKER_CLIENT_ID`
- `PROCESS_TRACKER_API_KEY`

値には、Google Cloudで作ったClient IDとAPI keyを入れます。

## 5. Google Cloud側に公開URLを追加する

GitHub PagesのURLは通常こうなります。

```text
https://ユーザー名.github.io/process-tracker/
```

Google Cloudで次を追加します。

OAuth Clientの `Authorized JavaScript origins`:

```text
https://ユーザー名.github.io
```

API keyの `HTTP referrers`:

```text
https://ユーザー名.github.io/*
https://ユーザー名.github.io/process-tracker/*
```

ブラウザや設定によって参照元URLが短く扱われることがあるので、`https://ユーザー名.github.io/*` も入れておくと安全です。

ローカル開発を続けるなら、今までのこれも残します。

```text
http://127.0.0.1:8787/*
http://localhost:8787/*
```

## 6. 他の人に使ってもらう

公開URLをiPhoneで開いてもらいます。各ユーザーが自分のGoogleアカウントで連携すると、その人自身のGoogle Driveに専用スプレッドシートが作られます。

アプリ側の保存は、まずその端末のブラウザ内に残ります。Google Sheets連携を使うと、各ユーザーのスプレッドシートにも長期保存できます。

Google CloudのOAuth同意画面が `Testing` のままだと、登録したテストユーザーしかGoogle連携できない場合があります。少人数で試す段階では、使ってもらう人のGmailを `Test users` に追加してください。広く配る段階では、OAuth同意画面を公開状態にします。

## Google Sheets連携で失敗する時

アプリの `設定 > Google Sheets` に前回の失敗理由が表示されます。よくある原因は次の3つです。

- OAuth Clientの `Authorized JavaScript origins` に `https://ユーザー名.github.io` が入っていない
- API keyの `HTTP referrers` に `https://ユーザー名.github.io/*` と `https://ユーザー名.github.io/process-tracker/*` が入っていない
- OAuth同意画面が `Testing` のままで、使うGoogleアカウントが `Test users` に入っていない

iPhoneのホーム画面アプリからGoogleの許可画面が開かない時は、まずSafariで公開URLを開いて連携してください。

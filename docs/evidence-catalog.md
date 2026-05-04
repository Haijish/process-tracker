# PBT項目・介入カタログ案

この文書は、30秒EMAに入れる候補項目と、解析後に出し分ける介入モジュールの初期カタログです。現時点では医療判断ではなく、セルフケアと研究プロトタイプ向けの設計資料として扱います。

## 基本方針

- EMAは1回30秒以内を守るため、毎回聞く項目は8から10個程度に抑える。
- WHO-5は「過去2週間」の尺度なので、1日3回のEMAではなく週1回または2週1回のチェックに回す。
- 1日3回のEMAでは「その瞬間」または「前回記録以降」の状態を尋ねる。
- プロセス項目はPBT/EEMMの次元に対応させる。候補は affect, cognition, attention, motivation/values, overt behavior, physiology, sociocultural。
- tsBoruta本番版では、個人ごと・変数ごとにARIMA残差を作り、Borutaへ渡してConfirmed/Tentative/Rejectedを判定する。

## 推奨EMA項目

| id | 表示名 | 役割 | PBT/EEMM | 毎回 | 文献上の位置づけ |
| --- | --- | --- | --- | --- | --- |
| momentary_wellbeing | 今のウェルビーイング | outcome | well-being | yes | WHO-5とは別の瞬間指標 |
| target_problem | 困りごとの強さ | outcome | target outcome | yes | ユーザーが選ぶ主アウトカム |
| anxiety | 不安・緊張 | process | affect | yes | tsBoruta論文のaffect項目例 |
| boredom_low_engagement | 退屈・低関与 | process | affect/motivation | yes | tsBoruta論文のaffect項目例 |
| cognitive_fixation | 認知的固着・反すう | process | cognition | yes | tsBorutaで主要候補になったプロセス |
| present_moment_attention | 今ここへの注意 | process | attention | yes | ACT/PBTの注意柔軟性 |
| values_action | 価値に沿った行動 | process | motivation/overt behavior | yes | ACT/PBTのvalues/committed action |
| avoidance | 回避・先送り | process | overt behavior | yes | ACTのexperiential avoidanceに対応 |
| energy_body | 活力・身体の重さ | process | physiology | rotate | well-being介入の身体経路 |
| sleep_quality | 睡眠の質 | process | physiology | daily | 長期変動の補助変数 |
| social_connection | つながり・孤立感 | process | sociocultural | rotate | well-beingと社会的支援の経路 |
| interpersonal_stress | 対人ストレス | process | sociocultural | rotate | 共通プロセス文献のcommunication/relationship |

## 定期チェック

| id | 尺度 | 頻度 | 用途 |
| --- | --- | --- | --- |
| who5 | WHO-5 | 週1回または2週1回 | ウェルビーイングの標準化アウトカム |
| custom_outcome | ユーザー独自アウトカム | 初期設定 + 必要時 | 主訴・目標に合わせた解析対象 |
| risk_check | 危機サイン | 任意または高スコア時 | 緊急支援への案内。診断ではない |

## 介入モジュール

| module_id | 対応プロセス | 介入名 | 1回の最小単位 | 備考 |
| --- | --- | --- | --- | --- |
| breathing_downshift | anxiety, energy_body | 呼吸・身体ダウンシフト | 3分 | 不安・身体緊張が高い時 |
| acceptance_space | anxiety, target_problem | アクセプタンス | 3分 | 不快感を消すより、持ったまま行動 |
| defusion_labeling | cognitive_fixation | 脱フュージョン | 2分 | 「私は今、こう考えている」を付ける |
| cognitive_reappraisal | cognitive_fixation | 認知的再評価 | 5分 | CBT系。固着が強く、再評価が有効な人向け |
| values_next_step | values_action | 価値の一手 | 3分 | 価値語から5分以内の行動へ |
| behavioral_activation | boredom_low_engagement, avoidance | 行動活性 | 5から10分 | 退屈・低関与・回避に対応 |
| graded_approach | avoidance, anxiety | 小さな接近 | 5分 | 安全な範囲で避けている行動に近づく |
| mindful_attention | present_moment_attention | 今ここへの注意 | 2分 | 五感・呼吸・身体感覚 |
| compassion_reset | target_problem, cognitive_fixation | コンパッション | 3分 | 自責・失敗後の立て直し |
| social_reachout | social_connection | つながり行動 | 5分 | 一通の短い連絡、支援要請 |
| assertive_message | interpersonal_stress | 境界線・非暴力的コミュニケーション | 5分 | 対人負荷が要因の時 |
| sleep_anchor | sleep_quality, energy_body | 睡眠アンカー | 3分 | 起床時刻・光・夜の刺激を整える |
| exercise_plus_reflection | low_wellbeing, avoidance | 軽い運動 + 振り返り | 10分 | well-being NMAで有望な複合介入 |
| gratitude_three_good | low_wellbeing | 3つのよかったこと | 3分 | positive psychology系 |

## Phase設計

- Phase 1: 50時点までは介入を提案せず、EMA記録だけを続ける。
- Phase 2: 50時点以降にtsBorutaでConfirmedまたは安定したTentativeになったプロセスに対応するモジュールを優先する。
- Phase 3: 介入実施後の短期変化を記録し、個人内で「効いた介入」を別軸で学習する。

## 現在の保存方式

現在のアプリは `localStorage` の `honshitsuTrackerState.v1` に保存している。保存範囲は同じURLを開いた同じブラウザ内だけ。

利点:
- サーバーなしで無料。
- 他人の端末には送られない。
- 試作が速い。

限界:
- 端末変更、ブラウザデータ削除、プライベートブラウズで消える可能性がある。
- 同じ端末・同じブラウザを共有すると見られる可能性がある。
- 管理者側で長期解析、バックアップ、複数端末同期ができない。
- 研究・臨床・多人数利用には不十分。

## 本番保存アーキテクチャ案

最小構成:
- PWAフロントエンド
- 認証: メールリンク、Appleログイン、Googleログインなど
- DB: `users`, `ema_records`, `weekly_scales`, `analysis_runs`, `intervention_events`
- 全テーブルに `user_id` を持たせる
- `user_id = auth.uid()` の行だけ読める・書けるルールを必須にする
- 解析ジョブはユーザー単位で走らせ、結果も `analysis_runs.user_id` に紐づける

推奨候補:
- Supabase: PostgreSQL + Auth + Row Level Security。PBT/tsBorutaの表形式データに向く。
- Firebase: Auth + Firestore Security Rules。モバイル寄りで導入しやすい。
- Cloudflare Pages + Workers + D1: 静的PWAと近く、低コスト。ただし認証と権限設計は自前部分が増える。

セキュリティ必須条件:
- 匿名の全件読み取りを禁止する。
- `auth != null` だけで許可しない。必ず本人の `user_id` と照合する。
- 管理画面は別ロールにし、原則として個別生データを見ない設計にする。
- HTTPSのみ。
- 保存データは少なく、エクスポート・削除・同意撤回を用意する。
- 解析ログは入力データと同じ権限で保護する。

## 個人別Googleスプレッドシート案

各ユーザーが自分のGoogle Drive内に、自分専用のスプレッドシートを持つ方式は、無料MVPとしては有力。

構成:
- PWAはまず端末内に即時保存する。
- ユーザーがGoogle連携を押す。
- Google OAuthで本人の許可を取る。
- アプリが本人のDrive内に「Process Tracker」スプレッドシートを作る、または既存シートIDを登録する。
- EMA記録、週次尺度、介入実施ログ、解析結果をその本人のシートに追記する。
- アプリは他人のシートIDやアクセストークンを持たない。

利点:
- 全員分が1枚の共有シートに混ざらない。
- ユーザー本人のGoogle Driveにデータが残る。
- ユーザーが自分でエクスポート、削除、共有管理できる。
- 研究初期には集計前の透明性が高い。

注意点:
- Google OAuthクライアントの作成と同意画面設定が必要。
- ブラウザだけで長期同期する場合、アクセストークンの期限や再認証を扱う必要がある。
- ユーザーが誤ってシートを共有すると、その共有先からは見える。
- ユーザーがシートを削除・移動・権限変更すると同期できなくなる。
- 大規模運用、厳密な監査ログ、行単位権限、サーバー側解析にはDBの方が向く。

無料MVPでの現実的な実装順:
1. 端末内保存を維持する。
2. Google Sheetsへ「バックアップ同期」するボタンを追加する。
3. 同期先シートIDを端末内に保存する。
4. 失敗時はローカルにキューを残して、次回同期する。
5. tsBoruta本番解析は、まずJSON/CSVまたはシートをRで読む形にする。

## 主要根拠

- WHO-5: https://www.who.int/publications/m/item/WHO-UCN-MSD-MHE-2024.01
- tsBoruta tutorial: https://www.sciencedirect.com/science/article/pii/S2212144726000104
- PBT/EEMM: https://www.sciencedirect.com/science/article/abs/pii/S0272735820300969
- ACT as PBT: https://www.sciencedirect.com/science/article/pii/S2212144724000140
- ACT core processes: https://contextualscience.org/about_act
- EMA validity review: https://pmc.ncbi.nlm.nih.gov/articles/PMC9163273/
- EMA burden/compliance review: https://pmc.ncbi.nlm.nih.gov/articles/PMC7970161/
- Well-being interventions NMA: local `先行研究/ウェルビーング.pdf`
- Common psychotherapy processes: local `先行研究/30要因.pdf`
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Firebase security rules: https://firebase.google.com/docs/firestore/security/get-started
- Google Sheets API JavaScript quickstart: https://developers.google.com/sheets/api/quickstart/js
- Apps Script Web Apps: https://developers.google.com/apps-script/guides/web

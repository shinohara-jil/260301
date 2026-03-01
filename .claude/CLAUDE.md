# ポケモンクイズアプリ

## 概要

初代ポケモン（151匹）の名前を当てるクイズアプリ。
タイプと名前の一部をヒントとして表示し、プレイヤーが名前を入力して答える。

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | React 18 |
| ビルドツール | Vite 5 |
| データソース | [PokéAPI](https://pokeapi.co/) |
| スタイル | CSS（App.css） |

## ディレクトリ構成

```
260301/
├── src/
│   ├── App.jsx      # メインコンポーネント（ゲームロジック含む）
│   ├── App.css      # スタイル
│   └── main.jsx     # エントリーポイント
├── index.html
├── vite.config.js
└── package.json
```

## ゲームの仕様

### 画面遷移

```
start → loading → quiz → correct
                       → revealed
```

| 画面 | 説明 |
|------|------|
| start | スタートボタンを表示 |
| loading | API取得中 |
| quiz | クイズ本体 |
| correct | 正解時 |
| revealed | 「こたえをみる」を押した時 |

### ヒントの仕組み

- `hintLevel` で制御（0始まり）
- 名前の先頭から `hintLevel + 1` 文字を表示
- 不正解のたびに1文字ずつ増える
- 最大 `pokemon.name.length - 1` 文字まで（最後の1文字は出さない）

### 回答の正規化

- ひらがな → カタカナ に変換して比較
- 前後スペース・空白を除去
- 大文字小文字などは考慮不要（日本語カナのみ）

### 除外ポケモン

ID 29（ニドラン♀）と 32（ニドラン♂）は ♀/♂ 記号が入力できないため除外。

## 開発コマンド

```bash
npm install       # 依存パッケージをインストール
npm run dev       # 開発サーバー起動（localhost:5173）
npm run build     # dist/ に本番ビルド
npm run preview   # ビルド結果をローカルで確認
```

## デプロイ

ビルド成果物は `dist/` フォルダ。
Vercel・Netlify・GitHub Pages 等の静的ホスティングにそのままアップロードできる。

### Vercel へのデプロイ（推奨）

1. GitHub にリポジトリを作成してプッシュ
2. [vercel.com](https://vercel.com) でリポジトリを連携
3. 設定はデフォルトのまま「Deploy」

## API について

PokéAPI を使用。認証不要・無料。

```
GET https://pokeapi.co/api/v2/pokemon/{id}         # スプライト・タイプ取得
GET https://pokeapi.co/api/v2/pokemon-species/{id} # 日本語名取得
```

日本語名は `names` 配列の `language.name === 'ja-Hrkt'` を優先、なければ `'ja'` を使用。

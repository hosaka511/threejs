# 案件名
XXXのブランドサイトです。

## ガイドライン
XAコーディングポリシーに準ずる

## 座組
| 職能 | 氏名 |
----|----|
| プロデューサー | ジョン |
| ディレクター | ポール |
| デザイナー | リンゴ |
| XA | ジョージ |

## 各環境
### 本番
```
https://example.com/
```

### ステージング
```
https://dev.example.com/

ID: devExample
PW: PASSWD
```

### 社内テストアップ
```
http://example-test01.un-tcheck.com/

ID: example
PW: PASSWD
```

## ディレクトリ
| 第1階層 | 第2階層 | 第3階層 | ディレクトリ |
----|----|----|----|
| トップ | | | / |
| | アバウト | | /about/ |
| | ラインナップ | | /lineup/ |
| | | バナナ | /lineup/banana/ |
| | | いちご | /lineup/berry/ |
| | | オレンジ | /lineup/orange/ |

## 納品方法
un-T側で、FTPアップロードです。

### 本番サーバー
```
サーバー: 192.168.1.1
ユーザー名: foo@example.com
パスワード: PASSWD
```

### ステージングサーバー
```
サーバー: 192.168.1.2
ユーザー名: foo@dev.example.com
パスワード: PASSWD
```

## アクセス解析
支給されたGAをいれています。  
Chrome拡張機能で、動作を確認してください。  
[Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) - GA用デバッガ

```
<!-- 支給されたGA -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments)};
  gtag('js', new Date());

  gtag('config', 'GA_TRACKING_ID');
</script>
```

## テンプレート

### PostCSS｜rucksack の使い方
**Responsive Typography** は、画面幅に応じて文字サイズがリキッドするタイポグラフィを作成します。

```
font-size: responsive [min-font-size] [max-font-size]
font-range: [lower-bound] [upper-bound]
```

例）画面幅が 320px 〜 375 px の間で文字サイズ 14px 〜 16px リキッドさせたい場合

```
html {
  font-size: responsive 14px 16px;
  font-range: 320px 375px;
}
```

詳細は、[公式サイト](https://www.rucksackcss.org/)を参照ください。

## その他
FTPアップ時、`main.js`のデバッグ用コードを、*必ず削除*してください。
```
// TODO: debug用コンソールログ
console.log('debug');
```
export const QUESTIONS = [
  {
    id: 1,
    term: "是非を問う",
    correct: "物事の正しいか正しくないかを判断する",
    incorrect: [
      "絶対にやり遂げようと強く求める",
      "全力を尽くして取り組む",
      "相手に熱心に依頼する",
    ],
    recallIncorrect: ["応酬する", "成就する", "言及する"],
    explanation: "是か非か＝正しいか正しくないかを判断する意。",
    example: "例:会議で新方針の是非を問う場面となった",
    newsArticles: [
      {
        title: "新潟知事、原発再稼働の是非問う県民投票の課題指摘",
        url: "https://www.nikkei.com/article/DGXZQOCC022C80S5A400C2000000/",
        source: "日本経済新聞",
        date: "2025-04-02",
      },
    ],
  },
  {
    id: 2,
    term: "監督",
    correct: "指導・取り締まりをして見守ること",
    incorrect: [
      "実際に現場で作業すること",
      "上位者に相談して判断を仰ぐこと",
      "規則を作り制度化すること",
    ],
    recallIncorrect: ["管理する", "調整する", "統制する"],
    explanation: "指導・取り締まりの立場から見守ること。",
    example: "例:工事現場を監督する責任者が配置された",
    newsArticles: [
      {
        title:
          "金融庁、資産運用立国で「ダブル監督局」へ 政局対応にらみ組織再編",
        url: "https://www.nikkei.com/article/DGXZQOCD2837K0Y5A820C2000000/",
        source: "日本経済新聞",
        date: "2025-08-29",
      },
    ],
  },
  {
    id: 3,
    term: "ステルスマーケティング",
    correct: "広告と気づかれない形で商品を宣伝すること",
    incorrect: [
      "新しい販売戦略を開発すること",
      "消費者の購買傾向を分析すること",
      "自然に売れる仕組みを作ること",
    ],
    recallIncorrect: [
      "バイラルマーケティング",
      "ダイレクトマーケティング",
      "コンテンツマーケティング",
    ],
    explanation: "広告表示をせず宣伝する手法。略称「ステマ」。",
    example: "例:有名人が自然に商品を紹介してステマ疑惑が浮上",
    newsArticles: [
      {
        title:
          "小泉陣営「投稿依頼」に批判…称賛コメント呼びかけ、総裁選の「公正さ」揺るがしかねず",
        url: "https://www.yomiuri.co.jp/politics/20250929-OYT1T50014/",
        source: "読売新聞オンライン",
        date: "2025-09-29",
      },
    ],
  },
  {
    id: 4,
    term: "バツが悪い",
    correct: "気まずく、居心地が悪い",
    incorrect: [
      "体調が悪く、調子が出ない",
      "失敗して大きな損害を受ける",
      "判断を誤り、結果が不利になる",
    ],
    recallIncorrect: ["気が重い", "面目ない", "心苦しい"],
    explanation: "その場に居づらい感じの「気まずさ」。",
    example: "例:偶然元カレに会ってバツが悪い思いをした",
    newsArticles: [
      {
        title: "世にも不愉快なエレベーター",
        url: "https://www.itmedia.co.jp/makoto/articles/1102/23/news015.html",
        source: "ITmedia",
        date: "2011-02-23",
      },
    ],
  },
  {
    id: 5,
    term: "揶揄する",
    correct: "からかうように言う",
    incorrect: [
      "やさしく助言する",
      "遠回しに皮肉を述べる",
      "さりげなく示唆する",
    ],
    recallIncorrect: ["批評する", "嘲笑する", "非難する"],
    explanation: "からかい・なぶりを含む言い方。",
    example: "例:彼の失敗を揶揄するような発言は控えるべきだ",
    newsArticles: [
      {
        title:
          "予約システム、キャッシュレス決済…万博は「未来社会の実験場」人々の行動変容につながるか",
        url: "https://www.yomiuri.co.jp/expo2025/20251008-OYO1T50000/",
        source: "読売新聞オンライン",
        date: "2025-10-08",
      },
    ],
  },
  {
    id: 6,
    term: "破談になる",
    correct: "まとまりかけていた話が取りやめになる",
    incorrect: [
      "談話が激しくなって口論になる",
      "相手と縁を切って絶交する",
      "嘘の話で人をだます",
    ],
    recallIncorrect: ["決裂する", "頓挫する", "白紙に戻る"],
    explanation: "まとまりかけていた縁談や商談などが取りやめになること。",
    example: "例:条件が合わず、結婚の話は破談になった",
    newsArticles: [
      {
        title:
          "立憲民主党と国民民主党、破談理由は安保法制　結党時の亀裂克服できず",
        url: "https://www.nikkei.com/article/DGXZQOUA143AA0U5A011C2000000/",
        source: "日本経済新聞",
        date: "2025-10-18",
      },
    ],
  },
  {
    id: 7,
    term: "示唆する",
    correct: "それとなくほのめかす",
    incorrect: [
      "強く命令して行動を促す",
      "根拠を示して説得する",
      "詳細に説明して理解させる",
    ],
    recallIncorrect: ["暗示する", "陳述する", "応答する"],
    explanation: "直接的に言わず、それとなく気づかせること。",
    example: "例:上司は異動の可能性を示唆するような発言をした",
    newsArticles: [
      {
        title:
          "トランプ氏、ウクライナへのトマホーク供与示唆…「トマホークを送るとプーチン氏に伝えるかもしれない」",
        url: "https://www.yomiuri.co.jp/world/20251014-OYT1T50020/",
        source: "読売新聞オンライン",
        date: "2025-10-14",
      },
    ],
  },
  {
    id: 8,
    term: "如実に",
    correct: "ありのままに、実際のとおりに",
    incorrect: [
      "おおげさに誇張して",
      "わかりやすく簡略化して",
      "一部だけを強調して",
    ],
    recallIncorrect: ["悠然と", "抽象的に", "詳細に"],
    explanation: "事実そのまま、ありのままの意。",
    example: "例:データが業績悪化の実態を如実に示している",
    newsArticles: [
      {
        title:
          "NY株ハイライト　小売り、現金給付の恩恵如実に　株一段高にはハードルも",
        url: "https://www.nikkei.com/article/DGXZASFL19H1G_Z10C21A5000000/",
        source: "日本経済新聞",
        date: "2025-05-19",
      },
    ],
  },
  {
    id: 9,
    term: "重宝する",
    correct: "便利で役に立つとして大切に使う",
    incorrect: [
      "高価で手に入りにくい",
      "長く保管して滅多に使わない",
      "他人に貸して価値を上げる",
    ],
    recallIncorrect: ["尊重する", "慎重に扱う", "専念する"],
    explanation: "便利で役立つものとして大事に使うこと。",
    example: "例:このツールは作業効率化に重宝している",
    newsArticles: [
      {
        title:
          "ヘルシーで時短「せいろ料理」人気、油使わず食材切って蒸すだけ…中華式は見た目もかわいく",
        url: "https://www.yomiuri.co.jp/national/20251002-OYT1T50021/",
        source: "読売新聞オンライン",
        date: "2025-10-05",
      },
    ],
  },
  {
    id: 10,
    term: "不問に付す",
    correct: "問題にせず、咎めないことにする",
    incorrect: [
      "詳しく調べて処罰する",
      "あいまいなまま放置する",
      "一時的に中止して再検討する",
    ],
    recallIncorrect: ["断罪する", "保留にする", "質疑する"],
    explanation: "過ちや責任を問わず、処罰しないこと。",
    example: "例:初犯ということで今回は不問に付すことにした",
    newsArticles: [
      {
        title: "SOX法とコンプライアンスとIT",
        url: "https://www.itmedia.co.jp/im/articles/0609/01/news132_3.html",
        source: "ITmedia",
        date: "2006-09-01",
      },
    ],
  },
  {
    id: 11,
    term: "鑑みる",
    correct: "他の事例や先例などを参考にして考える",
    incorrect: [
      "よく観察して見守る",
      "批判的に評価する",
      "深く反省して振り返る",
    ],
    recallIncorrect: ["顧みる", "省みる", "推察する"],
    explanation: "他の事例や先例を参考にして、よく考えること。",
    example: "例:過去の事例に鑑みて、慎重に判断する必要がある",
    newsArticles: [
      {
        title: "石破首相、経済対策の規模「過去に鑑み判断」",
        url: "https://www.nikkei.com/article/DGXZQOUA011FG0R00C25A0000000/",
        source: "日本経済新聞",
        date: "2025-10-01",
      },
    ],
  },
];

export const DAILY_THEMES = [
  "📖 ビジネス基礎語",
  "🎯 誤用しやすい言葉",
  "✨ 教養ワード",
  "💼 敬語マスター",
  "🔥 今週の必修語",
];

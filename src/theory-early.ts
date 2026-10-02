import type { TheoryEntry } from './theory-types'

// Ancient dates are approximate sorting anchors, not claims of exact composition dates.
export const earlyTheories: TheoryEntry[] = [
  {
    id: 'guanzi', year: -300, yearLabel: '战国至汉初 · 成书年代有争议', title: '《管子》：货币、物价与国家储备', authors: '《管子》诸篇作者', originalTitle: '《管子·国蓄》等轻重诸篇', kind: 'history',
    question: '谷物与货币的数量、储藏和流通，怎样影响价格与分配？', lessonIds: ['foundations', 'long-run'], terms: ['轻重', '国蓄', '货币思想'],
    sections: [
      { title: '先辨认这部书的时代', paragraphs: ['《管子》托名管仲，包含不同时期的作品，不能把全书视为春秋时期一位作者写成的专著。轻重诸篇的成书和编定年代仍有讨论。本条按战国至汉初的思想背景阅读，时间轴上的位置只表示大致范围。它讨论谷物、货币、财政与国家治理，是货币思想前史；现代意义上的国际收支、中央银行和浮动汇率尚未形成。'] },
      { title: '轻与重是一种相对关系', paragraphs: ['轻重诸篇把丰歉、储藏、征收和投放放在同一组关系中考察。丰年粮多，并不保证所有人都能低价得到粮食；如果少数商人掌握库存，急需粮食的人仍可能面对高价。《国蓄》因此把供给的季节性、财物的占有和交易时点联系起来。这里的“轻重”兼有贵贱、稀缺和支配力的含义，不能机械地对应今天某一个价格指数。'] },
      { title: '铸币并不等于增加可用资源', paragraphs: ['原文区分铸钱与通施：铸币只有进入交易，才便利物品的交换。财富集中、粮食囤积和流通阻碍，并不会因不断铸造钱币自动消失。用现代语言作辅助解释，增加名义支付手段与增加实际产出是两件事；公众持有货币的意愿、商品库存所在以及取得货币的条件，都会影响支出的去向。这是对原文问题的现代说明，并非古人已经提出了现代货币需求函数。'] },
      { title: '国家为何储粮并择时投放', paragraphs: ['书中主张国家积储粮食，在民间需要种子、农具和口粮时提供支持，并通过收购、借贷和出售影响市场条件。这类安排同时涉及价格稳定、农业生产和财政收入。评价其效果时，必须追问收储成本由谁承担、价格怎样确定、归还义务是否加重农户负担。原文既关心生产和民生，也关心君主取得财利与维持统治，两种目的不能混为一谈。'] },
      { title: '与国际金融课程怎样相接', paragraphs: ['可以从这里进入货币职能、购买力和政策信用的讨论，但不能直接推出金本位的自动调节机制，更不能把国家粮仓等同于现代外汇储备。粮食是可消费的实际资源，外汇储备通常是对外金融债权，两者的收益、风险和支付用途不同。继续阅读休谟时，应留意问题如何从一国的储藏与流通，转向各国之间的货币数量、相对价格与贸易调整。'] },
    ],
    sources: [{ title: '《管子·国蓄》原文', url: 'https://ctext.org/guanzi/guo-xu/zh', note: '中国哲学书电子化计划所录古籍原文；引文保留原字。', quote: '人君鑄錢立幣，民庶之通施也。', translation: '君主铸钱设立货币，是为了使民众之间的财物流通。' }], related: ['aristotle', 'hume', 'monetary-exchange'],
  },
  {
    id: 'aristotle', year: -350, yearLabel: '公元前 4 世纪', title: '亚里士多德：交换、货币与价值尺度', authors: 'Aristotle', originalTitle: 'Politics, Book I; Nicomachean Ethics, Book V', kind: 'history', question: '不同物品为何能交换，货币在其中承担什么职能？', lessonIds: ['foundations', 'digital-money'], terms: ['交换媒介', '价值尺度', '亚里士多德'],
    sections: [
      { title: '从家庭供给到远距离交换', paragraphs: ['《政治学》讨论家庭与城邦时，将取得生活所需物品和以增加财富为目的的活动区别开来。物品可以直接使用，也可以拿去交换；鞋既可穿在脚上，也可换取食物。随着交换范围扩大，交易双方不再总能恰好提供彼此所需的东西，易于携带、分割且能被接受的媒介便有了用途。这一论证出现在城邦制度与伦理讨论之中，并非现代的最优化模型。'] },
      { title: '货币为何适合用来交换', paragraphs: ['亚里士多德描述人们选择金属等便于交付的物品，最初需要称量，后来用印记表明数量，使接受者减少检验成本。这里已经可以辨认出交易媒介和标准化的作用：人们接受一枚钱币，不必因为自己需要那块金属，也可能因为相信别人将接受它。货币的使用因此同时依赖物质特性、共同惯例与发行标记的可信度。'] },
      { title: '共同尺度与未来购买', paragraphs: ['《尼各马可伦理学》第五卷进一步讨论交换的可比性。不同劳动和物品难以直接比较，货币提供共同的计量尺度，也允许人们把购买推迟到未来。共同尺度并不表示各种物品在物理意义上相同；它使不同物品能够以价格关系参加交换。对国际金融而言，计价货币、支付货币与储值货币可能由不同货币承担，不能仅凭某种货币用于结算就判断它已全面国际化。'] },
      { title: '规范判断与经济机制要分开读', paragraphs: ['亚里士多德对逐利和放贷收息有鲜明的伦理判断。他把满足生活需要与无止境地积累货币区别开来，并批评以货币自身生出货币为目的的活动。这样的判断值得放回当时的社会结构理解，却不能直接代替现代利率理论。时间偏好、违约风险、机会成本和期限转换等问题，需要后来的理论工具分别解释。'] },
      { title: '货币的材料改变后，问题仍在', paragraphs: ['纸币、银行存款和数字支付无需贵金属内在价值，却仍须解决计量、接受和履约的问题。比较稳定币与银行存款时，可以沿用这些问题：面值按什么计量，持有人对谁拥有请求权，是否能按面值赎回，最终支付在哪一种资产上完成。这些是从古典问题出发的现代延伸。原著没有提出存款保险或数字货币方案，阅读时应保留历史边界。'] },
    ], sources: [
      { title: 'Politics · Book I', url: 'https://classics.mit.edu/Aristotle/politics.1.one.html', note: 'MIT Internet Classics Archive，Benjamin Jowett 英译本；引文为英译文，保留作者对利息的规范判断。', excerptLabel: 'Benjamin Jowett 英译本节选', quote: 'For money was intended to be used in exchange, but not to increase at interest.', translation: '货币原是为交换而用，而不是为生息而增加。' },
      { title: 'Nicomachean Ethics · Book V', url: 'https://classics.mit.edu/Aristotle/nicomachaen.5.v.html', note: 'MIT Internet Classics Archive，W. D. Ross 英译本；阅读交换与货币的讨论。' },
    ], related: ['guanzi', 'oresme', 'clearing-union'],
  },
  {
    id: 'oresme', year: 1355, yearLabel: '约 1350 年代', title: '奥雷斯姆：铸币权与货币贬质', authors: 'Nicole Oresme', originalTitle: 'De moneta', kind: 'history', question: '统治者拥有铸币权，是否就可以任意改变钱币的含金属量？', lessonIds: ['foundations', 'dollar', 'future'], terms: ['铸币税', '货币贬质', '奥雷斯姆'],
    sections: [
      { title: '反复改铸造成的争论', paragraphs: ['《论货币》写于十四世纪法国反复改变铸币标准的背景下，确切成书年份没有一致结论，通常置于 1350 年代。战争财政与铸币收益使统治者有动力减少钱币的贵金属含量，同时要求它按原面值流通。买卖、租金与债务合同由此受到影响。奥雷斯姆关心的首要问题，是铸币管理的权力边界和社会共同体的利益。'] },
      { title: '标记是担保，不是任意处分的权利', paragraphs: ['他的论证从货币服务交换出发：铸币上的印记用于担保成色和重量，公共权力组织铸造能够降低反复检验的成本。但钱币进入交易后属于持有它的公众，发行权不能推出统治者有权随时改变公众财富的实际价值。书中逐项讨论币材、形制、重量、成色和金银比价，使“改变货币”不再只是一个笼统说法。'] },
      { title: '贬质如何重新分配财富', paragraphs: ['若同样面额的新币含有更少贵金属，发行者可以从改铸中取得收益，原有固定面额债权的实际价值则可能下降。商人如果预期继续改铸，会提高报价、改变收款条件或减少持币。用现代概念理解，铸币收益和持币损失具有对应关系；但这种金属含量变化与现代纸币经济中的通货膨胀并不完全相同，不能将二者的技术过程混用。'] },
      { title: '为何货币改革需要共同认可', paragraphs: ['奥雷斯姆并非认为任何币制调整都绝对不可能。金属相对价值确有变化、公共需要迫切等情形需要另行讨论，关键在于调整理由、共同认可及受益者是谁。其分析说明货币规则不仅影响当前交易，还影响人们是否相信未来的支付标准。任意改动规则可能增加短期财政收入，却削弱后续交易中对本币的接受。'] },
      { title: '读本的限度与现代联系', paragraphs: ['这部作品对信用、汇票和银行支付的处理有限，也没有现代宏观稳定政策的目标。不能据此推导任何货币扩张都不正当，也不宜把后世“劣币驱逐良币”的全部条件归给作者。文本的不同手稿、拉丁文与后来的翻译也需要辨别，不能将译者导论当成作者的原句。它为后续阅读保留了一个清楚的问题：货币制度改变所产生的损益，由谁决定、由谁承担？这一问题可延伸到通胀、储备资产信用与货币治理。'] },
    ], sources: [{ title: 'De moneta · 拉丁文本及 Charles Johnson 英译', url: 'https://people.bu.edu/chamley/HSFref/DeMoneta-E.pdf', note: '1956 年校订、翻译本，波士顿大学课程收藏；引文取 Charles Johnson 英译，不将译本出版年用作理论年代。', excerptLabel: 'Charles Johnson 英译本节选', quote: 'the coinage is the property of the community', translation: '铸币属于社会共同体。' }], related: ['aristotle', 'ricardo', 'triffin'],
  },
  {
    id: 'mercantilism', year: 1664, yearLabel: '1664 · 遗稿出版', title: '托马斯·孟：贸易差额与贵金属积累', authors: 'Thomas Mun', originalTitle: 'England’s Treasure by Forraign Trade', kind: 'history', question: '一国能否通过持续出口多于进口来增加财富？', lessonIds: ['foundations', 'accounts'], terms: ['重商主义', '贸易差额', '托马斯·孟'],
    sections: [
      { title: '国家财富与海外贸易', paragraphs: ['托马斯·孟的作品在他去世后于 1664 年出版，写作早于出版时间。海上贸易、国家财政和战争能力是书中相连的问题。他把对外贸易差额与金银流入联系起来，主张考察整个国家的贸易结果。重商主义包含不同时期和国家的政策论述，不能将所有作者概括为只懂禁止金银出口，也不能把孟的一部书当作统一学派的全部纲领。'] },
      { title: '允许输出金银的理由', paragraphs: ['单笔贸易可能先付出金银，随后经转口或出售取得更大的收入。因此，对某个贸易伙伴存在逆差，或为购买商品输出贵金属，并不必然意味着国家整体受损。孟强调总的对外贸易账目，这使他的论证区别于逐笔追求金银流入的看法。读原文时，需要分清某家商人的现金支出、某一条航线的收益与一国整体贸易差额。'] },
      { title: '从差额到金银流入', paragraphs: ['书中的推理是：出口所得如果超过进口消费，差额须以贵金属等形式返回国内。这个关系依赖当时所设想的结算方式。在现代国际收支中，货物差额还须与服务、投资收益、转移以及金融交易一起考察；出口收益可以买入外国债券，也可形成银行存款，不必运回金银。经常账户顺差与对外净放款之间有会计联系，顺差与国家福利之间则没有同样直接的等号。'] },
      { title: '持续积累所遗漏的价格变化', paragraphs: ['如果贵金属流入增加国内货币供给，国内价格和成本可能随之变化。较高的价格削弱出口竞争力，并增加购买外国商品的吸引力。将贸易数量、价格和货币量全部固定，便会把最初的顺差机械地外推。休谟后来的反驳正是沿着货币、相对价格、贸易和贵金属流动这一调整过程展开，而不是只争论顺差是否值得称赞。'] },
      { title: '今天如何评价贸易顺差', paragraphs: ['现代分析应进一步问：顺差来自生产率提高、储蓄意愿上升、投资不足，还是内需收缩？顺差国家得到的是怎样的对外资产，居民消费与风险承担又怎样变化？逆差也可能对应有回报的投资或难以持续的消费融资。孟的原著适合用来理解贸易差额为何长期受到政策关注；评价今天的外部失衡仍需国民账户、跨期约束和资产负债表。'] },
    ], sources: [{ title: 'England’s Treasure by Forraign Trade · 原著节录', url: 'https://sourcebooks.web.fordham.edu/mod/1664mun-engtrade.asp', note: 'Fordham University 原始史料选编，文本作过拼写整理。', quote: 'to sell more to strangers yearly than wee consume of theirs in value.', translation: '每年向外国人出售的价值，要超过我们消费其产品的价值。' }], related: ['hume', 'absorption', 'internal-external'],
  },
  {
    id: 'hume', year: 1752, yearLabel: '1752', title: '休谟：价格—铸币流动机制', authors: 'David Hume', originalTitle: 'Of the Balance of Trade', kind: 'theory', question: '一个贸易国家的金银会不会不断流失，直至完全耗尽？', lessonIds: ['foundations', 'accounts', 'regimes'], terms: ['价格—铸币流动机制', '休谟', '金本位'],
    sections: [
      { title: '原文针对的担忧', paragraphs: ['《论贸易差额》反驳一种流行担忧：进口付款会使国家的金银逐年减少，最后无钱可用。休谟认为，不能把某一时期的支付差额原样推到未来，因为货币减少会改变价格，价格改变又会影响贸易。他讨论的是金属货币能够跨境流动的环境。后来教科书将这个机制用于金本位分析，但十八世纪的原文不能直接等同于十九世纪金本位全部制度安排。'] },
      { title: '先设想货币突然减少', paragraphs: ['休谟让读者设想英国一夜之间失去五分之四的货币。如果货币需求和生产条件没有相应改变，劳动与商品的货币价格会下降；外国买家发现英国商品变便宜，英国居民则发现外国商品相对昂贵。出口增加、进口减少，使金银重新流入。随着货币恢复、国内价格回升，最初的价格优势逐渐消失。极端思想实验用于显示反馈方向，不是对实际调整速度的估计。'] },
      { title: '再设想货币突然增加', paragraphs: ['反向实验同样重要。若一夜之间货币增加五倍，国内价格上涨，外国商品显得便宜，本国出口变得困难，金银遂流向国外。持续追求顺差不能保证金银无限积累，因为积累本身改变了促成顺差的条件。用现代记号表示，货币量影响价格，相对价格影响净出口，贸易结算再改变货币量，四个环节构成闭合的调整过程。'] },
      { title: '机制赖以成立的条件', paragraphs: ['这一推理要求价格能对货币条件作出反应，贸易需求对相对价格有足够反应，贵金属流动也能改变国内货币条件。运输成本、贸易限制、资本流动和银行信用都会使路径更复杂。若央行冲销金银流入对货币供给的影响，或工资价格调整主要通过失业完成，教科书中的平滑自动调节便不能照搬。货币数量下降也不表示产出会立刻保持原样。'] },
      { title: '从自动调节到政策约束', paragraphs: ['休谟说明外部差额具有反馈，却没有证明调整没有社会代价。后来的金本位研究关注逆差国紧缩、顺差国冲销和国际信用条件，国际收支货币分析则把央行资产负债表加入机制。理解这条理论线索有助于区分两件事：某个制度是否存在恢复均衡的力量，以及恢复过程是否导致难以承受的失业、债务或银行压力。'] },
    ], sources: [{ title: 'Of the Balance of Trade · 1752 年文本', url: 'https://davidhume.org/texts/pld/bt', note: 'Hume Texts Online 校订原文。', quote: 'All water, wherever it communicates, remains always at a level.', translation: '凡彼此相通的水，总会保持在同一水平。' }], figure: 'specie-flow', related: ['mercantilism', 'monetary-bop', 'triffin'],
  },
  {
    id: 'ricardo', year: 1810, yearLabel: '1810 · 金块论争', title: '李嘉图：纸币发行、黄金价格与兑换约束', authors: 'David Ricardo', originalTitle: 'The High Price of Bullion; On the Principles of Political Economy and Taxation, Chapter 27', kind: 'theory', question: '黄金的纸币价格上涨，是黄金变贵，还是纸币的价值下降？', lessonIds: ['foundations', 'long-run', 'regimes'], terms: ['金块论争', '李嘉图', '兑换约束'],
    sections: [
      { title: '停止兑现后的争论', paragraphs: ['英国停止银行券兑金后，黄金的市场价格可以偏离铸币所规定的价格，外汇价格也会变化。李嘉图在 1810 年的金块论争中把黄金溢价与银行券贬值联系起来，强调过量发行的作用。1817 年《政治经济学及赋税原理》又系统讨论货币与银行。原著的制度背景是银行券、金属货币和兑换承诺并存，不能直接套用为任何时期的黄金价格预测。'] },
      { title: '名义单位与实际价值', paragraphs: ['一张纸币上印着多少镑，不能单独决定它能够买多少黄金或商品。发行受到数量约束时，纸币即使自身没有贵金属含量，也可以具有与同面额铸币相近的交换价值。这个论点把货币的材料与货币的购买力分开。李嘉图仍以金属标准作为衡量基准，但已经明确：纸的物理用途无法解释纸币的货币价值，必须考察发行与兑换规则。'] },
      { title: '可兑换怎样约束发行', paragraphs: ['若银行按固定比价兑现，公众认为纸币过多时可以要求兑换黄金，银行的金属储备因而减少，迫使其收缩发行或筹集储备。停止兑现后，这一约束减弱，过量发行可能通过黄金溢价、汇率和商品价格表现出来。这里的逻辑依赖公众能够兑换、兑换承诺可信，以及黄金跨境运输没有无法逾越的障碍。法律上写有承诺，并不自动保证兑现能力。'] },
      { title: '不能只看一个市场价格', paragraphs: ['黄金供求、战争中的贸易限制和国际支付需求也可能影响短期金价与外汇价格。因而，观察到黄金价格上涨，仍须辨别黄金自身的相对价格变化和一般货币购买力变化。现代研究还要区分货币供给的统计口径、银行存款创造和货币需求。李嘉图的数量约束论提供一种解释，但不能省略这些识别条件。'] },
      { title: '与现代固定汇率及稳定币的联系', paragraphs: ['固定汇率承诺与按面值赎回承诺都包含同一个资产负债表问题：发行者以什么资产履行兑付，兑付者同时增加时能否保持流动性？二者也存在差异，中央银行可以运用政策工具，私人稳定币发行者的资产和法律安排另有约束。阅读现代制度时，可以借用兑换纪律这一问题意识，具体结论仍应依据资产质量、期限、持有人权利和政策目标。'] },
    ], sources: [{ title: 'On Currency and Banks · 《原理》第二十七章', url: 'https://www.econlib.org/book-chapters/chapter-ch-27-on-currency-and-banks/', note: 'Econlib 所录李嘉图原著；本条以 1810 年论争定位，并用《原理》的系统表述辅助阅读。', quote: 'by limiting its quantity, its value in exchange is as great as an equal denomination of coin', translation: '通过限制其数量，它的交换价值可以与同面额的铸币一样大。' }], related: ['oresme', 'monetary-exchange', 'first-crisis'],
  },
  {
    id: 'ppp', year: 1918, yearLabel: '1918 · 代表论文', title: '卡塞尔：购买力平价', authors: 'Gustav Cassel', originalTitle: 'Abnormal Deviations in International Exchanges', kind: 'theory', question: '两国物价变化怎样构成汇率的长期参照？', lessonIds: ['long-run', 'fx-market'], terms: ['购买力平价', 'PPP', '卡塞尔', '实际汇率'],
    sections: [
      { title: '战争、通胀与新平价', paragraphs: ['第一次世界大战使各国物价和货币制度发生巨大变化，恢复旧的金平价可能对应完全不同的实际购买力。卡塞尔把汇率与两国货币的国内购买力联系起来，1918 年论文是这一论述的代表文本。购买力平价的思想有更早来源，本条年份表示代表论文的发表，而不是宣称汇率与物价的联系在这一年才被发现。'] },
      { title: '从一价定律到价格水平', paragraphs: ['如果同一种商品可以无成本交易，按同一货币计算的价格差会引出买卖套利，这是一价定律。将许多商品汇总到价格水平，需要篮子内容、权重和品质可比等额外条件。设 E 为一单位外币的本币价格，绝对购买力平价写作 E=P/P*。它说同一篮子商品的两国价格在换算后相等，并不表示一个本币单位与一个外币单位具有相同购买力。'] },
      { title: '相对购买力平价怎样计算', paragraphs: ['当基期存在稳定的价格差异时，可以只比较此后的价格变化。若本国物价上升 10%、外国上升 2%，在相对购买力平价下，直接标价汇率应乘以 1.10/1.02，而非简单增加 8% 的精确值；通胀差是低通胀时的近似。必须使用相同基期和可比价格指数。汇率上涨表示本币贬值，本币外币价值的百分比变化则是倒数变化，数值并不完全对称。', '还要区分价格水平与价格指数。两国统计机构都把某年指数定为 100，只表示各自与基期相等，不表示两国同一篮子的货币价格相同。直接拿两个都等于 100 的指数相除，不能推出两种货币的绝对平价为一比一。相对 PPP 通常以一个给定汇率为起点，预测此后的比例变化；起点是否已经处于长期均衡，需要另行判断。'] },
      { title: '偏离平价未必是错误定价', paragraphs: ['跨境运输、关税、零售服务、租金、税费和产品品质都可能造成价格差。消费者价格篮子还含有大量不可贸易服务。汉堡价格能直观显示换算后的差异，却不能独立给出货币应该立即回到的汇率。实际汇率 q=EP*/P 可以用来追踪相对价格；q 的水平和长期趋势仍可能受生产率、贸易条件、偏好与市场结构影响。'] },
      { title: '如何评价它的经验表现', paragraphs: ['购买力平价适合组织长期物价与汇率的讨论，短期汇率还受利率、风险溢价和预期支配。检验时须区分高通胀时期与低通胀时期、价格水平比较与时间序列变化，以及均值回归和准确预测。即使实际汇率最终有回归趋势，也不能据此断言偏离会在某个交易期限内消失。巴拉萨—萨缪尔森效应进一步解释某些持久的价格水平差异。'] },
      { title: '带着初始偏离做一次计算', paragraphs: ['设本国篮子价格为 100 本币，外国可比篮子为 10 外币，市场汇率为 7 本币/外币，则实际汇率 q=0.7，而绝对 PPP 所对应的汇率为 10。若随后本国物价上涨 10%、外国上涨 2%，相对 PPP 给出的新汇率约为 7.549；代入新价格 110 和 10.2，q 仍为 0.7。这说明相对 PPP 保持原有实际汇率，不会自动消除初始偏离。', '在交互图里改变通胀差，观察的是这条条件路径；在实际数据图里看到偏离，还需检查基期、篮子与计价方向。绝对 PPP 提供价格水平的比较，相对 PPP 提供变化率的参照，实际汇率则记录二者之间随时间变化的关系。这三种用法承担不同任务，不能因为图上有一条平价线，就把它当作市场必须在短期内触及的目标。'] },
    ], sources: [{ title: 'Abnormal Deviations in International Exchanges', url: 'https://www.jstor.org/stable/2223329', note: 'The Economic Journal，1918；原始论文入口，全文可用性取决于机构权限。' }], formulas: [
      { expression: 'E=\\frac{P}{P^{*}},\\qquad q=\\frac{EP^{*}}{P}', explanation: 'E 为直接标价汇率；P、P* 为本国、外国的可比价格水平。绝对 PPP 下 q=1。' },
      { expression: '\\frac{E_{t+1}}{E_t}=\\frac{1+\\pi}{1+\\pi^{*}}', explanation: '相对 PPP 的精确比例关系；π 为本国通胀率，π* 为外国通胀率。' },
    ], figure: 'relative-ppp', related: ['hume', 'balassa-samuelson', 'monetary-exchange'],
  },
  {
    id: 'interest-parity', year: 1923, yearLabel: '1923 · 系统论述', title: '凯恩斯：远期外汇与利率平价', authors: 'John Maynard Keynes', originalTitle: 'A Tract on Monetary Reform', kind: 'theory', question: '换汇、存款再用远期锁定汇率，能够稳定多赚一份利差吗？', lessonIds: ['fx-market', 'short-run', 'enterprise'], terms: ['利率平价', 'CIP', 'UIP', '远期升贴水', '抛补'],
    sections: [
      { title: '远期市场解决什么问题', paragraphs: ['《货币改革论》讨论战后即期与远期外汇市场。进出口商常在今天确定合同，却在未来收付款；他们需要事先锁定兑换价格。投资者也可将即期换汇、外国存款与远期卖出外币组合起来。利率平价已有市场实践和更早论述，1923 年是凯恩斯对这一机制作系统说明的代表时间，不应写成作者首次发明远期外汇。'] },
      { title: '把两条投资路径放在同一日期', paragraphs: ['从一单位本币出发，直接存入本国银行，到期得到 1+i。另一条路径是按 E 换成 1/E 单位外币，存款后得到 (1+i*)/E，再按今天约定的远期汇率 F 换回本币，最终得到 F(1+i*)/E。在期限、信用风险和交易条件相同且无成本时，两条确定收益路径必须相等，才不存在可以重复扩大的套利。'] },
      { title: '升贴水抵消利差', paragraphs: ['由两条路径相等可得 F/E=(1+i)/(1+i*)。若本币利率较高，直接标价的远期汇率通常也较高，即外币远期升水、本币远期贴水。它抵消将低息外币借入后换成本币投资的利差。报价方向非常重要：把本币/外币改为外币/本币后，公式和升贴水说法都要相应转换。还应将年利率换算到实际合同期限，不能把三个月远期点数直接与一年利差比较。'] },
      { title: '抛补与未抛补不是同一个条件', paragraphs: ['抛补利率平价使用已签约的 F，未来兑换金额可以锁定。未抛补利率平价使用预期未来即期汇率，未来损益仍然不确定，还需要风险偏好或风险溢价假设。远期汇率满足无套利关系，不等于它必然是未来即期汇率的无偏预测。高息货币的套息收益，也不能只凭一次盈利就被解释为无风险套利。'] },
      { title: '为什么现实会出现基差', paragraphs: ['凯恩斯已注意到可用于套利的流动资本有限。今天还需考察买卖价差、借贷利率差、保证金、银行资本、资产负债表成本和交易对手风险。观察到报价偏离教科书平价，应先用实际能成交的借款、存款和远期价格重算。有些偏离反映对冲需求与金融中介约束，它们可以持续存在，并成为研究跨境美元融资的资料。'] },
      { title: '从具体报价重建套利路径', paragraphs: ['设本币一年利率为 2%，美元一年利率为 5%，即期汇率为 7.20 本币/美元。无摩擦条件下，远期汇率应为 7.20×1.02/1.05，约 6.994。本币利率较低，美元远期贴水与美元的利率优势相抵。这个价格由今天的可交易条件决定，并未使用分析者对一年后即期汇率的判断。', '若同期限远期报价为 6.90，可以设想借入 100 万美元，即期换得 720 万本币并按 2% 投资，到期得到 734.4 万本币。美元债务到期是 105 万美元，事先按 6.90 买入这些美元只需 724.5 万本币，两个终值相差 9.9 万本币。讲义用同一方向的放大金额展示这条路径；实际交易还须用借款利率、存款利率及对应买卖价分别核算。', '若加入费用后差额仍为正，还需要确认能否借到指定币种、能否取得同期限授信，以及远期对手方是否履约。CIP 因而既是计算工具，也是检查报价口径的顺序：先统一到期日，再统一计价货币，最后扣除实际可发生的成本。预期汇率只参与没有远期锁定的另一类投资，不能被放入这条已锁定现金流来重复计算收益。还应检查报价是否年化、采用多少计息天数；同样标为三个月的交易，在起息日或结算日不同时并不是完全相同的现金流。'] },
    ], sources: [{ title: 'A Tract on Monetary Reform · 全文', url: 'https://www.gutenberg.org/ebooks/65278', note: '1923 年原著电子版；引文谈可供即期与远期套利使用的流动资本。', quote: 'is by no means unlimited in amount, and is not always adequate to the market’s requirements.', translation: '（这种流动资本）在数量上绝非无限，也并不总能满足市场需要。' }], formulas: [
      { expression: '1+i=\\frac{F}{E}(1+i^{*})', explanation: '抛补利率平价；E 和 F 均为每单位外币的本币价格，利率与合同期限一致。' },
      { expression: '1+i=\\frac{\\mathbb{E}_t[E_{t+1}]}{E_t}(1+i^{*})', explanation: '在风险中性等假设下的未抛补预期收益相等式；没有远期合约消除汇率风险。' },
    ], figure: 'cip-cashflow', related: ['ppp', 'overshooting', 'portfolio-balance'],
  },
  {
    id: 'elasticities', year: 1944, yearLabel: '1944 · 勒纳的系统表述', title: '弹性分析：马歇尔—勒纳条件与 J 曲线', authors: 'Alfred Marshall · Abba P. Lerner · Stephen P. Magee', originalTitle: 'The Economics of Control; Currency Contracts, Pass-Through, and Devaluation', kind: 'theory', question: '本币贬值以后，贸易收支一定改善吗？', lessonIds: ['long-run', 'policy', 'enterprise'], terms: ['马歇尔—勒纳条件', 'J曲线', 'J 曲线', '需求弹性'],
    sections: [
      { title: '价格效应与数量效应相反', paragraphs: ['本币贬值使外国商品的本币价格提高，也可能使本国商品对外国消费者更便宜。数量调整有助于出口增加、进口减少；但每单位进口需要支付的本币变多，又会增加进口账单。弹性分析比较这两个方向。马歇尔—勒纳条件经过多位作者的发展，本条以勒纳 1944 年的系统表述定位，并把后来研究的合同与时滞问题放在一起阅读。'] },
      { title: '条件究竟写了什么', paragraphs: ['在初始贸易平衡、进出口供给充分弹性、出口本币价格及进口外币价格给定等条件下，本币贬值改善本币计价贸易余额，要求出口需求价格弹性与进口需求价格弹性的绝对值之和大于一。供给价格固定使汇率变化充分传到交易价格；初始平衡则让两侧金额权重相同。若这些假设不成立，条件需要调整，不能只记住一个不带前提的“不等式”。'] },
      { title: '推导中的一个可见步骤', paragraphs: ['设贸易余额 B=PₓX−EPₘ* M，E 是直接标价汇率。E 上升时，出口量 X 的增加提高收入，进口量 M 的减少降低支出，但 E 本身上升增加进口付款。在初始平衡处，一次小幅贬值带来的余额变化与“出口弹性＋进口弹性−1”成比例。若出口合同以外币计价、企业压缩利润而不调整售价，或本国产品依赖进口投入，则须重新写出价格传递和成本关系。'] },
      { title: 'J 曲线为何先向下', paragraphs: ['合同通常先约定，交货和付款随后发生。贬值刚发生时，进出口数量来不及变动，货币换算先改变账面价值；随着新合同、替代采购和产能调整展开，数量效应才逐步出现。Magee 1973 年的研究把货币合同、价格传递和后续调整分开分析。J 曲线因此是一种有条件的时间路径：如果长期需求反应仍很弱，曲线并不保证最终向上穿过起点。'] },
      { title: '如何读数据而不误判', paragraphs: ['一国贬值之后贸易余额改善，可能同时受到内需下降、出口目的地复苏和商品价格变化影响。反之，余额恶化也不单独证明弹性条件失败。应分别观察出口价格、进口价格、数量、合同币种和时间长度。对于企业，收入端的竞争力改善还须与进口原材料和外币债务的成本上升比较；国家贸易余额改善并不意味着每家企业都获利。'] },
    ], sources: [
      { title: 'The Economics of Control · 1944 年原著书目', url: 'https://books.google.com/books/about/The_Economics_of_Control.html?id=2kcNAQAAIAAJ', note: 'Macmillan 原著书目及有限预览。' },
      { title: 'Currency Contracts, Pass-Through, and Devaluation', url: 'https://www.brookings.edu/articles/currency-contracts-pass-through-and-devaluation/', note: 'Stephen P. Magee，Brookings Papers on Economic Activity，1973。' },
    ], formulas: [{ expression: '|\\varepsilon_X|+|\\varepsilon_M|>1', explanation: '初始贸易平衡且满足供给与价格传递假设时的马歇尔—勒纳条件。' }], figure: 'j-curve', related: ['absorption', 'ppp', 'mundell-fleming'],
  },
  {
    id: 'clearing-union', year: 1943, yearLabel: '1943 · 公开方案；1941 起草', title: '凯恩斯：国际清算联盟与对称调整', authors: 'John Maynard Keynes', originalTitle: 'Proposals for an International Clearing Union', kind: 'proposal', question: '国际收支调整为什么不能只要求逆差国家紧缩？', lessonIds: ['foundations', 'governance', 'dollar', 'future'], terms: ['国际清算联盟', '班科', 'Bancor', '凯恩斯方案'],
    sections: [
      { title: '战间期经验与战后重建', paragraphs: ['凯恩斯的清算联盟方案于 1941 年开始形成，1943 年以英国政府白皮书公开。战间期的失业、外汇限制、双边结算和竞争性贬值，使他担心各国为保存储备而压缩支出，最终共同陷入需求不足。战后重建又需要进口设备与生活物资，暂时逆差未必等同于长期无法偿付。因此，国际制度既须约束持续失衡，也须提供过渡所需的支付能力。'] },
      { title: '班科怎样用于多边清算', paragraphs: ['方案设想一种国际记账货币 bancor，各国中央银行在联盟开户，跨国支付通过账户借记和贷记结算。一个国家对甲国的顺差可以抵消对乙国的逆差，不必逐笔取得同一双边关系中的支付手段。班科的用途是成员之间的国际结算，不能简单理解为所有居民都会使用的全球现金。各国货币与班科之间有规定的兑换关系，并设立调整程序。'] },
      { title: '为什么同时约束顺差与逆差', paragraphs: ['逆差国若只能紧缩进口和收入，其贸易伙伴的出口也会受损。凯恩斯因此提出对持续的债务余额和债权余额施加规则，促使顺差国也考虑扩大需求、调整汇率或输出资本。额度、费用与协商安排意在限制长期单边积累，不能概括为任何逆差都能无限透支。所谓对称调整，指的是制度责任同时落到两侧，而非每个国家在每一期都必须贸易平衡。'] },
      { title: '与实际布雷顿森林制度的区别', paragraphs: ['实际形成的国际货币基金组织与美元—黄金体系并未照搬班科清算联盟。怀特方案、美国的债权地位、战后融资规模和成员控制权都影响了最终制度。讨论凯恩斯方案时，应分别比较储备资产由谁发行、贷款怎样取得、谁承担信用风险、顺差国受到什么约束。不能因为 IMF 提供融资，就称其实现了凯恩斯提出的全部安排。'] },
      { title: '今天仍需回答的治理问题', paragraphs: ['超国家记账资产可以降低对单一国家负债的依赖，却不会自动消除利益冲突。新增额度如何分配，什么失衡需要纠正，谁有权要求调整，损失由谁承担，都需要明确规则。将这一方案与特别提款权或数字化跨境结算比较时，应比较发行、清算、信贷和治理功能，不能仅因它们都不是纸币，就把它们视作同一种制度。'] },
    ], sources: [{ title: 'The Keynes Plan · 1942 草案与 1943 白皮书全文', url: 'https://www.elibrary.imf.org/display/book/9781451972511/ch001.xml', note: 'IMF 史料卷收入的原始文件，分别标明草案与公开版本。', quote: 'The proposal is to establish a Currency Union, here designated an International Clearing Union', translation: '本方案拟建立一个货币联盟，在此称为国际清算联盟。' }], related: ['triffin', 'internal-external', 'hume'],
  },
  {
    id: 'absorption', year: 1952, yearLabel: '1952', title: '亚历山大：国际收支的吸收分析', authors: 'Sidney S. Alexander', originalTitle: 'Effects of a Devaluation on a Trade Balance', kind: 'theory', question: '贬值怎样通过总产出与国内支出影响贸易余额？', lessonIds: ['accounts', 'policy'], terms: ['吸收分析', '国内吸收', '支出转换', '支出削减'],
    sections: [
      { title: '从两类商品转向总收入与总支出', paragraphs: ['传统弹性分析关注进口和出口各自的供给、需求以及价格反应。亚历山大在 1952 年指出，还可以从一国实际收入与实际支出的关系分析贬值。若一国生产多于自己吸收，差额可以提供给国外；若支出大于收入，就需要取得国外资源。这个视角使外部余额与就业、总需求和国内政策直接相连。'] },
      { title: '吸收的定义与会计起点', paragraphs: ['在忽略跨境要素收入和转移的简单模型中，Y=C+I+G+NX。把国内消费、投资和政府购买合称吸收 A，就有 NX=Y−A。它首先是国民账户恒等式，不足以单独说明贬值为什么改变贸易余额。解释需要给出 Y 与 A 的行为反应。若讨论经常账户而非净出口，还须按账户口径加入净初次收入与净二次收入。'] },
      { title: '有闲置资源时的收入反应', paragraphs: ['失业和闲置产能存在时，贬值可能把需求转向本国产品，使产出增加。新增收入的一部分被用于消费和投资，其余部分才体现为外部余额改善。设吸收对收入的边际反应为 a，则产出增加 ΔY 对净出口的贡献为 (1−a)ΔY，还要减去贬值对吸收的直接影响。若生产离不开昂贵的进口原料，或者金融条件同时恶化，产出的反应就可能较弱甚至相反。'] },
      { title: '充分就业时为何需要支出调整', paragraphs: ['如果产出已受供给约束，贬值不能持续靠提高实际产量创造出口余量。外部余额改善就需要降低实际吸收，或改变国内支出构成。进口价格上涨可能压低实际购买力，财政和信贷政策也可影响总支出。但压低吸收的代价由不同家庭和企业承担，收入分配、公共服务和未来投资可能受影响。因此，外部调整的会计完成不等于福利改善。'] },
      { title: '与弹性分析如何配合', paragraphs: ['吸收分析指出总量上必须发生什么，弹性分析说明相对价格如何推动需求转换，两者可以共同使用。贬值使相对价格改变，但若居民和政府支出增加得更快，净出口未必改善；紧缩减少进口，也可能在汇率没有变化时改善余额。进一步加入资本流动、利率与货币政策，便进入内外均衡和蒙代尔—弗莱明模型的问题。'] },
    ], sources: [{ title: 'Effects of a Devaluation on a Trade Balance', url: 'https://www.elibrary.imf.org/view/journals/024/1952/001/article-A003-en.xml', note: 'Sidney S. Alexander，IMF Staff Papers，1952；引文为作者提出的分析关系。', quote: 'the relationships of real expenditure to real income', translation: '实际支出与实际收入之间的关系。' }], formulas: [
      { expression: 'NX=Y-A,\\qquad A=C+I+G', explanation: '简单国民账户中的国内吸收；NX 为净出口，不能不加调整地与完整经常账户混用。' },
      { expression: '\\Delta NX=(1-a)\\Delta Y-\\Delta A_{\\mathrm{direct}}', explanation: 'a 是吸收对收入的边际反应；直接吸收效应包括贬值在给定收入下对实际支出的影响。' },
    ], figure: 'account-bridge', related: ['elasticities', 'internal-external', 'mundell-fleming'],
  },
  {
    id: 'monetary-bop', year: 1957, yearLabel: '1957', title: '波拉克：国际收支与国内信贷', authors: 'Jacques J. Polak', originalTitle: 'Monetary Analysis of Income Formation and Payments Problems', kind: 'theory', question: '国内信贷扩张怎样转化为进口增加与外汇储备减少？', lessonIds: ['accounts', 'policy', 'currency-crises', 'governance'], terms: ['波拉克模型', '国际收支货币分析', '国内信贷'],
    sections: [
      { title: '把货币数据接入收入分析', paragraphs: ['波拉克在 1957 年试图用当时许多国家能够取得的货币、进出口和信贷资料，建立可以用于政策分析的数量框架。已有收入分析重视支出乘数，却不容易把信贷创造与支付困难连起来。波拉克模型把货币、名义收入、进口和储备放进同一个动态过程，后来成为 IMF 金融规划的重要起点。它与后来的国际收支货币分析有联系，但两者不宜完全画等号。'] },
      { title: '银行体系资产负债表', paragraphs: ['在简化的合并银行体系中，货币供给的对应资产包括净国外资产与国内信贷，写成 M=R+D。国内信贷增加最初提高货币余额；公众支出使收入和进口增加，外汇支付又减少净国外资产。这里 R 必须按同一币种和相同统计口径计量。它并非任何场合都等于新闻报道中的官方总外汇储备，还可能涉及银行体系的国外资产与负债。'] },
      { title: '收入、进口与货币持有', paragraphs: ['基础版本假定货币需求与名义收入有稳定关系，进口也随收入变化；出口和某些资本流动作为外生条件。国内新增信贷经由支出、收入和进口逐步向外泄漏，最终的货币存量受公众持有意愿约束。若信贷扩张超过新增货币需求可吸收的规模，固定汇率下的一部分调整会表现为储备流失。这个结论需要动态关系，不能只由资产负债表恒等式推出因果。'] },
      { title: '政策怎样使用这个框架', paragraphs: ['给定出口、资本流入和期望的储备变化，可以反推与这些目标相容的国内信贷扩张幅度。若政府赤字主要依赖银行融资，财政约束就进入外部稳定问题。模型并不意味着只要限制信贷便能解决所有危机；出口冲击、资本外逃、银行坏账以及供给中断都可能改变关系。政策还需考虑收缩对产出、就业和银行偿付能力的影响。'] },
      { title: '开放资本市场带来的变化', paragraphs: ['金融创新会改变货币需求，资本流动可能远大于货物贸易流，央行也可能通过利率而非固定货币数量操作。浮动汇率下，压力可先表现为汇率变化，冲销干预又可能切断简单的货币—储备关系。因此，应用时必须检查汇率制度、银行体系口径与行为参数是否稳定。这条分析线也帮助理解第一代货币危机中“持续信贷扩张与固定汇率不相容”的含义。'] },
    ], sources: [{ title: 'Monetary Analysis of Income Formation and Payments Problems', url: 'https://www.elibrary.imf.org/abstract/journals/024/1957/002/article-A001-en.xml', note: 'J. J. Polak，IMF Staff Papers，1957；初刊入口，引文与 IMF 收录的作者原文核对。', quote: 'to bring monetary events, monetary data, and monetary problems within the framework of income analysis', translation: '把货币事件、货币数据和货币问题纳入收入分析的框架。' }], formulas: [{ expression: 'M=R+D,\\qquad \\Delta R=\\Delta M-\\Delta D', explanation: '简化合并银行体系：M 为货币，R 为同币种计价的净国外资产，D 为国内信贷；行为假设决定各项怎样调整。' }], related: ['hume', 'absorption', 'first-crisis'],
  },
  {
    id: 'internal-external', year: 1951, yearLabel: '1951 起 · 1950—1960 年代发展', title: '米德与斯旺：内部均衡和外部均衡', authors: 'James E. Meade · Trevor W. Swan', originalTitle: 'The Balance of Payments; Longer-Run Problems of the Balance of Payments', kind: 'theory', question: '怎样同时处理失业、通胀与不可持续的对外失衡？', lessonIds: ['policy', 'accounts', 'regimes'], terms: ['内部均衡', '外部均衡', '斯旺图', '政策搭配'],
    sections: [
      { title: '两个目标不能合成一个指标', paragraphs: ['米德 1951 年的国际经济政策分析把充分就业与国际收支问题共同处理，斯旺随后用图形刻画支出和相对价格的搭配。斯旺图的构思与公开发表不在同一年，常见引用为 1963 年的文章。内部均衡指在稳定的价格条件下维持适当就业，外部均衡指与可持续融资和储备目标相容的支付状态；后者不必规定每年经常账户恰好为零。'] },
      { title: '支出变化与支出转换', paragraphs: ['国内吸收增加会提高总需求，同时通常增加进口；实际贬值则把需求转向本国产品，并改变外部余额。因而，单纯紧缩可以减少逆差，却可能扩大失业；单纯刺激可以减少失业，却可能加重外部压力。两种工具对两个目标的作用不同，政策需要搭配。图形所画的每条均衡曲线，都是一组能使某一目标满足的吸收与实际汇率组合。'] },
      { title: '怎样理解四种失衡区域', paragraphs: ['如果一国失业且外部逆差，扩大支出有助于就业却不利于外部余额，实际贬值可能同时发挥支出转换作用；若通胀与逆差并存，减少吸收的作用更直接。其他区域也可依次比较。这种分类帮助辨别政策方向，但具体组合仍取决于进口倾向、贸易弹性与资源约束。图上的交点不是政府可以不计代价立即抵达的数字目标。'] },
      { title: '工具分工还取决于制度', paragraphs: ['加入资本流动以后，利率不仅影响国内支出，也影响跨境资产选择。蒙代尔进一步研究货币与财政工具对内外均衡的相对作用，强调按有效性进行分工。固定汇率下，一国不能随意同时设定汇率、货币量和利率；欧元区成员也不能单独调整本币名义汇率。缺失的工具需要由工资价格、跨区转移或其他制度安排部分替代。'] },
      { title: '可持续性不是图上一条固定直线', paragraphs: ['今天判断外部均衡，还要考虑人口结构、未来收入、对外资产负债的币种与期限，以及金融市场愿意提供的融资。高投资带来的暂时逆差与消费泡沫形成的逆差不能用同一尺度评价。米德在后来的讨论中也重视工资形成与失业问题。这个框架的用途，是明确目标间的联系和政策条件，而不是为所有国家指定相同的贸易差额。'] },
    ], sources: [
      { title: 'The Meaning of “Internal Balance” · 米德原著演讲', url: 'https://www.nobelprize.org/prizes/economic-sciences/1977/meade/lecture/', note: '作者 1977 年诺贝尔演讲，回顾并发展内外均衡分析；不是 1951 年著作的逐字转载。' },
      { title: 'The Appropriate Use of Monetary and Fiscal Policy for Internal and External Stability', url: 'https://www.elibrary.imf.org/abstract/journals/024/1962/001/article-A003-en.xml', note: 'Robert A. Mundell，1962，关于政策分工的原始论文。' },
    ], related: ['absorption', 'mundell-fleming', 'clearing-union'],
  },
  {
    id: 'flexible-rates', year: 1953, yearLabel: '1953 · 收入论文集', title: '弗里德曼：浮动汇率的论证', authors: 'Milton Friedman', originalTitle: 'The Case for Flexible Exchange Rates', kind: 'proposal', question: '国际相对价格需要改变时，应主要调整汇率，还是国内工资和物价？', lessonIds: ['regimes', 'policy', 'short-run'], terms: ['浮动汇率', '弗里德曼', '汇率制度'],
    sections: [
      { title: '固定平价下的调整困难', paragraphs: ['弗里德曼的文章在 1953 年收入《实证经济学论文集》，讨论在不同国家政策和经济条件并不一致的情况下，固定汇率是否是最合适的安排。若国际相对价格需要改变，而汇率保持不变，调整必须更多依靠国内价格、工资、就业和数量。工资与价格调整缓慢时，这个过程可能伴随失业、贸易限制和反复的外汇管制。'] },
      { title: '一个价格调整的便利', paragraphs: ['汇率是两种货币之间的价格，改变汇率可以同时改变许多跨境交易的换算关系。浮动制度允许这个价格对供求变化作出反应，从而减少依靠大批国内名义价格共同下降的需要。但只有汇率变化传递到相关产品的相对价格，这种支出转换才会发生。若企业采用主导货币定价并稳定售价，短期传递效果就不同。'] },
      { title: '货币自主与外部约束', paragraphs: ['一国可以在更大程度上围绕国内目标安排货币政策，并让汇率吸收国际货币条件的差异。这不是说外部冲击不再影响国内经济：进口价格、外币债务和风险溢价仍会传导压力。浮动制度改变的是调整方式和政策约束组合。若央行虽宣布浮动却长期维持狭窄区间，其实际政策空间也不能仅凭制度名称判断。'] },
      { title: '投机是否稳定汇率', paragraphs: ['支持浮动汇率的一条论证是，低买高卖的投机者可以平抑暂时偏离并获利。但金融市场参与者可能面临保证金约束、短期绩效压力、共同预期和尾部风险，价格波动不能简单分成有利可图的稳定投机与必然亏损的破坏性投机。评价时需要观察持仓、资金约束和信息更新，而非只用事后盈利证明某种交易改善了稳定性。'] },
      { title: '后续理论怎样修改这个主张', paragraphs: ['最优货币区理论指出，共享货币可以降低交易成本，却需要足够的调整和风险分担机制。汇率超调模型说明，即使预期理性，快慢市场的差异也能带来很大的短期波动。外币债务研究进一步说明，贬值可能损伤资产负债表。因此，浮动汇率的优劣须与定价方式、债务币种、政策信用和资本流动条件一起评价。比较实际制度时，还应检查宣布的安排与央行日常干预是否一致，并区分正常时期和压力时期。'] },
    ], sources: [{ title: 'Essays in Positive Economics · 出版社目录', url: 'https://press.uchicago.edu/ucp/books/book/chicago/E/bo25773835.html', note: '芝加哥大学出版社原著入口，含 The Case for Flexible Exchange Rates；当前页面为再版信息，文章初收录于 1953 年版。' }], related: ['optimum-currency', 'overshooting', 'mundell-fleming'],
  },
  {
    id: 'triffin', year: 1960, yearLabel: '1960 · 专著出版', title: '特里芬：储备供给与美元信用', authors: 'Robert Triffin', originalTitle: 'Gold and the Dollar Crisis: The Future of Convertibility', kind: 'theory', question: '世界需要更多美元储备，为什么又会削弱美元兑金的可信度？', lessonIds: ['foundations', 'dollar', 'future'], terms: ['特里芬难题', '储备货币', '美元—黄金体系'],
    sections: [
      { title: '从美元短缺到美元负债增加', paragraphs: ['布雷顿森林体系将主要货币与美元联系起来，美国向外国官方持有人维持美元兑金承诺。国际贸易和支付增长需要可用的储备资产，外国通过国际收支交易积累美元债权。特里芬在 1950 年代已提出问题，1960 年《黄金与美元危机》作了集中论述。年份对应专著出版，而非这一担忧突然出现的唯一时点。'] },
      { title: '同一种负债承担两种任务', paragraphs: ['美元既是美国的国内货币，也是其他国家持有的国际储备。国外增加美元资产，意味着相关美元负债增加。在给定黄金价格和有限美国黄金储备下，外国可要求兑金的债权不断扩大，储备体系的流动性增长与兑换承诺的覆盖能力便可能出现张力。这里的问题不只是某一期贸易逆差，而是储备资产供给、负债存量与兑付规则的组合。'] },
      { title: '为什么两种选择都有代价', paragraphs: ['若美国严格消除对外支付逆差，世界储备的增长可能受限；若美元负债继续快速增加，外国官方持有人可能怀疑其兑金能力并提前兑换。信心变化能把长期的制度矛盾转化为短期压力。实际的美元对外供给还涉及资本输出等金融交易，因此不能把“美国必须每年有经常账户逆差”当作这一理论的精确命题。'] },
      { title: '制度改革的方向', paragraphs: ['特里芬主张加强国际储备创造的集体安排，减少体系对单一国家国际收支状况的依赖。这涉及新储备资产如何产生、增长率由谁决定、各国能否得到所需流动性等问题。特别提款权和国际货币改革可放在这条思想线索中理解，但不同安排的发行条件、使用范围与治理权并不相同。增加一种储备资产本身并不保证各国愿意大规模持有它。'] },
      { title: '今天还能否直接套用', paragraphs: ['美元不再维持固定兑金承诺，原始难题中的黄金兑换约束已经改变。今天讨论“新特里芬难题”，通常涉及安全资产需求与发行国财政能力、外部负债、政治信用或全球风险承担之间的张力，必须说明换用了哪些机制。美元份额下降、黄金价格上涨或美国财政赤字，任何单项事实都不足以证明储备体系即将崩溃。应分别分析流动性、偿付能力与替代资产的制度条件。'] },
    ], sources: [
      { title: 'Gold and the Dollar Crisis · 1960 年原著', url: 'https://books.google.com/books/about/Gold_and_the_Dollar_Crisis.html?id=0HBEAAAAIAAJ', note: 'Yale University Press 原著书目及有限预览。' },
      { title: 'Gold and the Dollar Crisis: Yesterday and Tomorrow', url: 'https://ies.princeton.edu/pdf/E132.pdf', note: '特里芬本人 1978 年的回顾，普林斯顿国际金融论文第 132 号；引文谈持续逆差时的美元负债。', quote: 'its foreign liabilities would inevitably come to exceed by far its ability to convert dollars into gold upon demand', translation: '其对外负债将不可避免地远远超过其应要求把美元兑换为黄金的能力。' },
    ], related: ['hume', 'clearing-union', 'first-crisis'],
  },
  {
    id: 'optimum-currency', year: 1961, yearLabel: '1961', title: '蒙代尔：最优货币区', authors: 'Robert A. Mundell', originalTitle: 'A Theory of Optimum Currency Areas', kind: 'theory', question: '什么样的经济区域适合共用一种货币？', lessonIds: ['regimes', 'policy', 'governance'], terms: ['最优货币区', 'OCA', '货币联盟', '非对称冲击'],
    sections: [
      { title: '货币边界为何等同于国界', paragraphs: ['浮动汇率支持者强调，各国可以借助汇率变化调整相对价格。蒙代尔在 1961 年追问：如果受到相似冲击的经济区域横跨国界，而同一国家内部又有差异很大的地区，以国家为单位设置货币是否合理？理论的分析对象是经济区域，而实际货币制度又受到主权与政治组织约束。最优货币区因此同时涉及调整机制与制度可行性。'] },
      { title: '需求从一个地区转向另一个地区', paragraphs: ['设两个地区共用货币，需求从甲的产品转向乙的产品。甲面临失业，乙面临工资与价格上涨压力。统一央行扩大需求可以帮助甲，却可能加重乙的通胀；紧缩可以压低乙的价格压力，却使甲失业更严重。若两地使用独立货币，汇率变化可能调整相对价格。但货币边界只有与实际经济结构相配，才可能把这种调整准确施加到受冲击区域。'] },
      { title: '劳动流动为什么关键', paragraphs: ['甲地失业者如果能够迁往乙地，劳动力供给便会随需求重新分布，减少同时存在的失业与通胀压力。迁移需要语言、资格认可、住房和公共服务等条件，不能只由法律允许自由流动来衡量。工资价格足够灵活也能帮助调整，但过程中的实际收入变化和债务压力仍需考虑。原文中的要素流动性是相对概念，不是一个达到即可永久合格的固定门槛。'] },
      { title: '共同货币的收益与其他缓冲', paragraphs: ['货币越多，兑换、报价、持有多种流动性和对冲的成本越高；共同货币可以降低这些成本，扩大交易与金融市场。后来的研究补充贸易开放度、产业多样化、财政转移与金融风险分担等条件。跨区财政可以帮助暂时受损地区，但能否及时、持续实施取决于政治协议和预算安排。这些发展不应全部倒写成 1961 年论文已经给出的完整清单。'] },
      { title: '货币联盟会改变入盟条件', paragraphs: ['共同货币建立之后，贸易、生产分工和金融联系可能增强，冲击的相关性也可能变化；产业专业化有时反而扩大地区差异。因此，应同时研究加入前的条件和加入后的结构变化。欧元区经验还提示银行—主权联系、共同监管和危机融资的重要性。最优货币区理论给出的是比较共同货币收益与调整成本的方法，不能仅凭成员贸易额高就宣布制度没有风险。'] },
    ], sources: [{ title: 'A Theory of Optimum Currency Areas · 原始论文', url: 'https://www.sfu.ca/~kkasa/mundell_61.pdf', note: 'American Economic Review，1961；Simon Fraser University 课程收藏。', quote: 'an essential ingredient of a common currency, or a single currency area, is a high degree of factor mobility', translation: '共同货币或单一货币区的一项必要条件，是高度的要素流动性。' }], related: ['flexible-rates', 'internal-external', 'mundell-fleming'],
  },
  {
    id: 'mundell-fleming', year: 1963, yearLabel: '1962—1963', title: '蒙代尔—弗莱明：汇率制度与政策效力', authors: 'J. Marcus Fleming · Robert A. Mundell', originalTitle: 'Domestic Financial Policies under Fixed and under Floating Exchange Rates; Capital Mobility and Stabilization Policy under Fixed and Flexible Exchange Rates', kind: 'theory', question: '同样的财政或货币扩张，为何在不同汇率制度下产生不同结果？', lessonIds: ['policy', 'regimes', 'globalization'], terms: ['蒙代尔—弗莱明', 'IS–LM–FX', 'IS-LM', '政策三难', '三元悖论'],
    sections: [
      { title: '把跨境资产选择加入短期总需求', paragraphs: ['弗莱明 1962 年与蒙代尔 1963 年的论文分别研究开放经济政策，两者的设定并非完全相同。课程常把它们合称蒙代尔—弗莱明框架：商品价格短期黏性，产出可随需求改变；货币、商品与跨境资产市场共同决定均衡。政府改变支出或税收，央行改变货币条件，投资者比较本外币资产回报。汇率制度决定央行是否必须为维持某个兑换价格而买卖外汇。'] },
      { title: '三个市场如何连接', paragraphs: ['商品市场要求 Y=C+I+G+NX，利率提高通常抑制投资，实际贬值在适当弹性条件下增加净出口。货币市场要求实际货币供给等于货币需求，收入增加提高交易需求，利率上升降低持币意愿。外汇市场的预期收益条件把本国利率、外国利率、即期汇率、预期未来汇率与风险溢价联系起来。三条关系共同解出 Y、i、E，不能先给每个变量各指定一个任意结果。', '讲义中的 FX 条件允许即期汇率与给定的未来预期不同，本国利率因而可以暂时偏离外国利率。蒙代尔原始的极端资本流动版本则常进一步设定国际资产完全替代、没有相关风险补偿，形成 i=i* 的限制。比较模型结论以前，应先明确正在使用哪一种预期与资本流动假设。'] },
      { title: '浮动汇率下的货币扩张', paragraphs: ['货币供给增加使原利率下实际余额过多，利率下降，本币资产的相对吸引力减弱。本币贬值推动净出口，配合投资增加提高总需求。因为央行没有承诺固定 E，无须为了抵消贬值压力而立即回收货币。这个方向依赖价格黏性、贸易反应和预期条件；若存在大量外币债务，贬值损害资产负债表，净效果可能弱于基本模型。'] },
      { title: '浮动汇率下的财政扩张', paragraphs: ['政府支出增加使 IS 向右移动，收入增加提高货币需求；在既定货币供给下，利率上升。本币升值与国内投资减少分别形成净出口挤出和投资挤出。一般情况下，最终产出仍可能提高，只是小于没有这些反馈时的变化。只有在资本完全流动、利率被固定在世界水平等极限条件下，汇率升值才会使净出口下降完全抵消财政扩张，产出不变。', '因此，“浮动汇率下财政政策无效”不能作为不加条件的结论。风险溢价、进口倾向、货币政策反应和支出结构都会改变乘数。政府购买直接进入需求，减税则先增加可支配收入，一部分可能被储蓄；两种财政工具也不能机械地设置相同的初始效果。'] },
      { title: '固定汇率下的央行干预', paragraphs: ['在可信固定汇率和高度资本流动条件下，独立货币扩张引出资本外流和贬值压力。央行为维持平价卖出外汇、回收本币，原来的扩张被抵消。财政扩张引出流入和升值压力时，央行买入外汇、投放本币，货币条件配合财政刺激。这里假定干预没有持续完全冲销，且储备和政策信誉足以维持承诺；有限储备、资本管制与风险溢价变化会改变调整过程。'] },
      { title: '政策三难及其适用范围', paragraphs: ['固定汇率、资本自由流动与独立货币政策之间的冲突，可以从利率平价和干预承诺中理解。现实制度通常处于程度不同的中间状态，拥有一定管理空间，也承担对应成本。基本模型擅长比较短期需求反馈，不能单独解释长期生产率、主权偿付能力或全球金融周期。观察实际政策时，应将模型的基准传导与这些额外渠道分别识别。比如，财政刺激后本币贬值可能反映主权风险补偿上升；这不构成对基准模型的直接反例，因为风险溢价保持不变的前提已经改变。应先核查改变了哪个条件，再比较相应的均衡。'] },
    ], sources: [
      { title: 'Capital Mobility and Stabilization Policy under Fixed and Flexible Exchange Rates', url: 'https://www.depfe.unam.mx/actividades/11/macro-abierta/11-2_majr_05_mundell_1963.pdf', note: 'Robert A. Mundell，1963；墨西哥国立自治大学课程收藏的原始论文。' },
      { title: 'On the History of the Mundell-Fleming Model', url: 'https://www.elibrary.imf.org/view/journals/024/2001/005/article-A008-en.xml', note: '蒙代尔本人的理论史回顾，交代弗莱明与其各篇论文的设定、写作和发表过程。' },
    ], formulas: [
      { expression: 'Y=C(Y-T)+I(i)+G+NX(E,Y,Y^{*})', explanation: '价格水平暂时给定时的商品市场关系；更一般写法应将名义汇率换为实际汇率。' },
      { expression: '\\frac{M}{P}=L(i,Y),\\qquad i\\approx i^{*}+\\frac{E^e-E}{E}+\\rho', explanation: '货币市场与带风险溢价的近似预期收益条件。ρ 在此定义为持有本币资产所需的额外补偿。' },
    ], figure: 'policy-capital-mobility', related: ['internal-external', 'interest-parity', 'overshooting', 'flexible-rates'],
  },
  {
    id: 'balassa-samuelson', year: 1964, yearLabel: '1964', title: '巴拉萨—萨缪尔森：生产率与实际升值', authors: 'Béla Balassa · Paul A. Samuelson', originalTitle: 'The Purchasing-Power Parity Doctrine: A Reappraisal; Theoretical Notes on Trade Problems', kind: 'theory', question: '为什么生产率较高的经济体，本地服务和综合物价往往也较高？', lessonIds: ['long-run', 'development-finance'], terms: ['巴拉萨—萨缪尔森', '佩恩效应', '不可贸易品', '部门生产率'],
    sections: [
      { title: '先区分事实与机制', paragraphs: ['富裕经济体的综合价格水平通常较高，这个跨国统计规律常称为佩恩效应。巴拉萨和萨缪尔森在 1964 年分别提出有关生产率与价格水平的解释。收入较高和物价较高同时出现，并不能单独识别生产率的因果作用；理论需要更细的部门关系。购买力平价偏离因此可能包含可解释的结构因素，不能一概称为汇率高估。'] },
      { title: '两个部门与工资联系', paragraphs: ['设经济包含可贸易部门 T 与不可贸易部门 N，商品市场竞争，劳动可以在国内部门之间移动。贸易品价格受到国际市场约束，可贸易部门生产率 Aₜ 提高使企业有能力支付更高工资。劳动者流动把工资压力传到本地服务业；如果服务业生产率 Aₙ 没有同样提高，服务单位成本上升，服务价格也随之上升。关键是两部门生产率的相对变化。'] },
      { title: '从单位成本推到实际汇率', paragraphs: ['在只有劳动投入的简化模型中，Pₜ=W/Aₜ、Pₙ=W/Aₙ，所以 Pₙ/Pₜ=Aₜ/Aₙ。可贸易部门生产率相对提高，便使不可贸易品相对价格提高。若消费篮子中服务占一定权重，综合价格 P 上升；在可贸易品国际价格被约束时，本国相对于外国发生实际升值。按 q=EP*/P 的直接标价定义，实际升值对应 q 下降，而不是所有课本都使用的同一个方向符号。'] },
      { title: '什么变化会削弱这条传导', paragraphs: ['部门间劳动分割、工资议价、资本投入差异和服务价格管制，都可能改变“同一工资—单位劳动成本”的简化关系。若不可贸易部门生产率也快速提高，它会缓解服务价格上涨。住房供给、土地价格、税收和贸易品定价差异又可能独立影响综合物价。因此，不能把所有实际升值都归因于制造业生产率，也不能仅凭 GDP 增长预测本币升值。'] },
      { title: '检验需要哪些资料', paragraphs: ['应同时观察可贸易与不可贸易部门的生产率、工资和价格，检查工资能否跨部门传导，再分解实际汇率变化来自本地服务相对价格还是各国贸易品价格差异。讲义指出，不同样本和分解方法得到的贡献并不一致。研究支持某个时期的这一机制，不意味着它主导短期汇率波动。名义汇率还受货币、利率和风险预期影响，实际升值也可以通过国内价格而非名义升值发生。'] },
    ], sources: [
      { title: 'The Purchasing-Power Parity Doctrine: A Reappraisal', url: 'https://www.journals.uchicago.edu/doi/10.1086/258965', note: 'Béla Balassa，Journal of Political Economy，1964；出版社原文入口。' },
      { title: 'Theoretical Notes on Trade Problems · 所在原刊期次', url: 'https://www.jstor.org/stable/i306100', note: 'Paul A. Samuelson，The Review of Economics and Statistics，1964 年第 46 卷第 2 期。' },
    ], formulas: [{ expression: '\\frac{P_N}{P_T}=\\frac{A_T}{A_N},\\qquad q=\\frac{EP^{*}}{P}', explanation: '第一式依赖竞争、单一劳动投入和国内工资均等化；本国服务价格上升通常使第二式中的 q 降低。' }], figure: 'balassa-samuelson', related: ['ppp', 'monetary-exchange', 'elasticities'],
  },
  {
    id: 'monetary-exchange', year: 1976, yearLabel: '1976 · 代表论文', title: '货币分析法：货币供求与长期汇率', authors: 'Jacob A. Frenkel · Michael Mussa 等', originalTitle: 'A Monetary Approach to the Exchange Rate: Doctrinal Aspects and Empirical Evidence', kind: 'theory', question: '货币供给变化何时会转化为物价上涨和本币贬值？', lessonIds: ['long-run', 'short-run'], terms: ['货币分析法', '货币需求', '弹性价格货币模型'],
    sections: [
      { title: '从物价比再向前追问一步', paragraphs: ['购买力平价把长期汇率与两国物价联系起来，货币分析法进一步解释物价怎样形成。1970 年代的相关研究把汇率作为资产价格，结合货币供求与对未来政策的预期。Frenkel 1976 年论文是代表文本，思想则与更早的数量论、货币需求和国际收支货币分析相连。本条采用弹性价格的长期基准，短期价格黏性留给超调模型。'] },
      { title: '公众希望持有多少购买力', paragraphs: ['货币需求指公众愿意保留的货币余额，不是想获得收入或想借款。名义余额 M 除以价格 P 得到实际购买力；实际货币需求 L 通常随收入增加而增加，随持币机会成本提高而减少。货币市场长期平衡要求 M/P=L(i,Y)。若新增货币超过实际货币需求的增长，价格水平便需要上升，使实际余额回到公众愿意持有的水平。'] },
      { title: '两国货币市场与 PPP 联立', paragraphs: ['本国 P=M/L，外国 P*=M*/L*，再用 E=P/P*，得到 E=(M/M*)(L*/L)。本国相对货币供给增加倾向于使 E 上升，即本币贬值；本国实际收入提高若增加货币需求，则可能抵消部分影响。讲义的一次性实验是：货币供给增加 20%，实际需求长期不变，物价与直接标价汇率相应提高 20%；本币的外币价值下降约 16.7%，不能也写成下降 20%。'] },
      { title: '为何高利率有不同含义', paragraphs: ['弹性价格长期模型中，较高名义利率可能反映较高预期通胀，使公众减少持币，并与本币贬值相伴。短期紧缩提高实际或政策利率，则可能吸引资产需求并使本币升值。两种表述针对不同冲击和不同调整期限。若只把“利率高”作为一个没有来源的条件，就会把费雪效应和短期流动性效应混在一起，得到方向相反的结论。'] },
      { title: '经验检验为何并不简单', paragraphs: ['货币需求会随支付技术、监管、资产收益和货币统计口径变化，PPP 也可能存在持续偏离。即使货币基本面与汇率长期相关，短期预测仍受预期新闻和风险溢价影响。检验不能只比较两条上升趋势的曲线，还要检查变量是否可比、参数是否稳定以及样本外预测。货币分析法适合解释长期名义约束，不提供一个凭 M2 增长率便能准确预测下月汇率的公式。'] },
    ], sources: [
      { title: 'A Monetary Approach to the Exchange Rate: Doctrinal Aspects and Empirical Evidence', url: 'https://doi.org/10.2307/3439924', note: 'Jacob A. Frenkel，Scandinavian Journal of Economics，1976。' },
      { title: 'Exchange Rates in the 1920’s: A Monetary Approach', url: 'https://www.nber.org/papers/w0290', note: 'Jacob A. Frenkel 与 Kenneth W. Clements，1978；作者的经验研究及模型推导。' },
    ], formulas: [{ expression: '\\frac{M}{P}=L(i,Y),\\qquad E=\\frac{M}{M^{*}}\\frac{L(i^{*},Y^{*})}{L(i,Y)}', explanation: '后一个等式把两国货币市场均衡与绝对 PPP 联立；两国实际货币需求函数可各有参数。' }], figure: 'money-adjustment', related: ['ppp', 'monetary-bop', 'overshooting'],
  },
  {
    id: 'portfolio-balance', year: 1970, yearLabel: '1970 起 · 1970 年代发展', title: '资产组合平衡：存量、风险与汇率', authors: 'William H. Branson · Pentti J. K. Kouri 等', originalTitle: 'Monetary Policy and the New View of International Capital Movements', kind: 'theory', question: '投资者已经持有多少本外币资产，会不会影响下一笔跨境交易？', lessonIds: ['capital-markets', 'short-run', 'accounts', 'globalization'], terms: ['资产组合平衡', '不完全替代', '存量调整', '风险溢价'],
    sections: [
      { title: '从持续流量改为存量配置', paragraphs: ['早期简单的资本流动函数常写成：外国利率较高，就持续有资金流向国外。Branson 的“新观点”强调，投资者在给定财富、风险和收益条件下，会选择希望持有的资产比例。一次利差变化首先引起资产组合从旧比例调整到新比例；调整完成后，不必继续保持同样规模的资金流出。1970 年论文是这一存量视角的早期代表，后来被扩展为汇率的资产组合模型。'] },
      { title: '为什么本外币债券不能完全替代', paragraphs: ['两种债券即使期限相同，也可能有汇率风险、违约风险、流动性差异和不同的对冲用途。风险厌恶的投资者通常不会仅因某种资产预期收益略高，就把全部财富转进去。均衡需要预期收益差补偿持仓风险；所需补偿还取决于该资产与其他收入和资产回报的共同变动。因此，利差并不只有未来汇率变化这一种解释。'] },
      { title: '资产供给如何进入汇率', paragraphs: ['设投资者的财富由货币、本币债券与外币债券构成。外币资产用本币计价时随汇率变化，汇率既改变回报预期，也改变已有资产的价值和组合权重。政府增发某类债券、经常账户形成新增对外债权、或央行调整所持资产，都可能改变私人部门必须吸收的相对资产供给。价格与风险溢价随之调整，直到投资者愿意持有这些存量。'] },
      { title: '冲销干预为何可能仍有效', paragraphs: ['央行买卖外汇后再以国内资产操作抵消货币数量变化，称为冲销干预。若本外币资产完全替代，纯粹改变资产构成的作用可能很小；若不完全替代，私人部门承担的币种风险改变，汇率仍可能通过资产组合渠道变化。这个渠道需要与政策信号渠道区分：市场也可能把干预理解为未来利率或汇率政策的信息，两者不能仅由干预后汇率变化来识别。'] },
      { title: '如何评价这类模型', paragraphs: ['检验需要资产持仓、相对供给、风险度量和预期收益等资料，许多变量并不容易观察。不同投资者的约束和负债币种也不同，合并为代表性投资者可能遗漏重要机制。后来的金融中介与资产定价研究进一步解释风险承受能力为何随资本和融资条件变化。资产组合视角最实用的提醒是：资本流动是资产负债表的变化，不能脱离已有存量和风险承担来解释。'] },
    ], sources: [{ title: 'Monetary Policy and the New View of International Capital Movements', url: 'https://www.brookings.edu/articles/monetary-policy-and-the-new-view-of-international-capital-movements/', note: 'William H. Branson，Brookings Papers on Economic Activity，1970；本条将原论文的存量视角与后续资产组合模型分开说明。', quote: 'The portfolio distribution approach to the explanation of capital flows relates equilibrium stocks of assets to levels of rates of return and risk.', translation: '用资产组合配置解释资本流动，是把均衡资产存量与收益率及风险水平联系起来。' }], formulas: [{ expression: 'W=M+B+EF^{*}', explanation: '示意性财富恒等式：本币计价财富 W 包括货币 M、本币债券 B 及外币资产 F* 的本币价值；单靠该恒等式不能确定汇率。' }], figure: 'iip-valuation', related: ['interest-parity', 'monetary-exchange', 'overshooting'],
  },
  {
    id: 'overshooting', year: 1976, yearLabel: '1976', title: '多恩布什：汇率超调', authors: 'Rudiger Dornbusch', originalTitle: 'Expectations and Exchange Rate Dynamics', kind: 'theory', question: '市场预期理性时，汇率为什么仍会在冲击后超过新的长期水平？', lessonIds: ['short-run', 'policy'], terms: ['汇率超调', '多恩布什', '价格黏性', '超调模型'],
    sections: [
      { title: '浮动以后出现的大幅波动', paragraphs: ['浮动汇率下，货币价格往往比商品价格调整得快。多恩布什 1976 年的模型将这种速度差异与一致的预期联系起来：资产市场可以立即重新定价，工资和商品价格逐步改变，因此汇率可能在冲击时承担更大的调整。模型并不把大幅波动直接解释为市场不理性，也不声称所有波动都来自货币供给。它给出一组能够生成超调的明确条件。'] },
      { title: '先确定冲击前后两个长期均衡', paragraphs: ['采用讲义中的简化实验：实际产出、外国利率和货币需求函数给定，资本自由流动，风险溢价为零，价格短期黏性。央行永久增加货币供给，长期物价随之提高，实际货币余额回到原来水平；长期利率仍等于外国利率。若长期购买力平价适用，直接标价的长期汇率也相应上升，即本币长期贬值。这确定了终点，却尚未确定冲击发生瞬间的汇率。'] },
      { title: '为什么当期贬值必须超过长期', paragraphs: ['冲击刚发生时，物价尚未上涨，实际货币余额增加，货币市场要求利率下降。本币资产的利息收益低于外币资产，在未抛补收益相等条件下，投资者必须预期本币随后升值，才愿意持有本币资产。可是新的长期本币价值低于原来水平。要同时满足“长期比原来贬值”和“从当下起逐步升值”，当期本币必须先贬得比新的长期水平更弱。直接标价下就是 E₀₊ 高于新的长期 Ē。', '随后商品价格逐渐提高，实际货币余额减少，利率恢复；汇率从最初的过度贬值部分回升，最终停在新的长期水平。这里“回升”指本币价值回升，E 则下降。若把两个方向混用，很容易在图上把超调路径画反。'] },
      { title: '一组可推导的调整路径', paragraphs: ['在对数线性化、实际产出固定的说明性版本中，设价格缺口按速度 κ 逐渐收敛，货币需求对利率的半弹性为 λ。以 m、p 分别表示货币供给和物价的对数相对冲击前稳态的偏离，货币市场给出 i−i*=−(m−p)/λ，预期汇率变化满足 ṡ=i−i*。一次幅度为 Δm 的永久货币增加后，可以得到 s(t)−s̄=Δm·exp(−κt)/(λκ)。价格越慢、利率对货币余额变化越敏感，示意路径的初始超调越大。', '这个指数路径增加了特定的价格收敛假设，方便展示机制，不是把多恩布什原文所有商品市场方程逐字复制，也不是用真实数据估计出来的时间表。若产出可随需求增加，货币交易需求会吸收部分新增余额，利率下降和超调可能减弱。'] },
      { title: '暂时冲击与未来预期', paragraphs: ['暂时扩张若很快撤回，且价格来不及明显改变，长期价格和汇率可以回到原来的水平。即期汇率仍可能贬值，但不能把永久冲击的新终点套过来。已被市场预料的政策、分阶段实施的政策，以及政策同时改变风险溢价时，又有不同的跳跃和过渡路径。长期终点约束整条路径，并不要求每一期对下一期的汇率预期都立即等于长期终点。'] },
      { title: '用经验事实检验哪些部分', paragraphs: ['讲义指出，实证研究中有时观察到货币紧缩后的最大升值延迟出现，这与最简单的即时超调不同。检验因此应分别考察冲击识别、利率反应、价格调整和预期变化。某次汇率反弹并不足以确认模型；需要判断它是否符合相应的收益条件和价格路径。超调模型保留了货币长期中性与短期非中性之间的联系，后续模型则加入产出、定价币种、金融摩擦和风险补偿。使用交互图时，可先固定冲击规模，只改变价格调整速度，观察初始跳跃和回归时间如何共同变化；再比较价格立即调整的情形，观察短期跳跃与长期终点的区别。'] },
    ], sources: [{ title: 'Expectations and Exchange Rate Dynamics', url: 'https://www.journals.uchicago.edu/doi/10.1086/260506', note: 'Journal of Political Economy，1976；引文来自作者摘要。', quote: 'An initial overshooting of exchange rates is shown to derive from differential adjustment speed of markets.', translation: '研究表明，汇率最初的超调源于不同市场调整速度的差异。' }], formulas: [
      { expression: 'i-i^{*}\\approx\\frac{E^e_{t+1}-E_t}{E_t}', explanation: '风险溢价为零的近似 UIP；本国利率较低要求预期 E 下降，即本币升值。' },
      { expression: 's(t)-\\bar{s}=\\frac{\\Delta m}{\\lambda\\kappa}e^{-\\kappa t}', explanation: '说明性线性路径：s=ln E，m=ln(M/M₀)，Δm 是永久货币扩张的对数幅度，λ 为货币需求利率半弹性，κ 为假定的价格收敛速度；不用于实际汇率预测。' },
    ], figure: 'overshooting', related: ['interest-parity', 'monetary-exchange', 'mundell-fleming', 'flexible-rates'],
  },
  {
    id: 'first-crisis', year: 1979, yearLabel: '1979', title: '克鲁格曼：第一代货币危机模型', authors: 'Paul Krugman', originalTitle: 'A Model of Balance-of-Payments Crises', kind: 'theory', question: '既然外汇储备尚未耗尽，为什么投机冲击会提前发生？', lessonIds: ['currency-crises', 'policy', 'governance'], terms: ['第一代货币危机', '影子汇率', '投机冲击', '储备耗尽'],
    sections: [
      { title: '政策之间存在长期矛盾', paragraphs: ['克鲁格曼 1979 年的模型研究政府维持固定汇率，同时又持续扩张国内信贷的情形。若公众在既定价格下的货币持有意愿不能相应增长，新增本币会转化为购汇需求，央行为守住平价卖出外汇，储备逐渐减少。外汇储备有限而国内信贷继续扩张，固定平价终究无法维持。后来称为“第一代”的名称是对理论演进的回顾性分类。'] },
      { title: '影子汇率是什么', paragraphs: ['影子汇率是设想当局停止维持平价、汇率转为浮动时，由现存国内信贷和货币需求等条件决定的汇率。它不是黑市报价，也不是央行秘密制定的目标。随着国内信贷增加，潜在的浮动汇率逐渐走弱。将影子汇率与官方平价比较，能够推断私人部门何时愿意一次性购入央行尚有的外汇。'] },
      { title: '为何不会等到最后一单位储备用完', paragraphs: ['如果人们已经知道储备耗尽的某一时刻汇率将发生可预见的贬值，提前按固定价格购入外汇就能避免损失或取得收益。竞争性的购汇把冲击时间推前。在标准完全预见模型中，冲击发生于转换前后的汇率没有可套利跳跃的位置：相关影子浮动汇率达到固定平价，投机者购入剩余储备，经济切换到新的货币需求与汇率路径。剩余储备会突然被吸收，而非缓慢降到零后才发生危机。'] },
      { title: '市场预期与基本面怎样同时出现', paragraphs: ['模型中的参与者可以准确理解政策规则，危机仍会发生，因此突然的市场行为不等于毫无基本面原因的恐慌。决定可持续性的，是财政融资、国内信贷与固定汇率承诺之间的关系；预期决定人们不愿等到承诺彻底失效才行动。增加储备可以推迟危机，但若持续不相容的政策不变，单纯增加储备不会永久消除压力。'] },
      { title: '为什么不能解释所有货币危机', paragraphs: ['有些危机前政府赤字并不突出，政策是否弃守又取决于高利率、失业、银行救助等成本，第一代的外生政策规则便不够。第二代模型研究预期与政府选择之间的反馈，第三代研究外币债务、期限错配和银行资产负债表。实际危机可能包含多种机制；账面储备还可能被远期承诺、抵押或资产冻结所限制。判别时应核查可动用净储备与潜在外汇需求，不能只用储备总额排名。'] },
    ], sources: [{ title: 'A Model of Balance-of-Payments Crises · 作者研究机构全文', url: 'https://stonecenter.gc.cuny.edu/files/1979/08/krugman-a-model-of-balance-of-payment-crises-1979.pdf', note: 'Journal of Money, Credit and Banking，1979；CUNY Stone Center 收藏的原始论文。', quote: 'the government is no longer able to defend a fixed parity', translation: '政府已无法继续维持固定平价。' }], related: ['monetary-bop', 'ricardo', 'triffin', 'mundell-fleming'],
  },
]

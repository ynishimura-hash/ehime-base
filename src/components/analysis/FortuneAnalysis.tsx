"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Moon, Sun, Compass,
    Sparkles, Info, ArrowRight,
    MapPin, Briefcase, Heart, Zap, AlertCircle, BookOpen, Star, ArrowUpRight
} from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import { getRecommendations, RecommendationResult } from '@/lib/recommendation';
// import { JOBS, COMPANIES } from '@/lib/dummyData'; // Removed

import { JIKKAN, calculateDayMasterIndex } from '@/lib/fortune';

interface FortuneResult {
    dayMaster: string;
    nature: string;
    description: string;
    workStyle: string;
    luckyEnvironment: string;
    careerLuck: string;
    loveLuck: string;
    moneyLuck: string;
    suitableJobs: string[];
    cautions: string;
    traits: string[];
}

const ANALYSIS_MAP: Record<string, FortuneResult> = {
    '甲': {
        dayMaster: '甲 (きのえ) - 大樹',
        nature: '向上心あふれるリーダー',
        description: '真っ直ぐに伸びる大樹のように、正義感が強く、向上心に溢れています。困難に直面しても屈しない強さと、弱者を守る優しさを持っています。',
        workStyle: '組織の柱として責任ある立場、新規事業の立ち上げ、教育者',
        luckyEnvironment: '成長が期待できる環境、良きライバルがいる職場',
        careerLuck: '若いうちから頭角を現すタイプ。ただし、折れやすく、挫折した際の回復に時間がかかる傾向があります。',
        loveLuck: '一本気で誠実。相手をリードすることを好みますが、頑固さが災いすることも。',
        moneyLuck: '着実な収入に縁があります。浪費は少ないですが、見栄を張る出費には注意。',
        suitableJobs: ['経営者', '政治家', '教育者', '建築家', '林業・造園'],
        cautions: 'プライドが高く、一度心が折れると立ち直りに時間がかかります。時には周囲の意見に耳を傾け、柔軟に枝を曲げる勇気も必要です。',
        traits: ['正直', '責任感', '信念']
    },
    '乙': {
        dayMaster: '乙 (きのと) - 草花',
        nature: '柔軟で粘り強い平和主義者',
        description: '草花のように柔らかく、周囲との調和を大切にします。一見弱そうに見えても、踏ましても立ち上がる驚異的な粘り強さと環境適応能力を秘めています。',
        workStyle: 'チームの潤滑油となる調整役、サポート業務、芸術職',
        luckyEnvironment: '人間関係が良好な職場、美意識を活かせる環境',
        careerLuck: '集団の中で力を発揮するタイプ。人脈を通じてチャンスが舞い込みやすいです。',
        loveLuck: '献身的で包容力があります。相手に寄り添いすぎず、自分を保つのがコツ。',
        moneyLuck: '細かな管理が得意。少しずつ財を蓄える堅実派です。',
        suitableJobs: ['芸術家', 'デザイナー', '秘書', 'セラピスト', '園芸関連'],
        cautions: '周囲に合わせすぎて自分を見失い、ストレスを溜め込みやすい傾向があります。自分の本音を言える場所を確保しましょう。',
        traits: ['協調性', '忍耐力', '感受性']
    },
    '丙': {
        dayMaster: '丙 (ひのえ) - 太陽',
        nature: '明るく情熱的なムードメーカー',
        description: '太陽のように明るく、周囲を照らす存在です。感情表現が豊かで、人々を惹きつけるカリスマ性を持っています。隠し事が苦手で、何事もオープンにする潔さがあります。',
        workStyle: '広報、営業、エンターテインメント、政治・企画',
        luckyEnvironment: '賑やかで自由な環境、評価が誰の目にも明確な職場',
        careerLuck: '注目を浴びることで運気が上がります。カリスマ性を活かして大衆を先導する素質があります。',
        loveLuck: '情熱的でストレート。冷めるのも早い傾向がありますが、交際中は全力で尽くします。',
        moneyLuck: '入るのも大きいが出るのも大きいタイプ。投資運はありますが、ギャンブルは禁物。',
        suitableJobs: ['芸能人', '営業プロフェッショナル', '広報・PR', '飲食店経営', '作家'],
        cautions: '隠し事ができない正直さは長所ですが、時と場合によっては配慮が足りないと見られることも。言葉を選ぶ慎重さを。',
        traits: ['陽気', '行動力', '裏表がない']
    },
    '丁': {
        dayMaster: '丁 (ひのと) - 灯火',
        nature: '知的で繊細な戦略家',
        description: '暗闇を照らす灯火や焚き火のように、内面に情熱を秘め、分析力と洞察力に優れています。礼儀正しく、細かな配慮ができますが、感受性が強く繊細な一面も。',
        workStyle: '研究、専門技術職、クリエイター、カウンセラー',
        luckyEnvironment: '落ち着いて集中できる環境、知的な刺激がある職場',
        careerLuck: '特定の分野を深く掘り下げることで成功します。夜型の生活や、独自のペースで動ける仕事に向きます。',
        loveLuck: 'ロマンチストで独占欲は強め。一度信頼した相手には深い愛情を注ぎます。',
        moneyLuck: '一攫千金よりも、技術や資格を活かした安定的な収入が期待できます。',
        suitableJobs: ['プログラマー', '心理カウンセラー', '伝統工芸士', '脚本家', '占い師'],
        cautions: '神経質になりやすく、些細なことで悩みすぎる面があります。時には火を休め、リラックスする時間を意識的に作りましょう。',
        traits: ['洞察力', '礼儀', '秘密主義']
    },
    '戊': {
        dayMaster: '戊 (つちのえ) - 山',
        nature: '包容力のある安定したサポーター',
        description: '雄大な山のようにどっしりと構え、周囲に安心感を与えます。忍耐強く、着実に物事を進める安定感があります。一度決めたことは曲げない頑固さも持ち合わせています。',
        workStyle: '管理職、不動産、建設、インフラ、公務員',
        luckyEnvironment: '伝統のある組織、長期的な視点を持つ職場、自然に近い場所',
        careerLuck: '大器晩成型。信頼を積み重ねることで、晩年には大きな成功を収めます。',
        loveLuck: '不器用ですが一途。結婚後は家庭をしっかりと守る良き伴侶になります。',
        moneyLuck: '不動産や長期投資との相性が抜群。お金を溜め込む力があります。',
        suitableJobs: ['不動産業', '建築・土木', '寺院・宗教職', '公務員', '農業'],
        cautions: '変化への適応が苦手で、頑固になりがちです。新しい考え方や技術を否定せず、受け入れる柔軟性を持つとさらに飛躍します。',
        traits: ['誠実', '寛大', '保守的']
    },
    '己': {
        dayMaster: '己 (つちのと) - 大地',
        nature: '多才で努力家な育成者',
        description: '豊かな大地（田畑）のように、多種多様なものを受け入れ、育む力を持っています。多趣味で器用であり、多くのことを同時にこなせますが、内面は複雑で葛藤しやすい一面も。',
        workStyle: '教育、人事、実務管理、技術職、料理・工芸',
        luckyEnvironment: '変化のある環境、学びや成長が共有される職場',
        careerLuck: '人の才能を見出し、育てることに長けています。縁の下の力持ちとして重宝されますが、実力も備わっています。',
        loveLuck: '世話焼きで愛情深い。ただし、相手に干渉しすぎてしまう点には注意が必要です。',
        moneyLuck: 'やりくり上手。貯蓄だけでなく、知識や人脈への投資で財を広げます。',
        suitableJobs: ['教師', '保育士', '経理・財務', '陶芸家', '料理人'],
        cautions: '人のために尽くしすぎて、自分自身の面倒を後回しにしがちです。たまには遠慮せずに自分の欲求を優先する日を作りましょう。',
        traits: ['多才', '勤勉', '現実的']
    },
    '庚': {
        dayMaster: '庚 (かのえ) - 鋼鉄',
        nature: '決断力のある開拓者',
        description: '鋭い刀剣や鋼鉄のように、意志が強く決断力に優れています。変化を恐れず、自らの道を切り開く強さがあります。正義感が強く、曲がったことが大嫌いな潔い性格です。',
        workStyle: '警察、軍隊、外科医、プロジェクトリーダー、司法',
        luckyEnvironment: '実力主義の仕事、スピード感のある職場、競争がある環境',
        careerLuck: '厳しい環境に身を置くほど、能力が磨かれます。困難な状況を突破する役割に最適。',
        loveLuck: '一目惚れしやすく情熱的。恋愛においても勝ち負けを意識してしまう癖があります。',
        moneyLuck: '勝負運が強く、短期間で大きな富を得る可能性があります。大きな買い物にも臆しません。',
        suitableJobs: ['警察官', '裁判官', '外科医', '金融トレーダー', 'スポーツ選手'],
        cautions: '言葉が鋭くなりやすく、思わぬところで人を傷つけてしまうことがあります。正論であっても、伝え方には優しさを添えて。',
        traits: ['果敢', '信念', '単刀直入']
    },
    '辛': {
        dayMaster: '辛 (かのと) - 宝石',
        nature: '美意識の高い完璧主義者',
        description: '磨けば輝く宝石や貴金属のように、独自の美学を持ち、細部までこだわり抜く力があります。繊細で気高い精神を持っていますが、傷つきやすく、プライドを大切にします。',
        workStyle: 'デザイン、宝石・宝飾、美容、品質管理、金融',
        luckyEnvironment: '洗練された空間、質が求められる環境、個性が尊重される職場',
        careerLuck: 'ブランド力や自分自身の価値を高める仕事で成功します。独自のネットワークを築く名手です。',
        loveLuck: '理想が高く、こだわりが強い。自分を大切にしてくれる洗練されたパートナーを求めます。',
        moneyLuck: '資産形成に優れたセンスを持ちます。良いものを見極める目があり、無駄遣いは少ないです。',
        suitableJobs: ['ジュエリーデザイナー', '美容師', 'エステティシャン', '時計職人', '会計士'],
        cautions: '完璧を求めすぎるあまり、自分にも他人にも厳しくなりすぎてしまいます。妥協することや「ほどほど」を知ることで心が楽になります。',
        traits: ['繊細', '品位', '自尊心']
    },
    '壬': {
        dayMaster: '壬 (みずのえ) - 大河',
        nature: 'ダイナミックで知的な自由人',
        description: '大河や海のように、スケールが大きく自由な発想を持っています。知恵が回り、どんな状況にも適応する柔軟さがありますが、一度怒ると手がつけられない激しさも秘めています。',
        workStyle: '貿易、海外関連、マスコミ、企画戦略、運輸',
        luckyEnvironment: '変化の激しい業界、制約の少ない環境、グローバルな職場',
        careerLuck: '広い世界で活躍すべき人。止まることなく流れ続けることで、運気が好転します。',
        loveLuck: '恋多き人。自由奔放で刺激を求めますが、根は思慮深く、深い愛も理解しています。',
        moneyLuck: '経済の大きな流れを読むのが得意。流動資産を活用して財を増やします。',
        suitableJobs: ['外交官', 'ジャーナリスト', '航海士', '企画ディレクター', 'イベントプロデューサー'],
        cautions: '一つの場所に留まり続けると運気が淀みます。定期的な環境の変化や旅行などで心をリフレッシュすることを忘れずに。',
        traits: ['聡明', '豪放', '適応力']
    },
    '癸': {
        dayMaster: '癸 (みずのと) - 雨露',
        nature: '思慮深く献身的な癒やし手',
        description: '万物を潤す雨露のように、物静かで慈愛に満ちています。直感力に優れ、人々の心に寄り添うことが得意です。一見おとなしいですが、コツコツと物事を進める持続力があります。',
        workStyle: '教育、哲学、介護、福祉、カウンセリング、クリエイティブ',
        luckyEnvironment: '温かい人間関係の環境、感性を活かせる職場、水に関わる場所',
        careerLuck: '着実な積み重ねで信頼を築きます。参謀役として、トップを支える役割で本領を発揮します。',
        loveLuck: '純粋で尽くすタイプ。相手との精神的な繋がりを何よりも重視します。',
        moneyLuck: '派手さはありませんが、地道な節約と管理で、将来の蓄えを確実に築きます。',
        suitableJobs: ['心理学者', '社会福祉士', '図書館司書', '書道家', '研究員'],
        cautions: '空気を読みすぎて自己犠牲に走りがちです。自分の意見を飲み込まず、適切な形でアウトプットする習慣をつけましょう。',
        traits: ['純粋', '直感', '謙虚']
    }
};

export default function FortuneAnalysis() {
    const { userAnalysis, setAnalysisResults, courses, fetchCourses, toggleFortuneIntegration, jobs, companies, users, currentUserId } = useAppStore();
    const [step, setStep] = useState(0); // 0: Input, 1: Result
    const [birthDate, setBirthDate] = useState('');
    const [result, setResult] = useState<FortuneResult | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);

    useEffect(() => {
        if (courses.length === 0) {
            fetchCourses();
        }
    }, [courses.length, fetchCourses]);

    // Pre-fill birthDate from user profile and show result if available
    useEffect(() => {
        if (currentUserId && users.length > 0) {
            const currentUser = users.find(u => u.id === currentUserId);
            if (currentUser?.birthDate) {
                const bDate = currentUser.birthDate;
                setBirthDate(bDate);

                // もし既に結果が表示されているなら何もしない
                if (result) return;

                // プロフィールの生年月日を使って自動計算
                const index = calculateDayMasterIndex(bDate);
                const stem = JIKKAN[index];
                const res = ANALYSIS_MAP[stem];

                if (res) {
                    setResult(res);
                    setStep(1);

                    // 分析結果がまだStoreにない場合は保存も行う
                    if (!userAnalysis.fortune?.dayMaster) {
                        setAnalysisResults({
                            fortune: {
                                dayMaster: res.dayMaster,
                                traits: res.traits
                            }
                        });
                    }

                    // Recalculate recommendations silently for the view
                    const recs = getRecommendations(
                        { fortune: { dayMaster: res.dayMaster, traits: res.traits } },
                        jobs, courses, companies
                    );
                    setRecommendations(recs);
                }
            }
        }
    }, [currentUserId, users, result]); // resultが変わったら再実行しないようにガードはあるが、依存配列には含めておく方が安全（ただしループ注意）

    // 実際には result がある場合は即returnしているのでループはしないはず

    const hasResult = !!result || !!userAnalysis.fortune?.dayMaster;



    const calculateFortune = () => {
        if (!birthDate) return;

        const index = calculateDayMasterIndex(birthDate);
        const stem = JIKKAN[index];
        const res = ANALYSIS_MAP[stem];
        if (res) {
            setResult(res);

            // Analysis結果を保存
            setAnalysisResults({
                fortune: {
                    dayMaster: res.dayMaster,
                    traits: res.traits
                }
            });

            // ユーザープロフィールにも生年月日を保存
            if (currentUserId) {
                useAppStore.getState().updateUser(currentUserId, { birthDate });
            }

            // Get recommendations
            const recs = getRecommendations(
                {
                    fortune: {
                        dayMaster: res.dayMaster,
                        traits: res.traits
                    }
                },
                jobs,
                courses,
                companies
            );
            setRecommendations(recs);

            setStep(1);
        }
    };

    return (
        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-200 shadow-xl overflow-hidden relative">
            <div className="absolute right-[-5%] top-[-5%] text-purple-50">
                <Compass size={300} aria-hidden="true" />
            </div>

            <AnimatePresence mode="wait">
                {step === 0 ? (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="relative z-10 text-center space-y-8"
                    >
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Calendar size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">資質診断 (四柱推命)</h2>
                            <p className="text-slate-600 font-bold max-w-md mx-auto">
                                生年月日に刻まれた資質を読み解き、あなたの本来の性格や向いている環境を分析します。
                            </p>
                        </div>

                        <div className="max-w-xs mx-auto space-y-4">
                            <div className="text-left">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                                    生年月日を入力
                                </label>
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-purple-500 transition-all outline-none"
                                />
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-slate-900">精密診断と統合する</div>
                                        <div className="text-[10px] font-bold text-slate-400">診断結果に占いのエッセンスを掛け合わせます</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleFortuneIntegration();
                                        }}
                                        className={`w-12 h-6 rounded-full transition-all relative ${userAnalysis.isFortuneIntegrated ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                    >
                                        <motion.div
                                            animate={{ x: userAnalysis.isFortuneIntegrated ? 26 : 4 }}
                                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm"
                                        />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={calculateFortune}
                                disabled={!birthDate}
                                className={`w-full font-black py-4 rounded-2xl transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 ${hasResult
                                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
                                    : 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-500/20 disabled:opacity-50 disabled:grayscale'
                                    }`}
                            >
                                {hasResult ? '診断結果を見る' : '分析を実行する'} <Sparkles size={18} />
                            </button>
                        </div>
                    </motion.div>
                ) : result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10"
                    >
                        <div className="flex justify-end mb-2">
                            <button
                                onClick={() => setStep(0)}
                                className="text-xs font-bold text-slate-400 hover:text-purple-600 transition-colors flex items-center gap-1"
                            >
                                <ArrowRight size={14} className="rotate-180" /> もう一度診断する
                            </button>
                        </div>
                        <div className="flex flex-col md:flex-row gap-10 items-start">
                            <div className="md:w-1/3 text-center space-y-6">
                                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/30">
                                    <span className="text-4xl text-white font-black">{result.dayMaster.charAt(0)}</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">{result.dayMaster}</h3>
                                    <p className="text-purple-600 font-black mt-1">{result.nature}</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {result.traits.map(trait => (
                                        <span key={trait} className="bg-slate-800 text-white px-3 py-1.5 rounded-full text-[10px] font-black border border-slate-700 shadow-sm">
                                            #{trait}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 space-y-8">
                                <div className="bg-slate-100/80 p-8 rounded-[2rem] border border-slate-200">
                                    <h4 className="flex items-center gap-2 text-slate-900 font-black mb-4 text-lg">
                                        <Info size={20} className="text-purple-600" /> 本質的な性格
                                    </h4>
                                    <p className="text-slate-800 font-bold leading-relaxed text-lg">{result.description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl shadow-sm">
                                        <h5 className="flex items-center gap-2 text-xs font-black text-blue-700 mb-3">
                                            <Briefcase size={14} /> 向いている仕事スタイル
                                        </h5>
                                        <p className="text-base font-black text-slate-900 leading-relaxed">{result.workStyle}</p>
                                    </div>
                                    <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl shadow-sm">
                                        <h5 className="flex items-center gap-2 text-xs font-black text-emerald-700 mb-3">
                                            <MapPin size={14} /> 運気が上がる環境
                                        </h5>
                                        <p className="text-base font-black text-slate-900 leading-relaxed">{result.luckyEnvironment}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-6 bg-slate-100/50 border border-slate-200 rounded-3xl">
                                        <h5 className="flex items-center gap-2 text-xs font-black text-slate-500 mb-3">
                                            <Briefcase size={14} /> 特に向いている職業例
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {result.suitableJobs.map((job, i) => (
                                                <span key={i} className="px-4 py-1.5 bg-white border-2 border-slate-200 rounded-full text-xs font-black text-slate-800 shadow-sm">
                                                    {job}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-red-100/50 border border-red-200 rounded-3xl">
                                        <h5 className="flex items-center gap-2 text-sm font-black text-red-700 mb-3">
                                            <AlertCircle size={16} /> 気をつけたほうがいいところ
                                        </h5>
                                        <p className="text-base font-bold text-slate-800 leading-relaxed">{result.cautions}</p>
                                    </div>

                                    <div className="p-6 bg-blue-100/50 border border-blue-200 rounded-3xl">
                                        <h5 className="flex items-center gap-2 text-sm font-black text-blue-700 mb-3">
                                            <Zap size={16} /> 仕事・成功の運勢
                                        </h5>
                                        <p className="text-base font-bold text-slate-800 leading-relaxed">{result.careerLuck}</p>
                                    </div>
                                    <div className="p-6 bg-pink-100/50 border border-pink-200 rounded-3xl">
                                        <h5 className="flex items-center gap-2 text-sm font-black text-pink-700 mb-3">
                                            <Heart size={16} /> 対人・恋愛の運勢
                                        </h5>
                                        <p className="text-base font-bold text-slate-800 leading-relaxed">{result.loveLuck}</p>
                                    </div>
                                    <div className="p-6 bg-amber-100/50 border border-amber-200 rounded-3xl">
                                        <h5 className="flex items-center gap-2 text-sm font-black text-amber-700 mb-3">
                                            <ArrowRight size={16} /> 金運・財産
                                        </h5>
                                        <p className="text-base font-bold text-slate-800 leading-relaxed">{result.moneyLuck}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(0)}
                                    className="text-slate-400 font-bold hover:text-slate-900 transition-colors flex items-center gap-2"
                                >
                                    別の生年月日で試す <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// This file contains mock data imported from CSV files.
// Generated via script with real durations.

export interface QuizData {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export interface ContentItem {
    id: string;
    title: string;
    type: 'video' | 'quiz' | 'document';
    url?: string;
    thumbnail?: string;
    duration?: string;
    category: string;
    createdAt: string;
    quiz?: QuizData;
    material_url?: string;
}

export interface CurriculumDef {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    image?: string; // カバー画像URL
    courseCount: number;
    lessons: ContentItem[];
    viewCount?: number;
    tags?: string[];
    category?: string;
    is_public?: boolean;
}

export interface CourseDef {
    id: string;
    title: string;
    description: string;
    category: string;
    lessonCount: number;
    // New fields for popularity and admin flags
    viewCount?: number;
    tags?: string[];
}

export const ALL_CONTENT: ContentItem[] = [
    {
        id: '1096',
        title: '2026/01/14_サラリーマンから独立する技術',
        type: 'video',
        url: 'https://youtu.be/W2dqWtRtVMg',
        category: 'リスキル大学講座アーカイブ',
        duration: '1:02:45',
        createdAt: '2026-01-17T06:49:09.089Z'
    },
    {
        id: '1095',
        title: '2026/01/05_第３講　年収1,000万円を超えるクリエイターになるために＿_仕事とは、これからのクリエイティブについて その1',
        type: 'video',
        url: 'https://youtu.be/M86ArrVSSFE',
        category: 'リスキル大学講座アーカイブ',
        duration: '52:46',
        createdAt: '2026-01-13T08:25:38.669Z'
    },
    {
        id: '1094',
        title: '2026/01/09_マネーリテラシー',
        type: 'video',
        url: 'https://youtu.be/Y3ZNnYNtaIo',
        category: 'リスキル大学講座アーカイブ',
        duration: '1:00:49',
        createdAt: '2026-01-10T07:18:33.167Z'
    },
    {
        id: '1093',
        title: '2025/12/23_第２講　年収1,000万円を超えるクリエイターになるために＿_経営者になるということ',
        type: 'video',
        url: 'https://youtu.be/hrAOXCuaMOg',
        category: 'リスキル大学講座アーカイブ',
        duration: '51:22',
        createdAt: '2026-01-03T08:21:24.675Z'
    },
    {
        id: '1092',
        title: '2025/12/22_副業で活躍！AIバックオフィス実践セミナー〜Lark×業務効率化で今、必要とされる人材に！〜',
        type: 'video',
        url: 'https://youtu.be/HgFP79PRPVQ',
        category: 'リスキル大学講座アーカイブ',
        duration: '1:28:53',
        createdAt: '2025-12-29T06:00:26.610Z'
    },
    {
        id: '1091',
        title: '2025/12/17_学んで損なし！Webライター入門編',
        type: 'video',
        url: 'https://youtu.be/bvxgjw1xg14',
        category: 'リスキル大学講座アーカイブ',
        duration: '1:07:40',
        createdAt: '2025-12-24T11:19:54.194Z'
    },
    {
        id: '1090',
        title: '2025/12/151.年収1000万円を超えるクリエイターになるために-事業を興すということ、年収1000万円の壁-',
        type: 'video',
        url: 'https://youtu.be/Y3609WHXFGM',
        category: 'リスキル大学講座アーカイブ',
        duration: '1:00:23',
        createdAt: '2025-12-24T06:09:42.982Z'
    },
    {
        id: '1085',
        title: '2025/12/08年収1000万円を超えるクリエイターになるために',
        type: 'video',
        url: 'https://youtu.be/F4cfeyTB0TM',
        category: 'リスキル大学講座アーカイブ',
        duration: '1:25:20',
        createdAt: '2025-12-10T10:28:55.897Z'
    },
    {
        id: '1084',
        title: '2025/12/03未来をデザイン！ライフデザインセミナー',
        type: 'video',
        url: 'https://youtu.be/moIS19siYyE',
        category: 'リスキル大学講座アーカイブ',
        duration: '57:00',
        createdAt: '2025-12-06T07:17:59.561Z'
    },
    {
        id: '1083',
        title: '2025/11/19愛されマインド',
        type: 'video',
        url: 'https://youtu.be/4dJARs75jg0',
        category: 'リスキル大学講座アーカイブ',
        duration: '1:05:28',
        createdAt: '2025-11-25T08:19:32.800Z'
    },
    {
        id: '1082',
        title: '2025/11/08見方を変えれば、世界が変わる。〜デザイン思考で【デザイナーの目】を手に入れる120分〜 ',
        type: 'video',
        url: 'https://youtu.be/Y6Zd3e0t1uw',
        category: 'リスキル大学講座アーカイブ',
        duration: '1:15:59',
        createdAt: '2025-11-19T07:21:20.079Z'
    },
    {
        id: '1081',
        title: '2025/11/10超好印象アップ-1分自己紹介と第一印象アップトレーニング-',
        type: 'video',
        url: 'https://youtu.be/8wq6OW2CeQA',
        category: 'リスキル大学講座アーカイブ',
        duration: '44:02',
        createdAt: '2025-11-14T05:13:37.585Z'
    },
    {
        id: '1080',
        title: '2025/11/05あなたのキャリアの探し方',
        type: 'video',
        url: 'https://youtu.be/jLS9B3YQBBE',
        category: 'リスキル大学講座アーカイブ',
        duration: '1:00:53',
        createdAt: '2025-11-14T01:41:14.902Z'
    },
    {
        id: '1079',
        title: '2025/10/31ショート動画の作り方講座',
        type: 'video',
        url: 'https://youtu.be/Kof3ujUEIbk',
        category: 'リスキル大学講座アーカイブ',
        duration: '59:46',
        createdAt: '2025-11-13T02:27:05.286Z'
    },
    {
        id: '1078',
        title: '2025/11/08見方を変えれば、世界が変わる。〜デザイン思考で【デザイナーの目】を手に入れる120分〜 ',
        type: 'video',
        url: 'https://youtu.be/Y6Zd3e0t1uw',
        category: 'リスキル大学講座アーカイブ',
        duration: '1:15:59',
        createdAt: '2025-11-10T13:34:08.311Z'
    },
    {
        id: '1077',
        title: '2025/10/18たった一回で劇的に！お金の扱い方が変わる未来投資',
        type: 'video',
        url: 'https://youtu.be/A-xEnlOB0-Y',
        category: 'リスキル大学講座アーカイブ',
        duration: '1:14:16',
        createdAt: '2025-10-26T04:34:45.065Z'
    },
    {
        id: '1076',
        title: '2025/10/23最新AI活用戦略',
        type: 'video',
        url: 'https://youtu.be/srzfgDRG4Ew',
        category: 'リスキル大学講座アーカイブ',
        duration: '52:34',
        createdAt: '2025-10-25T09:56:07.530Z'
    },
    {
        id: '1075',
        title: '2025/10/15リスキル大学開講記念「リスキル大学」について',
        type: 'video',
        url: 'https://youtu.be/EPrvQQ5_m6M',
        category: 'リスキル大学講座アーカイブ',
        duration: '1:03:26',
        createdAt: '2025-10-24T03:48:19.972Z'
    },
    {
        id: '1068',
        title: '企業活動：経営・組織論①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=yFJNZ-0CG5U',
        category: 'ITパスポート',
        duration: '05:06',
        createdAt: '2024-10-28T14:19:26.646Z'
    },
    {
        id: '1067',
        title: '企業活動：経営・組織論②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=3tYr-Zav6Ls',
        category: 'ITパスポート',
        duration: '03:26',
        createdAt: '2024-10-28T14:19:26.640Z'
    },
    {
        id: '1066',
        title: '企業活動：経営・組織論③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=uWhrTQhvjXY',
        category: 'ITパスポート',
        duration: '06:04',
        createdAt: '2024-10-28T14:19:26.635Z'
    },
    {
        id: '1065',
        title: '企業活動：業務分析・データ利活用①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=d3injoNKz2M',
        category: 'ITパスポート',
        duration: '04:09',
        createdAt: '2024-10-28T14:19:26.629Z'
    },
    {
        id: '1064',
        title: '企業活動：業務分析・データ利活用②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=AASnikS0KnU',
        category: 'ITパスポート',
        duration: '02:30',
        createdAt: '2024-10-28T14:19:26.623Z'
    },
    {
        id: '1063',
        title: '企業活動：業務分析・データ利活用③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=2BSwG2pLGvg',
        category: 'ITパスポート',
        duration: '03:39',
        createdAt: '2024-10-28T14:19:26.617Z'
    },
    {
        id: '1062',
        title: '企業活動：業務分析・データ利活用④',
        type: 'video',
        url: 'https://youtube.com/watch?v=1DwSO-7FqzQ',
        category: 'ITパスポート',
        duration: '03:34',
        createdAt: '2024-10-28T14:19:26.612Z'
    },
    {
        id: '1061',
        title: '企業活動：会計・財務',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=mysS6TTJhuM',
        category: 'ITパスポート',
        duration: '03:36',
        createdAt: '2024-10-28T14:19:26.606Z'
    },
    {
        id: '1060',
        title: '法務：知的財産権①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=6vscpAQoLuM',
        category: 'ITパスポート',
        duration: '03:25',
        createdAt: '2024-10-28T14:19:26.600Z'
    },
    {
        id: '1059',
        title: '法務：知的財産権②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=M8cuR502JSE',
        category: 'ITパスポート',
        duration: '02:42',
        createdAt: '2024-10-28T14:19:26.594Z'
    },
    {
        id: '1058',
        title: '法務：知的財産権③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=ISYQXSatorY',
        category: 'ITパスポート',
        duration: '04:52',
        createdAt: '2024-10-28T14:19:26.589Z'
    },
    {
        id: '1057',
        title: '法務：知的財産権④',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=Hot8yeZJggE',
        category: 'ITパスポート',
        duration: '04:36',
        createdAt: '2024-10-28T14:19:26.582Z'
    },
    {
        id: '1056',
        title: '法務：セキュリティ関連法規①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=irGf4wQ-4kc',
        category: 'ITパスポート',
        duration: '03:58',
        createdAt: '2024-10-28T14:19:26.577Z'
    },
    {
        id: '1055',
        title: '法務：セキュリティ関連法規②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=e1PgHfXhDgw',
        category: 'ITパスポート',
        duration: '02:05',
        createdAt: '2024-10-28T14:19:26.571Z'
    },
    {
        id: '1054',
        title: '法務：セキュリティ関連法規③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=OxGVYZrrchQ',
        category: 'ITパスポート',
        duration: '04:22',
        createdAt: '2024-10-28T14:19:26.565Z'
    },
    {
        id: '1053',
        title: '法務：セキュリティ関連法規④',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=HV7maxvssO0',
        category: 'ITパスポート',
        duration: '02:56',
        createdAt: '2024-10-28T14:19:26.559Z'
    },
    {
        id: '1052',
        title: '法務：セキュリティ関連法規⑤',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=ONZMGy3boqM',
        category: 'ITパスポート',
        duration: '02:36',
        createdAt: '2024-10-28T14:19:26.553Z'
    },
    {
        id: '1051',
        title: '法務：セキュリティ関連法規⑥',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=PBpNMENak2w',
        category: 'ITパスポート',
        duration: '04:25',
        createdAt: '2024-10-28T14:19:26.548Z'
    },
    {
        id: '1050',
        title: '法務：労働関連・取引関連法規①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=nD7MmFmyETA',
        category: 'ITパスポート',
        duration: '03:59',
        createdAt: '2024-10-28T14:19:26.542Z'
    },
    {
        id: '1049',
        title: '法務：労働関連・取引関連法規②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=IhWczC5I5nI',
        category: 'ITパスポート',
        duration: '03:52',
        createdAt: '2024-10-28T14:19:26.536Z'
    },
    {
        id: '1048',
        title: '法務：その他の法律・ガイドライン・情報論理①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=bLzKGajyFoc',
        category: 'ITパスポート',
        duration: '02:47',
        createdAt: '2024-10-28T14:19:26.530Z'
    },
    {
        id: '1047',
        title: '法務：その他の法律・ガイドライン・情報論理②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=41s17t8emRA',
        category: 'ITパスポート',
        duration: '04:23',
        createdAt: '2024-10-28T14:19:26.524Z'
    },
    {
        id: '1046',
        title: '法務：その他の法律・ガイドライン・情報論理③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=nYoZQaZNU-c',
        category: 'ITパスポート',
        duration: '04:34',
        createdAt: '2024-10-28T14:19:26.518Z'
    },
    {
        id: '1045',
        title: '法務：その他の法律・ガイドライン・情報論理④',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=oxkoK_8CLMM',
        category: 'ITパスポート',
        duration: '03:13',
        createdAt: '2024-10-28T14:19:26.512Z'
    },
    {
        id: '1044',
        title: '法務：標準化関連①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=6tB0PhehL8I',
        category: 'ITパスポート',
        duration: '03:20',
        createdAt: '2024-10-28T14:19:26.507Z'
    },
    {
        id: '1043',
        title: '法務：標準化関連②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=HBYqKbXthRM',
        category: 'ITパスポート',
        duration: '03:59',
        createdAt: '2024-10-28T14:19:26.501Z'
    },
    {
        id: '1042',
        title: '法務：標準化関連③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=RSSnmJsDink',
        category: 'ITパスポート',
        duration: '03:18',
        createdAt: '2024-10-28T14:19:26.495Z'
    },
    {
        id: '1041',
        title: '経営戦略マネジメント：経営戦略手法①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=X_XwrBMBhkc',
        category: 'ITパスポート',
        duration: '04:49',
        createdAt: '2024-10-28T14:19:26.489Z'
    },
    {
        id: '1040',
        title: '経営戦略マネジメント：経営戦略手法②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=ENZv81eDv4k',
        category: 'ITパスポート',
        duration: '03:15',
        createdAt: '2024-10-28T14:19:26.483Z'
    },
    {
        id: '1039',
        title: '経営戦略マネジメント：マーケティング①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=hOP6nXicKzQ',
        category: 'ITパスポート',
        duration: '04:33',
        createdAt: '2024-10-28T14:19:26.478Z'
    },
    {
        id: '1038',
        title: '経営戦略マネジメント：マーケティング②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=g3ATO0nW9kM',
        category: 'ITパスポート',
        duration: '03:44',
        createdAt: '2024-10-28T14:19:26.472Z'
    },
    {
        id: '1037',
        title: '経営戦略マネジメント：マーケティング③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=HlOOuLiByCI',
        category: 'ITパスポート',
        duration: '03:37',
        createdAt: '2024-10-28T14:19:26.466Z'
    },
    {
        id: '1036',
        title: '経営戦略マネジメント：マーケティング④',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=97ox6q00gSc',
        category: 'ITパスポート',
        duration: '03:46',
        createdAt: '2024-10-28T14:19:26.460Z'
    },
    {
        id: '1035',
        title: '経営戦略マネジメント：ビジネス戦略と目標・評価',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=dueEwdyG7y0',
        category: 'ITパスポート',
        duration: '03:28',
        createdAt: '2024-10-28T14:19:26.455Z'
    },
    {
        id: '1034',
        title: '経営戦略マネジメント：経営管理システム',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=LVIEce4DY1w',
        category: 'ITパスポート',
        duration: '03:53',
        createdAt: '2024-10-28T14:19:26.449Z'
    },
    {
        id: '1033',
        title: '技術戦略マネジメント：技術開発戦略の立案・技術開発計画',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=SV5TxWCy4pM',
        category: 'ITパスポート',
        duration: '06:19',
        createdAt: '2024-10-28T14:19:26.443Z'
    },
    {
        id: '1032',
        title: 'ビジネスインダストリ：ビジネスシステム①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=5SKBIbdtuEg',
        category: 'ITパスポート',
        duration: '04:01',
        createdAt: '2024-10-28T14:19:26.437Z'
    },
    {
        id: '1031',
        title: 'ビジネスインダストリ：ビジネスシステム②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=624kKv2EqaI',
        category: 'ITパスポート',
        duration: '03:23',
        createdAt: '2024-10-28T14:19:26.431Z'
    },
    {
        id: '1030',
        title: 'ビジネスインダストリ：ビジネスシステム③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=ARAY1gcVFiA',
        category: 'ITパスポート',
        duration: '03:38',
        createdAt: '2024-10-28T14:19:26.426Z'
    },
    {
        id: '1029',
        title: 'ビジネスインダストリ：ビジネスシステム④',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=4v5RGaOz9vM',
        category: 'ITパスポート',
        duration: '04:06',
        createdAt: '2024-10-28T14:19:26.420Z'
    },
    {
        id: '1028',
        title: 'ビジネスインダストリ：エンジニアリングシステム①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=d0eq5BILQSw',
        category: 'ITパスポート',
        duration: '04:38',
        createdAt: '2024-10-28T14:19:26.414Z'
    },
    {
        id: '1027',
        title: 'ビジネスインダストリ：エンジニアリングシステム②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=9gDtjBOLrzg',
        category: 'ITパスポート',
        duration: '03:53',
        createdAt: '2024-10-28T14:19:26.408Z'
    },
    {
        id: '1026',
        title: 'ビジネスインダストリ：e-ビジネス①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=u7i6Gxs6Jsw',
        category: 'ITパスポート',
        duration: '03:23',
        createdAt: '2024-10-28T14:19:26.402Z'
    },
    {
        id: '1025',
        title: 'ビジネスインダストリ：e-ビジネス②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=AeS8RAos780',
        category: 'ITパスポート',
        duration: '03:07',
        createdAt: '2024-10-28T14:19:26.396Z'
    },
    {
        id: '1024',
        title: 'ビジネスインダストリ：IoTシステム・組込みシステム①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=GkrvbcCdsnQ',
        category: 'ITパスポート',
        duration: '03:58',
        createdAt: '2024-10-28T14:19:26.390Z'
    },
    {
        id: '1023',
        title: 'ビジネスインダストリ：IoTシステム・組込みシステム②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=V-SGOd6XaRs',
        category: 'ITパスポート',
        duration: '03:49',
        createdAt: '2024-10-28T14:19:26.385Z'
    },
    {
        id: '1022',
        title: 'システム戦略：情報システム戦略①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=1Mdu89ADKk0',
        category: 'ITパスポート',
        duration: '03:10',
        createdAt: '2024-10-28T14:19:26.379Z'
    },
    {
        id: '1021',
        title: 'システム戦略：情報システム戦略②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=aBctwbHni98',
        category: 'ITパスポート',
        duration: '03:56',
        createdAt: '2024-10-28T14:19:26.373Z'
    },
    {
        id: '1020',
        title: 'システム戦略：業務プロセス①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=xwitLwTKl4E',
        category: 'ITパスポート',
        duration: '04:27',
        createdAt: '2024-10-28T14:19:26.367Z'
    },
    {
        id: '1019',
        title: 'システム戦略：業務プロセス②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=bEmzk1M9CDo',
        category: 'ITパスポート',
        duration: '02:46',
        createdAt: '2024-10-28T14:19:26.362Z'
    },
    {
        id: '1018',
        title: 'システム戦略：業務プロセス③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=lINmh1NVGyk',
        category: 'ITパスポート',
        duration: '04:42',
        createdAt: '2024-10-28T14:19:26.356Z'
    },
    {
        id: '1017',
        title: 'システム戦略：ソリューションビジネス①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=6lyLMQ4eIho',
        category: 'ITパスポート',
        duration: '03:46',
        createdAt: '2024-10-28T14:19:26.350Z'
    },
    {
        id: '1016',
        title: 'システム戦略：ソリューションビジネス②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=KO2bm6adjUc',
        category: 'ITパスポート',
        duration: '04:42',
        createdAt: '2024-10-28T14:19:26.344Z'
    },
    {
        id: '1015',
        title: 'システム戦略：システム活用促進・評価①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=gpcCZ4232-U',
        category: 'ITパスポート',
        duration: '03:56',
        createdAt: '2024-10-28T14:19:26.339Z'
    },
    {
        id: '1014',
        title: 'システム戦略：システム活用促進・評価②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=8hjOnQN3IT8',
        category: 'ITパスポート',
        duration: '03:22',
        createdAt: '2024-10-28T14:19:26.333Z'
    },
    {
        id: '1013',
        title: 'システム戦略：システム活用促進・評価③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=VtAmxu0aKPs',
        category: 'ITパスポート',
        duration: '03:40',
        createdAt: '2024-10-28T14:19:26.327Z'
    },
    {
        id: '1012',
        title: 'システム企画：システム化計画',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=3rc_6q2KBfI',
        category: 'ITパスポート',
        duration: '02:59',
        createdAt: '2024-10-28T14:19:26.322Z'
    },
    {
        id: '1011',
        title: 'システム企画：要件定義',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=Ljriqutrsy4',
        category: 'ITパスポート',
        duration: '02:48',
        createdAt: '2024-10-28T14:19:26.316Z'
    },
    {
        id: '1010',
        title: 'システム企画：調達計画・実施①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=js83PU0wSmc',
        category: 'ITパスポート',
        duration: '02:43',
        createdAt: '2024-10-28T14:19:26.310Z'
    },
    {
        id: '1009',
        title: 'システム企画：調達計画・実施②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=i-Z08SlGbqI',
        category: 'ITパスポート',
        duration: '03:37',
        createdAt: '2024-10-28T14:19:26.304Z'
    },
    {
        id: '1008',
        title: 'システム企画：調達計画・実施③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=l4qkj_0qMmU',
        category: 'ITパスポート',
        duration: '02:49',
        createdAt: '2024-10-28T14:19:26.298Z'
    },
    {
        id: '1007',
        title: 'システム企画：調達計画・実施④',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=grE8Ic9UDyI',
        category: 'ITパスポート',
        duration: '03:26',
        createdAt: '2024-10-28T14:19:26.292Z'
    },
    {
        id: '1006',
        title: 'システム企画：調達計画・実施⑤',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=9OSOYWkiafQ',
        category: 'ITパスポート',
        duration: '03:33',
        createdAt: '2024-10-28T14:19:26.286Z'
    },
    {
        id: '1005',
        title: 'システム開発技術：システム開発技術①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=Ia_kQi_IlPM',
        category: 'ITパスポート',
        duration: '04:45',
        createdAt: '2024-10-28T14:19:26.280Z'
    },
    {
        id: '1004',
        title: 'システム開発技術：システム開発技術②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=QNnlyMANGEE',
        category: 'ITパスポート',
        duration: '04:04',
        createdAt: '2024-10-28T14:19:26.275Z'
    },
    {
        id: '1003',
        title: 'ソフトウェア開発管理技術：開発プロセス・手法①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=iUXFMibTSHI',
        category: 'ITパスポート',
        duration: '02:57',
        createdAt: '2024-10-28T14:19:26.269Z'
    },
    {
        id: '1002',
        title: 'ソフトウェア開発管理技術：開発プロセス・手法②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=oWqPVodLC_w',
        category: 'ITパスポート',
        duration: '04:01',
        createdAt: '2024-10-28T14:19:26.263Z'
    },
    {
        id: '1001',
        title: 'ソフトウェア開発管理技術：開発プロセス・手法③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=cKStVY_kDWM',
        category: 'ITパスポート',
        duration: '03:56',
        createdAt: '2024-10-28T14:19:26.257Z'
    },
    {
        id: '1000',
        title: 'ソフトウェア開発管理技術：開発プロセス・手法④',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=QUiYLIYubJs',
        category: 'ITパスポート',
        duration: '03:54',
        createdAt: '2024-10-28T14:19:26.252Z'
    },
    {
        id: '999',
        title: 'プロジェクトマネジメント：プロジェクトマネジメント',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=GCaqMyEibjs',
        category: 'ITパスポート',
        duration: '04:37',
        createdAt: '2024-10-28T14:19:26.246Z'
    },
    {
        id: '998',
        title: 'サービスマネジメント：サービスマネジメント①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=3H3sMqIAP8U',
        category: 'ITパスポート',
        duration: '03:55',
        createdAt: '2024-10-28T14:19:26.240Z'
    },
    {
        id: '997',
        title: 'サービスマネジメント：サービスマネジメント②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=FMIpllOitJE',
        category: 'ITパスポート',
        duration: '01:42',
        createdAt: '2024-10-28T14:19:26.234Z'
    },
    {
        id: '996',
        title: 'サービスマネジメント：サービスマネジメント③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=X8FUbnQgUp8',
        category: 'ITパスポート',
        duration: '04:08',
        createdAt: '2024-10-28T14:19:26.228Z'
    },
    {
        id: '995',
        title: 'サービスマネジメント：サービスマネジメントシステム①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=MUVuK--Pwzs',
        category: 'ITパスポート',
        duration: '05:52',
        createdAt: '2024-10-28T14:19:26.222Z'
    },
    {
        id: '994',
        title: 'サービスマネジメント：サービスマネジメントシステム②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=2ZiiXCdH4fs',
        category: 'ITパスポート',
        duration: '03:31',
        createdAt: '2024-10-28T14:19:26.217Z'
    },
    {
        id: '993',
        title: 'サービスマネジメント：ファシリティマネジメント①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=TAl4UbYcDTk',
        category: 'ITパスポート',
        duration: '03:01',
        createdAt: '2024-10-28T14:19:26.211Z'
    },
    {
        id: '992',
        title: 'サービスマネジメント：ファシリティマネジメント②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=Ba7Bn7TCB9E',
        category: 'ITパスポート',
        duration: '03:51',
        createdAt: '2024-10-28T14:19:26.205Z'
    },
    {
        id: '991',
        title: 'システム監査：システム監査①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=1Go4kY0Lgo8',
        category: 'ITパスポート',
        duration: '02:49',
        createdAt: '2024-10-28T14:19:26.199Z'
    },
    {
        id: '990',
        title: 'システム監査：システム監査②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=E9R9KZpFado',
        category: 'ITパスポート',
        duration: '04:09',
        createdAt: '2024-10-28T14:19:26.193Z'
    },
    {
        id: '989',
        title: 'システム監査：内部統制①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XAuf86WW5-M',
        category: 'ITパスポート',
        duration: '04:13',
        createdAt: '2024-10-28T14:19:26.187Z'
    },
    {
        id: '988',
        title: 'システム監査：内部統制②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=6-Z8mnCZSNU',
        category: 'ITパスポート',
        duration: '03:43',
        createdAt: '2024-10-28T14:19:26.182Z'
    },
    {
        id: '987',
        title: '基礎理論：離散数学①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=eOXkRIYArSM',
        category: 'ITパスポート',
        duration: '04:16',
        createdAt: '2024-10-28T14:19:26.176Z'
    },
    {
        id: '986',
        title: '基礎理論：離散数学②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=R0UKxapQVxA',
        category: 'ITパスポート',
        duration: '03:20',
        createdAt: '2024-10-28T14:19:26.170Z'
    },
    {
        id: '985',
        title: '基礎理論：離散数学③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=PDc4hDaGc1k',
        category: 'ITパスポート',
        duration: '04:35',
        createdAt: '2024-10-28T14:19:26.164Z'
    },
    {
        id: '984',
        title: '基礎理論：応用数学①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=4RzQLp0E43Q',
        category: 'ITパスポート',
        duration: '03:04',
        createdAt: '2024-10-28T14:19:26.158Z'
    },
    {
        id: '983',
        title: '基礎理論：応用数学②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=RvX3DsDtXMg',
        category: 'ITパスポート',
        duration: '03:20',
        createdAt: '2024-10-28T14:19:26.152Z'
    },
    {
        id: '982',
        title: '基礎理論：応用数学③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=BOFnO4thmWo',
        category: 'ITパスポート',
        duration: '03:03',
        createdAt: '2024-10-28T14:19:26.146Z'
    },
    {
        id: '981',
        title: '基礎理論：応用数学④',
        type: 'video',
        url: 'youtube.com/watch?v=t5P_13ptGac',
        category: 'ITパスポート',
        duration: '10:00',
        createdAt: '2024-10-28T14:19:26.140Z'
    },
    {
        id: '980',
        title: '基礎理論：応用数学⑤',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=t1HRRmseUks',
        category: 'ITパスポート',
        duration: '04:03',
        createdAt: '2024-10-28T14:19:26.134Z'
    },
    {
        id: '979',
        title: '基礎理論：情報に関する理論①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=9ToYoGP7eyY',
        category: 'ITパスポート',
        duration: '01:19',
        createdAt: '2024-10-28T14:19:26.128Z'
    },
    {
        id: '978',
        title: '基礎理論：情報に関する理論②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=EARNTjSLsnA',
        category: 'ITパスポート',
        duration: '03:23',
        createdAt: '2024-10-28T14:19:26.122Z'
    },
    {
        id: '977',
        title: '基礎理論：情報に関する理論③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=8u7XfrxTMmU',
        category: 'ITパスポート',
        duration: '02:28',
        createdAt: '2024-10-28T14:19:26.116Z'
    },
    {
        id: '976',
        title: '基礎理論：情報に関する理論④',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=Eo0PUeTBZzk',
        category: 'ITパスポート',
        duration: '03:50',
        createdAt: '2024-10-28T14:19:26.110Z'
    },
    {
        id: '975',
        title: '基礎理論：情報に関する理論⑤',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=4iA0YcbTEWU',
        category: 'ITパスポート',
        duration: '03:38',
        createdAt: '2024-10-28T14:19:26.105Z'
    },
    {
        id: '974',
        title: 'アルゴリズムとプログラミング：データ構造',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=7AhRm-CMOS4',
        category: 'ITパスポート',
        duration: '03:15',
        createdAt: '2024-10-28T14:19:26.099Z'
    },
    {
        id: '973',
        title: 'アルゴリズムとプログラミング：アルゴリズムとプログラミング①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=9XIoCeeZvVk',
        category: 'ITパスポート',
        duration: '03:44',
        createdAt: '2024-10-28T14:19:26.093Z'
    },
    {
        id: '972',
        title: 'アルゴリズムとプログラミング：アルゴリズムとプログラミング②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=SbFufk0ky6I',
        category: 'ITパスポート',
        duration: '02:14',
        createdAt: '2024-10-28T14:19:26.087Z'
    },
    {
        id: '971',
        title: 'アルゴリズムとプログラミング：アルゴリズムとプログラミング③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=zLcKT-x9rBE',
        category: 'ITパスポート',
        duration: '03:26',
        createdAt: '2024-10-28T14:19:26.082Z'
    },
    {
        id: '970',
        title: 'アルゴリズムとプログラミング：アルゴリズムとプログラミング④',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=HU2ca7my8ZE',
        category: 'ITパスポート',
        duration: '03:39',
        createdAt: '2024-10-28T14:19:26.076Z'
    },
    {
        id: '969',
        title: 'アルゴリズムとプログラミング：プログラム言語①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=kkMJxTGADjE',
        category: 'ITパスポート',
        duration: '03:12',
        createdAt: '2024-10-28T14:19:26.070Z'
    },
    {
        id: '968',
        title: 'アルゴリズムとプログラミング：プログラム言語②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=IPFwN_tXrIk',
        category: 'ITパスポート',
        duration: '03:18',
        createdAt: '2024-10-28T14:19:26.065Z'
    },
    {
        id: '967',
        title: 'アルゴリズムとプログラミング：その他の言語①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=KCPMng4Cezg',
        category: 'ITパスポート',
        duration: '03:43',
        createdAt: '2024-10-28T14:19:26.059Z'
    },
    {
        id: '966',
        title: 'アルゴリズムとプログラミング：その他の言語②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=8ujhlrZDCmg',
        category: 'ITパスポート',
        duration: '03:46',
        createdAt: '2024-10-28T14:19:26.053Z'
    },
    {
        id: '965',
        title: 'コンピュータ構成要素：プロセッサ①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=zYqnvgI6u94',
        category: 'ITパスポート',
        duration: '03:06',
        createdAt: '2024-10-28T14:19:26.047Z'
    },
    {
        id: '964',
        title: 'コンピュータ構成要素：プロセッサ②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=TdDJybC7t8o',
        category: 'ITパスポート',
        duration: '02:39',
        createdAt: '2024-10-28T14:19:26.041Z'
    },
    {
        id: '963',
        title: 'コンピュータ構成要素：メモリ①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=y9PQVuzIxsI',
        category: 'ITパスポート',
        duration: '04:18',
        createdAt: '2024-10-28T14:19:26.035Z'
    },
    {
        id: '962',
        title: 'コンピュータ構成要素：メモリ②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=pbRX-zyshMk',
        category: 'ITパスポート',
        duration: '04:13',
        createdAt: '2024-10-28T14:19:26.029Z'
    },
    {
        id: '961',
        title: 'コンピュータ構成要素：メモリ③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=sQLVCMb9USc',
        category: 'ITパスポート',
        duration: '03:00',
        createdAt: '2024-10-28T14:19:26.023Z'
    },
    {
        id: '960',
        title: 'コンピュータ構成要素：入出力デバイス①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=sNQH2TwpmtM',
        category: 'ITパスポート',
        duration: '03:45',
        createdAt: '2024-10-28T14:19:26.018Z'
    },
    {
        id: '959',
        title: 'コンピュータ構成要素：入出力デバイス②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=_IJqk_RsDtY',
        category: 'ITパスポート',
        duration: '03:54',
        createdAt: '2024-10-28T14:19:26.012Z'
    },
    {
        id: '958',
        title: 'コンピュータ構成要素：入出力デバイス③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=pxu25FhjK7Y',
        category: 'ITパスポート',
        duration: '03:28',
        createdAt: '2024-10-28T14:19:26.005Z'
    },
    {
        id: '957',
        title: 'システム構成要素：システムの構成①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=oDjO5F6jSXY',
        category: 'ITパスポート',
        duration: '02:56',
        createdAt: '2024-10-28T14:19:25.999Z'
    },
    {
        id: '956',
        title: 'システム構成要素：システムの構成②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=fQW7nlikt2E',
        category: 'ITパスポート',
        duration: '04:31',
        createdAt: '2024-10-28T14:19:25.993Z'
    },
    {
        id: '955',
        title: 'システム構成要素：システムの構成③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=i62KiDCiJSA',
        category: 'ITパスポート',
        duration: '03:10',
        createdAt: '2024-10-28T14:19:25.987Z'
    },
    {
        id: '954',
        title: 'システム構成要素：システムの評価指数①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=GlrVy-tnbEk',
        category: 'ITパスポート',
        duration: '02:47',
        createdAt: '2024-10-28T14:19:25.981Z'
    },
    {
        id: '953',
        title: 'システム構成要素：システムの評価指数②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=-0W3uhCnCf8',
        category: 'ITパスポート',
        duration: '03:56',
        createdAt: '2024-10-28T14:19:25.976Z'
    },
    {
        id: '952',
        title: 'システム構成要素：システムの評価指数③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=GmBfRYm66xg',
        category: 'ITパスポート',
        duration: '03:56',
        createdAt: '2024-10-28T14:19:25.970Z'
    },
    {
        id: '951',
        title: 'ソフトウェア：オペレーティングシステム①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=OOUTxGK2HIE',
        category: 'ITパスポート',
        duration: '02:32',
        createdAt: '2024-10-28T14:19:25.964Z'
    },
    {
        id: '950',
        title: 'ソフトウェア：オペレーティングシステム②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=idMr5jSHPms',
        category: 'ITパスポート',
        duration: '02:38',
        createdAt: '2024-10-28T14:19:25.959Z'
    },
    {
        id: '949',
        title: 'ソフトウェア：オペレーティングシステム③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=UGlRhuaWulE',
        category: 'ITパスポート',
        duration: '03:23',
        createdAt: '2024-10-28T14:19:25.953Z'
    },
    {
        id: '948',
        title: 'ソフトウェア：ファイルシステム①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=cdfv8n_GGzk',
        category: 'ITパスポート',
        duration: '03:54',
        createdAt: '2024-10-28T14:19:25.947Z'
    },
    {
        id: '947',
        title: 'ソフトウェア：ファイルシステム②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=6RqGhP9ybc8',
        category: 'ITパスポート',
        duration: '04:04',
        createdAt: '2024-10-28T14:19:25.941Z'
    },
    {
        id: '946',
        title: 'ソフトウェア：オフィスツール①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=dt2JcP0m6B8',
        category: 'ITパスポート',
        duration: '03:40',
        createdAt: '2024-10-28T14:19:25.935Z'
    },
    {
        id: '945',
        title: 'ソフトウェア：オフィスツール②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=vrIooEftT3w',
        category: 'ITパスポート',
        duration: '03:44',
        createdAt: '2024-10-28T14:19:25.928Z'
    },
    {
        id: '944',
        title: 'ソフトウェア：オフィスツール③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=mfzshDtpBM0',
        category: 'ITパスポート',
        duration: '03:42',
        createdAt: '2024-10-28T14:19:25.922Z'
    },
    {
        id: '943',
        title: 'ソフトウェア：オフィスツール④',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=Ppu6yLFKDdA',
        category: 'ITパスポート',
        duration: '03:56',
        createdAt: '2024-10-28T14:19:25.916Z'
    },
    {
        id: '942',
        title: 'ソフトウェア：オフィスツール⑤',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=qahY58OedrA',
        category: 'ITパスポート',
        duration: '03:19',
        createdAt: '2024-10-28T14:19:25.910Z'
    },
    {
        id: '941',
        title: 'ソフトウェア：オープンソースソフトウェア',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=Dw_AoBo91Qw',
        category: 'ITパスポート',
        duration: '03:08',
        createdAt: '2024-10-28T14:19:25.904Z'
    },
    {
        id: '940',
        title: 'ハードウェア：ハードウェア（コンピュータ・入出力装置）①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=nahs9cUV32g',
        category: 'ITパスポート',
        duration: '04:28',
        createdAt: '2024-10-28T14:19:25.898Z'
    },
    {
        id: '939',
        title: 'ハードウェア：ハードウェア（コンピュータ・入出力装置）②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=AecHTKCZu5I',
        category: 'ITパスポート',
        duration: '03:14',
        createdAt: '2024-10-28T14:19:25.892Z'
    },
    {
        id: '938',
        title: '情報デザイン：情報デザイン①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=alchQcaKTYA',
        category: 'ITパスポート',
        duration: '03:24',
        createdAt: '2024-10-28T14:19:25.886Z'
    },
    {
        id: '937',
        title: '情報デザイン：情報デザイン②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=kwgxtAuRadA',
        category: 'ITパスポート',
        duration: '03:25',
        createdAt: '2024-10-28T14:19:25.881Z'
    },
    {
        id: '936',
        title: '情報デザイン：インターフェース設計①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=yB5x3LSA45Q',
        category: 'ITパスポート',
        duration: '02:53',
        createdAt: '2024-10-28T14:19:25.875Z'
    },
    {
        id: '935',
        title: '情報デザイン：インターフェース設計②',
        type: 'video',
        url: 'https://youtu.be/dNgZBekqZ5U',
        category: 'ITパスポート',
        duration: '02:18',
        createdAt: '2024-10-28T14:19:25.869Z'
    },
    {
        id: '934',
        title: '情報デザイン：インターフェース設計③',
        type: 'video',
        url: 'https://youtu.be/Jbn3Aigsmls',
        category: 'ITパスポート',
        duration: '02:56',
        createdAt: '2024-10-28T14:19:25.863Z'
    },
    {
        id: '933',
        title: '情報デザイン：インターフェース設計④',
        type: 'video',
        url: 'https://youtu.be/uyVzdF7Upp4',
        category: 'ITパスポート',
        duration: '03:12',
        createdAt: '2024-10-28T14:19:25.856Z'
    },
    {
        id: '932',
        title: '情報デザイン：インターフェース設計⑤',
        type: 'video',
        url: 'https://youtu.be/OfWh9LeE38Q',
        category: 'ITパスポート',
        duration: '03:42',
        createdAt: '2024-10-28T14:19:25.850Z'
    },
    {
        id: '931',
        title: '情報メディア：マルチメディア技術①',
        type: 'video',
        url: 'https://youtu.be/Vxjx2ffTenw',
        category: 'ITパスポート',
        duration: '03:43',
        createdAt: '2024-10-28T14:19:25.844Z'
    },
    {
        id: '930',
        title: '情報メディア：マルチメディア技術②',
        type: 'video',
        url: 'https://youtu.be/9QmhhSx_5Dg',
        category: 'ITパスポート',
        duration: '02:00',
        createdAt: '2024-10-28T14:19:25.839Z'
    },
    {
        id: '929',
        title: '情報メディア：マルチメディア技術③',
        type: 'video',
        url: 'https://youtu.be/LJlQAVG5av8',
        category: 'ITパスポート',
        duration: '04:04',
        createdAt: '2024-10-28T14:19:25.833Z'
    },
    {
        id: '928',
        title: '情報メディア：マルチメディア技術④',
        type: 'video',
        url: 'https://youtu.be/LxG_rxntHzg',
        category: 'ITパスポート',
        duration: '03:27',
        createdAt: '2024-10-28T14:19:25.827Z'
    },
    {
        id: '927',
        title: '情報メディア：マルチメディア技術⑤',
        type: 'video',
        url: 'https://youtu.be/G74td0IBIFg',
        category: 'ITパスポート',
        duration: '03:33',
        createdAt: '2024-10-28T14:19:25.821Z'
    },
    {
        id: '926',
        title: '情報メディア：マルチメディア応用①',
        type: 'video',
        url: 'https://youtu.be/a3QdQOqrdmw',
        category: 'ITパスポート',
        duration: '03:59',
        createdAt: '2024-10-28T14:19:25.815Z'
    },
    {
        id: '925',
        title: '情報メディア：マルチメディア応用②',
        type: 'video',
        url: 'https://youtu.be/TqvfQmXkUHA',
        category: 'ITパスポート',
        duration: '02:58',
        createdAt: '2024-10-28T14:19:25.809Z'
    },
    {
        id: '924',
        title: 'データベース：データベース方式①',
        type: 'video',
        url: 'https://youtu.be/GvoM4KRSdek',
        category: 'ITパスポート',
        duration: '04:48',
        createdAt: '2024-10-28T14:19:25.803Z'
    },
    {
        id: '923',
        title: 'データベース：データベース方式②',
        type: 'video',
        url: 'https://youtu.be/pD_keOVtfSw',
        category: 'ITパスポート',
        duration: '04:10',
        createdAt: '2024-10-28T14:19:25.798Z'
    },
    {
        id: '922',
        title: 'データベース：データベース設計①',
        type: 'video',
        url: 'https://youtu.be/p5EGA1XfaLg',
        category: 'ITパスポート',
        duration: '03:37',
        createdAt: '2024-10-28T14:19:25.792Z'
    },
    {
        id: '921',
        title: 'データベース：データベース設計②',
        type: 'video',
        url: 'https://youtu.be/wsB103rW5qk',
        category: 'ITパスポート',
        duration: '04:10',
        createdAt: '2024-10-28T14:19:25.786Z'
    },
    {
        id: '920',
        title: 'データベース：データベース設計③',
        type: 'video',
        url: 'https://youtu.be/5flE6O0QbCI',
        category: 'ITパスポート',
        duration: '02:32',
        createdAt: '2024-10-28T14:19:25.781Z'
    },
    {
        id: '919',
        title: 'データベース：データ操作',
        type: 'video',
        url: 'https://youtu.be/IYraFfT-eiI',
        category: 'ITパスポート',
        duration: '04:13',
        createdAt: '2024-10-28T14:19:25.774Z'
    },
    {
        id: '918',
        title: 'データベース：トランザクション処理①',
        type: 'video',
        url: 'https://youtu.be/8kV_IjhNnkQ',
        category: 'ITパスポート',
        duration: '02:46',
        createdAt: '2024-10-28T14:19:25.768Z'
    },
    {
        id: '917',
        title: 'データベース：トランザクション処理②',
        type: 'video',
        url: 'https://youtu.be/BcqgOkaGD1o',
        category: 'ITパスポート',
        duration: '03:48',
        createdAt: '2024-10-28T14:19:25.763Z'
    },
    {
        id: '916',
        title: 'ネットワーク：ネットワーク方式①',
        type: 'video',
        url: 'https://youtu.be/GQezlNH0Lm0',
        category: 'ITパスポート',
        duration: '02:58',
        createdAt: '2024-10-28T14:19:25.757Z'
    },
    {
        id: '915',
        title: 'ネットワーク：ネットワーク方式②',
        type: 'video',
        url: 'https://youtu.be/JbkM2kK0PLw',
        category: 'ITパスポート',
        duration: '03:29',
        createdAt: '2024-10-28T14:19:25.751Z'
    },
    {
        id: '914',
        title: 'ネットワーク：ネットワーク方式③',
        type: 'video',
        url: 'https://youtu.be/FQgAFHZoxoI',
        category: 'ITパスポート',
        duration: '03:48',
        createdAt: '2024-10-28T14:19:25.745Z'
    },
    {
        id: '913',
        title: 'ネットワーク：通信プロトコル①',
        type: 'video',
        url: 'https://youtu.be/nJhUGJI-K2A',
        category: 'ITパスポート',
        duration: '04:45',
        createdAt: '2024-10-28T14:19:25.739Z'
    },
    {
        id: '912',
        title: 'ネットワーク：通信プロトコル②',
        type: 'video',
        url: 'https://youtu.be/sRxqzXR8oKw',
        category: 'ITパスポート',
        duration: '03:45',
        createdAt: '2024-10-28T14:19:25.733Z'
    },
    {
        id: '911',
        title: 'ネットワーク：ネットワーク応用①',
        type: 'video',
        url: 'https://youtu.be/K59-S2u4EX8',
        category: 'ITパスポート',
        duration: '04:24',
        createdAt: '2024-10-28T14:19:25.727Z'
    },
    {
        id: '910',
        title: 'ネットワーク：ネットワーク応用②',
        type: 'video',
        url: 'https://youtu.be/Fa4DC8SasHw',
        category: 'ITパスポート',
        duration: '03:38',
        createdAt: '2024-10-28T14:19:25.721Z'
    },
    {
        id: '909',
        title: 'ネットワーク：ネットワーク応用③',
        type: 'video',
        url: 'https://youtu.be/r1wEp9QGSmI',
        category: 'ITパスポート',
        duration: '04:25',
        createdAt: '2024-10-28T14:19:25.715Z'
    },
    {
        id: '908',
        title: 'セキュリティ：情報セキュリティ①',
        type: 'video',
        url: 'https://youtu.be/S7BdlQ3Bmig',
        category: 'ITパスポート',
        duration: '02:53',
        createdAt: '2024-10-28T14:19:25.709Z'
    },
    {
        id: '907',
        title: 'セキュリティ：情報セキュリティ②',
        type: 'video',
        url: 'https://youtu.be/CFgDY34v3_Q',
        category: 'ITパスポート',
        duration: '05:25',
        createdAt: '2024-10-28T14:19:25.703Z'
    },
    {
        id: '906',
        title: 'セキュリティ：情報セキュリティ③',
        type: 'video',
        url: 'https://youtu.be/vwKrK91G1kE',
        category: 'ITパスポート',
        duration: '03:10',
        createdAt: '2024-10-28T14:19:25.697Z'
    },
    {
        id: '905',
        title: 'セキュリティ：情報セキュリティ④',
        type: 'video',
        url: 'https://youtu.be/BjmnBU-3Pu4',
        category: 'ITパスポート',
        duration: '04:05',
        createdAt: '2024-10-28T14:19:25.692Z'
    },
    {
        id: '904',
        title: 'セキュリティ：情報セキュリティ管理①',
        type: 'video',
        url: 'https://youtu.be/ohxpQesEfb4',
        category: 'ITパスポート',
        duration: '04:24',
        createdAt: '2024-10-28T14:19:25.685Z'
    },
    {
        id: '903',
        title: 'セキュリティ：情報セキュリティ管理②',
        type: 'video',
        url: 'https://youtu.be/ouuOQRNGvpo',
        category: 'ITパスポート',
        duration: '03:26',
        createdAt: '2024-10-28T14:19:25.680Z'
    },
    {
        id: '902',
        title: 'セキュリティ：情報セキュリティ管理③',
        type: 'video',
        url: 'https://youtu.be/kV-V8t-5IUs',
        category: 'ITパスポート',
        duration: '03:20',
        createdAt: '2024-10-28T14:19:25.674Z'
    },
    {
        id: '901',
        title: 'セキュリティ：情報セキュリティ管理④',
        type: 'video',
        url: 'https://youtu.be/AlUyJKTeChU',
        category: 'ITパスポート',
        duration: '04:52',
        createdAt: '2024-10-28T14:19:25.668Z'
    },
    {
        id: '900',
        title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術①',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=sFUx3FWxEgQ',
        category: 'ITパスポート',
        duration: '03:44',
        createdAt: '2024-10-28T14:19:25.663Z'
    },
    {
        id: '899',
        title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術②',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=zDzF9AAuJFE',
        category: 'ITパスポート',
        duration: '02:23',
        createdAt: '2024-10-28T14:19:25.657Z'
    },
    {
        id: '898',
        title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術③',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=dB4kRFNFfyU',
        category: 'ITパスポート',
        duration: '03:34',
        createdAt: '2024-10-28T14:19:25.651Z'
    },
    {
        id: '897',
        title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術④',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=Pazto--9VPw',
        category: 'ITパスポート',
        duration: '02:16',
        createdAt: '2024-10-28T14:19:25.645Z'
    },
    {
        id: '896',
        title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術⑤',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=gQQMQ5WfDRY',
        category: 'ITパスポート',
        duration: '03:23',
        createdAt: '2024-10-28T14:19:25.639Z'
    },
    {
        id: '895',
        title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術⑥',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=5UL8PFAtyg8',
        category: 'ITパスポート',
        duration: '02:37',
        createdAt: '2024-10-28T14:19:25.634Z'
    },
    {
        id: '894',
        title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術⑦',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=7QrZhWD3Lg4',
        category: 'ITパスポート',
        duration: '03:02',
        createdAt: '2024-10-28T14:19:25.628Z'
    },
    {
        id: '893',
        title: '20230817_就活ガイダンス',
        type: 'video',
        url: 'https://youtu.be/Nh0nnlGSClM',
        category: 'キャリアサポート',
        duration: '55:27',
        createdAt: '2024-10-28T14:19:25.623Z'
    },
    {
        id: '892',
        title: '20230824_自己分析①「価値観発見ワーク」',
        type: 'video',
        url: 'https://youtu.be/OYNzIZImsXo',
        category: 'キャリアサポート',
        duration: '49:29',
        createdAt: '2024-10-28T14:19:25.617Z'
    },
    {
        id: '891',
        title: '20230907_自己分析②「DISC理論ワーク」',
        type: 'video',
        url: 'https://youtu.be/A5swaPt41HQ',
        category: 'キャリアサポート',
        duration: '33:13',
        createdAt: '2024-10-28T14:19:25.612Z'
    },
    {
        id: '890',
        title: '20230914_AI最新トレンド情報',
        type: 'video',
        url: 'https://youtu.be/gkzK27R1n8Q',
        category: 'キャリアサポート',
        duration: '1:03:11',
        createdAt: '2024-10-28T14:19:25.606Z'
    },
    {
        id: '889',
        title: '20230921_マーケティングセミナー',
        type: 'video',
        url: 'https://youtu.be/yfyvhBG-UPQ',
        category: 'キャリアサポート',
        duration: '1:03:12',
        createdAt: '2024-10-28T14:19:25.601Z'
    },
    {
        id: '888',
        title: '20230928_自己分析③「やりたいことの見つけ方ワーク」',
        type: 'video',
        url: 'https://youtu.be/RZFot7535vo',
        category: 'キャリアサポート',
        duration: '38:05',
        createdAt: '2024-10-28T14:19:25.595Z'
    },
    {
        id: '887',
        title: '20231005_自己分析④「キャリアプラン作成」',
        type: 'video',
        url: 'https://youtu.be/WeoLMGS4YRc',
        category: 'キャリアサポート',
        duration: '1:12:47',
        createdAt: '2024-10-28T14:19:25.590Z'
    },
    {
        id: '886',
        title: '20231026_業界研究・履歴書作成ワーク',
        type: 'video',
        url: 'https://youtu.be/RiC-XZcKQYA',
        category: 'キャリアサポート',
        duration: '50:45',
        createdAt: '2024-10-28T14:19:25.584Z'
    },
    {
        id: '885',
        title: '20231109_「デジタルスキルを使ってキャリアとのつながりについて考える」',
        type: 'video',
        url: 'https://youtu.be/1KYyzJ3mmG4',
        category: 'キャリアサポート',
        duration: '59:28',
        createdAt: '2024-10-28T14:19:25.579Z'
    },
    {
        id: '884',
        title: '20231116_「IT業界や在宅勤務について」',
        type: 'video',
        url: 'https://youtu.be/BJ5fjopomF8',
        category: 'キャリアサポート',
        duration: '43:32',
        createdAt: '2024-10-28T14:19:25.573Z'
    },
    {
        id: '883',
        title: '20231123_「目標が漠然としていることについて」',
        type: 'video',
        url: 'https://youtu.be/uWxTDgP-53g',
        category: 'キャリアサポート',
        duration: '56:37',
        createdAt: '2024-10-28T14:19:25.568Z'
    },
    {
        id: '882',
        title: '20231207_制作系質問会',
        type: 'video',
        url: 'https://youtu.be/xZmCiUro0qc',
        category: 'キャリアサポート',
        duration: '1:08:31',
        createdAt: '2024-10-28T14:19:25.562Z'
    },
    {
        id: '881',
        title: '20231214_「現状と理想と手段について」',
        type: 'video',
        url: 'https://youtu.be/xhzZk5iMU4A',
        category: 'キャリアサポート',
        duration: '56:16',
        createdAt: '2024-10-28T14:19:25.557Z'
    },
    {
        id: '880',
        title: '20231221_「資格・試験は必要なのか」',
        type: 'video',
        url: 'https://youtu.be/jKkcVPKcWcM',
        category: 'キャリアサポート',
        duration: '54:52',
        createdAt: '2024-10-28T14:19:25.551Z'
    },
    {
        id: '879',
        title: '20240111_「プログラミングは必要か？ノーコードツールでアプリを作ってみよう」',
        type: 'video',
        url: 'https://youtu.be/q2Lj0TKlD6g',
        category: 'キャリアサポート',
        duration: '1:07:04',
        createdAt: '2024-10-28T14:19:25.546Z'
    },
    {
        id: '878',
        title: '20240125 _「女性活躍の今後について」',
        type: 'video',
        url: 'https://youtu.be/f2v0LByL6G8',
        category: 'キャリアサポート',
        duration: '34:22',
        createdAt: '2024-10-28T14:19:25.540Z'
    },
    {
        id: '877',
        title: '20240208_「会社とフリーランスの違い」',
        type: 'video',
        url: 'https://youtu.be/QiWJSF_cc4M',
        category: 'キャリアサポート',
        duration: '33:00',
        createdAt: '2024-10-28T14:19:25.534Z'
    },
    {
        id: '876',
        title: '20240215_「AIに仕事は奪われるのか」',
        type: 'video',
        url: 'https://youtu.be/_D3AazAUwWM',
        category: 'キャリアサポート',
        duration: '53:33',
        createdAt: '2024-10-28T14:19:25.528Z'
    },
    {
        id: '875',
        title: '20240222_「ビジネスの根幹」',
        type: 'video',
        url: 'https://youtu.be/saIZ4zuaORU',
        category: 'キャリアサポート',
        duration: '42:22',
        createdAt: '2024-10-28T14:19:25.523Z'
    },
    {
        id: '874',
        title: 'HP制作セミナー',
        type: 'video',
        url: 'https://youtu.be/fpG4gydfINk',
        category: 'HP制作',
        duration: '1:05:19',
        createdAt: '2024-10-28T14:19:25.517Z'
    },
    {
        id: '873',
        title: 'HP制作課題について',
        type: 'video',
        url: 'https://youtu.be/LZF-_eGWDsQ',
        category: 'HP制作',
        duration: '13:03',
        createdAt: '2024-10-28T14:19:25.512Z'
    },
    {
        id: '872',
        title: 'レスポンシブ対応について',
        type: 'video',
        url: 'https://youtu.be/r_j1rMoa-MI',
        category: 'HP制作',
        duration: '07:09',
        createdAt: '2024-10-28T14:19:25.506Z'
    },
    {
        id: '871',
        title: 'Wordpress構築について_応用',
        type: 'video',
        url: 'https://youtu.be/kRG6L_ePLfQ',
        category: 'HP制作',
        duration: '19:49',
        createdAt: '2024-10-28T14:19:25.500Z'
    },
    {
        id: '870',
        title: 'SNSマーケティングセミナー',
        type: 'video',
        url: 'https://youtu.be/SNZ8C2UmsLI',
        category: 'SNSマーケティング',
        duration: '1:03:05',
        createdAt: '2024-10-28T14:19:25.495Z'
    },
    {
        id: '869',
        title: '人工知能とは？',
        type: 'video',
        url: 'https://youtu.be/gNoH3LSlcnk',
        category: 'デジタル応用',
        duration: '06:08',
        createdAt: '2024-10-28T14:19:25.489Z'
    },
    {
        id: '868',
        title: '機械学習とは？',
        type: 'video',
        url: 'https://youtu.be/ijOXpcQ5so0',
        category: 'デジタル応用',
        duration: '06:18',
        createdAt: '2024-10-28T14:19:25.483Z'
    },
    {
        id: '867',
        title: 'IDEとは？',
        type: 'video',
        url: 'https://youtu.be/EkOd-bO0QeQ',
        category: 'デジタル応用',
        duration: '05:51',
        createdAt: '2024-10-28T14:19:25.478Z'
    },
    {
        id: '866',
        title: 'プログラムの基本構造とは？',
        type: 'video',
        url: 'https://youtu.be/r2oD6I6d4ek',
        category: 'デジタル応用',
        duration: '03:50',
        createdAt: '2024-10-28T14:19:25.472Z'
    },
    {
        id: '865',
        title: 'VRとは？',
        type: 'video',
        url: 'https://youtu.be/Rqbq0eJWmTY',
        category: 'デジタル応用',
        duration: '04:43',
        createdAt: '2024-10-28T14:19:25.466Z'
    },
    {
        id: '864',
        title: 'IoTとは？',
        type: 'video',
        url: 'https://youtu.be/llYn03L0BVU',
        category: 'デジタル応用',
        duration: '05:26',
        createdAt: '2024-10-28T14:19:25.460Z'
    },
    {
        id: '863',
        title: '量子コンピュータとは？',
        type: 'video',
        url: 'https://youtu.be/u3isJ8JU6tg',
        category: 'デジタル応用',
        duration: '04:54',
        createdAt: '2024-10-28T14:19:25.455Z'
    },
    {
        id: '862',
        title: '5Gとは？',
        type: 'video',
        url: 'https://youtu.be/GQVdQbiwMXo',
        category: 'デジタル応用',
        duration: '05:03',
        createdAt: '2024-10-28T14:19:25.449Z'
    },
    {
        id: '861',
        title: 'ビッグデータとは？',
        type: 'video',
        url: 'https://youtu.be/fcPrI08EepY',
        category: 'デジタル応用',
        duration: '04:23',
        createdAt: '2024-10-28T14:19:25.444Z'
    },
    {
        id: '860',
        title: 'ARとは？',
        type: 'video',
        url: 'https://youtu.be/VQA1_w8IVHk',
        category: 'デジタル応用',
        duration: '04:35',
        createdAt: '2024-10-28T14:19:25.438Z'
    },
    {
        id: '859',
        title: 'ブロックチェーン とは？',
        type: 'video',
        url: 'https://youtu.be/uYfIlJVDLXg',
        category: 'デジタル応用',
        duration: '05:36',
        createdAt: '2024-10-28T14:19:25.433Z'
    },
    {
        id: '858',
        title: '6Gとは？',
        type: 'video',
        url: 'https://youtu.be/kv2X9BO9TQQ',
        category: 'デジタル応用',
        duration: '08:41',
        createdAt: '2024-10-28T14:19:25.427Z'
    },
    {
        id: '857',
        title: 'プログラミング言語とは？',
        type: 'video',
        url: 'https://youtu.be/ZGB_38dOeQY',
        category: 'デジタル基礎（必修）',
        duration: '03:55',
        createdAt: '2024-10-28T14:19:25.422Z'
    },
    {
        id: '856',
        title: 'プログラムとは？',
        type: 'video',
        url: 'https://youtu.be/xSfgv_MlU8c',
        category: 'デジタル基礎（必修）',
        duration: '04:05',
        createdAt: '2024-10-28T14:19:25.416Z'
    },
    {
        id: '855',
        title: 'プログラミング言語の種類にはどんなものがある？',
        type: 'video',
        url: 'https://youtu.be/-LXCMmSS0cc',
        category: 'デジタル基礎（必修）',
        duration: '05:08',
        createdAt: '2024-10-28T14:19:25.411Z'
    },
    {
        id: '854',
        title: 'JavaScriptとは？',
        type: 'video',
        url: 'https://youtu.be/HpXhE05rDgs',
        category: 'デジタル基礎（必修）',
        duration: '04:11',
        createdAt: '2024-10-28T14:19:25.405Z'
    },
    {
        id: '853',
        title: 'Pythonとは？',
        type: 'video',
        url: 'https://youtu.be/ZhufHFIXku4',
        category: 'デジタル基礎（必修）',
        duration: '04:22',
        createdAt: '2024-10-28T14:19:25.400Z'
    },
    {
        id: '852',
        title: 'Rubyとは？',
        type: 'video',
        url: 'https://youtu.be/QmZZcBia7dU',
        category: 'デジタル基礎（必修）',
        duration: '03:20',
        createdAt: '2024-10-28T14:19:25.395Z'
    },
    {
        id: '851',
        title: 'Javaとは？',
        type: 'video',
        url: 'https://youtu.be/_5wNWgfwBbA',
        category: 'デジタル基礎（必修）',
        duration: '03:59',
        createdAt: '2024-10-28T14:19:25.389Z'
    },
    {
        id: '850',
        title: 'HTMLとは？',
        type: 'video',
        url: 'https://youtu.be/xCPEsIiDI_I',
        category: 'デジタル基礎（必修）',
        duration: '04:45',
        createdAt: '2024-10-28T14:19:25.384Z'
    },
    {
        id: '849',
        title: 'CSSとは？',
        type: 'video',
        url: 'https://youtu.be/jqJUXpR-wXk',
        category: 'デジタル基礎（必修）',
        duration: '04:25',
        createdAt: '2024-10-28T14:19:25.378Z'
    },
    {
        id: '848',
        title: 'PHPとは？',
        type: 'video',
        url: 'https://youtu.be/y5nhLDM5g-o',
        category: 'デジタル基礎（必修）',
        duration: '04:21',
        createdAt: '2024-10-28T14:19:25.373Z'
    },
    {
        id: '847',
        title: 'SQLとは？',
        type: 'video',
        url: 'https://youtu.be/7CSvDRzaZR4',
        category: 'デジタル基礎（必修）',
        duration: '05:04',
        createdAt: '2024-10-28T14:19:25.367Z'
    },
    {
        id: '846',
        title: 'フレームワークとは？',
        type: 'video',
        url: 'https://youtu.be/BPRtLnYAeL4',
        category: 'デジタル基礎（必修）',
        duration: '06:01',
        createdAt: '2024-10-28T14:19:25.362Z'
    },
    {
        id: '845',
        title: 'IPとは？',
        type: 'video',
        url: 'https://youtu.be/phK5FB-Rfy4',
        category: 'デジタル基礎（必修）',
        duration: '04:32',
        createdAt: '2024-10-28T14:19:25.356Z'
    },
    {
        id: '844',
        title: 'TCPとは？',
        type: 'video',
        url: 'https://youtu.be/hTt07JXEJok',
        category: 'デジタル基礎（必修）',
        duration: '04:27',
        createdAt: '2024-10-28T14:19:25.350Z'
    },
    {
        id: '843',
        title: 'ウェブとは？',
        type: 'video',
        url: 'https://youtu.be/F3yov3siGKM',
        category: 'デジタル基礎（必修）',
        duration: '04:07',
        createdAt: '2024-10-28T14:19:25.344Z'
    },
    {
        id: '842',
        title: 'URLとは？',
        type: 'video',
        url: 'https://youtu.be/Du-ho0YxcZE',
        category: 'デジタル基礎（必修）',
        duration: '05:19',
        createdAt: '2024-10-28T14:19:25.338Z'
    },
    {
        id: '841',
        title: 'LANとは？',
        type: 'video',
        url: 'https://youtu.be/VUii10WKP_w',
        category: 'デジタル基礎（必修）',
        duration: '04:13',
        createdAt: '2024-10-28T14:19:25.332Z'
    },
    {
        id: '840',
        title: 'WANとは？',
        type: 'video',
        url: 'https://youtu.be/NydlfuaJjJE',
        category: 'デジタル基礎（必修）',
        duration: '04:49',
        createdAt: '2024-10-28T14:19:25.326Z'
    },
    {
        id: '839',
        title: 'HTTPとは？',
        type: 'video',
        url: 'https://youtu.be/Z3IAcQuB8f0',
        category: 'デジタル基礎（必修）',
        duration: '04:17',
        createdAt: '2024-10-28T14:19:25.320Z'
    },
    {
        id: '838',
        title: 'インターネットとは？',
        type: 'video',
        url: 'https://youtu.be/daFfgBhzX_w',
        category: 'デジタル基礎（必修）',
        duration: '05:09',
        createdAt: '2024-10-28T14:19:25.315Z'
    },
    {
        id: '837',
        title: 'ポート番号とは？',
        type: 'video',
        url: 'https://youtu.be/ac1tohMto9k',
        category: 'デジタル基礎（必修）',
        duration: '04:53',
        createdAt: '2024-10-28T14:19:25.309Z'
    },
    {
        id: '836',
        title: 'コンパイルとは？',
        type: 'video',
        url: 'https://youtu.be/2FzDBWi8BkE',
        category: 'デジタル基礎（必修）',
        duration: '03:41',
        createdAt: '2024-10-28T14:19:25.303Z'
    },
    {
        id: '835',
        title: 'Linuxとは？',
        type: 'video',
        url: 'https://youtu.be/q8pBgVp459k',
        category: 'デジタル基礎（必修）',
        duration: '03:52',
        createdAt: '2024-10-28T14:19:25.297Z'
    },
    {
        id: '834',
        title: 'Gitとは？',
        type: 'video',
        url: 'https://youtu.be/vc7wqajaZKE',
        category: 'デジタル基礎（必修）',
        duration: '04:17',
        createdAt: '2024-10-28T14:19:25.291Z'
    },
    {
        id: '833',
        title: 'サーバーとは？',
        type: 'video',
        url: 'https://youtu.be/ODig-LexsV8',
        category: 'デジタル基礎（必修）',
        duration: '03:45',
        createdAt: '2024-10-28T14:19:25.286Z'
    },
    {
        id: '832',
        title: 'APIとは？',
        type: 'video',
        url: 'https://youtu.be/D4slpOz-7g4',
        category: 'デジタル基礎（必修）',
        duration: '04:26',
        createdAt: '2024-10-28T14:19:25.280Z'
    },
    {
        id: '831',
        title: 'データベースとは？',
        type: 'video',
        url: 'https://youtu.be/WsoDZcmwi4U',
        category: 'デジタル基礎（必修）',
        duration: '04:12',
        createdAt: '2024-10-28T14:19:25.274Z'
    },
    {
        id: '830',
        title: 'CPUとは？',
        type: 'video',
        url: 'https://youtu.be/AcFT9_KKlNs',
        category: 'デジタル基礎（必修）',
        duration: '05:15',
        createdAt: '2024-10-28T14:19:25.269Z'
    },
    {
        id: '829',
        title: 'メモリとは？',
        type: 'video',
        url: 'https://youtu.be/EWkJnopYioo',
        category: 'デジタル基礎（必修）',
        duration: '06:15',
        createdAt: '2024-10-28T14:19:25.263Z'
    },
    {
        id: '828',
        title: 'メモリ管理とは？',
        type: 'video',
        url: 'https://youtu.be/cUnFQCozOAA',
        category: 'デジタル基礎（必修）',
        duration: '05:42',
        createdAt: '2024-10-28T14:19:25.258Z'
    },
    {
        id: '827',
        title: 'ガベージコレクションとは？',
        type: 'video',
        url: 'https://youtu.be/0Htb_-S8M7k',
        category: 'デジタル基礎（必修）',
        duration: '05:50',
        createdAt: '2024-10-28T14:19:25.252Z'
    },
    {
        id: '826',
        title: 'GPUとは？',
        type: 'video',
        url: 'https://youtu.be/Nm19EhUQkB4',
        category: 'デジタル基礎（必修）',
        duration: '04:24',
        createdAt: '2024-10-28T14:19:25.246Z'
    },
    {
        id: '825',
        title: 'コンピュータの構成要素ってなに？',
        type: 'video',
        url: 'https://youtu.be/YF8p5ljat8w',
        category: 'デジタル基礎（必修）',
        duration: '04:52',
        createdAt: '2024-10-28T14:19:25.241Z'
    },
    {
        id: '824',
        title: 'HDD（ハードディスクドライブ）とは？',
        type: 'video',
        url: 'https://youtu.be/UyNnxg2tOHg',
        category: 'デジタル基礎（必修）',
        duration: '05:03',
        createdAt: '2024-10-28T14:19:25.235Z'
    },
    {
        id: '823',
        title: 'SSDとは？',
        type: 'video',
        url: 'https://youtu.be/s0GEzEWpGjg',
        category: 'デジタル基礎（必修）',
        duration: '04:53',
        createdAt: '2024-10-28T14:19:25.229Z'
    },
    {
        id: '822',
        title: 'クラウドとは？',
        type: 'video',
        url: 'https://youtu.be/EI-piFwG_N0',
        category: 'デジタル基礎（必修）',
        duration: '05:00',
        createdAt: '2024-10-28T14:19:25.223Z'
    },
    {
        id: '821',
        title: 'IaaS（イアース）とは？',
        type: 'video',
        url: 'https://youtu.be/HFUtjkG03EA',
        category: 'デジタル基礎（必修）',
        duration: '04:40',
        createdAt: '2024-10-28T14:19:25.217Z'
    },
    {
        id: '820',
        title: 'PaaS（パース）とは？',
        type: 'video',
        url: 'https://youtu.be/GdUKqfzvGCk',
        category: 'デジタル基礎（必修）',
        duration: '04:50',
        createdAt: '2024-10-28T14:19:25.211Z'
    },
    {
        id: '819',
        title: 'SaaS（サース）とは？',
        type: 'video',
        url: 'https://youtu.be/kruRscJujCA',
        category: 'デジタル基礎（必修）',
        duration: '05:00',
        createdAt: '2024-10-28T14:19:25.206Z'
    },
    {
        id: '818',
        title: 'AWSとは？',
        type: 'video',
        url: 'https://youtu.be/0czJqsWMWrM',
        category: 'デジタル基礎（必修）',
        duration: '05:19',
        createdAt: '2024-10-28T14:19:25.200Z'
    },
    {
        id: '817',
        title: 'GCPとは？',
        type: 'video',
        url: 'https://youtu.be/782OB_TIkBE',
        category: 'デジタル基礎（必修）',
        duration: '05:07',
        createdAt: '2024-10-28T14:19:25.195Z'
    },
    {
        id: '816',
        title: 'Azureとは？',
        type: 'video',
        url: 'https://youtu.be/NudwS2Bieuk',
        category: 'デジタル基礎（必修）',
        duration: '04:45',
        createdAt: '2024-10-28T14:19:25.189Z'
    },
    {
        id: '815',
        title: 'クラウドストレージとは？',
        type: 'video',
        url: 'https://youtu.be/2DaWVArOHUU',
        category: 'デジタル基礎（必修）',
        duration: '05:26',
        createdAt: '2024-10-28T14:19:25.184Z'
    },
    {
        id: '814',
        title: '第0回_マーケティングとは',
        type: 'video',
        url: 'https://youtu.be/kjE1BGQRgIk',
        category: 'マーケティング基礎',
        duration: '04:48',
        createdAt: '2024-10-28T14:19:25.178Z'
    },
    {
        id: '813',
        title: '第1回_マーケティングの４P',
        type: 'video',
        url: 'https://youtu.be/1Cl5TIiOQLs',
        category: 'マーケティング基礎',
        duration: '08:12',
        createdAt: '2024-10-28T14:19:25.173Z'
    },
    {
        id: '812',
        title: '第2回_マーケティングの４C',
        type: 'video',
        url: 'https://youtu.be/xlEAyoAqFVg',
        category: 'マーケティング基礎',
        duration: '04:56',
        createdAt: '2024-10-28T14:19:25.167Z'
    },
    {
        id: '811',
        title: '第3回_顧客ファースト',
        type: 'video',
        url: 'https://youtu.be/rhr-u5pCOcc',
        category: 'マーケティング基礎',
        duration: '02:35',
        createdAt: '2024-10-28T14:19:25.161Z'
    },
    {
        id: '810',
        title: '第4回_プロダクトライフサイクル',
        type: 'video',
        url: 'https://youtu.be/BBNXbdVhW4w',
        category: 'マーケティング基礎',
        duration: '03:14',
        createdAt: '2024-10-28T14:19:25.156Z'
    },
    {
        id: '809',
        title: '第5回_キャズム理論',
        type: 'video',
        url: 'https://youtu.be/ucm-MCZu0k4',
        category: 'マーケティング基礎',
        duration: '05:00',
        createdAt: '2024-10-28T14:19:25.150Z'
    },
    {
        id: '808',
        title: '第6回_コーポレートサイクル',
        type: 'video',
        url: 'https://youtu.be/pH23GhEzC5g',
        category: 'マーケティング基礎',
        duration: '03:57',
        createdAt: '2024-10-28T14:19:25.144Z'
    },
    {
        id: '807',
        title: '第7回_人間理解',
        type: 'video',
        url: 'https://youtu.be/7UEOJNqS81Y',
        category: 'マーケティング基礎',
        duration: '04:00',
        createdAt: '2024-10-28T14:19:25.138Z'
    },
    {
        id: '806',
        title: '第8回_SWOT分析',
        type: 'video',
        url: 'https://youtu.be/kl9N9X3hFio',
        category: 'マーケティング基礎',
        duration: '04:06',
        createdAt: '2024-10-28T14:19:25.132Z'
    },
    {
        id: '805',
        title: '第9回_ポジショニング戦略',
        type: 'video',
        url: 'https://youtu.be/7tmHqM25WQw',
        category: 'マーケティング基礎',
        duration: '03:19',
        createdAt: '2024-10-28T14:19:25.126Z'
    },
    {
        id: '804',
        title: '第10回_3C分析',
        type: 'video',
        url: 'https://youtu.be/3A9ixxu1gZs',
        category: 'マーケティング基礎',
        duration: '04:19',
        createdAt: '2024-10-28T14:19:25.121Z'
    },
    {
        id: '803',
        title: '情報セキュリティとは？',
        type: 'video',
        url: 'https://youtu.be/cPP1xt2xJ4A',
        category: '情報セキュリティ',
        duration: '05:03',
        createdAt: '2024-10-28T14:19:25.115Z'
    },
    {
        id: '802',
        title: '暗号化とは？',
        type: 'video',
        url: 'https://youtu.be/WhcA4m4qfDQ',
        category: '情報セキュリティ',
        duration: '04:59',
        createdAt: '2024-10-28T14:19:25.109Z'
    },
    {
        id: '801',
        title: '共通鍵暗号方式とは？',
        type: 'video',
        url: 'https://youtu.be/3QXQLNT6itg',
        category: '情報セキュリティ',
        duration: '04:26',
        createdAt: '2024-10-28T14:19:25.103Z'
    },
    {
        id: '800',
        title: '公開鍵暗号方式とは？',
        type: 'video',
        url: 'https://youtu.be/t7LWWkGmeP8',
        category: '情報セキュリティ',
        duration: '05:22',
        createdAt: '2024-10-28T14:19:25.098Z'
    },
    {
        id: '799',
        title: 'スパムメールとは？',
        type: 'video',
        url: 'https://youtu.be/7s1wCOaRjvk',
        category: '情報セキュリティ',
        duration: '04:31',
        createdAt: '2024-10-28T14:19:25.092Z'
    },
    {
        id: '798',
        title: 'サイバー攻撃とは？',
        type: 'video',
        url: 'https://youtu.be/Tx2wOby3wqE',
        category: '情報セキュリティ',
        duration: '04:33',
        createdAt: '2024-10-28T14:19:25.086Z'
    },
    {
        id: '797',
        title: 'セキュリティ対策とは？',
        type: 'video',
        url: 'https://youtu.be/ps5k_saIm4s',
        category: '情報セキュリティ',
        duration: '05:04',
        createdAt: '2024-10-28T14:19:25.081Z'
    },
    {
        id: '796',
        title: 'ファイアウォールとは？',
        type: 'video',
        url: 'https://youtu.be/d4VtNRFYmpg',
        category: '情報セキュリティ',
        duration: '04:00',
        createdAt: '2024-10-28T14:19:25.075Z'
    },
    {
        id: '795',
        title: '公衆無線LANについて',
        type: 'video',
        url: 'https://youtu.be/dOdvS2tEnHg',
        category: '情報セキュリティ',
        duration: '05:33',
        createdAt: '2024-10-28T14:19:25.069Z'
    },
    {
        id: '794',
        title: 'さまざまな公衆無線LANサービス',
        type: 'video',
        url: 'https://youtu.be/9JVp2b9BALs',
        category: '情報セキュリティ',
        duration: '04:02',
        createdAt: '2024-10-28T14:19:25.063Z'
    },
    {
        id: '793',
        title: 'Wi-Fiの接続と暗号化の仕組み',
        type: 'video',
        url: 'https://youtu.be/wFTDfExo28k',
        category: '情報セキュリティ',
        duration: '04:02',
        createdAt: '2024-10-28T14:19:25.058Z'
    },
    {
        id: '792',
        title: '安全なWeb利用の方法',
        type: 'video',
        url: 'https://youtu.be/sgIIWHRptJw',
        category: '情報セキュリティ',
        duration: '03:46',
        createdAt: '2024-10-28T14:19:25.052Z'
    },
    {
        id: '791',
        title: 'VPNとは？',
        type: 'video',
        url: 'https://youtu.be/ivUD-tDeDR8',
        category: '情報セキュリティ',
        duration: '02:17',
        createdAt: '2024-10-28T14:19:25.046Z'
    },
    {
        id: '790',
        title: 'より安全・安心にWi-Fiを使うために',
        type: 'video',
        url: 'https://youtu.be/ZtMENv3SH4g',
        category: '情報セキュリティ',
        duration: '03:37',
        createdAt: '2024-10-28T14:19:25.040Z'
    },
    {
        id: '789',
        title: '無線LAN利用時に注意すべき３つのポイント',
        type: 'video',
        url: 'https://youtu.be/FiBT-EdNoc8',
        category: '情報セキュリティ',
        duration: '04:05',
        createdAt: '2024-10-28T14:19:25.034Z'
    },
    {
        id: '788',
        title: 'こんなにある無線LAN（Wi-Fi）',
        type: 'video',
        url: 'https://youtu.be/Zb39jrOhJ4E',
        category: '情報セキュリティ',
        duration: '04:20',
        createdAt: '2024-10-28T14:19:25.028Z'
    },
    {
        id: '787',
        title: 'Wi-Fiはこうやって繋がっている',
        type: 'video',
        url: 'https://youtu.be/IMB8wfiXYZ0',
        category: '情報セキュリティ',
        duration: '02:54',
        createdAt: '2024-10-28T14:19:25.023Z'
    },
    {
        id: '786',
        title: 'Wi-Fi利用－自宅編－',
        type: 'video',
        url: 'https://youtu.be/gl5NYgPZTH8',
        category: '情報セキュリティ',
        duration: '01:50',
        createdAt: '2024-10-28T14:19:25.017Z'
    },
    {
        id: '785',
        title: 'Wi-Fi利用－オフィス編－',
        type: 'video',
        url: 'https://youtu.be/kj0SbTMxNHQ',
        category: '情報セキュリティ',
        duration: '02:37',
        createdAt: '2024-10-28T14:19:25.011Z'
    },
    {
        id: '784',
        title: 'Wi-Fi利用－外出先編－',
        type: 'video',
        url: 'https://youtu.be/aB2A4Ha-YS4',
        category: '情報セキュリティ',
        duration: '03:28',
        createdAt: '2024-10-28T14:19:25.005Z'
    },
    {
        id: '783',
        title: '動画制作セミナー',
        type: 'video',
        url: 'https://youtu.be/mq_LnVrc5xw',
        category: '動画制作',
        duration: '38:17',
        createdAt: '2024-10-28T14:19:25.000Z'
    },
    {
        id: '782',
        title: 'AI活用〜AIについて〜',
        type: 'video',
        url: 'https://youtu.be/9NeeFfOsLSw',
        category: 'AI活用',
        duration: '14:37',
        createdAt: '2024-10-28T14:19:24.994Z'
    },
    {
        id: '781',
        title: 'AI活用〜実際のAIツールを見てみよう１〜',
        type: 'video',
        url: 'https://youtu.be/hV1T9CTfG4Q',
        category: 'AI活用',
        duration: '20:55',
        createdAt: '2024-10-28T14:19:24.989Z'
    },
    {
        id: '780',
        title: 'AI活用〜実際のAIツールを見てみよう２〜',
        type: 'video',
        url: 'https://youtu.be/mY7Gs3W4ofw',
        category: 'AI活用',
        duration: '23:00',
        createdAt: '2024-10-28T14:19:24.983Z'
    },
    {
        id: '779',
        title: 'アプリ制作１〜一言掲示板アプリ〜',
        type: 'video',
        url: 'https://youtu.be/wk21wfcmxsg',
        category: 'アプリ開発①（モバイルアプリ）',
        duration: '1:09:42',
        createdAt: '2024-10-28T14:19:24.978Z'
    },
    {
        id: '778',
        title: 'アプリ制作２〜タスク管理アプリ〜',
        type: 'video',
        url: 'https://youtu.be/Qwfq7TgYyhQ',
        category: 'アプリ開発①（モバイルアプリ）',
        duration: '1:05:24',
        createdAt: '2024-10-28T14:19:24.972Z'
    },
    {
        id: '777',
        title: 'Googleクローム',
        type: 'video',
        url: 'https://youtu.be/Pi5daIiFGKw',
        category: 'Google基礎',
        duration: '05:36',
        createdAt: '2024-10-28T14:19:24.967Z'
    },
    {
        id: '776',
        title: 'Googleスライド',
        type: 'video',
        url: 'https://youtu.be/I4a3tAOJBDc',
        category: 'Google基礎',
        duration: '04:01',
        createdAt: '2024-10-28T14:19:24.961Z'
    },
    {
        id: '775',
        title: 'Googleドキュメント',
        type: 'video',
        url: 'https://youtu.be/3mY183OzOIY',
        category: 'Google基礎',
        duration: '02:33',
        createdAt: '2024-10-28T14:19:24.955Z'
    },
    {
        id: '774',
        title: 'Googleスプレッドシート',
        type: 'video',
        url: 'https://youtu.be/oMsEmiAbOdc',
        category: 'Google基礎',
        duration: '02:59',
        createdAt: '2024-10-28T14:19:24.950Z'
    },
    {
        id: '773',
        title: 'Googleフォーム',
        type: 'video',
        url: 'https://youtu.be/ZyzdmnkO8aE',
        category: 'Google基礎',
        duration: '08:21',
        createdAt: '2024-10-28T14:19:24.944Z'
    },
    {
        id: '772',
        title: 'アプリ制作１〜顧客管理システム導入編〜',
        type: 'video',
        url: 'https://youtu.be/NaQTsVGMTkg',
        category: 'アプリ開発②（業務管理）',
        duration: '19:29',
        createdAt: '2024-10-28T14:19:24.938Z'
    },
    {
        id: '771',
        title: 'アプリ制作２〜顧客管理システム実装１〜',
        type: 'video',
        url: 'https://youtu.be/PO5eSxUHymw',
        category: 'アプリ開発②（業務管理）',
        duration: '21:36',
        createdAt: '2024-10-28T14:19:24.932Z'
    },
    {
        id: '770',
        title: 'アプリ制作３〜顧客管理システム実装２〜',
        type: 'video',
        url: 'https://youtu.be/84kqzOv6DIs',
        category: 'アプリ開発②（業務管理）',
        duration: '21:42',
        createdAt: '2024-10-28T14:19:24.926Z'
    },
    {
        id: '769',
        title: 'Elementor更新情報',
        type: 'video',
        url: 'https://youtu.be/RkLRt60wzu8',
        category: 'HP制作',
        duration: '22:01',
        createdAt: '2024-10-28T14:19:24.915Z'
    },
    {
        id: '768',
        title: 'Google基礎 - アカウント作成 -',
        type: 'video',
        url: 'https://youtu.be/6jQWLg70xvc',
        category: 'Google基礎',
        duration: '04:09',
        createdAt: '2024-10-28T14:19:24.908Z'
    },
    {
        id: '767',
        title: 'Google基礎 - アカウントの基本操作 -',
        type: 'video',
        url: 'https://youtu.be/j17DH4kiFyY',
        category: 'Google基礎',
        duration: '05:14',
        createdAt: '2024-10-28T14:19:24.903Z'
    },
    {
        id: '766',
        title: 'Google基礎 - 制作練習 -',
        type: 'video',
        url: 'https://youtu.be/Uo-ZYq8oo_U',
        category: 'Google基礎',
        duration: '32:12',
        createdAt: '2024-10-28T14:19:24.897Z'
    },
    {
        id: '765',
        title: '①概要説明',
        type: 'video',
        url: 'https://youtu.be/Jj7IFbEnMmI',
        category: 'Google Apps Script',
        duration: '05:12',
        createdAt: '2024-10-28T14:19:24.891Z'
    },
    {
        id: '764',
        title: '②活用事例',
        type: 'video',
        url: 'https://youtu.be/yaANPlGbRxw',
        category: 'Google Apps Script',
        duration: '13:16',
        createdAt: '2024-10-28T14:19:24.885Z'
    },
    {
        id: '763',
        title: '③-1 Gmail→スプレッドシート①',
        type: 'video',
        url: 'https://youtu.be/4czu0cMQ5-U',
        category: 'Google Apps Script',
        duration: '05:46',
        createdAt: '2024-10-28T14:19:24.880Z'
    },
    {
        id: '762',
        title: '③-1 Gmail→スプレッドシート②',
        type: 'video',
        url: 'https://youtu.be/iI3vYusBr8c',
        category: 'Google Apps Script',
        duration: '07:40',
        createdAt: '2024-10-28T14:19:24.874Z'
    },
    {
        id: '761',
        title: '③-2 Gmail→Google ドライブ①',
        type: 'video',
        url: 'https://youtu.be/YdYm0XtY5jk',
        category: 'Google Apps Script',
        duration: '04:30',
        createdAt: '2024-10-28T14:19:24.869Z'
    },
    {
        id: '760',
        title: '③-2 Gmail→Google ドライブ②',
        type: 'video',
        url: 'https://youtu.be/lZVVeRRsNsU',
        category: 'Google Apps Script',
        duration: '07:52',
        createdAt: '2024-10-28T14:19:24.863Z'
    },
    {
        id: '759',
        title: 'Adalo〜SNS＆マッチングアプリ〜1',
        type: 'video',
        url: 'https://youtu.be/gd0QbMN6-Kk',
        category: 'アプリ開発①（モバイルアプリ）',
        duration: '1:23:10',
        createdAt: '2024-10-28T14:19:24.858Z'
    },
    {
        id: '758',
        title: '業務自動化ツール',
        type: 'video',
        url: 'https://youtu.be/3n9fCvkmbR8',
        category: '業務自動化',
        duration: '25:09',
        createdAt: '2024-10-28T14:19:24.852Z'
    },
    {
        id: '757',
        title: 'Adalo〜SNS＆マッチングアプリ〜2',
        type: 'video',
        url: 'https://youtu.be/OYY_vK9z3zc',
        category: 'アプリ開発①（モバイルアプリ）',
        duration: '1:17:58',
        createdAt: '2024-10-28T14:19:24.846Z'
    },
];

export const ALL_CURRICULUMS: CurriculumDef[] = [
    {
        id: '26',
        title: '',
        description: '',
        courseCount: 0,
        lessons: [
        ]
    },
    {
        id: '25',
        title: '',
        description: '',
        courseCount: 0,
        lessons: [
        ]
    },
    {
        id: '24',
        title: '',
        description: '',
        courseCount: 0,
        lessons: [
        ]
    },
    {
        id: '23',
        title: '',
        description: '',
        courseCount: 0,
        lessons: [
        ]
    },
    {
        id: '22',
        title: '',
        description: '',
        courseCount: 0,
        lessons: [
        ]
    },
    {
        id: '21',
        title: '',
        description: '',
        courseCount: 0,
        lessons: [
        ]
    },
    {
        id: '20',
        title: '',
        description: '',
        courseCount: 0,
        lessons: [
        ]
    },
    {
        id: '19',
        title: '',
        description: '',
        courseCount: 0,
        lessons: [
        ]
    },
    {
        id: '18',
        title: '',
        description: '',
        courseCount: 0,
        lessons: [
        ]
    },
    {
        id: '17',
        title: '',
        description: '',
        courseCount: 0,
        lessons: [
        ]
    },
    {
        id: '16',
        title: 'リスキル大学講座アーカイブ',
        description: 'リスキル大学の講座のアーカイブになります。',
        courseCount: 18,
        lessons: [
            {
                id: '1096',
                title: '2026/01/14_サラリーマンから独立する技術',
                type: 'video',
                url: 'https://youtu.be/W2dqWtRtVMg',
                category: 'リスキル大学講座アーカイブ',
                duration: '1:02:45',
                createdAt: '2026-01-17T06:49:09.089Z'
            },
            {
                id: '1095',
                title: '2026/01/05_第３講　年収1,000万円を超えるクリエイターになるために＿_仕事とは、これからのクリエイティブについて その1',
                type: 'video',
                url: 'https://youtu.be/M86ArrVSSFE',
                category: 'リスキル大学講座アーカイブ',
                duration: '52:46',
                createdAt: '2026-01-13T08:25:38.669Z'
            },
            {
                id: '1094',
                title: '2026/01/09_マネーリテラシー',
                type: 'video',
                url: 'https://youtu.be/Y3ZNnYNtaIo',
                category: 'リスキル大学講座アーカイブ',
                duration: '1:00:49',
                createdAt: '2026-01-10T07:18:33.167Z'
            },
            {
                id: '1093',
                title: '2025/12/23_第２講　年収1,000万円を超えるクリエイターになるために＿_経営者になるということ',
                type: 'video',
                url: 'https://youtu.be/hrAOXCuaMOg',
                category: 'リスキル大学講座アーカイブ',
                duration: '51:22',
                createdAt: '2026-01-03T08:21:24.675Z'
            },
            {
                id: '1092',
                title: '2025/12/22_副業で活躍！AIバックオフィス実践セミナー〜Lark×業務効率化で今、必要とされる人材に！〜',
                type: 'video',
                url: 'https://youtu.be/HgFP79PRPVQ',
                category: 'リスキル大学講座アーカイブ',
                duration: '1:28:53',
                createdAt: '2025-12-29T06:00:26.610Z'
            },
            {
                id: '1091',
                title: '2025/12/17_学んで損なし！Webライター入門編',
                type: 'video',
                url: 'https://youtu.be/bvxgjw1xg14',
                category: 'リスキル大学講座アーカイブ',
                duration: '1:07:40',
                createdAt: '2025-12-24T11:19:54.194Z'
            },
            {
                id: '1090',
                title: '2025/12/151.年収1000万円を超えるクリエイターになるために-事業を興すということ、年収1000万円の壁-',
                type: 'video',
                url: 'https://youtu.be/Y3609WHXFGM',
                category: 'リスキル大学講座アーカイブ',
                duration: '1:00:23',
                createdAt: '2025-12-24T06:09:42.982Z'
            },
            {
                id: '1085',
                title: '2025/12/08年収1000万円を超えるクリエイターになるために',
                type: 'video',
                url: 'https://youtu.be/F4cfeyTB0TM',
                category: 'リスキル大学講座アーカイブ',
                duration: '1:25:20',
                createdAt: '2025-12-10T10:28:55.897Z'
            },
            {
                id: '1084',
                title: '2025/12/03未来をデザイン！ライフデザインセミナー',
                type: 'video',
                url: 'https://youtu.be/moIS19siYyE',
                category: 'リスキル大学講座アーカイブ',
                duration: '57:00',
                createdAt: '2025-12-06T07:17:59.561Z'
            },
            {
                id: '1083',
                title: '2025/11/19愛されマインド',
                type: 'video',
                url: 'https://youtu.be/4dJARs75jg0',
                category: 'リスキル大学講座アーカイブ',
                duration: '1:05:28',
                createdAt: '2025-11-25T08:19:32.800Z'
            },
            {
                id: '1082',
                title: '2025/11/08見方を変えれば、世界が変わる。〜デザイン思考で【デザイナーの目】を手に入れる120分〜 ',
                type: 'video',
                url: 'https://youtu.be/Y6Zd3e0t1uw',
                category: 'リスキル大学講座アーカイブ',
                duration: '1:15:59',
                createdAt: '2025-11-19T07:21:20.079Z'
            },
            {
                id: '1081',
                title: '2025/11/10超好印象アップ-1分自己紹介と第一印象アップトレーニング-',
                type: 'video',
                url: 'https://youtu.be/8wq6OW2CeQA',
                category: 'リスキル大学講座アーカイブ',
                duration: '44:02',
                createdAt: '2025-11-14T05:13:37.585Z'
            },
            {
                id: '1080',
                title: '2025/11/05あなたのキャリアの探し方',
                type: 'video',
                url: 'https://youtu.be/jLS9B3YQBBE',
                category: 'リスキル大学講座アーカイブ',
                duration: '1:00:53',
                createdAt: '2025-11-14T01:41:14.902Z'
            },
            {
                id: '1079',
                title: '2025/10/31ショート動画の作り方講座',
                type: 'video',
                url: 'https://youtu.be/Kof3ujUEIbk',
                category: 'リスキル大学講座アーカイブ',
                duration: '59:46',
                createdAt: '2025-11-13T02:27:05.286Z'
            },
            {
                id: '1078',
                title: '2025/11/08見方を変えれば、世界が変わる。〜デザイン思考で【デザイナーの目】を手に入れる120分〜 ',
                type: 'video',
                url: 'https://youtu.be/Y6Zd3e0t1uw',
                category: 'リスキル大学講座アーカイブ',
                duration: '1:15:59',
                createdAt: '2025-11-10T13:34:08.311Z'
            },
            {
                id: '1077',
                title: '2025/10/18たった一回で劇的に！お金の扱い方が変わる未来投資',
                type: 'video',
                url: 'https://youtu.be/A-xEnlOB0-Y',
                category: 'リスキル大学講座アーカイブ',
                duration: '1:14:16',
                createdAt: '2025-10-26T04:34:45.065Z'
            },
            {
                id: '1076',
                title: '2025/10/23最新AI活用戦略',
                type: 'video',
                url: 'https://youtu.be/srzfgDRG4Ew',
                category: 'リスキル大学講座アーカイブ',
                duration: '52:34',
                createdAt: '2025-10-25T09:56:07.530Z'
            },
            {
                id: '1075',
                title: '2025/10/15リスキル大学開講記念「リスキル大学」について',
                type: 'video',
                url: 'https://youtu.be/EPrvQQ5_m6M',
                category: 'リスキル大学講座アーカイブ',
                duration: '1:03:26',
                createdAt: '2025-10-24T03:48:19.972Z'
            },
        ]
    },
    {
        id: '15',
        title: 'ITパスポート',
        description: 'ITパスポート試験の資格取得支援動画です。',
        courseCount: 175,
        lessons: [
            {
                id: '1068',
                title: '企業活動：経営・組織論①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=yFJNZ-0CG5U',
                category: 'ITパスポート',
                duration: '05:06',
                createdAt: '2024-10-28T14:19:26.646Z'
            },
            {
                id: '1067',
                title: '企業活動：経営・組織論②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=3tYr-Zav6Ls',
                category: 'ITパスポート',
                duration: '03:26',
                createdAt: '2024-10-28T14:19:26.640Z'
            },
            {
                id: '1066',
                title: '企業活動：経営・組織論③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=uWhrTQhvjXY',
                category: 'ITパスポート',
                duration: '06:04',
                createdAt: '2024-10-28T14:19:26.635Z'
            },
            {
                id: '1065',
                title: '企業活動：業務分析・データ利活用①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=d3injoNKz2M',
                category: 'ITパスポート',
                duration: '04:09',
                createdAt: '2024-10-28T14:19:26.629Z'
            },
            {
                id: '1064',
                title: '企業活動：業務分析・データ利活用②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=AASnikS0KnU',
                category: 'ITパスポート',
                duration: '02:30',
                createdAt: '2024-10-28T14:19:26.623Z'
            },
            {
                id: '1063',
                title: '企業活動：業務分析・データ利活用③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=2BSwG2pLGvg',
                category: 'ITパスポート',
                duration: '03:39',
                createdAt: '2024-10-28T14:19:26.617Z'
            },
            {
                id: '1062',
                title: '企業活動：業務分析・データ利活用④',
                type: 'video',
                url: 'https://youtube.com/watch?v=1DwSO-7FqzQ',
                category: 'ITパスポート',
                duration: '03:34',
                createdAt: '2024-10-28T14:19:26.612Z'
            },
            {
                id: '1061',
                title: '企業活動：会計・財務',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=mysS6TTJhuM',
                category: 'ITパスポート',
                duration: '03:36',
                createdAt: '2024-10-28T14:19:26.606Z'
            },
            {
                id: '1060',
                title: '法務：知的財産権①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=6vscpAQoLuM',
                category: 'ITパスポート',
                duration: '03:25',
                createdAt: '2024-10-28T14:19:26.600Z'
            },
            {
                id: '1059',
                title: '法務：知的財産権②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=M8cuR502JSE',
                category: 'ITパスポート',
                duration: '02:42',
                createdAt: '2024-10-28T14:19:26.594Z'
            },
            {
                id: '1058',
                title: '法務：知的財産権③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=ISYQXSatorY',
                category: 'ITパスポート',
                duration: '04:52',
                createdAt: '2024-10-28T14:19:26.589Z'
            },
            {
                id: '1057',
                title: '法務：知的財産権④',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=Hot8yeZJggE',
                category: 'ITパスポート',
                duration: '04:36',
                createdAt: '2024-10-28T14:19:26.582Z'
            },
            {
                id: '1056',
                title: '法務：セキュリティ関連法規①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=irGf4wQ-4kc',
                category: 'ITパスポート',
                duration: '03:58',
                createdAt: '2024-10-28T14:19:26.577Z'
            },
            {
                id: '1055',
                title: '法務：セキュリティ関連法規②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=e1PgHfXhDgw',
                category: 'ITパスポート',
                duration: '02:05',
                createdAt: '2024-10-28T14:19:26.571Z'
            },
            {
                id: '1054',
                title: '法務：セキュリティ関連法規③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=OxGVYZrrchQ',
                category: 'ITパスポート',
                duration: '04:22',
                createdAt: '2024-10-28T14:19:26.565Z'
            },
            {
                id: '1053',
                title: '法務：セキュリティ関連法規④',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=HV7maxvssO0',
                category: 'ITパスポート',
                duration: '02:56',
                createdAt: '2024-10-28T14:19:26.559Z'
            },
            {
                id: '1052',
                title: '法務：セキュリティ関連法規⑤',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=ONZMGy3boqM',
                category: 'ITパスポート',
                duration: '02:36',
                createdAt: '2024-10-28T14:19:26.553Z'
            },
            {
                id: '1051',
                title: '法務：セキュリティ関連法規⑥',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=PBpNMENak2w',
                category: 'ITパスポート',
                duration: '04:25',
                createdAt: '2024-10-28T14:19:26.548Z'
            },
            {
                id: '1050',
                title: '法務：労働関連・取引関連法規①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=nD7MmFmyETA',
                category: 'ITパスポート',
                duration: '03:59',
                createdAt: '2024-10-28T14:19:26.542Z'
            },
            {
                id: '1049',
                title: '法務：労働関連・取引関連法規②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=IhWczC5I5nI',
                category: 'ITパスポート',
                duration: '03:52',
                createdAt: '2024-10-28T14:19:26.536Z'
            },
            {
                id: '1048',
                title: '法務：その他の法律・ガイドライン・情報論理①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=bLzKGajyFoc',
                category: 'ITパスポート',
                duration: '02:47',
                createdAt: '2024-10-28T14:19:26.530Z'
            },
            {
                id: '1047',
                title: '法務：その他の法律・ガイドライン・情報論理②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=41s17t8emRA',
                category: 'ITパスポート',
                duration: '04:23',
                createdAt: '2024-10-28T14:19:26.524Z'
            },
            {
                id: '1046',
                title: '法務：その他の法律・ガイドライン・情報論理③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=nYoZQaZNU-c',
                category: 'ITパスポート',
                duration: '04:34',
                createdAt: '2024-10-28T14:19:26.518Z'
            },
            {
                id: '1045',
                title: '法務：その他の法律・ガイドライン・情報論理④',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=oxkoK_8CLMM',
                category: 'ITパスポート',
                duration: '03:13',
                createdAt: '2024-10-28T14:19:26.512Z'
            },
            {
                id: '1044',
                title: '法務：標準化関連①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=6tB0PhehL8I',
                category: 'ITパスポート',
                duration: '03:20',
                createdAt: '2024-10-28T14:19:26.507Z'
            },
            {
                id: '1043',
                title: '法務：標準化関連②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=HBYqKbXthRM',
                category: 'ITパスポート',
                duration: '03:59',
                createdAt: '2024-10-28T14:19:26.501Z'
            },
            {
                id: '1042',
                title: '法務：標準化関連③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=RSSnmJsDink',
                category: 'ITパスポート',
                duration: '03:18',
                createdAt: '2024-10-28T14:19:26.495Z'
            },
            {
                id: '1041',
                title: '経営戦略マネジメント：経営戦略手法①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=X_XwrBMBhkc',
                category: 'ITパスポート',
                duration: '04:49',
                createdAt: '2024-10-28T14:19:26.489Z'
            },
            {
                id: '1040',
                title: '経営戦略マネジメント：経営戦略手法②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=ENZv81eDv4k',
                category: 'ITパスポート',
                duration: '03:15',
                createdAt: '2024-10-28T14:19:26.483Z'
            },
            {
                id: '1039',
                title: '経営戦略マネジメント：マーケティング①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=hOP6nXicKzQ',
                category: 'ITパスポート',
                duration: '04:33',
                createdAt: '2024-10-28T14:19:26.478Z'
            },
            {
                id: '1038',
                title: '経営戦略マネジメント：マーケティング②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=g3ATO0nW9kM',
                category: 'ITパスポート',
                duration: '03:44',
                createdAt: '2024-10-28T14:19:26.472Z'
            },
            {
                id: '1037',
                title: '経営戦略マネジメント：マーケティング③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=HlOOuLiByCI',
                category: 'ITパスポート',
                duration: '03:37',
                createdAt: '2024-10-28T14:19:26.466Z'
            },
            {
                id: '1036',
                title: '経営戦略マネジメント：マーケティング④',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=97ox6q00gSc',
                category: 'ITパスポート',
                duration: '03:46',
                createdAt: '2024-10-28T14:19:26.460Z'
            },
            {
                id: '1035',
                title: '経営戦略マネジメント：ビジネス戦略と目標・評価',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=dueEwdyG7y0',
                category: 'ITパスポート',
                duration: '03:28',
                createdAt: '2024-10-28T14:19:26.455Z'
            },
            {
                id: '1034',
                title: '経営戦略マネジメント：経営管理システム',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=LVIEce4DY1w',
                category: 'ITパスポート',
                duration: '03:53',
                createdAt: '2024-10-28T14:19:26.449Z'
            },
            {
                id: '1033',
                title: '技術戦略マネジメント：技術開発戦略の立案・技術開発計画',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=SV5TxWCy4pM',
                category: 'ITパスポート',
                duration: '06:19',
                createdAt: '2024-10-28T14:19:26.443Z'
            },
            {
                id: '1032',
                title: 'ビジネスインダストリ：ビジネスシステム①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=5SKBIbdtuEg',
                category: 'ITパスポート',
                duration: '04:01',
                createdAt: '2024-10-28T14:19:26.437Z'
            },
            {
                id: '1031',
                title: 'ビジネスインダストリ：ビジネスシステム②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=624kKv2EqaI',
                category: 'ITパスポート',
                duration: '03:23',
                createdAt: '2024-10-28T14:19:26.431Z'
            },
            {
                id: '1030',
                title: 'ビジネスインダストリ：ビジネスシステム③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=ARAY1gcVFiA',
                category: 'ITパスポート',
                duration: '03:38',
                createdAt: '2024-10-28T14:19:26.426Z'
            },
            {
                id: '1029',
                title: 'ビジネスインダストリ：ビジネスシステム④',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=4v5RGaOz9vM',
                category: 'ITパスポート',
                duration: '04:06',
                createdAt: '2024-10-28T14:19:26.420Z'
            },
            {
                id: '1028',
                title: 'ビジネスインダストリ：エンジニアリングシステム①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=d0eq5BILQSw',
                category: 'ITパスポート',
                duration: '04:38',
                createdAt: '2024-10-28T14:19:26.414Z'
            },
            {
                id: '1027',
                title: 'ビジネスインダストリ：エンジニアリングシステム②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=9gDtjBOLrzg',
                category: 'ITパスポート',
                duration: '03:53',
                createdAt: '2024-10-28T14:19:26.408Z'
            },
            {
                id: '1026',
                title: 'ビジネスインダストリ：e-ビジネス①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=u7i6Gxs6Jsw',
                category: 'ITパスポート',
                duration: '03:23',
                createdAt: '2024-10-28T14:19:26.402Z'
            },
            {
                id: '1025',
                title: 'ビジネスインダストリ：e-ビジネス②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=AeS8RAos780',
                category: 'ITパスポート',
                duration: '03:07',
                createdAt: '2024-10-28T14:19:26.396Z'
            },
            {
                id: '1024',
                title: 'ビジネスインダストリ：IoTシステム・組込みシステム①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=GkrvbcCdsnQ',
                category: 'ITパスポート',
                duration: '03:58',
                createdAt: '2024-10-28T14:19:26.390Z'
            },
            {
                id: '1023',
                title: 'ビジネスインダストリ：IoTシステム・組込みシステム②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=V-SGOd6XaRs',
                category: 'ITパスポート',
                duration: '03:49',
                createdAt: '2024-10-28T14:19:26.385Z'
            },
            {
                id: '1022',
                title: 'システム戦略：情報システム戦略①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=1Mdu89ADKk0',
                category: 'ITパスポート',
                duration: '03:10',
                createdAt: '2024-10-28T14:19:26.379Z'
            },
            {
                id: '1021',
                title: 'システム戦略：情報システム戦略②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=aBctwbHni98',
                category: 'ITパスポート',
                duration: '03:56',
                createdAt: '2024-10-28T14:19:26.373Z'
            },
            {
                id: '1020',
                title: 'システム戦略：業務プロセス①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=xwitLwTKl4E',
                category: 'ITパスポート',
                duration: '04:27',
                createdAt: '2024-10-28T14:19:26.367Z'
            },
            {
                id: '1019',
                title: 'システム戦略：業務プロセス②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=bEmzk1M9CDo',
                category: 'ITパスポート',
                duration: '02:46',
                createdAt: '2024-10-28T14:19:26.362Z'
            },
            {
                id: '1018',
                title: 'システム戦略：業務プロセス③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=lINmh1NVGyk',
                category: 'ITパスポート',
                duration: '04:42',
                createdAt: '2024-10-28T14:19:26.356Z'
            },
            {
                id: '1017',
                title: 'システム戦略：ソリューションビジネス①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=6lyLMQ4eIho',
                category: 'ITパスポート',
                duration: '03:46',
                createdAt: '2024-10-28T14:19:26.350Z'
            },
            {
                id: '1016',
                title: 'システム戦略：ソリューションビジネス②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=KO2bm6adjUc',
                category: 'ITパスポート',
                duration: '04:42',
                createdAt: '2024-10-28T14:19:26.344Z'
            },
            {
                id: '1015',
                title: 'システム戦略：システム活用促進・評価①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=gpcCZ4232-U',
                category: 'ITパスポート',
                duration: '03:56',
                createdAt: '2024-10-28T14:19:26.339Z'
            },
            {
                id: '1014',
                title: 'システム戦略：システム活用促進・評価②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=8hjOnQN3IT8',
                category: 'ITパスポート',
                duration: '03:22',
                createdAt: '2024-10-28T14:19:26.333Z'
            },
            {
                id: '1013',
                title: 'システム戦略：システム活用促進・評価③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=VtAmxu0aKPs',
                category: 'ITパスポート',
                duration: '03:40',
                createdAt: '2024-10-28T14:19:26.327Z'
            },
            {
                id: '1012',
                title: 'システム企画：システム化計画',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=3rc_6q2KBfI',
                category: 'ITパスポート',
                duration: '02:59',
                createdAt: '2024-10-28T14:19:26.322Z'
            },
            {
                id: '1011',
                title: 'システム企画：要件定義',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=Ljriqutrsy4',
                category: 'ITパスポート',
                duration: '02:48',
                createdAt: '2024-10-28T14:19:26.316Z'
            },
            {
                id: '1010',
                title: 'システム企画：調達計画・実施①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=js83PU0wSmc',
                category: 'ITパスポート',
                duration: '02:43',
                createdAt: '2024-10-28T14:19:26.310Z'
            },
            {
                id: '1009',
                title: 'システム企画：調達計画・実施②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=i-Z08SlGbqI',
                category: 'ITパスポート',
                duration: '03:37',
                createdAt: '2024-10-28T14:19:26.304Z'
            },
            {
                id: '1008',
                title: 'システム企画：調達計画・実施③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=l4qkj_0qMmU',
                category: 'ITパスポート',
                duration: '02:49',
                createdAt: '2024-10-28T14:19:26.298Z'
            },
            {
                id: '1007',
                title: 'システム企画：調達計画・実施④',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=grE8Ic9UDyI',
                category: 'ITパスポート',
                duration: '03:26',
                createdAt: '2024-10-28T14:19:26.292Z'
            },
            {
                id: '1006',
                title: 'システム企画：調達計画・実施⑤',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=9OSOYWkiafQ',
                category: 'ITパスポート',
                duration: '03:33',
                createdAt: '2024-10-28T14:19:26.286Z'
            },
            {
                id: '1005',
                title: 'システム開発技術：システム開発技術①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=Ia_kQi_IlPM',
                category: 'ITパスポート',
                duration: '04:45',
                createdAt: '2024-10-28T14:19:26.280Z'
            },
            {
                id: '1004',
                title: 'システム開発技術：システム開発技術②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=QNnlyMANGEE',
                category: 'ITパスポート',
                duration: '04:04',
                createdAt: '2024-10-28T14:19:26.275Z'
            },
            {
                id: '1003',
                title: 'ソフトウェア開発管理技術：開発プロセス・手法①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=iUXFMibTSHI',
                category: 'ITパスポート',
                duration: '02:57',
                createdAt: '2024-10-28T14:19:26.269Z'
            },
            {
                id: '1002',
                title: 'ソフトウェア開発管理技術：開発プロセス・手法②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=oWqPVodLC_w',
                category: 'ITパスポート',
                duration: '04:01',
                createdAt: '2024-10-28T14:19:26.263Z'
            },
            {
                id: '1001',
                title: 'ソフトウェア開発管理技術：開発プロセス・手法③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=cKStVY_kDWM',
                category: 'ITパスポート',
                duration: '03:56',
                createdAt: '2024-10-28T14:19:26.257Z'
            },
            {
                id: '1000',
                title: 'ソフトウェア開発管理技術：開発プロセス・手法④',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=QUiYLIYubJs',
                category: 'ITパスポート',
                duration: '03:54',
                createdAt: '2024-10-28T14:19:26.252Z'
            },
            {
                id: '999',
                title: 'プロジェクトマネジメント：プロジェクトマネジメント',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=GCaqMyEibjs',
                category: 'ITパスポート',
                duration: '04:37',
                createdAt: '2024-10-28T14:19:26.246Z'
            },
            {
                id: '998',
                title: 'サービスマネジメント：サービスマネジメント①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=3H3sMqIAP8U',
                category: 'ITパスポート',
                duration: '03:55',
                createdAt: '2024-10-28T14:19:26.240Z'
            },
            {
                id: '997',
                title: 'サービスマネジメント：サービスマネジメント②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=FMIpllOitJE',
                category: 'ITパスポート',
                duration: '01:42',
                createdAt: '2024-10-28T14:19:26.234Z'
            },
            {
                id: '996',
                title: 'サービスマネジメント：サービスマネジメント③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=X8FUbnQgUp8',
                category: 'ITパスポート',
                duration: '04:08',
                createdAt: '2024-10-28T14:19:26.228Z'
            },
            {
                id: '995',
                title: 'サービスマネジメント：サービスマネジメントシステム①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=MUVuK--Pwzs',
                category: 'ITパスポート',
                duration: '05:52',
                createdAt: '2024-10-28T14:19:26.222Z'
            },
            {
                id: '994',
                title: 'サービスマネジメント：サービスマネジメントシステム②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=2ZiiXCdH4fs',
                category: 'ITパスポート',
                duration: '03:31',
                createdAt: '2024-10-28T14:19:26.217Z'
            },
            {
                id: '993',
                title: 'サービスマネジメント：ファシリティマネジメント①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=TAl4UbYcDTk',
                category: 'ITパスポート',
                duration: '03:01',
                createdAt: '2024-10-28T14:19:26.211Z'
            },
            {
                id: '992',
                title: 'サービスマネジメント：ファシリティマネジメント②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=Ba7Bn7TCB9E',
                category: 'ITパスポート',
                duration: '03:51',
                createdAt: '2024-10-28T14:19:26.205Z'
            },
            {
                id: '991',
                title: 'システム監査：システム監査①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=1Go4kY0Lgo8',
                category: 'ITパスポート',
                duration: '02:49',
                createdAt: '2024-10-28T14:19:26.199Z'
            },
            {
                id: '990',
                title: 'システム監査：システム監査②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=E9R9KZpFado',
                category: 'ITパスポート',
                duration: '04:09',
                createdAt: '2024-10-28T14:19:26.193Z'
            },
            {
                id: '989',
                title: 'システム監査：内部統制①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=XAuf86WW5-M',
                category: 'ITパスポート',
                duration: '04:13',
                createdAt: '2024-10-28T14:19:26.187Z'
            },
            {
                id: '988',
                title: 'システム監査：内部統制②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=6-Z8mnCZSNU',
                category: 'ITパスポート',
                duration: '03:43',
                createdAt: '2024-10-28T14:19:26.182Z'
            },
            {
                id: '987',
                title: '基礎理論：離散数学①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=eOXkRIYArSM',
                category: 'ITパスポート',
                duration: '04:16',
                createdAt: '2024-10-28T14:19:26.176Z'
            },
            {
                id: '986',
                title: '基礎理論：離散数学②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=R0UKxapQVxA',
                category: 'ITパスポート',
                duration: '03:20',
                createdAt: '2024-10-28T14:19:26.170Z'
            },
            {
                id: '985',
                title: '基礎理論：離散数学③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=PDc4hDaGc1k',
                category: 'ITパスポート',
                duration: '04:35',
                createdAt: '2024-10-28T14:19:26.164Z'
            },
            {
                id: '984',
                title: '基礎理論：応用数学①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=4RzQLp0E43Q',
                category: 'ITパスポート',
                duration: '03:04',
                createdAt: '2024-10-28T14:19:26.158Z'
            },
            {
                id: '983',
                title: '基礎理論：応用数学②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=RvX3DsDtXMg',
                category: 'ITパスポート',
                duration: '03:20',
                createdAt: '2024-10-28T14:19:26.152Z'
            },
            {
                id: '982',
                title: '基礎理論：応用数学③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=BOFnO4thmWo',
                category: 'ITパスポート',
                duration: '03:03',
                createdAt: '2024-10-28T14:19:26.146Z'
            },
            {
                id: '981',
                title: '基礎理論：応用数学④',
                type: 'video',
                url: 'youtube.com/watch?v=t5P_13ptGac',
                category: 'ITパスポート',
                duration: '10:00',
                createdAt: '2024-10-28T14:19:26.140Z'
            },
            {
                id: '980',
                title: '基礎理論：応用数学⑤',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=t1HRRmseUks',
                category: 'ITパスポート',
                duration: '04:03',
                createdAt: '2024-10-28T14:19:26.134Z'
            },
            {
                id: '979',
                title: '基礎理論：情報に関する理論①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=9ToYoGP7eyY',
                category: 'ITパスポート',
                duration: '01:19',
                createdAt: '2024-10-28T14:19:26.128Z'
            },
            {
                id: '978',
                title: '基礎理論：情報に関する理論②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=EARNTjSLsnA',
                category: 'ITパスポート',
                duration: '03:23',
                createdAt: '2024-10-28T14:19:26.122Z'
            },
            {
                id: '977',
                title: '基礎理論：情報に関する理論③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=8u7XfrxTMmU',
                category: 'ITパスポート',
                duration: '02:28',
                createdAt: '2024-10-28T14:19:26.116Z'
            },
            {
                id: '976',
                title: '基礎理論：情報に関する理論④',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=Eo0PUeTBZzk',
                category: 'ITパスポート',
                duration: '03:50',
                createdAt: '2024-10-28T14:19:26.110Z'
            },
            {
                id: '975',
                title: '基礎理論：情報に関する理論⑤',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=4iA0YcbTEWU',
                category: 'ITパスポート',
                duration: '03:38',
                createdAt: '2024-10-28T14:19:26.105Z'
            },
            {
                id: '974',
                title: 'アルゴリズムとプログラミング：データ構造',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=7AhRm-CMOS4',
                category: 'ITパスポート',
                duration: '03:15',
                createdAt: '2024-10-28T14:19:26.099Z'
            },
            {
                id: '973',
                title: 'アルゴリズムとプログラミング：アルゴリズムとプログラミング①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=9XIoCeeZvVk',
                category: 'ITパスポート',
                duration: '03:44',
                createdAt: '2024-10-28T14:19:26.093Z'
            },
            {
                id: '972',
                title: 'アルゴリズムとプログラミング：アルゴリズムとプログラミング②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=SbFufk0ky6I',
                category: 'ITパスポート',
                duration: '02:14',
                createdAt: '2024-10-28T14:19:26.087Z'
            },
            {
                id: '971',
                title: 'アルゴリズムとプログラミング：アルゴリズムとプログラミング③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=zLcKT-x9rBE',
                category: 'ITパスポート',
                duration: '03:26',
                createdAt: '2024-10-28T14:19:26.082Z'
            },
            {
                id: '970',
                title: 'アルゴリズムとプログラミング：アルゴリズムとプログラミング④',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=HU2ca7my8ZE',
                category: 'ITパスポート',
                duration: '03:39',
                createdAt: '2024-10-28T14:19:26.076Z'
            },
            {
                id: '969',
                title: 'アルゴリズムとプログラミング：プログラム言語①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=kkMJxTGADjE',
                category: 'ITパスポート',
                duration: '03:12',
                createdAt: '2024-10-28T14:19:26.070Z'
            },
            {
                id: '968',
                title: 'アルゴリズムとプログラミング：プログラム言語②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=IPFwN_tXrIk',
                category: 'ITパスポート',
                duration: '03:18',
                createdAt: '2024-10-28T14:19:26.065Z'
            },
            {
                id: '967',
                title: 'アルゴリズムとプログラミング：その他の言語①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=KCPMng4Cezg',
                category: 'ITパスポート',
                duration: '03:43',
                createdAt: '2024-10-28T14:19:26.059Z'
            },
            {
                id: '966',
                title: 'アルゴリズムとプログラミング：その他の言語②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=8ujhlrZDCmg',
                category: 'ITパスポート',
                duration: '03:46',
                createdAt: '2024-10-28T14:19:26.053Z'
            },
            {
                id: '965',
                title: 'コンピュータ構成要素：プロセッサ①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=zYqnvgI6u94',
                category: 'ITパスポート',
                duration: '03:06',
                createdAt: '2024-10-28T14:19:26.047Z'
            },
            {
                id: '964',
                title: 'コンピュータ構成要素：プロセッサ②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=TdDJybC7t8o',
                category: 'ITパスポート',
                duration: '02:39',
                createdAt: '2024-10-28T14:19:26.041Z'
            },
            {
                id: '963',
                title: 'コンピュータ構成要素：メモリ①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=y9PQVuzIxsI',
                category: 'ITパスポート',
                duration: '04:18',
                createdAt: '2024-10-28T14:19:26.035Z'
            },
            {
                id: '962',
                title: 'コンピュータ構成要素：メモリ②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=pbRX-zyshMk',
                category: 'ITパスポート',
                duration: '04:13',
                createdAt: '2024-10-28T14:19:26.029Z'
            },
            {
                id: '961',
                title: 'コンピュータ構成要素：メモリ③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=sQLVCMb9USc',
                category: 'ITパスポート',
                duration: '03:00',
                createdAt: '2024-10-28T14:19:26.023Z'
            },
            {
                id: '960',
                title: 'コンピュータ構成要素：入出力デバイス①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=sNQH2TwpmtM',
                category: 'ITパスポート',
                duration: '03:45',
                createdAt: '2024-10-28T14:19:26.018Z'
            },
            {
                id: '959',
                title: 'コンピュータ構成要素：入出力デバイス②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=_IJqk_RsDtY',
                category: 'ITパスポート',
                duration: '03:54',
                createdAt: '2024-10-28T14:19:26.012Z'
            },
            {
                id: '958',
                title: 'コンピュータ構成要素：入出力デバイス③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=pxu25FhjK7Y',
                category: 'ITパスポート',
                duration: '03:28',
                createdAt: '2024-10-28T14:19:26.005Z'
            },
            {
                id: '957',
                title: 'システム構成要素：システムの構成①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=oDjO5F6jSXY',
                category: 'ITパスポート',
                duration: '02:56',
                createdAt: '2024-10-28T14:19:25.999Z'
            },
            {
                id: '956',
                title: 'システム構成要素：システムの構成②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=fQW7nlikt2E',
                category: 'ITパスポート',
                duration: '04:31',
                createdAt: '2024-10-28T14:19:25.993Z'
            },
            {
                id: '955',
                title: 'システム構成要素：システムの構成③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=i62KiDCiJSA',
                category: 'ITパスポート',
                duration: '03:10',
                createdAt: '2024-10-28T14:19:25.987Z'
            },
            {
                id: '954',
                title: 'システム構成要素：システムの評価指数①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=GlrVy-tnbEk',
                category: 'ITパスポート',
                duration: '02:47',
                createdAt: '2024-10-28T14:19:25.981Z'
            },
            {
                id: '953',
                title: 'システム構成要素：システムの評価指数②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=-0W3uhCnCf8',
                category: 'ITパスポート',
                duration: '03:56',
                createdAt: '2024-10-28T14:19:25.976Z'
            },
            {
                id: '952',
                title: 'システム構成要素：システムの評価指数③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=GmBfRYm66xg',
                category: 'ITパスポート',
                duration: '03:56',
                createdAt: '2024-10-28T14:19:25.970Z'
            },
            {
                id: '951',
                title: 'ソフトウェア：オペレーティングシステム①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=OOUTxGK2HIE',
                category: 'ITパスポート',
                duration: '02:32',
                createdAt: '2024-10-28T14:19:25.964Z'
            },
            {
                id: '950',
                title: 'ソフトウェア：オペレーティングシステム②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=idMr5jSHPms',
                category: 'ITパスポート',
                duration: '02:38',
                createdAt: '2024-10-28T14:19:25.959Z'
            },
            {
                id: '949',
                title: 'ソフトウェア：オペレーティングシステム③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=UGlRhuaWulE',
                category: 'ITパスポート',
                duration: '03:23',
                createdAt: '2024-10-28T14:19:25.953Z'
            },
            {
                id: '948',
                title: 'ソフトウェア：ファイルシステム①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=cdfv8n_GGzk',
                category: 'ITパスポート',
                duration: '03:54',
                createdAt: '2024-10-28T14:19:25.947Z'
            },
            {
                id: '947',
                title: 'ソフトウェア：ファイルシステム②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=6RqGhP9ybc8',
                category: 'ITパスポート',
                duration: '04:04',
                createdAt: '2024-10-28T14:19:25.941Z'
            },
            {
                id: '946',
                title: 'ソフトウェア：オフィスツール①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=dt2JcP0m6B8',
                category: 'ITパスポート',
                duration: '03:40',
                createdAt: '2024-10-28T14:19:25.935Z'
            },
            {
                id: '945',
                title: 'ソフトウェア：オフィスツール②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=vrIooEftT3w',
                category: 'ITパスポート',
                duration: '03:44',
                createdAt: '2024-10-28T14:19:25.928Z'
            },
            {
                id: '944',
                title: 'ソフトウェア：オフィスツール③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=mfzshDtpBM0',
                category: 'ITパスポート',
                duration: '03:42',
                createdAt: '2024-10-28T14:19:25.922Z'
            },
            {
                id: '943',
                title: 'ソフトウェア：オフィスツール④',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=Ppu6yLFKDdA',
                category: 'ITパスポート',
                duration: '03:56',
                createdAt: '2024-10-28T14:19:25.916Z'
            },
            {
                id: '942',
                title: 'ソフトウェア：オフィスツール⑤',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=qahY58OedrA',
                category: 'ITパスポート',
                duration: '03:19',
                createdAt: '2024-10-28T14:19:25.910Z'
            },
            {
                id: '941',
                title: 'ソフトウェア：オープンソースソフトウェア',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=Dw_AoBo91Qw',
                category: 'ITパスポート',
                duration: '03:08',
                createdAt: '2024-10-28T14:19:25.904Z'
            },
            {
                id: '940',
                title: 'ハードウェア：ハードウェア（コンピュータ・入出力装置）①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=nahs9cUV32g',
                category: 'ITパスポート',
                duration: '04:28',
                createdAt: '2024-10-28T14:19:25.898Z'
            },
            {
                id: '939',
                title: 'ハードウェア：ハードウェア（コンピュータ・入出力装置）②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=AecHTKCZu5I',
                category: 'ITパスポート',
                duration: '03:14',
                createdAt: '2024-10-28T14:19:25.892Z'
            },
            {
                id: '938',
                title: '情報デザイン：情報デザイン①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=alchQcaKTYA',
                category: 'ITパスポート',
                duration: '03:24',
                createdAt: '2024-10-28T14:19:25.886Z'
            },
            {
                id: '937',
                title: '情報デザイン：情報デザイン②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=kwgxtAuRadA',
                category: 'ITパスポート',
                duration: '03:25',
                createdAt: '2024-10-28T14:19:25.881Z'
            },
            {
                id: '936',
                title: '情報デザイン：インターフェース設計①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=yB5x3LSA45Q',
                category: 'ITパスポート',
                duration: '02:53',
                createdAt: '2024-10-28T14:19:25.875Z'
            },
            {
                id: '935',
                title: '情報デザイン：インターフェース設計②',
                type: 'video',
                url: 'https://youtu.be/dNgZBekqZ5U',
                category: 'ITパスポート',
                duration: '02:18',
                createdAt: '2024-10-28T14:19:25.869Z'
            },
            {
                id: '934',
                title: '情報デザイン：インターフェース設計③',
                type: 'video',
                url: 'https://youtu.be/Jbn3Aigsmls',
                category: 'ITパスポート',
                duration: '02:56',
                createdAt: '2024-10-28T14:19:25.863Z'
            },
            {
                id: '933',
                title: '情報デザイン：インターフェース設計④',
                type: 'video',
                url: 'https://youtu.be/uyVzdF7Upp4',
                category: 'ITパスポート',
                duration: '03:12',
                createdAt: '2024-10-28T14:19:25.856Z'
            },
            {
                id: '932',
                title: '情報デザイン：インターフェース設計⑤',
                type: 'video',
                url: 'https://youtu.be/OfWh9LeE38Q',
                category: 'ITパスポート',
                duration: '03:42',
                createdAt: '2024-10-28T14:19:25.850Z'
            },
            {
                id: '931',
                title: '情報メディア：マルチメディア技術①',
                type: 'video',
                url: 'https://youtu.be/Vxjx2ffTenw',
                category: 'ITパスポート',
                duration: '03:43',
                createdAt: '2024-10-28T14:19:25.844Z'
            },
            {
                id: '930',
                title: '情報メディア：マルチメディア技術②',
                type: 'video',
                url: 'https://youtu.be/9QmhhSx_5Dg',
                category: 'ITパスポート',
                duration: '02:00',
                createdAt: '2024-10-28T14:19:25.839Z'
            },
            {
                id: '929',
                title: '情報メディア：マルチメディア技術③',
                type: 'video',
                url: 'https://youtu.be/LJlQAVG5av8',
                category: 'ITパスポート',
                duration: '04:04',
                createdAt: '2024-10-28T14:19:25.833Z'
            },
            {
                id: '928',
                title: '情報メディア：マルチメディア技術④',
                type: 'video',
                url: 'https://youtu.be/LxG_rxntHzg',
                category: 'ITパスポート',
                duration: '03:27',
                createdAt: '2024-10-28T14:19:25.827Z'
            },
            {
                id: '927',
                title: '情報メディア：マルチメディア技術⑤',
                type: 'video',
                url: 'https://youtu.be/G74td0IBIFg',
                category: 'ITパスポート',
                duration: '03:33',
                createdAt: '2024-10-28T14:19:25.821Z'
            },
            {
                id: '926',
                title: '情報メディア：マルチメディア応用①',
                type: 'video',
                url: 'https://youtu.be/a3QdQOqrdmw',
                category: 'ITパスポート',
                duration: '03:59',
                createdAt: '2024-10-28T14:19:25.815Z'
            },
            {
                id: '925',
                title: '情報メディア：マルチメディア応用②',
                type: 'video',
                url: 'https://youtu.be/TqvfQmXkUHA',
                category: 'ITパスポート',
                duration: '02:58',
                createdAt: '2024-10-28T14:19:25.809Z'
            },
            {
                id: '924',
                title: 'データベース：データベース方式①',
                type: 'video',
                url: 'https://youtu.be/GvoM4KRSdek',
                category: 'ITパスポート',
                duration: '04:48',
                createdAt: '2024-10-28T14:19:25.803Z'
            },
            {
                id: '923',
                title: 'データベース：データベース方式②',
                type: 'video',
                url: 'https://youtu.be/pD_keOVtfSw',
                category: 'ITパスポート',
                duration: '04:10',
                createdAt: '2024-10-28T14:19:25.798Z'
            },
            {
                id: '922',
                title: 'データベース：データベース設計①',
                type: 'video',
                url: 'https://youtu.be/p5EGA1XfaLg',
                category: 'ITパスポート',
                duration: '03:37',
                createdAt: '2024-10-28T14:19:25.792Z'
            },
            {
                id: '921',
                title: 'データベース：データベース設計②',
                type: 'video',
                url: 'https://youtu.be/wsB103rW5qk',
                category: 'ITパスポート',
                duration: '04:10',
                createdAt: '2024-10-28T14:19:25.786Z'
            },
            {
                id: '920',
                title: 'データベース：データベース設計③',
                type: 'video',
                url: 'https://youtu.be/5flE6O0QbCI',
                category: 'ITパスポート',
                duration: '02:32',
                createdAt: '2024-10-28T14:19:25.781Z'
            },
            {
                id: '919',
                title: 'データベース：データ操作',
                type: 'video',
                url: 'https://youtu.be/IYraFfT-eiI',
                category: 'ITパスポート',
                duration: '04:13',
                createdAt: '2024-10-28T14:19:25.774Z'
            },
            {
                id: '918',
                title: 'データベース：トランザクション処理①',
                type: 'video',
                url: 'https://youtu.be/8kV_IjhNnkQ',
                category: 'ITパスポート',
                duration: '02:46',
                createdAt: '2024-10-28T14:19:25.768Z'
            },
            {
                id: '917',
                title: 'データベース：トランザクション処理②',
                type: 'video',
                url: 'https://youtu.be/BcqgOkaGD1o',
                category: 'ITパスポート',
                duration: '03:48',
                createdAt: '2024-10-28T14:19:25.763Z'
            },
            {
                id: '916',
                title: 'ネットワーク：ネットワーク方式①',
                type: 'video',
                url: 'https://youtu.be/GQezlNH0Lm0',
                category: 'ITパスポート',
                duration: '02:58',
                createdAt: '2024-10-28T14:19:25.757Z'
            },
            {
                id: '915',
                title: 'ネットワーク：ネットワーク方式②',
                type: 'video',
                url: 'https://youtu.be/JbkM2kK0PLw',
                category: 'ITパスポート',
                duration: '03:29',
                createdAt: '2024-10-28T14:19:25.751Z'
            },
            {
                id: '914',
                title: 'ネットワーク：ネットワーク方式③',
                type: 'video',
                url: 'https://youtu.be/FQgAFHZoxoI',
                category: 'ITパスポート',
                duration: '03:48',
                createdAt: '2024-10-28T14:19:25.745Z'
            },
            {
                id: '913',
                title: 'ネットワーク：通信プロトコル①',
                type: 'video',
                url: 'https://youtu.be/nJhUGJI-K2A',
                category: 'ITパスポート',
                duration: '04:45',
                createdAt: '2024-10-28T14:19:25.739Z'
            },
            {
                id: '912',
                title: 'ネットワーク：通信プロトコル②',
                type: 'video',
                url: 'https://youtu.be/sRxqzXR8oKw',
                category: 'ITパスポート',
                duration: '03:45',
                createdAt: '2024-10-28T14:19:25.733Z'
            },
            {
                id: '911',
                title: 'ネットワーク：ネットワーク応用①',
                type: 'video',
                url: 'https://youtu.be/K59-S2u4EX8',
                category: 'ITパスポート',
                duration: '04:24',
                createdAt: '2024-10-28T14:19:25.727Z'
            },
            {
                id: '910',
                title: 'ネットワーク：ネットワーク応用②',
                type: 'video',
                url: 'https://youtu.be/Fa4DC8SasHw',
                category: 'ITパスポート',
                duration: '03:38',
                createdAt: '2024-10-28T14:19:25.721Z'
            },
            {
                id: '909',
                title: 'ネットワーク：ネットワーク応用③',
                type: 'video',
                url: 'https://youtu.be/r1wEp9QGSmI',
                category: 'ITパスポート',
                duration: '04:25',
                createdAt: '2024-10-28T14:19:25.715Z'
            },
            {
                id: '908',
                title: 'セキュリティ：情報セキュリティ①',
                type: 'video',
                url: 'https://youtu.be/S7BdlQ3Bmig',
                category: 'ITパスポート',
                duration: '02:53',
                createdAt: '2024-10-28T14:19:25.709Z'
            },
            {
                id: '907',
                title: 'セキュリティ：情報セキュリティ②',
                type: 'video',
                url: 'https://youtu.be/CFgDY34v3_Q',
                category: 'ITパスポート',
                duration: '05:25',
                createdAt: '2024-10-28T14:19:25.703Z'
            },
            {
                id: '906',
                title: 'セキュリティ：情報セキュリティ③',
                type: 'video',
                url: 'https://youtu.be/vwKrK91G1kE',
                category: 'ITパスポート',
                duration: '03:10',
                createdAt: '2024-10-28T14:19:25.697Z'
            },
            {
                id: '905',
                title: 'セキュリティ：情報セキュリティ④',
                type: 'video',
                url: 'https://youtu.be/BjmnBU-3Pu4',
                category: 'ITパスポート',
                duration: '04:05',
                createdAt: '2024-10-28T14:19:25.692Z'
            },
            {
                id: '904',
                title: 'セキュリティ：情報セキュリティ管理①',
                type: 'video',
                url: 'https://youtu.be/ohxpQesEfb4',
                category: 'ITパスポート',
                duration: '04:24',
                createdAt: '2024-10-28T14:19:25.685Z'
            },
            {
                id: '903',
                title: 'セキュリティ：情報セキュリティ管理②',
                type: 'video',
                url: 'https://youtu.be/ouuOQRNGvpo',
                category: 'ITパスポート',
                duration: '03:26',
                createdAt: '2024-10-28T14:19:25.680Z'
            },
            {
                id: '902',
                title: 'セキュリティ：情報セキュリティ管理③',
                type: 'video',
                url: 'https://youtu.be/kV-V8t-5IUs',
                category: 'ITパスポート',
                duration: '03:20',
                createdAt: '2024-10-28T14:19:25.674Z'
            },
            {
                id: '901',
                title: 'セキュリティ：情報セキュリティ管理④',
                type: 'video',
                url: 'https://youtu.be/AlUyJKTeChU',
                category: 'ITパスポート',
                duration: '04:52',
                createdAt: '2024-10-28T14:19:25.668Z'
            },
            {
                id: '900',
                title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術①',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=sFUx3FWxEgQ',
                category: 'ITパスポート',
                duration: '03:44',
                createdAt: '2024-10-28T14:19:25.663Z'
            },
            {
                id: '899',
                title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術②',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=zDzF9AAuJFE',
                category: 'ITパスポート',
                duration: '02:23',
                createdAt: '2024-10-28T14:19:25.657Z'
            },
            {
                id: '898',
                title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術③',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=dB4kRFNFfyU',
                category: 'ITパスポート',
                duration: '03:34',
                createdAt: '2024-10-28T14:19:25.651Z'
            },
            {
                id: '897',
                title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術④',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=Pazto--9VPw',
                category: 'ITパスポート',
                duration: '02:16',
                createdAt: '2024-10-28T14:19:25.645Z'
            },
            {
                id: '896',
                title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術⑤',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=gQQMQ5WfDRY',
                category: 'ITパスポート',
                duration: '03:23',
                createdAt: '2024-10-28T14:19:25.639Z'
            },
            {
                id: '895',
                title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術⑥',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=5UL8PFAtyg8',
                category: 'ITパスポート',
                duration: '02:37',
                createdAt: '2024-10-28T14:19:25.634Z'
            },
            {
                id: '894',
                title: 'セキュリティ：情報セキュリティ対策・情報セキュリティ実装技術⑦',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=7QrZhWD3Lg4',
                category: 'ITパスポート',
                duration: '03:02',
                createdAt: '2024-10-28T14:19:25.628Z'
            },
        ]
    },
    {
        id: '14',
        title: 'キャリアサポート',
        description: '自己分析ややりたいことの見つけ方などをキャリアサポートに関する情報をまとめています。',
        courseCount: 19,
        lessons: [
            {
                id: '893',
                title: '20230817_就活ガイダンス',
                type: 'video',
                url: 'https://youtu.be/Nh0nnlGSClM',
                category: 'キャリアサポート',
                duration: '55:27',
                createdAt: '2024-10-28T14:19:25.623Z'
            },
            {
                id: '892',
                title: '20230824_自己分析①「価値観発見ワーク」',
                type: 'video',
                url: 'https://youtu.be/OYNzIZImsXo',
                category: 'キャリアサポート',
                duration: '49:29',
                createdAt: '2024-10-28T14:19:25.617Z'
            },
            {
                id: '891',
                title: '20230907_自己分析②「DISC理論ワーク」',
                type: 'video',
                url: 'https://youtu.be/A5swaPt41HQ',
                category: 'キャリアサポート',
                duration: '33:13',
                createdAt: '2024-10-28T14:19:25.612Z'
            },
            {
                id: '890',
                title: '20230914_AI最新トレンド情報',
                type: 'video',
                url: 'https://youtu.be/gkzK27R1n8Q',
                category: 'キャリアサポート',
                duration: '1:03:11',
                createdAt: '2024-10-28T14:19:25.606Z'
            },
            {
                id: '889',
                title: '20230921_マーケティングセミナー',
                type: 'video',
                url: 'https://youtu.be/yfyvhBG-UPQ',
                category: 'キャリアサポート',
                duration: '1:03:12',
                createdAt: '2024-10-28T14:19:25.601Z'
            },
            {
                id: '888',
                title: '20230928_自己分析③「やりたいことの見つけ方ワーク」',
                type: 'video',
                url: 'https://youtu.be/RZFot7535vo',
                category: 'キャリアサポート',
                duration: '38:05',
                createdAt: '2024-10-28T14:19:25.595Z'
            },
            {
                id: '887',
                title: '20231005_自己分析④「キャリアプラン作成」',
                type: 'video',
                url: 'https://youtu.be/WeoLMGS4YRc',
                category: 'キャリアサポート',
                duration: '1:12:47',
                createdAt: '2024-10-28T14:19:25.590Z'
            },
            {
                id: '886',
                title: '20231026_業界研究・履歴書作成ワーク',
                type: 'video',
                url: 'https://youtu.be/RiC-XZcKQYA',
                category: 'キャリアサポート',
                duration: '50:45',
                createdAt: '2024-10-28T14:19:25.584Z'
            },
            {
                id: '885',
                title: '20231109_「デジタルスキルを使ってキャリアとのつながりについて考える」',
                type: 'video',
                url: 'https://youtu.be/1KYyzJ3mmG4',
                category: 'キャリアサポート',
                duration: '59:28',
                createdAt: '2024-10-28T14:19:25.579Z'
            },
            {
                id: '884',
                title: '20231116_「IT業界や在宅勤務について」',
                type: 'video',
                url: 'https://youtu.be/BJ5fjopomF8',
                category: 'キャリアサポート',
                duration: '43:32',
                createdAt: '2024-10-28T14:19:25.573Z'
            },
            {
                id: '883',
                title: '20231123_「目標が漠然としていることについて」',
                type: 'video',
                url: 'https://youtu.be/uWxTDgP-53g',
                category: 'キャリアサポート',
                duration: '56:37',
                createdAt: '2024-10-28T14:19:25.568Z'
            },
            {
                id: '882',
                title: '20231207_制作系質問会',
                type: 'video',
                url: 'https://youtu.be/xZmCiUro0qc',
                category: 'キャリアサポート',
                duration: '1:08:31',
                createdAt: '2024-10-28T14:19:25.562Z'
            },
            {
                id: '881',
                title: '20231214_「現状と理想と手段について」',
                type: 'video',
                url: 'https://youtu.be/xhzZk5iMU4A',
                category: 'キャリアサポート',
                duration: '56:16',
                createdAt: '2024-10-28T14:19:25.557Z'
            },
            {
                id: '880',
                title: '20231221_「資格・試験は必要なのか」',
                type: 'video',
                url: 'https://youtu.be/jKkcVPKcWcM',
                category: 'キャリアサポート',
                duration: '54:52',
                createdAt: '2024-10-28T14:19:25.551Z'
            },
            {
                id: '879',
                title: '20240111_「プログラミングは必要か？ノーコードツールでアプリを作ってみよう」',
                type: 'video',
                url: 'https://youtu.be/q2Lj0TKlD6g',
                category: 'キャリアサポート',
                duration: '1:07:04',
                createdAt: '2024-10-28T14:19:25.546Z'
            },
            {
                id: '878',
                title: '20240125 _「女性活躍の今後について」',
                type: 'video',
                url: 'https://youtu.be/f2v0LByL6G8',
                category: 'キャリアサポート',
                duration: '34:22',
                createdAt: '2024-10-28T14:19:25.540Z'
            },
            {
                id: '877',
                title: '20240208_「会社とフリーランスの違い」',
                type: 'video',
                url: 'https://youtu.be/QiWJSF_cc4M',
                category: 'キャリアサポート',
                duration: '33:00',
                createdAt: '2024-10-28T14:19:25.534Z'
            },
            {
                id: '876',
                title: '20240215_「AIに仕事は奪われるのか」',
                type: 'video',
                url: 'https://youtu.be/_D3AazAUwWM',
                category: 'キャリアサポート',
                duration: '53:33',
                createdAt: '2024-10-28T14:19:25.528Z'
            },
            {
                id: '875',
                title: '20240222_「ビジネスの根幹」',
                type: 'video',
                url: 'https://youtu.be/saIZ4zuaORU',
                category: 'キャリアサポート',
                duration: '42:22',
                createdAt: '2024-10-28T14:19:25.523Z'
            },
        ]
    },
    {
        id: '13',
        title: 'デジタル応用',
        description: 'デジタルの少し応用レベルの知識を学ぶコースです。',
        courseCount: 12,
        lessons: [
            {
                id: '869',
                title: '人工知能とは？',
                type: 'video',
                url: 'https://youtu.be/gNoH3LSlcnk',
                category: 'デジタル応用',
                duration: '06:08',
                createdAt: '2024-10-28T14:19:25.489Z'
            },
            {
                id: '868',
                title: '機械学習とは？',
                type: 'video',
                url: 'https://youtu.be/ijOXpcQ5so0',
                category: 'デジタル応用',
                duration: '06:18',
                createdAt: '2024-10-28T14:19:25.483Z'
            },
            {
                id: '867',
                title: 'IDEとは？',
                type: 'video',
                url: 'https://youtu.be/EkOd-bO0QeQ',
                category: 'デジタル応用',
                duration: '05:51',
                createdAt: '2024-10-28T14:19:25.478Z'
            },
            {
                id: '866',
                title: 'プログラムの基本構造とは？',
                type: 'video',
                url: 'https://youtu.be/r2oD6I6d4ek',
                category: 'デジタル応用',
                duration: '03:50',
                createdAt: '2024-10-28T14:19:25.472Z'
            },
            {
                id: '865',
                title: 'VRとは？',
                type: 'video',
                url: 'https://youtu.be/Rqbq0eJWmTY',
                category: 'デジタル応用',
                duration: '04:43',
                createdAt: '2024-10-28T14:19:25.466Z'
            },
            {
                id: '864',
                title: 'IoTとは？',
                type: 'video',
                url: 'https://youtu.be/llYn03L0BVU',
                category: 'デジタル応用',
                duration: '05:26',
                createdAt: '2024-10-28T14:19:25.460Z'
            },
            {
                id: '863',
                title: '量子コンピュータとは？',
                type: 'video',
                url: 'https://youtu.be/u3isJ8JU6tg',
                category: 'デジタル応用',
                duration: '04:54',
                createdAt: '2024-10-28T14:19:25.455Z'
            },
            {
                id: '862',
                title: '5Gとは？',
                type: 'video',
                url: 'https://youtu.be/GQVdQbiwMXo',
                category: 'デジタル応用',
                duration: '05:03',
                createdAt: '2024-10-28T14:19:25.449Z'
            },
            {
                id: '861',
                title: 'ビッグデータとは？',
                type: 'video',
                url: 'https://youtu.be/fcPrI08EepY',
                category: 'デジタル応用',
                duration: '04:23',
                createdAt: '2024-10-28T14:19:25.444Z'
            },
            {
                id: '860',
                title: 'ARとは？',
                type: 'video',
                url: 'https://youtu.be/VQA1_w8IVHk',
                category: 'デジタル応用',
                duration: '04:35',
                createdAt: '2024-10-28T14:19:25.438Z'
            },
            {
                id: '859',
                title: 'ブロックチェーン とは？',
                type: 'video',
                url: 'https://youtu.be/uYfIlJVDLXg',
                category: 'デジタル応用',
                duration: '05:36',
                createdAt: '2024-10-28T14:19:25.433Z'
            },
            {
                id: '858',
                title: '6Gとは？',
                type: 'video',
                url: 'https://youtu.be/kv2X9BO9TQQ',
                category: 'デジタル応用',
                duration: '08:41',
                createdAt: '2024-10-28T14:19:25.427Z'
            },
        ]
    },
    {
        id: '12',
        title: 'HP制作',
        description: 'プログラミングを使わずにノーコードでWordpress環境でHPを作成するためのコースです。',
        courseCount: 5,
        lessons: [
            {
                id: '874',
                title: 'HP制作セミナー',
                type: 'video',
                url: 'https://youtu.be/fpG4gydfINk',
                category: 'HP制作',
                duration: '1:05:19',
                createdAt: '2024-10-28T14:19:25.517Z'
            },
            {
                id: '873',
                title: 'HP制作課題について',
                type: 'video',
                url: 'https://youtu.be/LZF-_eGWDsQ',
                category: 'HP制作',
                duration: '13:03',
                createdAt: '2024-10-28T14:19:25.512Z'
            },
            {
                id: '872',
                title: 'レスポンシブ対応について',
                type: 'video',
                url: 'https://youtu.be/r_j1rMoa-MI',
                category: 'HP制作',
                duration: '07:09',
                createdAt: '2024-10-28T14:19:25.506Z'
            },
            {
                id: '871',
                title: 'Wordpress構築について_応用',
                type: 'video',
                url: 'https://youtu.be/kRG6L_ePLfQ',
                category: 'HP制作',
                duration: '19:49',
                createdAt: '2024-10-28T14:19:25.500Z'
            },
            {
                id: '769',
                title: 'Elementor更新情報',
                type: 'video',
                url: 'https://youtu.be/RkLRt60wzu8',
                category: 'HP制作',
                duration: '22:01',
                createdAt: '2024-10-28T14:19:24.915Z'
            },
        ]
    },
    {
        id: '11',
        title: '動画制作',
        description: 'TikTok，YouTube、Instagramなど、動画コンテンツが主流担ってきています。動画制作の過程や動画編集の使い方、実践も含めて動画最セクに関するスキルを学びます。',
        courseCount: 1,
        lessons: [
            {
                id: '783',
                title: '動画制作セミナー',
                type: 'video',
                url: 'https://youtu.be/mq_LnVrc5xw',
                category: '動画制作',
                duration: '38:17',
                createdAt: '2024-10-28T14:19:25.000Z'
            },
        ]
    },
    {
        id: '10',
        title: 'Google Apps Script',
        description: 'Google Apps Scriptを使うと、GmailやGoogleスプレッドシートやGoogleカレンダーなどのGoogle サービス上で様々な処理を自動化できます。単一サービス上での自動化はもちろん、GmailとGoogleスプレッドシート、GmailとGoogleドキュメントなど、複数のGoogleサービスを連携させて業務の効率化を量ることももちろん可能です。',
        courseCount: 6,
        lessons: [
            {
                id: '765',
                title: '①概要説明',
                type: 'video',
                url: 'https://youtu.be/Jj7IFbEnMmI',
                category: 'Google Apps Script',
                duration: '05:12',
                createdAt: '2024-10-28T14:19:24.891Z'
            },
            {
                id: '764',
                title: '②活用事例',
                type: 'video',
                url: 'https://youtu.be/yaANPlGbRxw',
                category: 'Google Apps Script',
                duration: '13:16',
                createdAt: '2024-10-28T14:19:24.885Z'
            },
            {
                id: '763',
                title: '③-1 Gmail→スプレッドシート①',
                type: 'video',
                url: 'https://youtu.be/4czu0cMQ5-U',
                category: 'Google Apps Script',
                duration: '05:46',
                createdAt: '2024-10-28T14:19:24.880Z'
            },
            {
                id: '762',
                title: '③-1 Gmail→スプレッドシート②',
                type: 'video',
                url: 'https://youtu.be/iI3vYusBr8c',
                category: 'Google Apps Script',
                duration: '07:40',
                createdAt: '2024-10-28T14:19:24.874Z'
            },
            {
                id: '761',
                title: '③-2 Gmail→Google ドライブ①',
                type: 'video',
                url: 'https://youtu.be/YdYm0XtY5jk',
                category: 'Google Apps Script',
                duration: '04:30',
                createdAt: '2024-10-28T14:19:24.869Z'
            },
            {
                id: '760',
                title: '③-2 Gmail→Google ドライブ②',
                type: 'video',
                url: 'https://youtu.be/lZVVeRRsNsU',
                category: 'Google Apps Script',
                duration: '07:52',
                createdAt: '2024-10-28T14:19:24.863Z'
            },
        ]
    },
    {
        id: '9',
        title: 'アプリ開発②（業務管理）',
        description: 'Google App Sheetを活用し、BtoB向けにノーコードでスプレッドシートを使い、データベースにアプリを構築します。在庫管理、営業管理、顧客管理、勤怠管理などあらゆる業務管理ツール、企業の基幹システムを構築することが可能となります。',
        courseCount: 3,
        lessons: [
            {
                id: '772',
                title: 'アプリ制作１〜顧客管理システム導入編〜',
                type: 'video',
                url: 'https://youtu.be/NaQTsVGMTkg',
                category: 'アプリ開発②（業務管理）',
                duration: '19:29',
                createdAt: '2024-10-28T14:19:24.938Z'
            },
            {
                id: '771',
                title: 'アプリ制作２〜顧客管理システム実装１〜',
                type: 'video',
                url: 'https://youtu.be/PO5eSxUHymw',
                category: 'アプリ開発②（業務管理）',
                duration: '21:36',
                createdAt: '2024-10-28T14:19:24.932Z'
            },
            {
                id: '770',
                title: 'アプリ制作３〜顧客管理システム実装２〜',
                type: 'video',
                url: 'https://youtu.be/84kqzOv6DIs',
                category: 'アプリ開発②（業務管理）',
                duration: '21:42',
                createdAt: '2024-10-28T14:19:24.926Z'
            },
        ]
    },
    {
        id: '8',
        title: 'アプリ開発①（モバイルアプリ）',
        description: 'ノーコードアプリ開発ツールClickを用いて、EC，SNS，タスク管理ツール、在庫管理ツールなどBtoC向けを中心に、業務用ツールのアプリを作成し、サービス開発や業務効率化につながるアプリ開発ができるようになります。',
        courseCount: 4,
        lessons: [
            {
                id: '779',
                title: 'アプリ制作１〜一言掲示板アプリ〜',
                type: 'video',
                url: 'https://youtu.be/wk21wfcmxsg',
                category: 'アプリ開発①（モバイルアプリ）',
                duration: '1:09:42',
                createdAt: '2024-10-28T14:19:24.978Z'
            },
            {
                id: '778',
                title: 'アプリ制作２〜タスク管理アプリ〜',
                type: 'video',
                url: 'https://youtu.be/Qwfq7TgYyhQ',
                category: 'アプリ開発①（モバイルアプリ）',
                duration: '1:05:24',
                createdAt: '2024-10-28T14:19:24.972Z'
            },
            {
                id: '759',
                title: 'Adalo〜SNS＆マッチングアプリ〜1',
                type: 'video',
                url: 'https://youtu.be/gd0QbMN6-Kk',
                category: 'アプリ開発①（モバイルアプリ）',
                duration: '1:23:10',
                createdAt: '2024-10-28T14:19:24.858Z'
            },
            {
                id: '757',
                title: 'Adalo〜SNS＆マッチングアプリ〜2',
                type: 'video',
                url: 'https://youtu.be/OYY_vK9z3zc',
                category: 'アプリ開発①（モバイルアプリ）',
                duration: '1:17:58',
                createdAt: '2024-10-28T14:19:24.846Z'
            },
        ]
    },
    {
        id: '7',
        title: '業務自動化',
        description: 'Makeというツールを活用し、特定の作業をアプリ感で連携し、自動化することができます。受診したメール内容をLINEに転機したり、名刺を撮影した画像を送ると自動でスプレッドシートに自動で転機してくれたりと無限の広がりが考えられます。',
        courseCount: 1,
        lessons: [
            {
                id: '758',
                title: '業務自動化ツール',
                type: 'video',
                url: 'https://youtu.be/3n9fCvkmbR8',
                category: '業務自動化',
                duration: '25:09',
                createdAt: '2024-10-28T14:19:24.852Z'
            },
        ]
    },
    {
        id: '6',
        title: '情報セキュリティ',
        description: '企業では情報セキュリティに長けた人材が不足している現状があります。ウイルスの種類や、対策方法、企業における情報セキュリティについて学んでいきます。',
        courseCount: 20,
        lessons: [
            {
                id: '803',
                title: '情報セキュリティとは？',
                type: 'video',
                url: 'https://youtu.be/cPP1xt2xJ4A',
                category: '情報セキュリティ',
                duration: '05:03',
                createdAt: '2024-10-28T14:19:25.115Z'
            },
            {
                id: '802',
                title: '暗号化とは？',
                type: 'video',
                url: 'https://youtu.be/WhcA4m4qfDQ',
                category: '情報セキュリティ',
                duration: '04:59',
                createdAt: '2024-10-28T14:19:25.109Z'
            },
            {
                id: '801',
                title: '共通鍵暗号方式とは？',
                type: 'video',
                url: 'https://youtu.be/3QXQLNT6itg',
                category: '情報セキュリティ',
                duration: '04:26',
                createdAt: '2024-10-28T14:19:25.103Z'
            },
            {
                id: '800',
                title: '公開鍵暗号方式とは？',
                type: 'video',
                url: 'https://youtu.be/t7LWWkGmeP8',
                category: '情報セキュリティ',
                duration: '05:22',
                createdAt: '2024-10-28T14:19:25.098Z'
            },
            {
                id: '799',
                title: 'スパムメールとは？',
                type: 'video',
                url: 'https://youtu.be/7s1wCOaRjvk',
                category: '情報セキュリティ',
                duration: '04:31',
                createdAt: '2024-10-28T14:19:25.092Z'
            },
            {
                id: '798',
                title: 'サイバー攻撃とは？',
                type: 'video',
                url: 'https://youtu.be/Tx2wOby3wqE',
                category: '情報セキュリティ',
                duration: '04:33',
                createdAt: '2024-10-28T14:19:25.086Z'
            },
            {
                id: '797',
                title: 'セキュリティ対策とは？',
                type: 'video',
                url: 'https://youtu.be/ps5k_saIm4s',
                category: '情報セキュリティ',
                duration: '05:04',
                createdAt: '2024-10-28T14:19:25.081Z'
            },
            {
                id: '796',
                title: 'ファイアウォールとは？',
                type: 'video',
                url: 'https://youtu.be/d4VtNRFYmpg',
                category: '情報セキュリティ',
                duration: '04:00',
                createdAt: '2024-10-28T14:19:25.075Z'
            },
            {
                id: '795',
                title: '公衆無線LANについて',
                type: 'video',
                url: 'https://youtu.be/dOdvS2tEnHg',
                category: '情報セキュリティ',
                duration: '05:33',
                createdAt: '2024-10-28T14:19:25.069Z'
            },
            {
                id: '794',
                title: 'さまざまな公衆無線LANサービス',
                type: 'video',
                url: 'https://youtu.be/9JVp2b9BALs',
                category: '情報セキュリティ',
                duration: '04:02',
                createdAt: '2024-10-28T14:19:25.063Z'
            },
            {
                id: '793',
                title: 'Wi-Fiの接続と暗号化の仕組み',
                type: 'video',
                url: 'https://youtu.be/wFTDfExo28k',
                category: '情報セキュリティ',
                duration: '04:02',
                createdAt: '2024-10-28T14:19:25.058Z'
            },
            {
                id: '792',
                title: '安全なWeb利用の方法',
                type: 'video',
                url: 'https://youtu.be/sgIIWHRptJw',
                category: '情報セキュリティ',
                duration: '03:46',
                createdAt: '2024-10-28T14:19:25.052Z'
            },
            {
                id: '791',
                title: 'VPNとは？',
                type: 'video',
                url: 'https://youtu.be/ivUD-tDeDR8',
                category: '情報セキュリティ',
                duration: '02:17',
                createdAt: '2024-10-28T14:19:25.046Z'
            },
            {
                id: '790',
                title: 'より安全・安心にWi-Fiを使うために',
                type: 'video',
                url: 'https://youtu.be/ZtMENv3SH4g',
                category: '情報セキュリティ',
                duration: '03:37',
                createdAt: '2024-10-28T14:19:25.040Z'
            },
            {
                id: '789',
                title: '無線LAN利用時に注意すべき３つのポイント',
                type: 'video',
                url: 'https://youtu.be/FiBT-EdNoc8',
                category: '情報セキュリティ',
                duration: '04:05',
                createdAt: '2024-10-28T14:19:25.034Z'
            },
            {
                id: '788',
                title: 'こんなにある無線LAN（Wi-Fi）',
                type: 'video',
                url: 'https://youtu.be/Zb39jrOhJ4E',
                category: '情報セキュリティ',
                duration: '04:20',
                createdAt: '2024-10-28T14:19:25.028Z'
            },
            {
                id: '787',
                title: 'Wi-Fiはこうやって繋がっている',
                type: 'video',
                url: 'https://youtu.be/IMB8wfiXYZ0',
                category: '情報セキュリティ',
                duration: '02:54',
                createdAt: '2024-10-28T14:19:25.023Z'
            },
            {
                id: '786',
                title: 'Wi-Fi利用－自宅編－',
                type: 'video',
                url: 'https://youtu.be/gl5NYgPZTH8',
                category: '情報セキュリティ',
                duration: '01:50',
                createdAt: '2024-10-28T14:19:25.017Z'
            },
            {
                id: '785',
                title: 'Wi-Fi利用－オフィス編－',
                type: 'video',
                url: 'https://youtu.be/kj0SbTMxNHQ',
                category: '情報セキュリティ',
                duration: '02:37',
                createdAt: '2024-10-28T14:19:25.011Z'
            },
            {
                id: '784',
                title: 'Wi-Fi利用－外出先編－',
                type: 'video',
                url: 'https://youtu.be/aB2A4Ha-YS4',
                category: '情報セキュリティ',
                duration: '03:28',
                createdAt: '2024-10-28T14:19:25.005Z'
            },
        ]
    },
    {
        id: '5',
        title: 'マーケティング基礎',
        description: 'マーケティングについて知ろう',
        courseCount: 11,
        lessons: [
            {
                id: '814',
                title: '第0回_マーケティングとは',
                type: 'video',
                url: 'https://youtu.be/kjE1BGQRgIk',
                category: 'マーケティング基礎',
                duration: '04:48',
                createdAt: '2024-10-28T14:19:25.178Z'
            },
            {
                id: '813',
                title: '第1回_マーケティングの４P',
                type: 'video',
                url: 'https://youtu.be/1Cl5TIiOQLs',
                category: 'マーケティング基礎',
                duration: '08:12',
                createdAt: '2024-10-28T14:19:25.173Z'
            },
            {
                id: '812',
                title: '第2回_マーケティングの４C',
                type: 'video',
                url: 'https://youtu.be/xlEAyoAqFVg',
                category: 'マーケティング基礎',
                duration: '04:56',
                createdAt: '2024-10-28T14:19:25.167Z'
            },
            {
                id: '811',
                title: '第3回_顧客ファースト',
                type: 'video',
                url: 'https://youtu.be/rhr-u5pCOcc',
                category: 'マーケティング基礎',
                duration: '02:35',
                createdAt: '2024-10-28T14:19:25.161Z'
            },
            {
                id: '810',
                title: '第4回_プロダクトライフサイクル',
                type: 'video',
                url: 'https://youtu.be/BBNXbdVhW4w',
                category: 'マーケティング基礎',
                duration: '03:14',
                createdAt: '2024-10-28T14:19:25.156Z'
            },
            {
                id: '809',
                title: '第5回_キャズム理論',
                type: 'video',
                url: 'https://youtu.be/ucm-MCZu0k4',
                category: 'マーケティング基礎',
                duration: '05:00',
                createdAt: '2024-10-28T14:19:25.150Z'
            },
            {
                id: '808',
                title: '第6回_コーポレートサイクル',
                type: 'video',
                url: 'https://youtu.be/pH23GhEzC5g',
                category: 'マーケティング基礎',
                duration: '03:57',
                createdAt: '2024-10-28T14:19:25.144Z'
            },
            {
                id: '807',
                title: '第7回_人間理解',
                type: 'video',
                url: 'https://youtu.be/7UEOJNqS81Y',
                category: 'マーケティング基礎',
                duration: '04:00',
                createdAt: '2024-10-28T14:19:25.138Z'
            },
            {
                id: '806',
                title: '第8回_SWOT分析',
                type: 'video',
                url: 'https://youtu.be/kl9N9X3hFio',
                category: 'マーケティング基礎',
                duration: '04:06',
                createdAt: '2024-10-28T14:19:25.132Z'
            },
            {
                id: '805',
                title: '第9回_ポジショニング戦略',
                type: 'video',
                url: 'https://youtu.be/7tmHqM25WQw',
                category: 'マーケティング基礎',
                duration: '03:19',
                createdAt: '2024-10-28T14:19:25.126Z'
            },
            {
                id: '804',
                title: '第10回_3C分析',
                type: 'video',
                url: 'https://youtu.be/3A9ixxu1gZs',
                category: 'マーケティング基礎',
                duration: '04:19',
                createdAt: '2024-10-28T14:19:25.121Z'
            },
        ]
    },
    {
        id: '4',
        title: 'Google基礎',
        description: 'スプレッドシートやドキュメント、ドライブ、Gmail、スライド、ToDoリストなど、Googleのツールについて学んでいきます。特にクラウドサービスは自動化やアプリ開発、AI活用と非常に相性が良く急速に進化している領域なので、より非常に重要な経験になります',
        courseCount: 8,
        lessons: [
            {
                id: '777',
                title: 'Googleクローム',
                type: 'video',
                url: 'https://youtu.be/Pi5daIiFGKw',
                category: 'Google基礎',
                duration: '05:36',
                createdAt: '2024-10-28T14:19:24.967Z'
            },
            {
                id: '776',
                title: 'Googleスライド',
                type: 'video',
                url: 'https://youtu.be/I4a3tAOJBDc',
                category: 'Google基礎',
                duration: '04:01',
                createdAt: '2024-10-28T14:19:24.961Z'
            },
            {
                id: '775',
                title: 'Googleドキュメント',
                type: 'video',
                url: 'https://youtu.be/3mY183OzOIY',
                category: 'Google基礎',
                duration: '02:33',
                createdAt: '2024-10-28T14:19:24.955Z'
            },
            {
                id: '774',
                title: 'Googleスプレッドシート',
                type: 'video',
                url: 'https://youtu.be/oMsEmiAbOdc',
                category: 'Google基礎',
                duration: '02:59',
                createdAt: '2024-10-28T14:19:24.950Z'
            },
            {
                id: '773',
                title: 'Googleフォーム',
                type: 'video',
                url: 'https://youtu.be/ZyzdmnkO8aE',
                category: 'Google基礎',
                duration: '08:21',
                createdAt: '2024-10-28T14:19:24.944Z'
            },
            {
                id: '768',
                title: 'Google基礎 - アカウント作成 -',
                type: 'video',
                url: 'https://youtu.be/6jQWLg70xvc',
                category: 'Google基礎',
                duration: '04:09',
                createdAt: '2024-10-28T14:19:24.908Z'
            },
            {
                id: '767',
                title: 'Google基礎 - アカウントの基本操作 -',
                type: 'video',
                url: 'https://youtu.be/j17DH4kiFyY',
                category: 'Google基礎',
                duration: '05:14',
                createdAt: '2024-10-28T14:19:24.903Z'
            },
            {
                id: '766',
                title: 'Google基礎 - 制作練習 -',
                type: 'video',
                url: 'https://youtu.be/Uo-ZYq8oo_U',
                category: 'Google基礎',
                duration: '32:12',
                createdAt: '2024-10-28T14:19:24.897Z'
            },
        ]
    },
    {
        id: '3',
        title: 'デジタル基礎（必修）',
        description: 'デジタルに関する基礎知識を学ぶコースです。',
        courseCount: 43,
        lessons: [
            {
                id: '857',
                title: 'プログラミング言語とは？',
                type: 'video',
                url: 'https://youtu.be/ZGB_38dOeQY',
                category: 'デジタル基礎（必修）',
                duration: '03:55',
                createdAt: '2024-10-28T14:19:25.422Z'
            },
            {
                id: '856',
                title: 'プログラムとは？',
                type: 'video',
                url: 'https://youtu.be/xSfgv_MlU8c',
                category: 'デジタル基礎（必修）',
                duration: '04:05',
                createdAt: '2024-10-28T14:19:25.416Z'
            },
            {
                id: '855',
                title: 'プログラミング言語の種類にはどんなものがある？',
                type: 'video',
                url: 'https://youtu.be/-LXCMmSS0cc',
                category: 'デジタル基礎（必修）',
                duration: '05:08',
                createdAt: '2024-10-28T14:19:25.411Z'
            },
            {
                id: '854',
                title: 'JavaScriptとは？',
                type: 'video',
                url: 'https://youtu.be/HpXhE05rDgs',
                category: 'デジタル基礎（必修）',
                duration: '04:11',
                createdAt: '2024-10-28T14:19:25.405Z'
            },
            {
                id: '853',
                title: 'Pythonとは？',
                type: 'video',
                url: 'https://youtu.be/ZhufHFIXku4',
                category: 'デジタル基礎（必修）',
                duration: '04:22',
                createdAt: '2024-10-28T14:19:25.400Z'
            },
            {
                id: '852',
                title: 'Rubyとは？',
                type: 'video',
                url: 'https://youtu.be/QmZZcBia7dU',
                category: 'デジタル基礎（必修）',
                duration: '03:20',
                createdAt: '2024-10-28T14:19:25.395Z'
            },
            {
                id: '851',
                title: 'Javaとは？',
                type: 'video',
                url: 'https://youtu.be/_5wNWgfwBbA',
                category: 'デジタル基礎（必修）',
                duration: '03:59',
                createdAt: '2024-10-28T14:19:25.389Z'
            },
            {
                id: '850',
                title: 'HTMLとは？',
                type: 'video',
                url: 'https://youtu.be/xCPEsIiDI_I',
                category: 'デジタル基礎（必修）',
                duration: '04:45',
                createdAt: '2024-10-28T14:19:25.384Z'
            },
            {
                id: '849',
                title: 'CSSとは？',
                type: 'video',
                url: 'https://youtu.be/jqJUXpR-wXk',
                category: 'デジタル基礎（必修）',
                duration: '04:25',
                createdAt: '2024-10-28T14:19:25.378Z'
            },
            {
                id: '848',
                title: 'PHPとは？',
                type: 'video',
                url: 'https://youtu.be/y5nhLDM5g-o',
                category: 'デジタル基礎（必修）',
                duration: '04:21',
                createdAt: '2024-10-28T14:19:25.373Z'
            },
            {
                id: '847',
                title: 'SQLとは？',
                type: 'video',
                url: 'https://youtu.be/7CSvDRzaZR4',
                category: 'デジタル基礎（必修）',
                duration: '05:04',
                createdAt: '2024-10-28T14:19:25.367Z'
            },
            {
                id: '846',
                title: 'フレームワークとは？',
                type: 'video',
                url: 'https://youtu.be/BPRtLnYAeL4',
                category: 'デジタル基礎（必修）',
                duration: '06:01',
                createdAt: '2024-10-28T14:19:25.362Z'
            },
            {
                id: '845',
                title: 'IPとは？',
                type: 'video',
                url: 'https://youtu.be/phK5FB-Rfy4',
                category: 'デジタル基礎（必修）',
                duration: '04:32',
                createdAt: '2024-10-28T14:19:25.356Z'
            },
            {
                id: '844',
                title: 'TCPとは？',
                type: 'video',
                url: 'https://youtu.be/hTt07JXEJok',
                category: 'デジタル基礎（必修）',
                duration: '04:27',
                createdAt: '2024-10-28T14:19:25.350Z'
            },
            {
                id: '843',
                title: 'ウェブとは？',
                type: 'video',
                url: 'https://youtu.be/F3yov3siGKM',
                category: 'デジタル基礎（必修）',
                duration: '04:07',
                createdAt: '2024-10-28T14:19:25.344Z'
            },
            {
                id: '842',
                title: 'URLとは？',
                type: 'video',
                url: 'https://youtu.be/Du-ho0YxcZE',
                category: 'デジタル基礎（必修）',
                duration: '05:19',
                createdAt: '2024-10-28T14:19:25.338Z'
            },
            {
                id: '841',
                title: 'LANとは？',
                type: 'video',
                url: 'https://youtu.be/VUii10WKP_w',
                category: 'デジタル基礎（必修）',
                duration: '04:13',
                createdAt: '2024-10-28T14:19:25.332Z'
            },
            {
                id: '840',
                title: 'WANとは？',
                type: 'video',
                url: 'https://youtu.be/NydlfuaJjJE',
                category: 'デジタル基礎（必修）',
                duration: '04:49',
                createdAt: '2024-10-28T14:19:25.326Z'
            },
            {
                id: '839',
                title: 'HTTPとは？',
                type: 'video',
                url: 'https://youtu.be/Z3IAcQuB8f0',
                category: 'デジタル基礎（必修）',
                duration: '04:17',
                createdAt: '2024-10-28T14:19:25.320Z'
            },
            {
                id: '838',
                title: 'インターネットとは？',
                type: 'video',
                url: 'https://youtu.be/daFfgBhzX_w',
                category: 'デジタル基礎（必修）',
                duration: '05:09',
                createdAt: '2024-10-28T14:19:25.315Z'
            },
            {
                id: '837',
                title: 'ポート番号とは？',
                type: 'video',
                url: 'https://youtu.be/ac1tohMto9k',
                category: 'デジタル基礎（必修）',
                duration: '04:53',
                createdAt: '2024-10-28T14:19:25.309Z'
            },
            {
                id: '836',
                title: 'コンパイルとは？',
                type: 'video',
                url: 'https://youtu.be/2FzDBWi8BkE',
                category: 'デジタル基礎（必修）',
                duration: '03:41',
                createdAt: '2024-10-28T14:19:25.303Z'
            },
            {
                id: '835',
                title: 'Linuxとは？',
                type: 'video',
                url: 'https://youtu.be/q8pBgVp459k',
                category: 'デジタル基礎（必修）',
                duration: '03:52',
                createdAt: '2024-10-28T14:19:25.297Z'
            },
            {
                id: '834',
                title: 'Gitとは？',
                type: 'video',
                url: 'https://youtu.be/vc7wqajaZKE',
                category: 'デジタル基礎（必修）',
                duration: '04:17',
                createdAt: '2024-10-28T14:19:25.291Z'
            },
            {
                id: '833',
                title: 'サーバーとは？',
                type: 'video',
                url: 'https://youtu.be/ODig-LexsV8',
                category: 'デジタル基礎（必修）',
                duration: '03:45',
                createdAt: '2024-10-28T14:19:25.286Z'
            },
            {
                id: '832',
                title: 'APIとは？',
                type: 'video',
                url: 'https://youtu.be/D4slpOz-7g4',
                category: 'デジタル基礎（必修）',
                duration: '04:26',
                createdAt: '2024-10-28T14:19:25.280Z'
            },
            {
                id: '831',
                title: 'データベースとは？',
                type: 'video',
                url: 'https://youtu.be/WsoDZcmwi4U',
                category: 'デジタル基礎（必修）',
                duration: '04:12',
                createdAt: '2024-10-28T14:19:25.274Z'
            },
            {
                id: '830',
                title: 'CPUとは？',
                type: 'video',
                url: 'https://youtu.be/AcFT9_KKlNs',
                category: 'デジタル基礎（必修）',
                duration: '05:15',
                createdAt: '2024-10-28T14:19:25.269Z'
            },
            {
                id: '829',
                title: 'メモリとは？',
                type: 'video',
                url: 'https://youtu.be/EWkJnopYioo',
                category: 'デジタル基礎（必修）',
                duration: '06:15',
                createdAt: '2024-10-28T14:19:25.263Z'
            },
            {
                id: '828',
                title: 'メモリ管理とは？',
                type: 'video',
                url: 'https://youtu.be/cUnFQCozOAA',
                category: 'デジタル基礎（必修）',
                duration: '05:42',
                createdAt: '2024-10-28T14:19:25.258Z'
            },
            {
                id: '827',
                title: 'ガベージコレクションとは？',
                type: 'video',
                url: 'https://youtu.be/0Htb_-S8M7k',
                category: 'デジタル基礎（必修）',
                duration: '05:50',
                createdAt: '2024-10-28T14:19:25.252Z'
            },
            {
                id: '826',
                title: 'GPUとは？',
                type: 'video',
                url: 'https://youtu.be/Nm19EhUQkB4',
                category: 'デジタル基礎（必修）',
                duration: '04:24',
                createdAt: '2024-10-28T14:19:25.246Z'
            },
            {
                id: '825',
                title: 'コンピュータの構成要素ってなに？',
                type: 'video',
                url: 'https://youtu.be/YF8p5ljat8w',
                category: 'デジタル基礎（必修）',
                duration: '04:52',
                createdAt: '2024-10-28T14:19:25.241Z'
            },
            {
                id: '824',
                title: 'HDD（ハードディスクドライブ）とは？',
                type: 'video',
                url: 'https://youtu.be/UyNnxg2tOHg',
                category: 'デジタル基礎（必修）',
                duration: '05:03',
                createdAt: '2024-10-28T14:19:25.235Z'
            },
            {
                id: '823',
                title: 'SSDとは？',
                type: 'video',
                url: 'https://youtu.be/s0GEzEWpGjg',
                category: 'デジタル基礎（必修）',
                duration: '04:53',
                createdAt: '2024-10-28T14:19:25.229Z'
            },
            {
                id: '822',
                title: 'クラウドとは？',
                type: 'video',
                url: 'https://youtu.be/EI-piFwG_N0',
                category: 'デジタル基礎（必修）',
                duration: '05:00',
                createdAt: '2024-10-28T14:19:25.223Z'
            },
            {
                id: '821',
                title: 'IaaS（イアース）とは？',
                type: 'video',
                url: 'https://youtu.be/HFUtjkG03EA',
                category: 'デジタル基礎（必修）',
                duration: '04:40',
                createdAt: '2024-10-28T14:19:25.217Z'
            },
            {
                id: '820',
                title: 'PaaS（パース）とは？',
                type: 'video',
                url: 'https://youtu.be/GdUKqfzvGCk',
                category: 'デジタル基礎（必修）',
                duration: '04:50',
                createdAt: '2024-10-28T14:19:25.211Z'
            },
            {
                id: '819',
                title: 'SaaS（サース）とは？',
                type: 'video',
                url: 'https://youtu.be/kruRscJujCA',
                category: 'デジタル基礎（必修）',
                duration: '05:00',
                createdAt: '2024-10-28T14:19:25.206Z'
            },
            {
                id: '818',
                title: 'AWSとは？',
                type: 'video',
                url: 'https://youtu.be/0czJqsWMWrM',
                category: 'デジタル基礎（必修）',
                duration: '05:19',
                createdAt: '2024-10-28T14:19:25.200Z'
            },
            {
                id: '817',
                title: 'GCPとは？',
                type: 'video',
                url: 'https://youtu.be/782OB_TIkBE',
                category: 'デジタル基礎（必修）',
                duration: '05:07',
                createdAt: '2024-10-28T14:19:25.195Z'
            },
            {
                id: '816',
                title: 'Azureとは？',
                type: 'video',
                url: 'https://youtu.be/NudwS2Bieuk',
                category: 'デジタル基礎（必修）',
                duration: '04:45',
                createdAt: '2024-10-28T14:19:25.189Z'
            },
            {
                id: '815',
                title: 'クラウドストレージとは？',
                type: 'video',
                url: 'https://youtu.be/2DaWVArOHUU',
                category: 'デジタル基礎（必修）',
                duration: '05:26',
                createdAt: '2024-10-28T14:19:25.184Z'
            },
        ]
    },
    {
        id: '2',
        title: 'SNSマーケティング',
        description: 'スマホの普及によりSNSにおけるマーケティングは、商品やサービスのPRや集客においてかかせないものとなりました。各SNSの特徴や活用方法などについて学びます。Canvaを使い簡単にデザインを学び、Instagramの投稿を考えます。',
        courseCount: 1,
        lessons: [
            {
                id: '870',
                title: 'SNSマーケティングセミナー',
                type: 'video',
                url: 'https://youtu.be/SNZ8C2UmsLI',
                category: 'SNSマーケティング',
                duration: '1:03:05',
                createdAt: '2024-10-28T14:19:25.495Z'
            },
        ]
    },
    {
        id: '1',
        title: 'AI活用',
        description: 'Chat GPT、Google Gemini、画像生成AI、動画生成AIの基礎知識の習得、活用方法、実践による成果物の提出などを行います。',
        courseCount: 3,
        lessons: [
            {
                id: '782',
                title: 'AI活用〜AIについて〜',
                type: 'video',
                url: 'https://youtu.be/9NeeFfOsLSw',
                category: 'AI活用',
                duration: '14:37',
                createdAt: '2024-10-28T14:19:24.994Z'
            },
            {
                id: '781',
                title: 'AI活用〜実際のAIツールを見てみよう１〜',
                type: 'video',
                url: 'https://youtu.be/hV1T9CTfG4Q',
                category: 'AI活用',
                duration: '20:55',
                createdAt: '2024-10-28T14:19:24.989Z'
            },
            {
                id: '780',
                title: 'AI活用〜実際のAIツールを見てみよう２〜',
                type: 'video',
                url: 'https://youtu.be/mY7Gs3W4ofw',
                category: 'AI活用',
                duration: '23:00',
                createdAt: '2024-10-28T14:19:24.983Z'
            },
        ]
    },
];

export const ALL_COURSES: CourseDef[] = [
    {
        id: '7',
        title: 'キャリアサポート',
        description: '転職のサポートに役立つ情報をまとめました',
        category: 'General',
        lessonCount: 5
    },
    {
        id: '6',
        title: 'ITパスポート試験対策',
        description: 'ITパスポートの資格試験用のプログラムです',
        category: 'General',
        lessonCount: 5
    },
    {
        id: '4',
        title: 'ITエンジニア志向',
        description: 'IT業界に行きたい人向けのプログラムです難易度も高くなっています',
        category: 'General',
        lessonCount: 5
    },
    {
        id: '3',
        title: 'クリエイター向け',
        description: 'SNSやHP,動画制作などクリエイター志向の人におすすめです',
        category: 'General',
        lessonCount: 5
    },
    {
        id: '2',
        title: '業務改善・効率化',
        description: '社内での業務改善・効率化などができるようになります。･･･',
        category: 'General',
        lessonCount: 5
    },
    {
        id: '1',
        title: '初心者向け',
        description: 'デジタルが苦手･･！そんな人におすすめの優しめの内容のコースです。',
        category: 'General',
        lessonCount: 5
    },
];

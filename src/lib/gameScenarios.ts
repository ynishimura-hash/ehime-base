export interface ScenarioStep {
    bg?: string;
    chara?: {
        name: string;
        image: string;
        side: 'left' | 'right' | 'center';
    }[];
    speaker?: string;
    text: string;
    choices?: {
        text: string;
        targetIndex?: number;
        targetScenario?: string;
        action?: (state: any) => void;
    }[];
    onEnter?: (state: any) => void;
}

export const SCENARIOS: Record<string, ScenarioStep[]> = {
    intro: [
        {
            bg: '/game/bg/campus.png',
            text: '桜が舞う、4月のキャンパス。'
        },
        {
            text: '今日から僕は大学3年生だ。'
        },
        {
            text: '……その前に、僕の性別は……',
            choices: [
                {
                    text: '男性',
                    action: (state) => {
                        state.setPlayerGender('male');
                        state.updateStats({ charm: 20 });
                    }
                },
                {
                    text: '女性',
                    action: (state) => {
                        state.setPlayerGender('female');
                        state.updateStats({ charm: 25 });
                    }
                }
            ]
        },
        {
            chara: [{ name: 'mc', image: 'male.png', side: 'left' }],
            speaker: '??',
            text: '「はぁ……就活かぁ……」'
        },
        {
            text: '「愛媛で働きたいとは思ってるけど、どんな企業があるのか全然知らないし……」'
        },
        {
            text: '「何から始めればいいんだろう……」'
        },
        {
            chara: [
                { name: 'mc', image: 'male.png', side: 'left' },
                { name: 'mikan', image: 'normal.png', side: 'right' }
            ],
            speaker: '？？？',
            text: '「お困りのようだね、後輩くん！」'
        },
        {
            speaker: '??',
            text: '「えっ、誰！？」'
        },
        {
            speaker: 'みかん先輩',
            text: '「ふふふ、私はみかん先輩。この大学の4年生だよ。」'
        },
        {
            text: '「愛媛での就活を勝ち抜いた、いわば就活マスターさ！」'
        },
        {
            speaker: '??',
            text: '「し、就活マスター……？」'
        },
        {
            speaker: 'みかん先輩',
            text: '「君、愛媛で就職したいんでしょ？でも何をしていいかわからない顔をしてる。」'
        },
        {
            text: '「そんな君のために、私が愛媛の企業や就活のノウハウを教えてあげる！」'
        },
        {
            text: '「名付けて、『愛媛就活RPG』の始まりだよ！」'
        },
        {
            speaker: '??',
            text: '「RPG……？（なんか変な先輩に絡まれたな……）」'
        },
        {
            speaker: 'みかん先輩',
            text: '「さあ、準備はいい？まずは就活の基本からレクチャーするよ！」',
            choices: [
                { text: 'お願いします！', action: (state) => { } },
                { text: 'ちょっと心の準備が...', action: (state) => { } }
            ]
        },
        {
            text: '「いい返事だ！その意気があれば大丈夫。」'
        },
        {
            text: '「それじゃあ、まずはこの大学のキャリアセンターに行ってみよう！」'
        },
        {
            text: '「そこには愛媛の企業情報がたくさん集まっているんだ。」'
        },
        {
            speaker: '??',
            text: 'こうして、僕の愛媛での就活……もとい、愛媛就活RPGが幕を開けたのだった。',
            onEnter: (state) => {
                state.setGameMode('strategy');
            }
        }
    ]
};

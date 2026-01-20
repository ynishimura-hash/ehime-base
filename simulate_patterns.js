
const { DIAGNOSIS_QUESTIONS, VALUE_CARDS } = require('./src/lib/constants/analysisData');
const { calculateSelectedValues } = require('./src/lib/analysisUtils');

function simulate(patternName, scoreGenerator) {
    const scores = {};
    DIAGNOSIS_QUESTIONS.forEach(q => {
        scores[q.id] = scoreGenerator(q);
    });

    const selectedIds = calculateSelectedValues(scores);
    const resultPairs = [];
    for (let i = 0; i < selectedIds.length; i += 2) {
        const posId = selectedIds[i];
        const negId = selectedIds[i + 1];
        const pos = VALUE_CARDS.find(c => c.id === posId);
        const neg = VALUE_CARDS.find(c => c.id === negId);
        const score = scores[DIAGNOSIS_QUESTIONS.find(q => q.positiveValueId === posId && q.negativeValueId === negId)?.id];
        resultPairs.push({
            pairIndex: (i / 2) + 1,
            score,
            activated: score >= 4 ? pos.name : (score <= 2 ? neg.name : 'Neutral'),
            pos: pos.name,
            neg: neg.name
        });
    }

    console.log(`--- Pattern: ${patternName} ---`);
    console.log('Top 5 Value Pairs:');
    resultPairs.forEach(p => {
        console.log(`${p.pairIndex}. Score: ${p.score} -> ${p.activated} (Pair: ${p.pos} / ${p.neg})`);
    });
    console.log('\n');
    return { name: patternName, scores, resultPairs };
}

// Pattern 1: High Creativity & Intellectual (Creative, Curious, Aesthetic)
const creativeGen = (q) => {
    if (['A'].includes(q.category)) return 5;
    if (['D'].includes(q.category)) return 1;
    return 3;
};

// Pattern 2: High Energy & Action (Passionate, Decisive, Social)
const actionGen = (q) => {
    if (['B'].includes(q.category)) return 5;
    if (['A'].includes(q.category)) return 1;
    return 3;
};

// Pattern 3: High Stability & Detail (Honest, Methodical, Calm)
const stableGen = (q) => {
    if (['E'].includes(q.category)) return 5;
    if (['C'].includes(q.category)) return 1;
    return 3;
};

simulate("Creative Scholar (A-Focus)", creativeGen);
simulate("Passionate Achiever (B-Focus)", actionGen);
simulate("Silent Reliable (E-Focus)", stableGen);


export interface SimulationInput {
    currentAge: number;
    retirementAge: number;
    initialSavings: number;
    monthlyContribution: number;
    investmentRate: number; // Percent, e.g., 5.0
}

export const BANK_RATE = 0.001; // 0.001%
export const RETIREMENT_SPENDING_YEARS = 30; // Spend down over 30 years

export interface YearlyResult {
    age: number;
    invested: number;
    bank: number;
    principal: number;
}

export function calculateSimulation(input: SimulationInput): YearlyResult[] {
    const { currentAge, retirementAge, initialSavings, monthlyContribution, investmentRate } = input;
    const years = retirementAge - currentAge;
    const results: YearlyResult[] = [];

    let currentInvested = initialSavings;
    let currentBank = initialSavings;
    let currentPrincipal = initialSavings;

    // Monthly rates
    const monthlyInvRate = (investmentRate / 100) / 12;
    const monthlyBankRate = (BANK_RATE / 100) / 12;

    // Add initial state
    results.push({
        age: currentAge,
        invested: Math.round(currentInvested),
        bank: Math.round(currentBank),
        principal: Math.round(currentPrincipal),
    });

    for (let y = 1; y <= years; y++) {
        // Compound monthly for this year
        for (let m = 0; m < 12; m++) {
            currentInvested = (currentInvested + monthlyContribution) * (1 + monthlyInvRate);
            currentBank = (currentBank + monthlyContribution) * (1 + monthlyBankRate);
            currentPrincipal += monthlyContribution;
        }

        results.push({
            age: currentAge + y,
            invested: Math.round(currentInvested),
            bank: Math.round(currentBank),
            principal: Math.round(currentPrincipal),
        });
    }

    return results;
}

export function calculateDailyDifference(investedTotal: number, bankTotal: number): number {
    const difference = investedTotal - bankTotal;
    const days = RETIREMENT_SPENDING_YEARS * 365;
    return Math.round(difference / days);
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value);
}

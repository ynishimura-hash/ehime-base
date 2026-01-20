import { LifePlanInput, YearlyCashFlow, Person, Child } from "./types";
import { EDUCATION_COSTS, DEFAULT_PENSION } from "./constants";

export function calculateLifePlan(input: LifePlanInput): YearlyCashFlow[] {
    const { headOfHousehold, spouse, children, housing, expenses, assets, config } = input;
    const results: YearlyCashFlow[] = [];

    // Initialize state
    let currentCash = assets.cashSavings;
    let mainInvestments = assets.investmentAssets;
    let tsumitateInvestments = 0;

    // Savings Only Scenario Stats
    let savingsScenarioTotal = assets.cashSavings + assets.investmentAssets;

    // We simulate until the head of household is 100 years old
    const startAge = headOfHousehold.currentAge;
    const maxAge = 100;
    const yearsToSimulate = maxAge - startAge;

    for (let year = 0; year <= yearsToSimulate; year++) {
        const currentYearAge = startAge + year;

        // --- INCOME ---
        let annualIncome = 0;
        let annualPension = 0;

        // Head
        if (config.enableRetirement !== false) {
            // Standard Logic with Retirement
            if (currentYearAge < headOfHousehold.targetRetirementAge) {
                annualIncome += headOfHousehold.annualIncome + headOfHousehold.annualBonus;
            } else if (currentYearAge === headOfHousehold.targetRetirementAge) {
                annualIncome += headOfHousehold.retirementAllowance;
            } else if (currentYearAge >= config.socialSecurityPensionOffset) {
                annualPension += getYearlyPension(headOfHousehold.employmentType);
            }
        } else {
            // Work Forever
            annualIncome += headOfHousehold.annualIncome + headOfHousehold.annualBonus;
        }

        // Spouse
        if (spouse) {
            const spouseAge = spouse.currentAge + year;
            if (config.enableRetirement !== false) {
                if (spouseAge < spouse.targetRetirementAge) {
                    annualIncome += spouse.annualIncome + spouse.annualBonus;
                } else if (spouseAge === spouse.targetRetirementAge) {
                    annualIncome += spouse.retirementAllowance;
                } else if (spouseAge >= config.socialSecurityPensionOffset) {
                    annualPension += getYearlyPension(spouse.employmentType);
                }
            } else {
                annualIncome += spouse.annualIncome + spouse.annualBonus;
            }
        }

        const totalIncome = annualIncome + annualPension;

        // --- EXPENSES ---

        // 1. Basic Living (inflate)
        const inflationMultiplier = Math.pow(1 + config.inflationRate / 100, year);

        const monthlyLivingSum =
            (expenses.food || 0) +
            (expenses.utilities || 0) +
            (expenses.communication || 0) +
            (expenses.dailyGoods || 0) +
            (expenses.clothingBeauty || 0) +
            (expenses.entertainment || 0) +
            (expenses.medicalInsurance || 0) +
            (expenses.otherBasic || 0);

        // Sum Only
        let basicLiving = monthlyLivingSum * 12 * inflationMultiplier;
        const specialExp = expenses.yearlySpecialExpenses * inflationMultiplier;

        // 2. Housing
        let housingCostAnnual = 0;
        if (housing.type === 'rent') {
            housingCostAnnual = housing.monthlyCost * 12 * inflationMultiplier;
        } else if (housing.type === 'own_with_loan') {
            if (year < housing.remainingLoanYears) {
                housingCostAnnual += housing.monthlyCost * 12;
            }
            housingCostAnnual += housing.maintenanceCostPerYear * inflationMultiplier;
        } else {
            housingCostAnnual += housing.maintenanceCostPerYear * inflationMultiplier;
        }

        // 3. Education
        let educationCost = 0;
        children.forEach(child => {
            const childAge = child.age + year;
            educationCost += getEducationCost(child, childAge) * inflationMultiplier;
        });

        // 4. Events (Cars, Loans)
        let eventCost = 0;
        if (assets.otherLoansRemaining > 0) {
            const yearlyLoanPay = assets.otherMonthlyPayment * 12;
            if (currentCash > yearlyLoanPay) {
                eventCost += assets.otherMonthlyPayment * 12;
            }
        }

        // Car Replacement
        expenses.vehicleReplacements.forEach(vehicle => {
            if (year > 0 && year % vehicle.intervalYears === 0) {
                eventCost += vehicle.cost * inflationMultiplier;
            }
        });

        // Retirement Living Override
        if (config.enableRetirement !== false) {
            if (currentYearAge >= headOfHousehold.targetRetirementAge) {
                basicLiving = 200000 * 12 * inflationMultiplier;
            }
        }

        let totalExpenses = basicLiving + specialExp + housingCostAnnual + educationCost + eventCost;

        if (config.enableExpenses === false) {
            totalExpenses = 0;
            // But Tsumitate Flow is an "Expense" from Cash Flow perspective?
            // No, Tsumitate is asset transfer.
            // If EnableExpenses is OFF, strictly Expenses(Consumption) are 0.
        }

        // Tsumitate Flow
        let tsumitateFlow = 0;
        if (assets.monthlyInvestment && year < assets.monthlyInvestment.durationYears) {
            tsumitateFlow = assets.monthlyInvestment.amount * 12;
        }

        // --- BALANCE & ASSET GROWTH ---
        const surplus = totalIncome - totalExpenses - tsumitateFlow;

        // 1. Tsumitate Growth
        if (assets.monthlyInvestment) {
            // With Return
            const tsumitateReturn = tsumitateInvestments * (assets.monthlyInvestment.expectedReturn / 100);
            tsumitateInvestments += tsumitateReturn + tsumitateFlow;
        }

        // 2. Main Investment Growth
        const globalReturnRate = assets.monthlyInvestment?.expectedReturn || 0;
        const mainReturn = mainInvestments * (globalReturnRate / 100);
        mainInvestments += mainReturn;

        // 3. Surplus Allocation
        if (surplus >= 0) {
            mainInvestments += surplus;
        } else {
            // Deficit
            let deficit = -surplus;
            if (currentCash >= deficit) {
                currentCash -= deficit;
            } else {
                deficit -= currentCash;
                currentCash = 0;

                if (mainInvestments >= deficit) {
                    mainInvestments -= deficit;
                } else {
                    deficit -= mainInvestments;
                    mainInvestments = 0;
                    if (tsumitateInvestments > 0) {
                        tsumitateInvestments -= deficit;
                    }
                }
            }
        }

        // --- SAVINGS ONLY SCENARIO ---
        // Treat tsumitate as just cash savings inside the same pot (or simplified)
        // Actually, just add net cash flow (Income - Exp)
        // Income is same. Expenses same. 
        // Surplus (before tsumitate deduction) = totalIncome - totalExpenses
        // In savings scenario, tsumitate is just money moving from one pocket to another, 0 yield.
        // So Net Flow = totalIncome - totalExpenses.
        const savingsSurplus = totalIncome - totalExpenses; // Tsumitate is part of asset accumulation
        savingsScenarioTotal += savingsSurplus;
        if (savingsScenarioTotal < 0) savingsScenarioTotal = 0; // No debt tracking in this simple calc

        const totalInvestments = mainInvestments + tsumitateInvestments;
        const totalAssets = currentCash + totalInvestments;

        results.push({
            age: currentYearAge,
            year: year,
            income: annualIncome,
            pension: annualPension,
            totalIncome,
            basicLiving: basicLiving + specialExp,
            housing: housingCostAnnual,
            education: educationCost,
            events: eventCost,
            totalExpenses,
            annualSurplus: surplus,
            totalAssets: Math.round(totalAssets),
            investmentAssets: Math.round(totalInvestments),
            cashAssets: Math.round(currentCash),
            realTotalAssets: Math.round(totalAssets / inflationMultiplier),
            totalAssetsSavingsOnly: Math.round(savingsScenarioTotal)
        });
    }

    return results;
}

function getYearlyPension(type: Person['employmentType']): number {
    return DEFAULT_PENSION[type] || 0;
}

function getEducationCost(child: Child, age: number): number {
    const plan = child.educationPlan;

    // Age 3-5: Kindergarten
    if (age >= 3 && age <= 5) return EDUCATION_COSTS.kindergarten[plan.kindergarten];

    // Age 6-11: Elementary
    if (age >= 6 && age <= 11) return EDUCATION_COSTS.elementary[plan.elementary];

    // Age 12-14: Junior High
    if (age >= 12 && age <= 14) return EDUCATION_COSTS.juniorHigh[plan.juniorHigh];

    // Age 15-17: High School
    if (age >= 15 && age <= 17) return EDUCATION_COSTS.highSchool[plan.highSchool];

    // Age 18-21: University
    if (age >= 18 && age <= 21) {
        if (plan.university === 'none') return 0;
        return EDUCATION_COSTS.university[plan.university];
    }

    return 0;
}

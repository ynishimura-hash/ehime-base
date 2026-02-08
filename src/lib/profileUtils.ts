import { User } from './appStore';

/**
 * プロフィール充実度を計算する
 * @param user ユーザーオブジェクト
 * @returns 充実度（0-100の整数）
 */
export function calculateProfileCompletion(user: User | undefined | null): number {
    if (!user) return 0;

    let points = 0;
    let total = 0;

    // 1. Basic Info (4 items)
    const basicFields = ['name', 'university', 'faculty', 'graduationYear'];
    basicFields.forEach(f => {
        total++;
        if ((user as any)[f]) points++;
    });

    // 2. Self Intro (2 items)
    const introFields = ['bio', 'image'];
    introFields.forEach(f => {
        total++;
        if ((user as any)[f]) points++;
    });

    // 3. Skills & Quals (2 items)
    // Skills
    total++;
    if (user.skills && user.skills.length > 0) points++;

    // Qualifications
    total++;
    if (user.qualifications && user.qualifications.length > 0) points++;

    // 4. Conditions (3 items)
    total += 3;
    if (user.desiredConditions) {
        if (user.desiredConditions.industry && user.desiredConditions.industry.length > 0) points++;
        if (user.desiredConditions.location && user.desiredConditions.location.length > 0) points++;
        if (user.desiredConditions.salary) points++;
    }

    if (total === 0) return 0;
    return Math.round((points / total) * 100);
}

/**
 * プロフィール項目の詳細な達成状況を返す（チェックリスト表示用）
 */
export function getProfileSectionStatus(user: User | undefined | null) {
    if (!user) return {
        basic: false,
        intro: false,
        skills: false,
        conditions: false
    };

    return {
        basic: !!(user.name && user.university && user.faculty && user.graduationYear),
        intro: !!(user.bio && user.image),
        skills: !!(user.skills?.length && user.qualifications?.length),
        conditions: !!(user.desiredConditions?.industry?.length && user.desiredConditions?.location?.length && user.desiredConditions?.salary)
    };
}

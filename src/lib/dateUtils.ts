
export function calculateAge(birthDate: string | Date | undefined | null): number | null {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const today = new Date();

    if (isNaN(birth.getTime())) return null;

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

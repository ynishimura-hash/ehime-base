/**
 * Generates a fallback avatar URL based on gender.
 * Male/Female use Avataaars, Other/Animals use Big Ears.
 */
export const getFallbackAvatarUrl = (id: string, gender?: string) => {
    // ユーザーの要望により、Dicebearの代わりにローカルのシルエット画像を使用
    return '/images/defaults/default_user_avatar.png';
};

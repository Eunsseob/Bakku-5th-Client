export function formatBirthDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join(' . ');
}

export function validateNickname(value: string): string | null {
  const nickname = value.trim();
  if (!nickname) return '닉네임을 입력해 주세요.';
  if (nickname.length < 2 || nickname.length > 10) return '닉네임은 2~10자로 입력해 주세요.';
  return null;
}

export function validateBirthDate(value: string, today = new Date()): string | null {
  if (!/^\d{4}\s*\.\s*\d{2}\s*\.\s*\d{2}$/.test(value))
    return '생년월일을 YYYY . MM . DD 형식으로 입력해 주세요.';
  const [year, month, day] = value.split(/\s*\.\s*/).map(Number);
  const date = new Date(year, month - 1, day);
  if (
    year < 100 ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return '올바른 생년월일을 입력해 주세요.';
  if (date > new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    return '생년월일은 오늘 이후일 수 없어요.';
  const birthdayPassed =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  const age = today.getFullYear() - year - (birthdayPassed ? 0 : 1);
  if (age < 14) return '만 14세 이상만 가입할 수 있어요.';
  return null;
}

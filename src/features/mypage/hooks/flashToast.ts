// 화면을 닫으면서 이전 화면에 띄울 토스트 한 줄 (예: 닉네임 저장 뒤 내 프로필에 '프로필을 수정했어요')
let pending: string | null = null;

export function setFlashToast(message: string) {
  pending = message;
}

/** 한 번 꺼내면 비운다 */
export function takeFlashToast() {
  const message = pending;
  pending = null;
  return message;
}

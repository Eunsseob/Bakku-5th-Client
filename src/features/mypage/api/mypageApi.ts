import { apiData } from '@/shared/api/client';

// Swagger user: MB-2 내 정보 · MB-3 닉네임 수정 · MB-5 탈퇴 전 안내 · MB-6 회원 탈퇴 · MB-7 마케팅 수신
//               BL-2 차단 목록 · BL-3 차단 해제
// Swagger notification: NT-5 알림 설정 조회 · NT-6 알림 설정 변경

/** MB-2 내 정보. 매너 지표 · 경고 · 이용 제한은 2차라 1차에는 null 이 온다 */
export type MyInfoResponse = {
  userId: number;
  nickname: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE' | null;
  /** 교환 완료 횟수. 0이면 '첫 교환을 기다리고 있어요' */
  completedCount: number;
  /** 다음 닉네임 변경 가능 시각. null 이면 지금 변경 가능 */
  nicknameChangeableAt: string | null;
  marketingAgreed: boolean;
  createdAt: string;
  /** 매너 지표. 2차, 교환 0회면 null */
  mannerScore: number | null;
  receivedReviews: { best: number; good: number; bad: number };
  noShow: { confirmedCount: number; pendingCount: number };
  /** 위반 경고 횟수. 2차 */
  warningCount: number | null;
  /** 이용 제한 해제 일시. 제한 중이 아니면 null. 2차 */
  restrictedUntil: string | null;
};

/** MB-3 닉네임 수정 결과 */
export type NicknameUpdateResponse = {
  nickname: string;
  /** 다음 변경 가능 시각 (지금 + 30일) */
  nicknameChangeableAt: string;
};

/** NT-5 · NT-6 알림 종류. 마이페이지 알림 설정은 교환 요청 · 채팅 · 약속 · 마케팅만 보여준다 */
export type NotificationType =
  | 'EXCHANGE_REQUEST'
  | 'CHAT'
  | 'APPOINTMENT'
  | 'WISHLIST_KEYWORD'
  | 'NOW_EXCHANGE_REPEAT'
  | 'MARKETING';

export type NotificationSetting = {
  type: NotificationType;
  enabled: boolean;
  changedAt: string | null;
};

/** MB-5 탈퇴 전 안내 */
export type WithdrawalNoticeResponse = {
  /** 진행 중인 교환(확정 약속) 수. 0이면 안내 문구 없음 */
  inProgressExchangeCount: number;
};

/** MB-6 떠나는 이유 */
export type WithdrawalReason =
  'NO_WANTED_GOODS' | 'HARD_TO_FIND_PARTNER' | 'INCONVENIENT' | 'OTHER';

export type BlockedMemberResponse = {
  userId: number;
  nickname: string;
  blockedAt: string;
};

type CursorPage<T> = { content: T[]; nextCursor: string | null; hasNext: boolean };

/** MB-2 내 정보 */
export function getMyInfo() {
  return apiData<MyInfoResponse>({ method: 'GET', url: '/v1/members/me' });
}

/** MB-3 닉네임 수정. 30일에 한 번 (가입 직후 1회는 바로 가능) */
export function updateNickname(nickname: string) {
  return apiData<NicknameUpdateResponse>({
    method: 'PATCH',
    url: '/v1/members/me/nickname',
    data: { nickname: nickname.trim() },
  });
}

/** NT-5 알림 설정 조회. 꺼도 앱 안 알림 목록에는 쌓이고 푸시만 안 보낸다 */
export function getNotificationSettings() {
  return apiData<{ settings: NotificationSetting[] }>({
    method: 'GET',
    url: '/v1/members/me/notification-settings',
  });
}

/** NT-6 알림 설정 변경. 누르면 바로 저장. MARKETING 은 MB-7 과 같은 값 */
export function updateNotificationSetting(type: NotificationType, enabled: boolean) {
  return apiData<NotificationSetting>({
    method: 'PATCH',
    url: '/v1/members/me/notification-settings',
    data: { type, enabled },
  });
}

/** MB-7 마케팅 정보 수신 동의 변경 */
export function updateMarketingConsent(agreed: boolean) {
  return apiData<{ agreed: boolean; changedAt: string }>({
    method: 'PUT',
    url: '/v1/members/me/marketing-consent',
    data: { agreed },
  });
}

/** MB-5 탈퇴 화면에 들어올 때. 진행 중인 교환이 있어도 탈퇴는 막지 않는다 */
export function getWithdrawalNotice() {
  return apiData<WithdrawalNoticeResponse>({
    method: 'GET',
    url: '/v1/members/me/withdrawal-notice',
  });
}

/** MB-6 회원 탈퇴 */
export function withdraw(reason: WithdrawalReason | null) {
  return apiData<unknown>({ method: 'DELETE', url: '/v1/members/me', data: { reason } });
}

/** BL-2 차단 목록 (최근 차단 순) */
export function getBlockedMembers(size = 50) {
  return apiData<CursorPage<BlockedMemberResponse>>({
    method: 'GET',
    url: '/v1/members/me/blocks',
    params: { size },
  });
}

/** BL-3 차단 해제 */
export function unblockMember(userId: number) {
  return apiData<unknown>({ method: 'DELETE', url: `/v1/members/me/blocks/${userId}` });
}

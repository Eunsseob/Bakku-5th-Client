import { apiData } from '@/shared/api/client';

// Swagger user: MB-2 내 정보 · MB-5 탈퇴 전 안내 · MB-6 회원 탈퇴 · BL-2 차단 목록 · BL-3 차단 해제

/** MB-2 내 정보. 1차는 닉네임 · 교환 완료 횟수만 쓴다 (2차 필드는 null) */
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

import { Tag } from '@/shared/components';

import type { ExchangeStatus, ItemCondition } from '../types';

// BDS Tag secondary sm (Figma BDS '✅F. 교환 완료' 채팅방 상단 배지: 테두리 없는 회색)

const CONDITION_LABEL: Record<ItemCondition, string> = {
  sealed: '미개봉',
  opened: '개봉',
};

/** 개봉 여부를 모르면 (서버 POST 아이템) 보이지 않는다 */
export function ItemConditionBadge({ condition }: { condition?: ItemCondition }) {
  if (!condition) return null;
  return <Tag hierarchy="secondary">{CONDITION_LABEL[condition]}</Tag>;
}

const STATUS_LABEL: Record<ExchangeStatus, string> = {
  available: '교환 가능',
  reserved: '예약중',
  completed: '교환 완료',
};

/** 교환글 상태. 채팅 목록에서는 진행 중(available)일 때 표시하지 않는다 */
export function ExchangeStatusBadge({
  status,
  hideAvailable = false,
}: {
  status: ExchangeStatus;
  hideAvailable?: boolean;
}) {
  if (status === 'available' && hideAvailable) return null;
  return <Tag hierarchy="secondary">{STATUS_LABEL[status]}</Tag>;
}

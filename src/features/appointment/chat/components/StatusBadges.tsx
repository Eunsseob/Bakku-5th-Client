import { Badge, type BadgeHierarchy, type BadgeVariant, Tag } from '@/shared/components';

import type { ExchangeStatus, ItemCondition } from '../types';

const CONDITION_LABEL: Record<ItemCondition, string> = {
  sealed: '미개봉',
  opened: '개봉',
};

/** 개봉 여부를 모르면 (서버 POST 아이템) 보이지 않는다 */
export function ItemConditionBadge({ condition }: { condition?: ItemCondition }) {
  if (!condition) return null;
  return <Tag hierarchy="secondary">{CONDITION_LABEL[condition]}</Tag>;
}

type StatusBadgeStyle = { label: string; hierarchy: BadgeHierarchy; variant: BadgeVariant };

/** BDS Chatstate/state: 채팅방 상단 교환글 상태 (Badge lg) */
const ROOM_STATUS: Record<ExchangeStatus, StatusBadgeStyle> = {
  available: { label: '교환 가능', hierarchy: 'accent', variant: 'alpha' },
  reserved: { label: '예약중', hierarchy: 'secondary', variant: 'solid' },
  completed: { label: '교환 완료', hierarchy: 'tertiary', variant: 'outlined' },
};

/** BDS Chatlist/state: 채팅 목록 상태 (Badge md). 교환 가능(default)은 배지가 없다 */
const LIST_STATUS: Partial<Record<ExchangeStatus, StatusBadgeStyle>> = {
  reserved: { label: '예약중', hierarchy: 'secondary', variant: 'alpha' },
  completed: { label: '교환완료', hierarchy: 'tertiary', variant: 'outlined' },
};

/** 채팅방 상단 교환글 상태 */
export function ExchangeStatusBadge({ status }: { status: ExchangeStatus }) {
  const { label, hierarchy, variant } = ROOM_STATUS[status];
  return (
    <Badge hierarchy={hierarchy} variant={variant} size="lg">
      {label}
    </Badge>
  );
}

/** 채팅 목록 닉네임 옆 상태 */
export function ChatListStatusBadge({ status }: { status: ExchangeStatus }) {
  const style = LIST_STATUS[status];
  if (!style) return null;
  return (
    <Badge hierarchy={style.hierarchy} variant={style.variant} size="md">
      {style.label}
    </Badge>
  );
}

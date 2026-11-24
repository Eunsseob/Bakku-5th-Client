import { semantic } from '@/design-tokens';
import { router } from 'expo-router';
import { NotePencilIcon } from 'phosphor-react-native/src/icons/NotePencil';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  BottomSheet,
  Button,
  Chip,
  EmptyState,
  Icon,
  type IconComponent,
  InteractionLayer,
  TopNavigation,
} from '@/shared/components';

import { MOCK_MY_POSTS, type MyPost, type MyPostStatus } from '../api/mockMyPosts';
import { useToastMessage } from '../hooks/useToastMessage';
import { MyPostItem } from './MyPostItem';
import { ToastOverlay } from './ToastOverlay';

// G-2 내 교환글 (2729:31360 · G-2-1 예약중 · G-2-2 교환완료 · G-3 ⋮ 바텀시트 · G-4 작성 글 없음)
// TODO: 내 교환글 목록 API 가 생기면 목업(MOCK_MY_POSTS) 대신 서버 데이터로 바꾼다

const TABS: { status: MyPostStatus; label: string }[] = [
  { status: 'AVAILABLE', label: '교환가능' },
  { status: 'RESERVED', label: '예약중' },
  { status: 'COMPLETED', label: '교환완료' },
];

type ExchangeKind = 'now' | 'normal';

/** Tab Menu: 3칸, 선택된 칸은 아래 2px accent/boldest */
function TabMenu({
  selected,
  onSelect,
}: {
  selected: MyPostStatus;
  onSelect: (status: MyPostStatus) => void;
}) {
  return (
    <View accessibilityRole="tablist" className="flex-row px-4">
      {TABS.map((tab) => {
        const active = tab.status === selected;
        return (
          <Pressable
            key={tab.status}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(tab.status)}
            className={`flex-1 items-center justify-center px-3 py-2 ${active ? 'border-b-2 border-accent-boldest' : ''}`}
          >
            <Text className="font-sans text-label-md font-medium text-object-boldest">
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** 바텀시트 한 줄: 32 원(surface/deeper) 안 20 아이콘 + label/lg */
function SheetAction({
  icon,
  label,
  destructive = false,
  onPress,
}: {
  icon: IconComponent;
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 py-[11px]"
    >
      {({ pressed }) => (
        <>
          <View className="size-8 items-center justify-center rounded-max bg-surface-deeper">
            <Icon
              icon={icon}
              size="lg"
              color={destructive ? semantic.theme.red.bold : semantic.object.bold}
            />
          </View>
          <Text
            className={`font-sans text-label-lg font-normal ${destructive ? 'text-theme-red-bold' : 'text-object-normal'}`}
          >
            {label}
          </Text>
          <InteractionLayer pressed={pressed} color={semantic.fill.boldest} radius={8} />
        </>
      )}
    </Pressable>
  );
}

export function MyPostsScreen() {
  const [toast, setToast] = useToastMessage();
  const [posts, setPosts] = useState<MyPost[]>(MOCK_MY_POSTS);
  const [tab, setTab] = useState<MyPostStatus>('AVAILABLE');
  const [kind, setKind] = useState<ExchangeKind>('now');
  const [menuPost, setMenuPost] = useState<MyPost | null>(null);

  const inTab = posts.filter((post) => post.status === tab);
  // 교환가능 탭만 지금교환 · 일반교환으로 나눈다 (글이 없으면 칩도 숨김, G-4)
  const showKinds = tab === 'AVAILABLE' && inTab.length > 0;
  const visible = showKinds ? inTab.filter((post) => post.nowExchange === (kind === 'now')) : inTab;

  const closeMenu = () => setMenuPost(null);

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation type="screen" title="내 교환글" onBack={() => router.back()} />
      <TabMenu selected={tab} onSelect={setTab} />

      {showKinds ? (
        <View className="mt-3 flex-row gap-2 px-[17px]">
          <Chip
            hierarchy={kind === 'now' ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setKind('now')}
          >
            지금교환
          </Chip>
          <Chip
            hierarchy={kind === 'normal' ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setKind('normal')}
          >
            일반교환
          </Chip>
        </View>
      ) : null}

      {visible.length === 0 ? (
        <View className="flex-1 justify-center">
          <EmptyState
            title="작성한 교환글이 없어요"
            description="바꾸에서 굿즈를 교환해보세요!"
            action={{
              label: '글쓰기',
              hierarchy: 'primary',
              onPress: () => router.push('/(main)/(post-create)/write'),
            }}
          />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-5 px-4 pb-6 pt-6">
          {visible.map((post) => (
            <MyPostItem key={post.id} post={post} onMore={() => setMenuPost(post)} />
          ))}
        </ScrollView>
      )}

      {/* G-3: ⋮ → 수정하기 · 삭제하기 · [닫기] */}
      <BottomSheet visible={!!menuPost} onRequestClose={closeMenu}>
        <View>
          <SheetAction
            icon={NotePencilIcon}
            label="수정하기"
            onPress={() => {
              closeMenu();
              // TODO: 서버 글이면 /post/edit/[id] 로 이동. 목업 글은 상세가 없어서 막아 둔다
              setToast('준비 중이에요');
            }}
          />
          <SheetAction
            icon={XIcon}
            label="삭제하기"
            destructive
            onPress={() => {
              // TODO: 서버 글이면 PO-5 삭제. 지금은 목업에서만 뺀다
              const target = menuPost;
              closeMenu();
              if (target) setPosts((list) => list.filter((post) => post.id !== target.id));
            }}
          />
        </View>
        <View className="pb-2 pt-3">
          <Button hierarchy="secondary" size="lg" onPress={closeMenu} className="self-stretch">
            닫기
          </Button>
        </View>
      </BottomSheet>
      <ToastOverlay message={toast} />
    </View>
  );
}

import { router } from 'expo-router';
import { NotePencilIcon } from 'phosphor-react-native/src/icons/NotePencil';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BottomSheet, Button, EmptyState, TopNavigation } from '@/shared/components';

import { MOCK_MY_POSTS, type MyPost, type MyPostStatus } from '../../api/mockMyPosts';
import { useToastMessage } from '../../hooks/useToastMessage';
import { SheetAction } from '../common/SheetAction';
import { ToastOverlay } from '../common/ToastOverlay';
import { MyPostItem } from './MyPostItem';

// G-2 내 교환글 (2729:31360 교환가능 · G-2-1 예약중 2729:36282 · G-2-2 교환완료 2840:29965)
// G-2-3 ⋮ 바텀시트 (2729:31372): 수정하기 · 삭제하기 · [닫기]
// G-2-4 작성 글 없음 (2729:31352)
// TODO: 내 교환글 목록 API 가 생기면 목업(MOCK_MY_POSTS) 대신 서버 데이터로 바꾼다

const TABS: { status: MyPostStatus; label: string }[] = [
  { status: 'AVAILABLE', label: '교환가능' },
  { status: 'RESERVED', label: '예약중' },
  { status: 'COMPLETED', label: '교환완료' },
];

/** Tab Menu: 3칸(114), 선택된 칸은 아래 2px accent/boldest */
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

export function MyPostsScreen() {
  const [toast, setToast] = useToastMessage();
  const [posts, setPosts] = useState<MyPost[]>(MOCK_MY_POSTS);
  const [tab, setTab] = useState<MyPostStatus>('AVAILABLE');
  const [menuPost, setMenuPost] = useState<MyPost | null>(null);

  const visible = posts.filter((post) => post.status === tab);
  const closeMenu = () => setMenuPost(null);

  return (
    <View className="flex-1 bg-surface-standard">
      <TopNavigation type="screen" title="내 교환글" onBack={() => router.back()} />
      <TabMenu selected={tab} onSelect={setTab} />

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
        // 탭 아래 26 · 카드 사이 20
        <ScrollView contentContainerClassName="gap-5 px-4 pb-6 pt-[26px]">
          {visible.map((post) => (
            <MyPostItem key={post.id} post={post} onMore={() => setMenuPost(post)} />
          ))}
        </ScrollView>
      )}

      {/* G-2-3: ⋮ → 수정하기 · 삭제하기 · [닫기] */}
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

import { router } from 'expo-router';
import { CheckCircleIcon } from 'phosphor-react-native/src/icons/CheckCircle';
import { NotePencilIcon } from 'phosphor-react-native/src/icons/NotePencil';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { BottomSheet, Button, Chip, EmptyState, TopNavigation } from '@/shared/components';

import { MOCK_MY_POSTS, type MyPost, type MyPostStatus } from '../../api/mockMyPosts';
import { useToastMessage } from '../../hooks/useToastMessage';
import { MyPostItem } from './MyPostItem';
import { SheetAction } from '../common/SheetAction';
import { ToastOverlay } from '../common/ToastOverlay';

// G-2 내 교환글 (2729:31360 · G-2-1 예약중 · G-2-2 교환완료 · G-3 ⋮ 바텀시트 · G-4 작성 글 없음)
// 추가 프레임 G-4 내 게시글 사후 교환완료처리 (3115:53839): ⋮ → 교환 완료로 바꾸기 → 누구와 교환했나요? → 교환 확정
// TODO: 내 교환글 목록 API 가 생기면 목업(MOCK_MY_POSTS) 대신 서버 데이터로 바꾼다
// TODO: 사후 교환 완료 처리 API 가 Swagger 에 없다. 지금은 목업 글을 교환완료 탭으로만 옮긴다

const TABS: { status: MyPostStatus; label: string }[] = [
  { status: 'AVAILABLE', label: '교환가능' },
  { status: 'RESERVED', label: '예약중' },
  { status: 'COMPLETED', label: '교환완료' },
];

type ExchangeKind = 'now' | 'normal';

/** G-4 교환 완료로 바꾸기 단계: 상대 고르기 → 확정 (앱 밖 교환이면 partner 가 null) */
type CompleteFlow =
  { post: MyPost; step: 'partner' } | { post: MyPost; step: 'confirm'; partner: string | null };

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

export function MyPostsScreen() {
  const [toast, setToast] = useToastMessage();
  const [posts, setPosts] = useState<MyPost[]>(MOCK_MY_POSTS);
  const [tab, setTab] = useState<MyPostStatus>('AVAILABLE');
  const [kind, setKind] = useState<ExchangeKind>('now');
  const [menuPost, setMenuPost] = useState<MyPost | null>(null);
  const [completeFlow, setCompleteFlow] = useState<CompleteFlow | null>(null);

  const inTab = posts.filter((post) => post.status === tab);
  // 교환가능 탭만 지금교환 · 일반교환으로 나눈다 (글이 없으면 칩도 숨김, G-4)
  const showKinds = tab === 'AVAILABLE' && inTab.length > 0;
  const visible = showKinds ? inTab.filter((post) => post.nowExchange === (kind === 'now')) : inTab;

  const closeMenu = () => setMenuPost(null);
  const closeComplete = () => setCompleteFlow(null);

  const completePost = (post: MyPost) => {
    closeComplete();
    setPosts((list) =>
      list.map((item) => (item.id === post.id ? { ...item, status: 'COMPLETED' } : item)),
    );
    setToast('교환 완료로 바꿨어요');
  };

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

      {/* G-3: ⋮ → 수정하기 · 삭제하기 · (G-4) 교환 완료로 바꾸기 · [닫기] */}
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
          {menuPost && menuPost.status !== 'COMPLETED' ? (
            <SheetAction
              icon={CheckCircleIcon}
              label="교환 완료로 바꾸기"
              onPress={() => {
                const target = menuPost;
                closeMenu();
                setCompleteFlow({ post: target, step: 'partner' });
              }}
            />
          ) : null}
        </View>
        <View className="pb-2 pt-3">
          <Button hierarchy="secondary" size="lg" onPress={closeMenu} className="self-stretch">
            닫기
          </Button>
        </View>
      </BottomSheet>

      {/* G-4 누구와 교환했나요? (채팅 상대 0명이면 '앱 밖에서 교환했어요'만) */}
      <BottomSheet
        visible={completeFlow?.step === 'partner'}
        onRequestClose={closeComplete}
        title="누구와 교환했나요?"
        closeButtonVisible
      >
        <View className="pb-2">
          {completeFlow?.post.chatPartners.map((partner) => (
            <SheetAction
              key={partner}
              label={partner}
              onPress={() =>
                completeFlow &&
                setCompleteFlow({ post: completeFlow.post, step: 'confirm', partner })
              }
            />
          ))}
          <SheetAction
            label="앱 밖에서 교환했어요"
            onPress={() =>
              completeFlow &&
              setCompleteFlow({ post: completeFlow.post, step: 'confirm', partner: null })
            }
          />
        </View>
      </BottomSheet>

      {/* G-4 교환 확정 시트 · 앱 밖 교환 확인 */}
      <BottomSheet
        visible={completeFlow?.step === 'confirm'}
        onRequestClose={closeComplete}
        closeButtonVisible
        {...(completeFlow?.step === 'confirm' && completeFlow.partner === null
          ? {
              // TODO: 앱 밖 교환 확인 문구 · 형태(시트/팝업)는 Figma 에 'PD' 로 비어 있다. 정해지면 맞춘다
              title: '앱 밖에서 교환했나요?',
              description: '교환 완료로 바꾸면 되돌릴 수 없어요.',
            }
          : {
              title: '한 쪽만 확정해도 교환완료 처리돼요',
              description:
                '한 명만 교환 완료 처리해도 교환이 확정됩니다. 확정은 취소할 수 없으니 주의해주세요.',
            })}
        primary={{
          label: '교환 확정',
          onPress: () => completeFlow && completePost(completeFlow.post),
        }}
        secondary={{ label: '취소', onPress: closeComplete }}
      />
      <ToastOverlay message={toast} />
    </View>
  );
}

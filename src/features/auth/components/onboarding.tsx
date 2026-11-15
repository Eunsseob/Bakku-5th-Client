import { Button } from '@/shared/components/Button';
import { router, Stack } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ONBOARDING_DATA } from '@/constants/auth';

const font = { fontFamily: 'Pretendard', includeFontPadding: false };

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pageWidth = Math.max(1, width - insets.left - insets.right);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const goToLogin = () => router.replace('/(auth)/login');
  const handleNext = () => {
    if (currentIndex === ONBOARDING_DATA.length - 1) {
      goToLogin();
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setCurrentIndex(
      Math.max(
        0,
        Math.min(
          ONBOARDING_DATA.length - 1,
          Math.round(event.nativeEvent.contentOffset.x / pageWidth),
        ),
      ),
    );
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className={'items-end justify-center px-4'}
        style={{
          height: Math.max(34, 78 - insets.top),
        }}
      >
        {currentIndex < ONBOARDING_DATA.length - 1 && (
          <Pressable
            accessibilityRole="button"
            onPress={goToLogin}
            className="min-h-11 min-w-20 items-end justify-center"
          >
            <Text style={font} className="text-[14px] leading-5 tracking-[-0.14px] text-[#4A5565]">
              건너뛰기
            </Text>
          </Pressable>
        )}
      </View>
      <FlatList
        key={pageWidth}
        ref={flatListRef}
        style={{ flex: 1, minHeight: 0 }}
        data={ONBOARDING_DATA}
        horizontal
        pagingEnabled
        initialScrollIndex={currentIndex}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index: pageIndex }) => (
          <ScrollView
            style={{ width: pageWidth }}
            contentContainerStyle={{
              alignItems: 'center',
              paddingTop: 24,
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View
              accessibilityLabel="온보딩 이미지 자리"
              style={{ width: Math.min(311, pageWidth - 64), height: 360 }}
              className={'rounded-[24px] bg-[#F3F4F6]'}
            />
            <Text
              style={font}
              className={
                'mt-10 w-full px-4 text-center text-[20px] leading-[26px] tracking-[-0.2px] text-[#364153]'
              }
            >
              {item.title}
            </Text>
            <Text
              style={font}
              className={'mt-2 w-full px-4 text-center text-[16px] leading-[26px] text-[#6A7282]'}
            >
              {item.description}
            </Text>
            <View
              accessibilityLabel={`${pageIndex + 1} / ${ONBOARDING_DATA.length} 페이지`}
              className={'mt-8 flex-row items-center justify-center gap-[6px]'}
            >
              {ONBOARDING_DATA.map((page, index) => (
                <View
                  key={page.id}
                  className={`h-[6px] rounded-full ${index === pageIndex ? 'w-[18px] bg-[#364153]' : 'w-[6px] bg-[#D1D5DC]'}`}
                />
              ))}
            </View>
          </ScrollView>
        )}
      />
      <View className={'shrink-0 px-4'} style={{ paddingBottom: 8 }}>
        <Button
          hierarchy="primary"
          accessibilityRole="button"
          onPress={handleNext}
          className={'w-full self-center !rounded-xl !bg-[#364153]'}
        >
          {currentIndex === ONBOARDING_DATA.length - 1 ? '바꾸 시작하기' : '다음'}
        </Button>
      </View>
    </View>
  );
}

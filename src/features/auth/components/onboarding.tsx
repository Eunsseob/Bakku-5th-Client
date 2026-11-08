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
        className="items-end justify-end px-[17px] pb-[13px]"
        style={{ height: Math.max(64, 97 - insets.top) }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={goToLogin}
          className="min-h-11 min-w-20 items-end justify-center"
        >
          <Text style={font} className="text-[13px] leading-[18px] text-[#737380]">
            건너뛰기
          </Text>
        </Pressable>
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
            contentContainerStyle={{ alignItems: 'center', paddingTop: 40, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              accessibilityLabel="온보딩 이미지 자리"
              className="h-[280px] w-[280px] max-w-[90%] rounded-[12px] bg-[#E0E0E6]"
            />
            <Text
              style={font}
              className="mt-[30px] w-full px-2 text-center text-[19px] leading-[27px] text-[#2E2E33]"
            >
              {item.title}
            </Text>
            <Text
              style={font}
              className="mt-[13px] w-full max-w-[280px] text-center text-[14px] leading-5 text-[#737380]"
            >
              {item.description}
            </Text>
            <View
              accessibilityLabel={`${pageIndex + 1} / ${ONBOARDING_DATA.length} 페이지`}
              className="mt-[50px] flex-row items-center justify-center gap-2"
            >
              {ONBOARDING_DATA.map((page, index) => (
                <View
                  key={page.id}
                  className={`h-2 rounded-full ${index === pageIndex ? 'w-[18px] bg-[#2E2E33]' : 'w-2 bg-[#BFBFC7]'}`}
                />
              ))}
            </View>
          </ScrollView>
        )}
      />
      <View className="px-[21px] pt-3" style={{ paddingBottom: Math.max(16, 35 - insets.bottom) }}>
        <Button
          hierarchy="primary"
          accessibilityRole="button"
          onPress={handleNext}
          className="w-full max-w-[312px] self-center"
        >
          {currentIndex === ONBOARDING_DATA.length - 1 ? '시작하기' : '다음'}
        </Button>
      </View>
    </View>
  );
}

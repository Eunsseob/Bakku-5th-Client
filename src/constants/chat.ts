// 채팅 데이터 소스. 기본은 서버 API, EXPO_PUBLIC_USE_MOCK_CHAT=true 면 목업 데이터(mockChats)를 쓴다.
export const USE_MOCK_CHAT = process.env.EXPO_PUBLIC_USE_MOCK_CHAT === 'true';

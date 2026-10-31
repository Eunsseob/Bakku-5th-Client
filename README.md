# Bakku (5th) Front

iOS · Android · Web 을 하나의 코드베이스로 개발하는 React Native(Expo) 앱입니다.

## 기술 스택

| 영역          | 사용 기술                                        |
| ------------- | ------------------------------------------------ |
| 앱/프론트엔드 | React Native + Expo (SDK 58), Expo Router        |
| 스타일링      | NativeWind v4 (Tailwind CSS v3)                  |
| 상태 관리     | Zustand (클라이언트 전역 상태)                   |
| 서버 통신     | axios + TanStack Query (서버 상태·캐싱)          |
| 코드 품질     | TypeScript, ESLint(eslint-config-expo), Prettier |

## 시작하기

Node.js **22.13 이상**이 필요합니다 (`.nvmrc` 참고).

```bash
npm install
cp .env.example .env.local   # API 주소 설정
npm start                    # Expo 개발 서버 (a: Android, i: iOS, w: Web)
```

## 스크립트

| 명령                | 설명                    |
| ------------------- | ----------------------- |
| `npm start`         | Expo 개발 서버          |
| `npm run web`       | 웹으로 실행             |
| `npm run android`   | Android로 실행          |
| `npm run ios`       | iOS로 실행 (macOS 필요) |
| `npm run lint`      | ESLint                  |
| `npm run typecheck` | 타입 체크               |
| `npm run format`    | Prettier 포맷팅         |

## 폴더 구조

```
src/
├── app/                      # Expo Router 화면/레이아웃 (파일 = 라우트)
├── shared/
│   ├── api/                  # axios 인스턴스, QueryClient, 환경변수, 인증 토큰 스토어
│   └── components/           # 공통 컴포넌트
├── features/
│   ├── auth/                 # A   진입 · 가입
│   ├── post-create/          # B   교환글 작성
│   ├── explore/              # C
│   │   ├── post-detail/      # C-1 검색 · 상세 · 신고
│   │   ├── exchange-request/ # C-2 교환 요청 · 새 사진
│   │   └── map/              # C-3 교환 지도
│   ├── request/              # D
│   │   ├── inbox/            # D-1 받은 요청 · 수락 · 거절
│   │   └── rejection/        # D-2 거절 확인 · 재요청
│   ├── appointment/          # E
│   │   ├── chat/             # E-1 채팅 · 약속 확정 · 메뉴 · 장소 보내기
│   │   └── cancel/           # E-2 약속 취소 · 약속 임박 취소 경고
│   ├── completion/           # F
│   │   ├── review/           # F-1 교환 완료 · 후기
│   │   └── failure/          # F-2 교환 못 함 · 노쇼 · 응답 없음 리마인드
│   └── mypage/               # G   마이 · 설정
└── global.css                # Tailwind 진입점
```

각 기능 폴더는 아래 구조를 따릅니다.

```
features/<기능>/
├── api/         # API 호출 함수, useQuery/useMutation 훅
├── components/  # 기능 전용 UI
├── hooks/       # 기능 전용 훅
├── store/       # 기능 전용 Zustand 스토어
└── types/       # 기능 전용 타입
```

- 화면이 아닌 코드는 `src/app/` 밖에 둡니다. 라우트 파일은 `features`의 컴포넌트를 조합만 합니다.
- 여러 기능에서 쓰는 코드만 `shared`로 올립니다. 기능끼리는 서로 직접 import 하지 않습니다.
- 서버 데이터는 TanStack Query, 로그인 토큰·UI 상태 등 클라이언트 전역 상태는 Zustand로 관리합니다.
- 패키지 추가 시 `npx expo install <패키지>` 를 사용하면 SDK에 맞는 버전이 설치됩니다.

## 브랜드 컬러

[tailwind.config.js](tailwind.config.js)에서 관리합니다. 색을 바꿀 때는 이 파일만 수정하면 됩니다.

| 이름 | 컬러           | 대표색 (400) |
| ---- | -------------- | ------------ |
| `bp` | Bubblegum Pink | `#FF5FA2`    |
| `gb` | Gacha Blue     | `#4AA8F5`    |
| `lp` | Lime Pop       | `#C8F03C`    |

각 컬러는 50~950 단계가 있고, 단계를 생략하면 대표색이 적용됩니다.

```tsx
<View className="bg-bp" />        {/* 대표색 */}
<Text className="text-gb-600" />  {/* 단계 지정 */}
<View className="bg-lp-400/50" /> {/* 투명도 */}
```

## 협업 규칙

브랜치 전략, 이슈 → 브랜치 자동 생성, CI는 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

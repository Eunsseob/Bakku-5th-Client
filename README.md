# Bakku (5th) Front

iOS · Android · Web 을 하나의 코드베이스로 개발하는 React Native(Expo) 앱입니다.

## 기술 스택

| 영역          | 사용 기술                                         |
| ------------- | ------------------------------------------------- |
| 앱/프론트엔드 | React Native + Expo (SDK 58), Expo Router         |
| 스타일링      | NativeWind v4 (Tailwind CSS v3) + BDS 디자인 토큰 |
| 상태 관리     | Zustand (클라이언트 전역 상태)                    |
| 서버 통신     | axios + TanStack Query (서버 상태·캐싱)           |
| 코드 품질     | TypeScript, ESLint(eslint-config-expo), Prettier  |

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

## 디자인 토큰 (BDS)

Figma [BDS - 바꾸 디자인 시스템](https://www.figma.com/design/8ABy7xIlfPzaP3a4qQAZNS)의 변수를 [design-tokens.js](design-tokens.js)에 그대로 옮겼습니다. 값은 Figma 에서만 바꾸고, 이 파일을 같이 맞춥니다. Tailwind 기본 색상표는 쓰지 않습니다.

### 컬러

시멘틱 토큰을 먼저 씁니다. Figma 변수 `semantic/object/boldest` → 클래스 `text-object-boldest` 처럼 `/`를 `-`로 바꿉니다.

| 그룹                        | 용도                        | 예시                                                  |
| --------------------------- | --------------------------- | ----------------------------------------------------- |
| `object` · `object-inverse` | 글자·아이콘                 | `text-object-boldest`, `text-object-inverse-boldest`  |
| `accent`                    | 강조(바이올렛)              | `bg-accent-bold`, `text-accent-bold`                  |
| `surface`                   | 화면·카드 배경              | `bg-surface-standard`, `bg-surface-deeper`            |
| `fill`                      | 반투명 채움                 | `bg-fill-boldest`, `bg-fill-subtlest`                 |
| `stroke` · `stroke-alpha`   | 테두리·구분선               | `border-stroke-subtle`, `border-stroke-alpha-subtler` |
| `curtain`                   | 딤 처리                     | `bg-curtain-dim`                                      |
| `theme-<색>`                | 상태색 (red, green 등 17색) | `bg-theme-red-bold`, `text-theme-green-bolder`        |

단계는 `boldest · bolder · bold · normal · neutral · alternative · assistive · subtle · subtler · subtlest` 입니다. 프리미티브(`gray-900`, `violet-500` …)는 시멘틱에 없는 경우에만 씁니다.

`className`을 못 쓰는 곳(아이콘 `color` 등)은 값을 직접 가져옵니다.

```tsx
import { semantic } from '@/design-tokens';

<HeartIcon color={semantic.accent.bold} />;
```

### 텍스트 스타일

폰트는 **Pretendard**(400·500·600·700)이고 [src/app/\_layout.tsx](src/app/_layout.tsx)에서 불러옵니다. `title/6` → `text-title-6` 처럼 씁니다. 크기·행간·자간이 함께 적용되고, title 은 Figma 모바일 모드 값입니다.

| 그룹   | 클래스                                                        |
| ------ | ------------------------------------------------------------- |
| title  | `text-title-6` ~ `text-title-1` (40px ~ 18px)                 |
| label  | `text-label-lg` / `-md` / `-sm` / `-xs` / `-2xs`              |
| body   | `text-body-lg` / `-md` / `-sm` / `-xs` / `-2xs`               |
| syntax | `text-syntax-lg` / `-md` / `-sm` / `-xs` (`font-mono`와 함께) |

`Text`마다 `font-sans`를 붙여야 Pretendard가 적용됩니다. 굵기는 Figma 의 bold/normal/subtle 에 맞춰 `font-semibold`(또는 `font-bold`) / `font-medium` / `font-normal`을 씁니다.

```tsx
<Text className="font-sans text-title-2 font-semibold text-object-bolder">제목</Text>
```

### 아이콘

[Phosphor](https://phosphoricons.com) 아이콘을 아이콘별 경로로 가져옵니다. 루트(`phosphor-react-native`)에서 가져오면 아이콘 전체가 번들에 들어가서 lint 에러가 납니다.

```tsx
import { HeartIcon } from 'phosphor-react-native/src/icons/Heart';
import { Icon } from '@/shared/components';

<Icon icon={HeartIcon} size="xl" />  {/* 5xl 48 · 4xl 40 · 3xl 32 · 2xl 28 · xl 24 · lg 20 · md 16 · sm 14 · xs 12 · 2xs 10 */}
```

## 공통 컴포넌트

[src/shared/components](src/shared/components)에서 가져다 씁니다. prop 이름은 Figma 컴포넌트 속성과 같습니다(Figma 의 `style`은 RN 예약어라 `variant`).

```tsx
import { Button, Chip, TextField, TopNavigation } from '@/shared/components';

<Button hierarchy="accent" size="lg" leadingIcon={PlusIcon} onPress={submit}>작성 완료</Button>
<Chip hierarchy="primary" variant="outlined" trailingIconVisible>필터</Chip>
```

| 컴포넌트            | 주요 props                                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`            | `hierarchy` accent·primary·secondary, `variant` solid·outlined·hollow, `size` lg·md·sm·xs, `feedback`, `leadingIcon`·`trailingIcon`, `disabled` |
| `LabelButton`       | `hierarchy` accent·primary·secondary·tertiary, `size` lg·md·sm·xs, `feedback`, `leadingIcon`·`trailingIcon`                                     |
| `IconButton`        | `icon`, `accessibilityLabel`, `hierarchy`, `size` 3xl ~ 2xs                                                                                     |
| `Fab`               | `accessibilityLabel`, `icon`(기본 +)                                                                                                            |
| `Chip`              | `hierarchy` accent·primary·secondary, `variant` solid·outlined, `size` lg·md·sm, `trailingIconVisible`                                          |
| `Tag`               | `hierarchy`, `variant` solid·outlined, `size` sm·md (Figma 작업 중)                                                                             |
| `Thumbnail`         | `source`, `ratio` 1:1·4:5·3:4·2:3·9:16, `orientation`, `cornerStyle` angular·curved·rounded, `variant`, `size`                                  |
| `Checkbox`·`Radio`  | `status`/`checked`, `label`, `helperText`, `hierarchy` primary·accent, `size` lg·md, `disabled`                                                 |
| `TextField`         | `label`, `optional`, `helperText`, `error`, `disabled`, `leadingIcon`, `trailing` delete·dropDown·move·time·date, `multiline` + TextInput props |
| `TopNavigation`     | `type="home"`(`title`, `onTitlePress`, `actions`) · `type="screen"`(`title`, `description`, `onBack`, `trailingLabel`)                          |
| `BottomNavigation`  | `items`(`key`·`label`·`icon`·`badge`), `selectedKey`, `onSelect`                                                                                |
| `NotificationBadge` | `count`(없으면 점), `size` sm·md·lg                                                                                                             |
| `Divider`           | `thickness` normal·bold·bolder·boldest, `layout`, `variant` solid·dashed                                                                        |
| `InteractionLayer`  | 눌림 효과(8% 오버레이). 새 컴포넌트를 만들 때 사용                                                                                              |

## 협업 규칙

브랜치 전략, 이슈 → 브랜치 자동 생성, CI는 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

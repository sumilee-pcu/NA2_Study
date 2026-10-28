# 실기 모듈 통합 계약

## 컴포넌트와 경로

```jsx
const Cabling = lazy(() => import('./modules/cabling/App.jsx'));
<Cabling route={currentRoute} onTheory={openTheory} onAssessmentState={setAssessmentInProgress} />
```

- `default App({ onTheory, onAssessmentState, route = '/cabling' })`를 내보냅니다. 모듈이 자체 `styles.css`를 불러옵니다.
- 루트는 실기 모듈을 한 번 마운트한 뒤 이론·필기 방문 동안 숨겨 유지합니다. `route`에는 현재 경로 전체를 전달합니다.
- `/cabling`은 마지막 일반 화면으로 돌아갑니다. 진행 중인 세션이 있으면 새로고침 후 훈련 화면을 엽니다.
- `/cabling/pins`는 핀별 진단·복습, `/cabling/correction`은 배열 교정입니다.
- 내부 탐색은 `#/cabling`, `#/cabling/pins`, `#/cabling/correction` 해시를 사용합니다. 필기 링크는 `#/written`입니다.
- 이론 버튼은 `onTheory('cabling-t568')` 또는 `onTheory('cabling-orientation')`를 호출합니다. 호출 동안 세션과 입력을 초기화하지 않습니다.
- `onTheory`가 없으면 모듈 안의 개념 학습으로 이동합니다.
- 현재 경로가 실기가 아니면 퀴즈 자동 다음 문항 타이머를 멈춥니다. 제작 연습 타이머는 실제 경과 시각을 기준으로 계속됩니다.
- 진행 중인 평가에서는 모듈의 개념 설명·이론 버튼·교정 화면과 교정 reducer 작업을 막습니다. 진단은 해당 평가 제출을 제외하고 이전 기록만 보여 줍니다.
- `onAssessmentState(boolean)`를 effect에서 호출하여 평가 진행 상태를 루트에 알립니다. 루트는 평가 중 학습센터 본문을 차단하고 해당 평가로 돌아가는 버튼을 제공합니다. 새로고침 직후 모듈 로딩 전 차단은 루트가 새 저장 키의 `session.mode === 'assessment' && !session.completedAt`만 확인하여 적용합니다.

## 저장과 백업

- 현재 저장 키: `na2_study_cabling_v1`
- 별도 보존 슬롯: `na2_study_cabling_legacy_v1`
- 원본 `na2_cabling_v1`, `cabling-trainer-progress`는 읽거나 쓰지 않습니다.
- 새 상태의 `schemaVersion`은 `2`입니다. 기존 필드 `events`, `session`, `settings`, `legacy`, `practical`을 유지하고 `corrections`를 추가했습니다.
- 사용자가 명시적으로 가져온 기존 schema 1 백업은 응답·세션·제작 기록을 그대로 보존하고 빈 `corrections`를 추가해 schema 2로 변환합니다. 원본 앱 저장소에서 자동으로 가져오지 않습니다.
- 내보내기와 저장은 동일한 엄격 검증을 사용합니다. 잘못된 원본 참조·배열·채점·시간·중복 완료·알 수 없는 필드·미래 버전을 거부합니다.
- 초기화는 통합 실기의 응답·세션·교정·제작 기록을 비웁니다. 기존 앱 저장소와 필기 기록에는 접근하지 않습니다.

### `corrections`

```js
{
  active: null | {
    id,                  // c_<시각>_<완료 기록 수>
    standard,            // T568A | T568B
    sourceEventId,       // 실제 배열 오답 event.id 또는 생성 배열이면 null
    original,            // 시작 시 8개 전선 ID 배열, 이후 변경하지 않음
    draft,               // 현재 교정 배열
    selectedPin,         // null 또는 0..7
    swaps,               // 완료한 두 핀 교환 횟수
    startedAt,           // ISO 시간
    completedAt          // null 또는 ISO 시간
  },
  records: [{
    id, standard, sourceEventId, original,
    answer,              // 교정 완료 배열
    swaps, startedAt, completedAt
  }]
}
```

완료 후에도 `active`를 유지하여 결과와 무힌트 재확인 버튼을 표시합니다. `active.completedAt`가 있으면 마지막 완료 기록과 정확히 일치해야 하며, 추가 교환·중복 완료를 거부합니다.

### 교정 reducer 입력

- `CORRECTION_START`: `{ standard, sourceEventId?: string|null, pair?: [0..7, 0..7], at }`
- `CORRECTION_SELECT`: `{ pin: 0..7 }`. 첫 선택을 저장하고 두 번째 다른 핀 선택에서 교환합니다. 같은 핀을 다시 선택하면 선택을 취소합니다.
- `CORRECTION_FINISH`: `{ at }`. 표준과 8개 위치가 모두 일치할 때 1건만 기록합니다.
- 교정은 `events`, 기존 제출 답안, 정답률, 오답 목록을 변경하지 않습니다. 무힌트 재확인은 일반 `makeSession({ kind: 'order', mode: 'assessment', questionIds: ['order-A' 또는 'order-B'], count: 1 })`으로 새 평가를 시작합니다.

## 핀 진단

`pinDiagnostics(state)`는 `{ pinSubmissions, orderSubmissions, rows, reviewIds }`를 반환합니다.

- `rows`는 A/B 각 8개, 총 16개입니다.
- 각 행: `{ standard, pin, questionId, standalone, position }`
- `standalone`, `position`: `{ total, correct, accuracy, lastCorrect, lastAnsweredAt }`
- 단독 문항의 제출과 배열 내 해당 위치 관찰을 별도 집계합니다. 배열 제출 1건이 퀴즈 8건으로 증가하지 않습니다.
- 무응답 비율은 `null`이며 화면에서는 `—`로 표시합니다.
- `reviewIds`는 단독 또는 배열 위치의 가장 최근 응답 중 오답이 있는 핀의 단독 문항 ID입니다. 선택한 핀만 일반 복습 모드로 재출제할 수 있습니다.
- 진행 중인 평가 ID는 함수 내부에서도 제외하여 원본 상태를 전달해도 해당 진단이 드러나지 않습니다.

## 검증

2026-10-22 실기 모듈 단독 검증:

- `node --test tests/cabling-model.test.mjs tests/cabling-backup-size.test.mjs tests/cabling-correction.test.mjs`: 40개 통과.
- 원본의 모델·백업 크기 테스트 27개와 신규 테스트 13개로 구성됩니다.
- 독립 전사한 T568A/B 핀표, 22문항, 중복 제출, 첫 응답 통계, 오답 복습, 저장·복원, 제작 타이머 검증을 유지했습니다.
- 신규 검증: 저장 키 격리, A/B×8 진단, 배열 중복 집계 방지, 평가 중 진단 제외, 교정 원본 보존, 점수 불변, 중복 완료 차단, 교정 복원, 새 평가 기록, schema 1 변환, 변조 백업 거부, 초기화.
- esbuild의 JSX 구문 검사: 경고 0개.
- PostCSS로 전체 스타일을 파싱하고 302개 선택자가 모두 `.cabling-module`로 시작함을 확인했습니다.

루트 통합 담당자가 전체 빌드와 렌더 검수를 진행합니다. 특히 모바일 진단/교정, 키보드 두 핀 교환, 이론 방문 후 입력 복귀, 새로고침, 루트 공통 이론 메뉴의 평가 정책을 확인해야 합니다.

# 통합 앱 필기 모듈

`src/modules/written/WrittenApp.jsx`는 기존 필기 화면을 통합 앱의 독립 모듈로 구성한다. 기존 NA2-com 폴더와 원격 저장소는 수정하지 않는다.

## 공개 인터페이스

```jsx
const WrittenApp = lazy(() => import('./modules/written/WrittenApp.jsx'));

<div hidden={!isWrittenRoute}>
  <WrittenApp
    route={route}
    questionTopics={questionTopics}
    onTheory={topicId => navigate(`/theory/${topicId}`)}
    onAssessmentState={setWrittenAssessment}
  />
</div>
```

- 기본 export: `WrittenApp({ onTheory, questionTopics = {}, route = '/written', onAssessmentState })`
- `questionTopics`: 문항 ID를 키로 하고 `[{ id, title }]`를 값으로 갖는 객체.
- `onTheory(topicId)`: 통합 앱의 공통 이론 화면을 여는 콜백.
- `onAssessmentState(boolean)`: 진행 중인 실전 시험 세션이 있으면 `true`, 없거나 제출이 완료되면 `false`를 effect로 전달한다. 루트는 이 상태로 공통 이론의 접근을 제한할 수 있다.
- 최초 판정에는 `integration.mjs`의 `readWrittenAssessmentState()`를 사용할 수 있다. 이 함수는 `na2_study_written_v1`의 세션만 읽으며 문제은행을 요청하거나 모듈을 마운트하지 않는다.
- 한 번 방문한 뒤에는 컴포넌트를 unmount하거나 route별 `key`로 다시 만들지 않는다. 부모에서 `hidden`으로 화면만 가려야 내부 화면, 선택 답안, 필터, 제출 완료 결과가 유지된다.
- 실제 현재 route를 전달한다. `/written` 재진입과 이론 화면으로의 이동은 내부 화면을 초기화하지 않는다.
- `/written/question/ID`는 해당 문항을 연습한다. 진행 중 연습에 이미 있는 문항은 답안과 세션을 유지한 채 그 위치로 이동한다. 다른 문항이나 진행 중 실전 시험이 있으면 기존 교체 확인 대화상자를 거친다. 취소하면 기존 세션을 유지한다.
- 없는 문항 ID는 안내만 표시하고 기존 세션을 보존한다.
- 관련 이론은 정답을 확인한 연습 문항 및 제출 완료 결과에만 표시한다. 진행 중 실전 시험에는 표시하지 않는다.
- 실전 제한시간은 다른 화면을 보는 중에도 흐른다. 기존 50분 정책과 자동 제출을 유지한다.

## 데이터와 저장소

루트 Vite 설정은 기존과 같이 `__BANK_VERSION__`, `__BANK_BYTES__`를 제공한다. 문제은행은 `${import.meta.env.BASE_URL}data/bank.json`에서 읽는다. 문제·보기 이미지, 정답, 과목, 회차 및 시험 시간·채점 정책은 바꾸지 않는다.

| 용도 | 통합 앱 전용 이름 |
|---|---|
| 학습 기록 | `na2_study_written_v1` |
| 통합 앱 내부 이전 기록 fallback | `na2_study_written_legacy_v1` |
| 문제은행 Cache Storage | `na2_study_written_bank_v1` |

기존 공개 필기 앱의 저장 키나 캐시를 자동으로 읽거나 쓰지 않는다. 백업 가져오기는 사용자가 파일을 고르고 교체를 확인하는 기존 수동 동작만 유지한다.

## 스타일

`original.css`는 복사 당시 그대로 보존한다. 이를 PostCSS AST로 범위 지정한 `styles.css`를 모듈에서 import하며 모든 일반 선택자는 `.written-module` 아래에만 적용된다. `:root`와 `body`의 선언도 문서 전체 대신 모듈 wrapper에 적용한다. 로딩·오류 화면도 이 wrapper 내부에 있어 부모의 공통 메뉴를 교체하지 않는다.

## 검증

`node --test tests/written-integration.test.mjs`에서 기존 앱 저장소 격리, 내부 이전 기록 복원, 일반 경로 왕복의 세션 보존, 딥링크의 이어하기·교체 확인 판단, 평가 중 이론 추천 제한을 검증한다. 통합 루트의 실제 hide/show, 버튼 이동, 반응형 표시와 브라우저 저장은 루트 화면에서 추가 확인해야 한다.

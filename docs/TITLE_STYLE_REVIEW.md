# 제목 문체 수정 기록

검토일: 2026-10-23

## 적용 범위와 기준

기존 검토 후보 76개를 모두 수정했다. 화면의 기능과 자료 범위를 직접 드러내는 명사형 제목을 사용하고, 상대적인 날짜 표현과 홍보성 문장을 정리했다. 질문 원문, FAQ 질문, 출처의 원제목, 설명 본문은 이번 제목 수정의 대상에서 제외했다.

| 영역 | 후보 수 |
|---|---:|
| 학습센터·공통 화면 | 14 |
| 실기 안내 | 8 |
| 실기 문제풀이 | 10 |
| 필기 | 24 |
| 케이블링 | 20 |
| 합계 | 76 |

후보 수는 정오답 상태별 문구와 공통 제목 템플릿을 포함한다. 화면에 동시에 나타나는 제목 개수나 고유 문자열 개수는 아니다. 실기 채점 상태 3개의 제목은 공통 제목 ‘채점 결과’로 통일하고 정답·오답·미응답 배지를 유지했다.

## 기록 보존과 연관 변경

- 필기의 기존 저장 제목은 displayWrittenTitle()에서 표시할 때만 변환한다. 저장 객체·점수·답안·이력은 바꾸지 않는다.
- 기존 ‘오늘의 10문항’과 ‘오답 복습 · N문항’ 기록을 가져온 뒤 화면에서 새 제목을 확인하고, 다시 내보낸 파일에서 원래 제목과 점수가 유지됨을 확인했다.
- 필기 시작 버튼 1개를 ‘미풀이 우선 10문항 시작’으로 맞췄다.
- 날짜 상태는 기존 채점 기록 판정을 유지하면서 ‘YYYY-MM-DD 채점 기록 있음/없음’으로 표시한다.
- 모바일 검수에서 배경 장식이 필기 시작 버튼 클릭을 가로막는 현상을 확인했다. src/modules/written/styles.css의 .hero::after에 pointer-events: none을 추가했고, 360px 화면에서 시작·확인·채점·제출 동작을 확인했다.
- 수정 전 소스 9개는 verification/title-style-20261023/before/에 보존했다.

## 검증

| 항목 | 결과 |
|---|---|
| 수정 후보 | 76개 반영 |
| 원본 스킬의 문체 검사 | 수정된 제목 76개에서 0건 탐지 (full, structured) |
| 자동 테스트 | 84개 통과, 실패 0개 |
| 실기 문제은행 생성 상태 검사 | 통과 |
| Vite 배포용 빌드 | 통과, /NA2-study/ 경로 |
| 기존 두 원본 프로젝트 | 42개 소스 파일 해시 일치 |
| 케이블링 질문·정답·해설·배열·출처·본문 | 변경 없음 |
| 필기 채점·저장·문제은행 로직 | 변경 없음 |
| 기존 저장 제목 변환 | 단위 테스트 3개 및 백업 가져오기·내보내기 UI 확인 |
| 로컬 브라우저 | 학습센터·학습 절차·이론·실기 안내·케이블링·필기·실기 채점 화면 확인 |
| 모바일 360px | 새 제목, 시작 버튼, 채점·제출, 가로 넘침 확인 |

문체 검사 0건은 지정된 패턴 검사 결과이며 모든 문체 품질의 자동 보증을 뜻하지 않는다. 오류·저장 충돌 등 모든 예외 상태를 실제로 발생시키지는 않았으며, 해당 제목은 소스 비교와 관련 자동 테스트로 확인했다. 모바일 검증은 브라우저 화면 크기 조정으로 수행했다.

공개 배포 후 실제 접속 증빙은 로컬 verification/title-style-20261023/public-evidence.json 및 *-public-*.png에 별도로 보존한다. 이 문서의 위 검증 표는 배포 전 검증 결과이다.

## 수정 전후 76개

### 학습센터·공통 화면

| ID | 수정 전 | 수정 후 | 파일 |
|---|---|---|---|
| H01 | 필요한 곳에서 시작하세요 | 학습 바로가기 | src/App.jsx |
| H02 | 근거를 확인하며 공부할 수 있도록 | 학습 자료 출처와 수록 범위 | src/App.jsx |
| H03 | 오답에서 다시 시작 | 오답 복습 | src/App.jsx |
| H04 | 먼저 알아두기 | 선수 학습 | src/App.jsx |
| H05 | 혼동하기 쉬운 점 | 주요 혼동 사항 | src/App.jsx |
| H06 | 이어서 학습하기 | 관련 학습 | src/App.jsx |
| H07 | 처음 시작하는 학습 순서 | 학습 시작 절차 | src/content/learning.mjs |
| H08 | 필기 개념과 문제의 연결 | 필기 학습 절차 | src/content/learning.mjs |
| H09 | 오답 이후의 재확인 | 오답 복습 절차 | src/content/learning.mjs |
| H10 | 진행 중인 평가가 있습니다 | 진행 중 평가 | src/App.jsx |
| H11 | 이론을 찾을 수 없습니다 | 이론 페이지 없음 | src/App.jsx |
| H12 | 요청한 화면이 없습니다 | 페이지 없음 | src/App.jsx |
| H13 | 학습센터 기록을 가져올까요? | 학습센터 기록 복원 확인 | src/App.jsx |
| H14 | 화면을 불러오지 못했습니다 | 화면 표시 오류 | src/main.jsx |

### 실기 안내

| ID | 수정 전 | 수정 후 | 파일 |
|---|---|---|---|
| P01 | 실기, 세 영역으로 준비하세요 | 실기시험 3영역 | src/Practical.jsx |
| P02 | 지금 바로 케이블링을 연습할 수 있습니다 | 케이블링 연습 | src/Practical.jsx |
| P03 | 제작 전부터 완성까지 | 케이블 제작 절차 | src/Practical.jsx |
| P04 | 필요한 연습으로 이동 | 관련 학습 | src/Practical.jsx |
| P05 | 명령어로 설정하고 저장하기 | 라우터 설정 및 저장 | src/Practical.jsx |
| P06 | 조건에 맞게 설정하기 | Windows Server 설정 | src/Practical.jsx |
| P07 | 실습 프로그램은 공식 자료실에서 | 공식 실습 프로그램 | src/Practical.jsx |
| P08 | 실기 화면을 찾을 수 없습니다 | 실기 페이지 없음 | src/Practical.jsx |

### 실기 문제풀이

| ID | 수정 전 | 수정 후 | 파일 |
|---|---|---|---|
| Q01 | 연습할 문제를 선택하세요 | 연습 문제 선택 | src/PracticalQuiz.jsx |
| Q02 | 정답입니다. | 채점 결과 | src/PracticalQuiz.jsx |
| Q03 | 해설을 확인하고 다시 풀어 보세요. | 채점 결과 | src/PracticalQuiz.jsx |
| Q04 | 미응답으로 기록했습니다. | 채점 결과 | src/PracticalQuiz.jsx |
| Q05 | 이번 풀이 | 현재 풀이 현황 | src/PracticalQuiz.jsx |
| Q06 | 이번 풀이를 확인하세요 | 풀이 결과 | src/PracticalQuiz.jsx |
| Q07 | 현재 복습할 오답이 없습니다. | 복습 대상 없음 | src/PracticalQuiz.jsx |
| Q08 | 새 풀이를 시작할까요? | 새 문제풀이 시작 확인 | src/PracticalQuiz.jsx |
| Q09 | 자동 저장을 중단했습니다 | 자동 저장 중단 | src/PracticalQuiz.jsx |
| Q10 | 이어서 풀 수 있습니다 | 진행 중 문제풀이 | src/PracticalQuiz.jsx |

### 필기

| ID | 수정 전 | 수정 후 | 파일 |
|---|---|---|---|
| W01 | 새 학습을 시작할까요? | 새 학습 시작 확인 | src/modules/written/WrittenApp.jsx |
| W02 | 오늘의 10문항 | 미풀이 우선 10문항 | src/modules/written/WrittenApp.jsx |
| W03 | 백업 기록으로 바꿀까요? | 학습 기록 복원 확인 | src/modules/written/WrittenApp.jsx |
| W04 | 기출문제 풀기 | 기출문제 풀이 | src/modules/written/WrittenApp.jsx |
| W05 | 문제은행을 불러오지 못했습니다 | 문제은행 로딩 실패 | src/modules/written/WrittenApp.jsx |
| W06 | 문제은행을 불러오는 중 | 문제은행 로딩 | src/modules/written/WrittenApp.jsx |
| W07 | 원문 그대로, 매일 꾸준히. | 기출문제 원문·답안표 | src/modules/written/WrittenApp.jsx |
| W08 | 오늘 학습 완료 | {날짜} 채점 기록 있음 | src/modules/written/WrittenApp.jsx |
| W09 | 오늘의 학습을 시작해요 | {날짜} 채점 기록 없음 | src/modules/written/WrittenApp.jsx |
| W10 | 진행 중인 학습이 있어요 | 진행 중 학습 | src/modules/written/WrittenApp.jsx |
| W11 | 학습을 제출할까요? | 학습 답안 제출 확인 | src/modules/written/WrittenApp.jsx |
| W12 | 오답 복습 · {문항 수}문항 | 오답·미응답 복습 · {문항 수}문항 | src/modules/written/WrittenApp.jsx |
| W13 | 학습 기록을 초기화할까요? | 학습 기록 초기화 확인 | src/modules/written/WrittenApp.jsx |
| W14 | YOUR DAILY NETWORK ROUTINE | 필기 기출문제 | src/modules/written/WrittenApp.jsx |
| W15 | 풀이한 고유 문항 | 풀이 문항 수(중복 제외) | src/modules/written/WrittenApp.jsx |
| W16 | 다시 풀 오답 | 오답 문항 | src/modules/written/WrittenApp.jsx |
| W17 | 모아 둔 북마크 | 북마크 문항 | src/modules/written/WrittenApp.jsx |
| W18 | 정답입니다 · 정답 {정답 번호}번 | 정답 · {정답 번호}번 | src/modules/written/WrittenApp.jsx |
| W19 | 다시 확인해 보세요 · 정답 {정답 번호}번 | 오답 · 정답 {정답 번호}번 | src/modules/written/WrittenApp.jsx |
| W20 | 고유 풀이 문항 | 풀이 문항 수(중복 제외) | src/modules/written/WrittenApp.jsx |
| W21 | 학습한 날짜 | 학습 일수 | src/modules/written/WrittenApp.jsx |
| W22 | 900문항, 원문과 근거를 함께. | 기출문제 900문항과 답안표 | src/modules/written/WrittenApp.jsx |
| W23 | 오늘의 10문항: | 미풀이 우선 10문항: | src/modules/written/WrittenApp.jsx |
| W24 | 이어하기: | 학습 재개: | src/modules/written/WrittenApp.jsx |

### 케이블링

| ID | 수정 전 | 수정 후 | 파일 |
|---|---|---|---|
| C01 | 진행 중인 훈련을 마칠까요? | 훈련 전환 | src/modules/cabling/App.jsx |
| C02 | 백업 기록으로 교체할까요? | 백업 기록 적용 | src/modules/cabling/App.jsx |
| C03 | 학습 기록을 초기화할까요? | 학습 기록 초기화 | src/modules/cabling/App.jsx |
| C04 | 새 기록 저장을 시작할까요? | 새 학습 기록 저장 | src/modules/cabling/App.jsx |
| C05 | 새 배열로 교정할까요? | 새 배열 교정 시작 | src/modules/cabling/App.jsx |
| C06 | 제작 연습을 마칠까요? | 제작 연습 종료 | src/modules/cabling/App.jsx |
| C07 | 저장된 기록을 확인해 주세요. | 저장 기록 확인 필요 | src/modules/cabling/App.jsx |
| C08 | 다른 탭에서 학습 기록이 변경되었습니다. | 다른 탭의 학습 기록 변경 | src/modules/cabling/App.jsx |
| C09 | 훈련을 선택해 주세요. | 훈련 유형 선택 | src/modules/cabling/App.jsx |
| C10 | 복습할 오답이 없습니다. | 오답 복습 대상 없음 | src/modules/cabling/App.jsx |
| C11 | 평가를 마친 뒤 확인해 주세요. | 평가 중 개념·교정 열람 제한 | src/modules/cabling/App.jsx |
| C12 | 어느 핀을 다시 연습할까요? | 핀별 오답 진단과 복습 | src/modules/cabling/App.jsx |
| C13 | 잘못 꽂힌 전선을 찾아 바꿔 보세요. | 전선 배열 오류 교정 | src/modules/cabling/App.jsx |
| C14 | 교정할 배열을 선택해 주세요. | 교정 대상 배열 선택 | src/modules/cabling/App.jsx |
| C15 | 교정 전 원본 배열 보기 | 교정 전 원본 배열 | src/modules/cabling/App.jsx |
| C16 | 답안을 제출했습니다. | 답안 제출 완료 | src/modules/cabling/App.jsx |
| C17 | 정답입니다. | 정답 | src/modules/cabling/App.jsx |
| C18 | 정답을 확인해 주세요. | 오답 | src/modules/cabling/App.jsx |
| C19 | 필기와 실기를 함께 | 필기·실기 통합 학습 | src/modules/cabling/App.jsx |
| C20 | 플러그의 방향부터 확인 | 플러그 관찰 방향 | src/modules/cabling/content.mjs |

const LEGACY_TITLES = new Map([
  ['오늘의 10문항', '미풀이 우선 10문항'],
  ['새 학습을 시작할까요?', '새 학습 시작 확인'],
  ['백업 기록으로 바꿀까요?', '학습 기록 복원 확인'],
  ['학습을 제출할까요?', '학습 답안 제출 확인'],
  ['학습 기록을 초기화할까요?', '학습 기록 초기화 확인'],
]);

// Preserve stored sessions and backup records; normalize only their visible titles.
export function displayWrittenTitle(title) {
  if (typeof title !== 'string') return '';
  if (LEGACY_TITLES.has(title)) return LEGACY_TITLES.get(title);
  return title.replace(/^오답 복습 · (\d+)문항$/, '오답·미응답 복습 · $1문항');
}

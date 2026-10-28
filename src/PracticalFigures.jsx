import { LearningFigure, TheoryFigures } from './TheoryFigures.jsx';
import { PRACTICAL_FIGURES, LAB_VISUALS, QUIZ_VISUALS } from './content/practical-figures.mjs';
import './practical-figures.css';

const assets = import.meta.glob('./assets/practical/*.{svg,png,jpg}', { eager: true, query: '?url', import: 'default' });

export function PracticalFigures({ ids }) {
  return ids.map(id => {
    const figure = PRACTICAL_FIGURES[id];
    return <LearningFigure key={id} figure={figure} src={assets[`./assets/practical/${figure.file}`]} credit={figure.kind === 'screenshot' ? `ICQA 실습 프로그램 실제 화면 · ${figure.capturedAt} 촬영 · 학습용 예제 설정` : '학습용 재구성 도해 · 2026-10-24 검토'}/>;
  });
}

export function LabFigures({ labId }) {
  return <section className="practical-visuals" aria-label="풀이 도해와 실제 설정 화면"><h3>그림과 실제 화면으로 확인</h3><p className="practical-visual-note">그림으로 값을 해석한 뒤 실제 프로그램의 같은 항목을 찾아 비교하세요. 화면의 값과 상태는 촬영한 실습 시점을 기준으로 합니다.</p><PracticalFigures ids={LAB_VISUALS[labId] || []}/></section>;
}

export function QuizFigures({ questionId }) {
  const visual = QUIZ_VISUALS[questionId];
  if (!visual) return null;
  return <div className="practical-visuals" aria-label="제출 후 시각 해설">{visual.ids && <PracticalFigures ids={visual.ids}/>} {visual.theory && <TheoryFigures topicId={visual.theory.topic} section={visual.theory.section}/>}</div>;
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './hub.css';
import './typography.css';

class Boundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <main className="hub-fatal"><h1>화면 표시 오류</h1><p>학습 기록을 삭제하지 않고 화면을 다시 열어 주세요.</p><button onClick={() => window.location.reload()}>다시 열기</button></main>;
    return this.props.children;
  }
}
createRoot(document.getElementById('root')).render(<Boundary><App /></Boundary>);

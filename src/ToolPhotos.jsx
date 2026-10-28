import { TOOL_PHOTOS } from './content/tool-photos.mjs';

export function ToolHeading({ tool }) {
  const photo = TOOL_PHOTOS[tool.id];
  return <div className="hub-tool-heading">
    <span className="hub-tool-thumbnail"><img src={photo.src} alt={photo.alt} width="72" height="72" loading="lazy" decoding="async"/></span>
    <h2>{tool.name}</h2>
  </div>;
}

export function ToolPhotoSources({ tools }) {
  return <details className="hub-photo-sources">
    <summary>사진 출처</summary>
    <p>사진은 준비물의 형태를 보여 주는 예시입니다. 표시용 테이프 사진은 양 끝 표시용 레이블의 예시이며, 제품별 규격과 호환 여부는 각 항목에서 확인하세요.</p>
    <ul>{tools.map(tool => {
      const photo = TOOL_PHOTOS[tool.id];
      return <li key={tool.id}><b>{tool.name}</b> · <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">{photo.title}</a> · {photo.author} · <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license}</a></li>;
    })}</ul>
    <p>Wikimedia Commons의 원본 또는 제공 썸네일을 사용했으며, 사진 내용을 수정하지 않았습니다.</p>
  </details>;
}

# 자체 호스팅 웹폰트 기록

확인·변환일: 2026-10-23

## 적용 파일

사용자가 지정한 로컬 TTF 세 파일을 WOFF 1.0으로 압축했습니다. 글리프 삭제, 서브세팅, 윤곽·힌팅·메트릭·이름·저작권·라이선스 변경은 하지 않았습니다. 설치된 fontTools와 zlib만 사용했으며 새 패키지는 설치하지 않았습니다. Brotli가 설치되어 있지 않아 WOFF2 대신 추가 의존성이 없는 WOFF를 선택했습니다.

| 파일 (`src/assets/fonts/`) | CSS 굵기 | 내부 typographic family / subfamily (name ID 16 / 17) | 글리프 수 | cmap 코드 포인트 수 | 바이트 |
|---|---:|---|---:|---:|---:|
| `GmarketSans-Bold.woff` | 700 | `Gmarket Sans TTF` / `Bold` | 12,262 | 12,266 | 978,292 |
| `Paperlogy-Regular.woff` | 400 | `Paperlogy` / `4 Regular` | 11,733 | 11,723 | 254,204 |
| `Paperlogy-SemiBold.woff` | 600 | `Paperlogy` / `6 SemiBold` | 11,733 | 11,723 | 254,072 |

총 웹폰트 크기는 1,486,568바이트입니다. CSS에서는 제목에 `NA2 Gmarket Sans`, 본문과 강조에 `NA2 Paperlogy`라는 별칭을 사용할 수 있습니다. 이 별칭은 `@font-face` 선언의 이름일 뿐이며 폰트 내부 이름을 변경하지 않습니다. 글리프 수와 cmap 코드 포인트 수는 서로 다른 지표입니다.

## 공식 출처와 원본 대조

- Gmarket 공식 디자인 시스템: <https://gds.gmarket.co.kr/brand/typeface>
- 해당 페이지에서 연결한 공식 배포 ZIP: <https://gds.gmarket.co.kr/file/GmarketSans.zip>
- Gmarket ZIP 안 `GmarketSans/TTF/GmarketSansTTFBold.ttf`와 로컬 원본은 바이트 단위로 동일했습니다. `__MACOSX`의 `._` 메타데이터 파일은 비교 대상에서 제외합니다.
- Gmarket ZIP SHA-256: `0bf97309a1f9226b8f0f6098739124d78a57d0e083dacfa809c6320aa9b91356`
- Paperlogy 제작자 공식 배포 페이지: <https://freesentation.blog/paperlogyfont>
- 해당 페이지에서 연결한 공식 GitHub 저장소: <https://github.com/Freesentation/paperlogy>
- 사용한 원본과 일치하는 공식 v1.000 ZIP: <https://github.com/Freesentation/paperlogy/raw/refs/heads/main/Paperlogy-1.000.zip>
- Paperlogy ZIP 안 `Paperlogy-4Regular.ttf`, `Paperlogy-6SemiBold.ttf`는 각각 로컬 원본과 바이트 단위로 동일했습니다. 원본 버전 1.000을 유지했으며 공식 사이트에 있는 일본어 추가 버전 1.001로 교체하지 않았습니다.
- Paperlogy v1.000 ZIP SHA-256: `bd30c2161cf8e05769240a9d42e820e12f381e2d83a8f31b886d91acaa1c73be`

확인 당시 이전 Gmarket 주소 `https://corp.gmarket.com/fonts/`와 `https://news.gmarket.com/fonts/`는 HTTP 404였습니다. 현재 접근 가능한 공식 Gmarket 디자인 시스템과 그 배포 ZIP으로 출처를 확인했습니다. 제3자 블로그의 라이선스 주장은 근거로 사용하지 않았습니다.

## 웹 재배포 근거와 동봉 라이선스

### Gmarket Sans

공식 ZIP과 일치하는 원본 TTF의 `name` 테이블 ID 13에 영문·한글 라이선스 전문이 들어 있습니다. 이 원문을 문자 변경 없이 UTF-8로 추출했습니다.

- `public/fonts/licenses/GmarketSans-LICENSE-en.txt`
- `public/fonts/licenses/GmarketSans-LICENSE-ko.txt`

원문은 저작권자 eBay Korea Co., Ltd.의 저작권 고지, SIL Open Font License 1.1 명시, 번들·임베딩·재배포 허용, 폰트 단독 판매 금지, 저작권·라이선스 동봉 조건, Reserved Font Name 조건을 포함합니다. 또한 제작물의 서체 홍보 활용에 관한 6항이 포함되어 있으므로 일반 OFL 문서로 대체하지 않고 원문 전체를 보존했습니다. 영문 원문이 법적 효력을 갖는다는 한글 안내도 그대로 포함됩니다.

### Paperlogy

제작자 공식 페이지는 OFL에 따른 수정·재배포 허용을 명시하며 아래 라이선스 전문으로 직접 연결합니다.

- 공식 라이선스 원문: <https://www.designptn.com/wp-content/uploads/2024/08/OFL-license.txt>
- 동봉 파일: `public/fonts/licenses/Paperlogy-OFL.txt`

라이선스 URL의 응답 바이트를 그대로 저장했습니다. `Copyright 2024 The PAPERLOGY Authors`와 SIL OFL 1.1 전문이 포함됩니다. 원본 폰트 내부의 `Copyright © 2024 PT&` 및 한국어 저작권·라이선스 메타데이터도 그대로 유지했습니다.

### WOFF 압축 방식

OFL 관리 기관의 [공식 FAQ 2.1, 2.2, 2.2.1](https://openfontlicense.org/ofl-faq/)는 CSS `@font-face`를 통한 배포와, 원본 데이터를 유지하고 WOFF 압축만 하는 경우의 이름 유지를 설명합니다. 이번 변환은 모든 원본 sfnt 테이블을 바이트 단위로 보존하고 별도 WOFF 메타데이터를 추가하지 않았습니다. 폰트 자체 라이선스는 계속 유지됩니다.

## 변환 명령

실행 환경: Python 3.14.7, fontTools 4.63.0, zlib 1.3.1.zlib-ng.

실행한 핵심 변환·무결성 검사 절차는 아래 명령으로 재현할 수 있습니다. 동일한 이름의 출력 파일이 있으면 덮어쓰지 않고 중단합니다. 원본 파일은 읽기만 합니다.

```powershell
@'
from pathlib import Path
from io import BytesIO
from fontTools.ttLib import TTFont

root = Path(r'C:\sumiWork\2026\0803_ICT폴리텍\04_강의준비\02_알고리즘과코딩설계\NA2-study')
source_dir = Path(r'C:\Users\user\AppData\Local\Microsoft\Windows\Fonts')
files = [
    ('GmarketSansTTFBold.ttf', 'GmarketSans-Bold.woff'),
    ('Paperlogy-4Regular.ttf', 'Paperlogy-Regular.woff'),
    ('Paperlogy-6SemiBold.ttf', 'Paperlogy-SemiBold.woff'),
]
for source, output in files:
    original = TTFont(source_dir / source, recalcBBoxes=False, recalcTimestamp=False)
    font = TTFont(source_dir / source, recalcBBoxes=False, recalcTimestamp=False)
    font.flavor = 'woff'
    buffer = BytesIO()
    font.save(buffer, reorderTables=False)
    converted = TTFont(BytesIO(buffer.getvalue()))
    assert set(original.reader.keys()) == set(converted.reader.keys())
    assert all(original.reader[tag] == converted.reader[tag]
               for tag in original.reader.keys())
    destination = root / 'src/assets/fonts' / output
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open('xb') as handle:
        handle.write(buffer.getvalue())
'@ | python -X utf8 -
```

## 검증

- 원본 해시를 변환 전·후 비교: 3개 모두 동일.
- 압축 해제한 sfnt 테이블을 원본과 바이트 단위 대조: Gmarket 17개, Paperlogy 각각 14개 전부 동일. `head` 테이블도 동일.
- 글리프 순서, cmap 매핑, hmtx 메트릭, name 테이블 대조: 3개 모두 동일.
- 원본과 동일한 전체 글리프 수 유지: 12,262 / 11,733 / 11,733.
- 프로젝트 `src`의 JSX·JS·MJS·JSON에 실제 등장하는 한글 음절 516자를 검사: 세 글꼴 모두 미등록 글자 및 빈 윤곽 글자 0개.
- Gmarket 라이선스 2개: 원본 name ID 13 문자열과 문자 단위 동일.
- Paperlogy 라이선스: 공식 배포자가 연결한 원문의 응답 바이트 그대로 저장.
- 이 기록은 파일·출처·변환 무결성 검증입니다. 실제 브라우저 글꼴 로딩 및 화면 배치는 통합 UI 검수에서 확인합니다.

## SHA-256 목록

| 파일 | 바이트 | SHA-256 |
|---|---:|---|
| 원본 `GmarketSansTTFBold.ttf` | 2,511,976 | `ff7c354dd1a324e4cecc1223c4f71e74fa81be7027e0c7f6324c475909cacefc` |
| 웹폰트 `GmarketSans-Bold.woff` | 978,292 | `2687d3c023dd093f6ca3ac3d6d61268e3a459697c16331d9c5e0d33210853e06` |
| 원본 `Paperlogy-4Regular.ttf` | 679,480 | `fde17e6e5acabcfabdad79f37fedc01405a0d6298c965b3f99378dd89a25b1ba` |
| 웹폰트 `Paperlogy-Regular.woff` | 254,204 | `6f5c5e47563548911f717267c62b9ab4b80a1d5fa71f123535be07d0461e3e29` |
| 원본 `Paperlogy-6SemiBold.ttf` | 677,712 | `59c1927c28ad6833adfce6298c445fe0474072be4f9ddb2b88ed2a4187db050e` |
| 웹폰트 `Paperlogy-SemiBold.woff` | 254,072 | `e34c92ba562554f921885e9c6920017a74dfdad1d7db8c0edb74cb7ef010b51a` |
| 라이선스 `GmarketSans-LICENSE-en.txt` | 4,602 | `0b408bbb92acdf3a7796ffd1649bc9e43000526e3a8cff29eb4d290a665271c7` |
| 라이선스 `GmarketSans-LICENSE-ko.txt` | 6,765 | `736039aff5dc32390787865196454619f665f83f3eae13fc28a783f4ad081651` |
| 라이선스 `Paperlogy-OFL.txt` | 4,380 | `603b2e7ef9effb9037b0b67f0530cacdc05e71a4e569032d7e4d98c2e6763135` |

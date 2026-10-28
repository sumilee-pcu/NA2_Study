# 공개 배포 검증

## 실기 24문항·글꼴 업데이트 공개 검증

검증일: 2026-10-23 13시대 (한국시간). 사용자의 공개 배포 승인 후 `sumilee-phd/NA2-study`의 `main`을 갱신했습니다.

- 기능·스타일 변경 커밋: `a4ebbe1d0158f14c6fafbb4f5bddf3ebef8f3e2b`.
- [자동 검사 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/39898428728).
- [Pages 배포 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/39898428826). Ubuntu·Node.js 22에서 81개 테스트 통과, 실패 0개, 빌드 성공을 로그로 확인했습니다.
- 실제 접속 주소: <https://sumilee-phd.github.io/NA2-study/>.

| 공개 사이트 점검 | 실제 확인 결과 |
|---|---|
| 버전·메뉴 | 통합 학습판 02, 상위 실기 메뉴와 작업형·실습형·단답형/객관식 하위 메뉴 표시 |
| 제목·본문 | 제목 Gmarket Sans Bold 700, 본문 Paperlogy Regular. 웹폰트 3개가 공개 주소의 `/NA2-study/assets/` 경로에서 관측됨 |
| 선택 색상 | T568B 선택 탭이 hover 상태에서도 흰색 글자, `#103b37` 배경·테두리 유지 |
| 24문항 | PRAC-001부터 PRAC-024까지 개별 시작 버튼 확인 |
| 단답형 | PRAC-001에서 오답 제출 → 해설 확인 → 새로고침 후 답안·판정 복원 |
| 오답 복습 | PRAC-001 재풀이 정답 → 복습 목록 0건, 이전 오답과 재풀이 정답 모두 학습 기록에 유지 |
| 단일 선택 | PRAC-009에서 D(16384개) 선택 → 정답과 해설 표시 |
| 복수 선택 | PRAC-018에서 D·A·C 순서로 선택 → 정답과 해설 표시 |
| 저장 | 총 4회 제출 기록이 새로고침 후에도 복원됨 |
| 모바일 | 360×800 화면에서 복수 선택·해설·학습 기록 표시 확인, 페이지 가로 넘침 없음 |
| 콘솔 | 위 공개 화면의 오류·경고 0건 |

공개 검수는 Windows Chromium 기반 브라우저에서 수행했습니다. 모바일은 화면 크기 모의 검수이며 실제 스마트폰·Safari 실기기 검수는 아닙니다. 공개 사이트에서는 세 유형의 대표 문항과 저장 흐름을 확인했으며, 24문항 전체의 브라우저 채점은 앞선 로컬 기능 검수 결과를 따릅니다. 검수용 답안은 해당 검수 브라우저에만 저장되었습니다. 기존 학습센터의 이론 읽음 1건도 유지됐습니다.

공개 화면 증빙은 로컬 `verification/public-update-20261023/`에 보관합니다: `01-live-home.png`, `02-live-multiple-mobile.png`, `03-live-history-restored.png`, `04-live-hover-fixed.png`. 글꼴 라이선스는 `.gitattributes`로 원문 공백·줄바꿈을 보존하며, 원본 파일과 Git blob의 바이트 일치를 확인했습니다.

## 최초 공개 검증 기록

검증일: 2026-10-23 (한국시간)

- 공개 사이트: https://sumilee-phd.github.io/NA2-study/
- 리포: https://github.com/sumilee-phd/NA2-study
- 기본 브랜치: `main`
- Pages 방식: GitHub Actions. `main` 푸시 또는 수동 실행 시 테스트·빌드 후 배포.
- 최초 공개 검증 코드: `e3bf09696d8762be8673cd122ed25334e386cd09`
- [검증 워크플로 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/39878858740)
- [Pages 배포 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/39878858724)

## 배포와 자동 검사

GitHub의 Ubuntu·Node.js 22 환경에서 의존성 설치, 58개 테스트, Vite 빌드와 Pages 배포가 성공했다. 첫 실행에서는 로컬 검토 이미지 경로에 의존한 테스트 1개가 실패했다. 검토 당시 텍스트·이미지 해시, 정답, 쪽수를 `CONTENT_EVIDENCE.json`으로 추적하고 문제은행과 직접 대조하도록 수정한 뒤 다시 통과했다. 테스트를 생략하거나 원문 데이터를 변경하지 않았다.

공개 HTML, 메인 JavaScript와 CSS, `data/bank.json`이 모두 HTTP 200으로 응답했다. 문제은행은 24,968,935바이트, 900문항이며 SHA-256은 `979ca7ba0c4ec2b45fc9e9b627cb8a2c871b7951bef1d7a426afb6bb27234ece`로 보존된 원본과 일치했다.

## 공개 브라우저 확인

1. 공개 홈에서 이론 10개 목록과 서브넷 이론 페이지를 열고 읽음으로 표시했다.
2. 이론의 `2022-03-Q03` 링크로 필기 문제은행을 불러왔다. 원문 이미지와 보기 표시를 확인했다.
3. 2번 선택 후 정답 3번 안내를 확인하고 제출했다. 새로고침 뒤 필기 기록은 응답 1건·정답률 0%·세션 1건으로 유지됐다.
4. 실기 T568B 배열 교정에서 뒤바뀐 4·5번을 교환하고 완료했다. 새로고침 뒤 완료 상태와 교정 기록 1건이 유지됐다.
5. 학습센터로 돌아왔을 때 읽은 이론 1/10이 유지됐고, 검증 탭의 error·warn 로그는 없었다.

증거 이미지는 로컬 `verification/public-20261023/`의 `01-live-home.png`, `02-live-written-records.png`, `03-live-correction-restored.png`, `04-live-home-verified.png`에 보관한다. 검증용 학습 기록은 해당 브라우저의 새 통합 앱 저장 키에만 생성했다.

## 기존 앱과 검증 한계

기존 `NA2-com`과 `NA2-cabling`의 로컬·GitHub main 커밋은 각각 `7e0c035d8f49063ae51e5715bb5dd9062487da20`, `8036a544085cf96f52e535bda8ebd8c14c86031b`로 유지됐다. 로컬 추적 파일 42개의 SHA-256도 기준 기록과 일치했다. 기존 리포와 공개 앱의 코드·배포는 변경하지 않았다.

이번 공개 검증은 데스크톱 브라우저의 핵심 흐름을 확인한 것이다. 실제 스마트폰·모든 브라우저·900문항 전체의 답안 정확도를 인증하는 검증은 아니다. 초기 이론 범위와 실물 케이블 측정의 한계는 기존 문서를 따른다.

## 2026-10-23 Windows·라우터 실습 자료 배포

- 배포 코드: [`a75eadf1f975a5d8e8d1ca92a3235ea11bbe4fcb`](https://github.com/sumilee-phd/NA2-study/commit/a75eadf1f975a5d8e8d1ca92a3235ea11bbe4fcb)
- [자동 검증 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/39916887390): Ubuntu·Node.js 22의 설치·테스트·빌드 통과.
- [Pages 배포 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/39916887550): 2026-10-23 16:24 KST 완료. 배포용 빌드에서도 설치·96개 테스트·빌드·아티팩트 업로드를 통과했다.
- 공개 주소: [Windows·라우터 실습 자료](https://sumilee-phd.github.io/NA2-study/#/practical/lab)

공개 브라우저에서 8개 과제 목록을 확인했다. 메인 번들 `index-BAnhN6dL.js`는 `/NA2-study/` 경로로 로컬 검수한 빌드와 동일한 이름이다. DHCP 과제에서 `/25`, 제외 범위 `.1~.10`, 임대 6시간, 후보 첫 주소 `.11`, 후보 수 116을 입력하여 6/6 일치 판정을 확인했다. 새로고침 후 입력·판정이 유지됐고 목록 진행률은 1/8이었다. 공개 검수 탭의 error·warn 로그는 없었다.

로컬에서는 8과제의 44항목 입력 판정과 8/8 진행률, 360px 모바일 화면, 기존 필기·케이블링·실기 문제풀이 연결을 확인했다. 자세한 범위와 한계는 [실습 검수 보고서](PRACTICAL_LABS_VERIFICATION.md)를 따른다. 공개 증거 이미지는 Git 제외 폴더 `verification/practical-labs-20261023/public-labs.png`, `public-dhcp.png`에 보관한다. 이 배포 이력을 기록하는 후속 문서 커밋은 앱 코드·빌드 산출물을 변경하지 않는다.

## 2026-10-23 라우터 실습 자료의 ICQA 데모 검증 반영

- 배포 코드: [`eeacba6d603eb331151cfee6d75ac79384c7e725`](https://github.com/sumilee-phd/NA2-study/commit/eeacba6d603eb331151cfee6d75ac79384c7e725)
- [자동 검증 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/39942168881): Ubuntu·Node.js 22에서 97개 테스트 통과, 빌드 통과.
- [Pages 배포 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/39942168887): 2026-10-23 19:53 KST 완료. 배포용 빌드에서도 97개 테스트 통과.

ICQA 라우터 시험 데모에서 거부된 `show ip interface brief`를 `show running-config`·`show interfaces`로 바꾸고, `no shutdown` 반복 입력 시 비활성화되는 데모 동작과 데모 확인 범위를 라우터 과제에 반영했다. 검증 내용은 [실습 검수 보고서](PRACTICAL_LABS_VERIFICATION.md#icqa-에뮬레이터-직접-검증)를 따른다.

공개 주소에서 새 메인 번들 `index-CvhVFOPz.js`와 실습 번들 `PracticalLabs-BTyGuto9.js`를 확인했다. 라우터 4개 과제의 새 명령·데모 확인 노트·검토 범위 문구, Windows 과제의 기존 한계 문구를 확인했다. router-interface에서 5/5 일치 판정 후 새로고침해도 입력·판정이 유지되었고 목록 진행률은 1/8이었다. 공개 검수 탭의 콘솔 로그는 없었다. 검수 입력은 해당 검수 브라우저에만 저장되었다. 공개 화면 증거는 Git 제외 폴더 `verification/emulator-20261023/public/`에 보관한다.

## 2026-10-23 Windows 실습 자료의 ICQA 에뮬레이터 검증 반영

- 배포 코드: [`d09cd400941f163f1937e0cbee65bc80e0cfd6a6`](https://github.com/sumilee-phd/NA2-study/commit/d09cd400941f163f1937e0cbee65bc80e0cfd6a6)
- [자동 검증 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/39956311836): Ubuntu·Node.js 22에서 98개 테스트 통과, 빌드 통과.
- [Pages 배포 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/39956311788): 2026-10-23 21:50 KST 완료. 배포용 빌드에서도 98개 테스트 통과.

ICQA Windows 실습용 에뮬레이터에서 확인한 화면 차이(마스크 자동 채움 없음, DHCP·SOA 기본값과 단위, 빈 DNS 영역에서 시작, 명령 프롬프트의 고정 출력, 일련번호 자동 증가 없음)와 과제별 확인 범위를 Windows 과제에 반영했다. 기준값과 점검 항목 ID는 바꾸지 않았다. 검증 내용은 [실습 검수 보고서](PRACTICAL_LABS_VERIFICATION.md#icqa-에뮬레이터-직접-검증)를 따른다.

로컬 확인: `npm test` 98개 통과, `npm run verify:originals` 통과(추적 파일 42개 일치). 한글 경로에서는 `vite build`가 메시지 없이 `dist/`를 갱신하지 않아 영문 임시 경로 사본에서 빌드를 통과했다. 그 빌드로 windows-dns-soa 5/6 → 수정 시 판정 해제 → 6/6 → 새로고침 복원, Windows 상세 4개의 새 안내와 에뮬레이터 확인 노트, 필기 900문항 로딩과 답안 유지, 실기 단답형 PRAC-006 초안 복원, 케이블링 평가 중 실습 자료 미표시와 4/4 완료 후 해제, 360×800 가로 넘침 없음, 콘솔 로그 없음을 확인했다.

공개 주소에서 메인 번들 `index-Cl4esbkB.js`와 실습 번들 `PracticalLabs-B5o17QJm.js`를 확인했다. Windows 과제 4개의 에뮬레이터 확인 노트와 검토 범위 문구가 표시되고 이전의 "설치·실행하여 검증한 결과는 아니다" 문구가 사라졌다. 앞선 라우터 배포 때 같은 브라우저에 남긴 router-interface 확인 기록은 갱신 후에도 유지되었다. windows-ipv4에서 6/6 판정 후 새로고침해도 입력·판정이 유지되었고, 공개 검수 탭의 콘솔 로그는 없었다. 공개 화면 증거는 Git 제외 폴더 `verification/emulator-20261023/public/`에 보관한다.

## 2026-10-24 router-access 콘솔·VTY 검증 반영

- 배포 코드: [`36ecc4a6436bc216e541e1555a86b964695709a2`](https://github.com/sumilee-phd/NA2-study/commit/36ecc4a6436bc216e541e1555a86b964695709a2)
- [자동 검증 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40043810420): Ubuntu·Node.js 22에서 99개 테스트 통과, 빌드 통과.
- [Pages 배포 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40043810352): 2026-10-24 09:13 KST 완료. 배포용 빌드에서도 99개 테스트 통과.

ICQA 라우터 시험 데모에서 콘솔·VTY 연습용 비밀번호와 `login`, `exec-timeout 5 30`의 입력 수락과 running-config·startup-config 저장을 확인한 결과를 router-access 확인 노트와 [실습 검수 보고서](PRACTICAL_LABS_VERIFICATION.md#router-access-콘솔vty-재검증-2026-10-24)에 반영했다. 과제 조건·명령·기준값은 바꾸지 않았다.

로컬 확인: `npm test` 99개 통과, `npm run verify:originals` 통과(추적 파일 42개 일치). 영문 임시 경로 사본에서 `vite build`가 새 `dist/` 산출물을 만들었고, 실습 번들에 2026-10-24 노트가 포함되고 이전 미실행 문구가 빠진 것을 확인했다. 그 빌드로 router-access 5/6 → 수정 시 판정 해제 → 6/6 → 새로고침 복원, 목록 진행률 1/8, 360×800 가로 넘침 없음, 콘솔 로그 없음을 확인했다.

공개 주소에서 메인 번들 `index-E-VTiiDh.js`와 실습 번들 `PracticalLabs-yOa4L7aF.js`를 확인했다. router-access에 2026-10-23·2026-10-24 확인 노트가 표시되고 이전 "비밀번호 문자열과 콘솔 login 입력" 미실행 문구가 사라졌다. 같은 브라우저에 앞서 남긴 router-interface·windows-ipv4 확인 기록은 갱신 후에도 유지되었다. router-access에서 6/6 판정 후 새로고침해도 입력·판정이 유지되었고, 공개 검수 탭의 콘솔 로그는 없었다. 공개 화면 증거는 Git 제외 폴더 `verification/emulator-20261024/public/`에 보관한다.

## 2026-10-24 router-access 인증·원격 접속·재실행 검증 반영

- 배포 코드: [`42e48b71b02a27d620217cc55d628739f0d95b3c`](https://github.com/sumilee-phd/NA2-study/commit/42e48b71b02a27d620217cc55d628739f0d95b3c)
- [자동 검증 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40046098283): Ubuntu·Node.js 22에서 99개 테스트 통과, 빌드 통과.
- [Pages 배포 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40046098289): 2026-10-24 09:40 KST 완료. 배포용 빌드에서도 99개 테스트 통과.

ICQA 라우터 시험 데모에서 콘솔 재접속 인증은 통과, VTY 원격 인증과 330초 유휴 종료는 `telnet`·`connect` 미구현으로 도구 미지원, 프로그램 재실행 후에는 새 시험으로 초기화되어 설정이 보존되지 않았다는 결과를 router-access 절차·주의점·확인 노트와 [실습 검수 보고서](PRACTICAL_LABS_VERIFICATION.md#router-access-인증유휴-종료재실행-검증-2026-10-24)에 반영했다. 과제 조건·명령·기준값과 ID는 바꾸지 않았다.

로컬 확인: 작업 폴더에는 이 변경과 무관한 다른 작업의 수정·미추적 파일이 있어, 커밋 대상(HEAD와 이 변경)만 영문 임시 경로 사본에 맞춰 확인했다. 그 사본에서 테스트 99개 통과, `vite build`의 새 `dist/` 산출물과 실습 번들의 새 문구 포함을 확인했다. `npm run verify:originals`도 통과(추적 파일 42개 일치). 이전 확인 때 저장한 router-access 기록이 새 문구에서도 복원되었고, 5/6 → 수정 시 판정 해제 → 6/6 → 새로고침 복원, 360×800 가로 넘침 없음, 콘솔 로그 없음을 확인했다.

공개 주소에서 메인 번들 `index-BbH3DbTo.js`와 실습 번들 `PracticalLabs-Djww1ViK.js`를 확인했다. router-access에 새 확인 노트와 "저장과 프로그램 재실행을 구분하세요" 주의점이 표시되고, VTY 원격 인증·유휴 종료를 이 데모로 확인할 수 없다는 범위가 함께 표시되었다. 이전 "프로그램 재실행 후 보존은 실행하지 않았습니다" 문구는 사라졌다. 같은 브라우저에 앞서 남긴 router-access·router-interface·windows-ipv4 확인 기록이 유지되었고 콘솔 로그는 없었다. 공개 화면 증거는 Git 제외 폴더 `verification/emulator-20261024-auth-restart/public/`에 보관한다.

## 2026-10-24 router-access VTY 원격 인증·유휴 종료(Packet Tracer) 반영

- 배포 코드: [`3d93b3d20d8c6ee691461f9f17103a8494ba8ce0`](https://github.com/sumilee-phd/NA2-study/commit/3d93b3d20d8c6ee691461f9f17103a8494ba8ce0)
- [자동 검증 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40050505461): Ubuntu·Node.js 22에서 107개 테스트 통과, 빌드 통과.
- [Pages 배포 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40050505290): 2026-10-24 10:36 KST 완료.

ICQA 라우터 시험 데모가 지원하지 않는 VTY 원격 인증과 `exec-timeout 5 30` 유휴 종료를 Cisco Packet Tracer 9.0.0.0810의 1941 라우터 시뮬레이션에서 실행한 결과를 router-access 환경 설명·5단계·주의점·별도 출처 노트와 [실습 검수 보고서](PRACTICAL_LABS_VERIFICATION.md#cisco-packet-tracer-시뮬레이션-검증-router-access-vty-2026-10-24)에 반영했다. ICQA 데모의 확인 노트와 미지원 문구는 그대로 두었고, 과제 ID·점검 항목 ID·정답·저장 구조와 명령은 바꾸지 않았다.

로컬 확인: 별도 작업 사본에서 최신 main(`f901176`) 위로 재배치한 뒤 테스트 107개 통과, 영문 경로 `vite build`의 새 `dist/` 산출물과 메인 번들의 새 노트 포함을 확인했다. `npm run verify:originals`는 원래 작업 폴더에서 통과(추적 파일 42개 일치, 스크립트는 줄 끝 문자 외 동일). 로컬 미리보기에서 router-access 초 값 오답 판정 → 수정 시 판정 해제 → 6/6 → 새로고침 복원, 다른 작업의 실습 그림 표시, 360×800 가로 넘침 없음, 콘솔 로그 없음을 확인했다.

공개 주소에서 메인 번들 `index-DZoxdDuq.js`를 확인했다. router-access에 Packet Tracer 시뮬레이션 노트 1개, 5단계의 시뮬레이션 결과 문장, "유휴 종료는 VTY 세션에서 확인하세요" 주의점이 표시되고, ICQA 데모로 VTY 원격 인증과 유휴 종료를 확인할 수 없다는 문구도 유지되었다. 같은 브라우저에 앞서 남긴 router-interface·windows-ipv4·router-access 기록이 유지되어 router-access는 6/6으로 복원되었다. 360×800 가로 넘침과 콘솔 로그는 없었다. 실행·로컬·공개 화면 증거는 Git 제외 폴더 `verification/vty-lab-20261024-packet-tracer/`(`screens/`, `local/`, `public/`, `RUN.txt`, `SHA256SUMS.txt`)에 보관한다.

## 2026-10-24 8개 과제 최종 검증표 공개

- 배포 코드: [`03ff8375fb8c5ec13457ec6af8d11f1bd4684085`](https://github.com/sumilee-phd/NA2-study/commit/03ff8375fb8c5ec13457ec6af8d11f1bd4684085)
- [자동 검증 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40067785986): Ubuntu·Node.js 22의 설치·테스트·빌드 통과.
- [Pages 배포 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40067785987): 2026-10-24 14:50 KST 완료. 배포용 빌드에서도 설치·테스트·빌드·아티팩트 업로드를 통과했다.
- 공개 주소: [8개 과제 최종 검증표](https://sumilee-phd.github.io/NA2-study/#/practical/lab/verification)

문서 상단과 사이트에서 같은 검증 데이터를 사용하도록 구성하고, 실습 목록·개별 과제에 검증표 진입 링크를 추가했다. ICQA와 Packet Tracer의 확인 범위·미실시 항목·공통 한계를 구분한다. 기존 과제 조건·44개 점검 기준·저장 구조는 변경하지 않았다.

로컬 검수는 109개 테스트, 원본 42개 파일 일치, 영문 경로 사본의 배포용 빌드를 통과했다. 입력·판정 보존, 다른 탭의 변경 경고, 케이블링 평가 중 직접 경로·새로고침 차단과 종료 후 복원, 잘못된 하위 경로 안내를 확인했다. 상세 범위는 [실습 검수 보고서](PRACTICAL_LABS_VERIFICATION.md#최종-검증표-공개-화면-구현-검수-2026-10-24)를 따른다.

공개 사이트의 메인 번들 `index-Bkacqbrk.js`는 로컬 검수 빌드와 동일한 이름이다. 실습 목록 진입 링크, 검증표 8행, router-access 과제 왕복, 새로고침 후 표시와 360×800 화면의 가로 넘침 없음을 확인했다. 앞서 공개 브라우저에 저장된 DHCP 완료 표시와 목록 1/8 상태도 유지되었다. 공개 검수 탭의 error·warn 로그는 없었다. 실제 스마트폰·모든 브라우저의 검증을 뜻하지 않는다.

공개 화면 증거는 Git 제외 폴더 `verification/lab-verification-summary-20261024/public-summary.png`, `public-mobile.png`에 보관한다. 이 배포 이력을 기록하는 후속 문서 커밋은 앱 코드·빌드 산출물을 변경하지 않는다.

## 2026-10-24 Packet Tracer 후속 검증·SOA 재검증 결과 반영

- 배포 코드: [`84ab06d58b1dc3ff54b69fbeaa3960bead81f9e0`](https://github.com/sumilee-phd/NA2-study/commit/84ab06d58b1dc3ff54b69fbeaa3960bead81f9e0)
- [자동 검증 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40078005633): Ubuntu·Node.js 22에서 113개 테스트 통과, 빌드 통과. 2026-10-24 17:26:12 KST 완료.
- [Pages 배포 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40078005670): 2026-10-24 17:26:26 KST 완료. 배포용 빌드에서도 113개 테스트 통과.
- 공개 주소: [8개 과제 최종 검증표](https://sumilee-phd.github.io/NA2-study/#/practical/lab/verification)

Packet Tracer 후속 검증(1841·PC-PT·Server-PT)과 SOA Minimum TTL 동일 조건 재검증 결과를 검증표·상단 종합표·[실습 검수 보고서](PRACTICAL_LABS_VERIFICATION.md#cisco-packet-tracer-후속-검증-2026-10-24-15001604)에 반영했다. Packet Tracer 결과는 router-interface·router-route·router-basics·windows-ipv4·router-access가 통과, windows-dhcp·windows-dns-records·windows-dns-soa가 부분 확인이다. 부분 확인 배지 스타일을 추가했고, 과거 상태를 고정하던 테스트를 증거 기준의 상태·스타일·문구 검사로 바꿨다. 과제 ID·44개 점검 기준·정답·저장 구조는 바꾸지 않았다.

로컬 확인: 영문 경로 작업 사본(커밋 `84ab06d`, 원래 작업 폴더와 파일 내용 동일)에서 `npm test` 113개 통과, `node scripts/sync-lab-verification.mjs --check` 일치, `git diff --check` 통과. `npm run verify:originals`는 원래 작업 폴더에서 통과(추적 파일 42개 일치). 배포 경로 빌드는 Git Bash에서 `BASE_PATH=/NA2-study/`가 Windows 경로로 바뀌어 잘못된 경로로 한 번 만들어졌고, PowerShell에서 다시 실행해 `/NA2-study/assets/index-DF2UsE2d.js`를 쓰는 산출물을 확인했다. 원래 작업 폴더(한글 경로)의 같은 빌드는 모듈 변환 직후 종료 코드 -1073740791로 끝나 `dist/`가 갱신되지 않았다.

그 영문 경로 빌드로 검증표 8행과 통과 13개·부분 확인 3개 배지, 실습 목록·개별 과제·검증표 사이 이동, router-interface 입력·판정의 새로고침 후 복원, 케이블링 평가 중 검증표 직접 진입·새로고침 차단과 평가 종료 후 표시, 360×800 화면의 카드 배치와 가로 넘침 없음을 확인했다. 브라우저 콘솔 로그는 없었다.

공개 주소에서 메인 번들 `index-DdOB8CfY.js`를 확인했다. 검증표 8행, Packet Tracer 열의 부분 확인 배지 3개(windows-dhcp·windows-dns-records·windows-dns-soa), 새 환경 설명(1941·1841·PC-PT·Server-PT), SOA 600·700·600 문구, 기존 VTY 330.4초 초과~344.2초 이하와 ICQA 재실행 초기화 문구가 표시되었다. 검증표·개별 과제·실습 목록 이동과 상세 기록 링크(GitHub 문서, 새 절 포함)가 동작했고, 같은 브라우저의 기존 학습 기록 3건이 유지되었다. 360×800에서 페이지 가로 넘침과 콘솔 로그는 없었다. 실제 스마트폰·모든 브라우저 검증을 뜻하지 않는다.

화면 증거는 Git 제외 폴더 `verification/lab-verification-update-20261024-1725/`(`local/`, `public/`)에 보관한다. 실험 증거는 `verification/packet-tracer-followup-20261024-1500/`, `verification/soa-ttl-recheck-20261024-1646/`에 있다.

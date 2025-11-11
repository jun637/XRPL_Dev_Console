# Dev Console 사용 가이드

XRPL Developer Console은 XRPL 개발자를 위한 **네트워크 선택 → 지갑 상태 파악 → 트랜잭션 작성/제출 → 결과 분석**을 한 화면에서 반복하도록 설계된 테스트 툴입니다. 또한 XRPL GPT·Tooltip·Sidebar 자료를 곳곳에 배치해 학습용 레퍼런스로도 활용할 수 있도록 구성했습니다.  

내부 로직과 레퍼런스는 `xrpl.js`를 중심으로 구성했고, 함께 참고할 수 있는 `xrpl-py` 예시도 곳곳에 준비해 놓았습니다다.

만약 XRPL 개발이 처음이라면, 하단의 XRPL 공식 js/py SDK 레퍼런스 링크를 통해 **네트워크 연결 → 지갑 생성/연결 → 트랜잭션 작성/제출** 의 흐름을 간단히 파악하고 오는 것을 추천합니다. 이는 XRPL 개발에서 전반적으로 반복되는 흐름입니다.

- `xrpl.js` 공식 문서: https://js.xrpl.org/  
- `xrpl-py` 코드 스니펫: https://xrpl-py.readthedocs.io/en/stable/source/snippets.html

---

## 1. 상단 제어 영역

> 네트워크, XRPL GPT, 전역 상태를 다루는 상단 바

- **Network Selector**: `NETWORKS` 리스트에서 Mainnet / Testnet / Devnet 등을 고르면 RPC 엔드포인트 및 관련 설정이 즉시 교체됩니다.

- **사이드바 버튼**: 헤더 좌측의 사이드바 아이콘을 누르면 좌측 사이드바가 열립니다. 교육/참고용 기능들로 구성된 메뉴들을 제공합니다.

- **XRPL GPT 버튼**: 헤더 우측의 OpenAI 아이콘을 누르면 XRPL GPT가 새 탭으로 열립니다. 트랜잭션 시나리오나 문서를 빠르게 검색할 때 사용합니다.


---

## 2. 좌측 Wallet Workspace

> 계정 준비와 상태 점검을 담당하는 영역

- **지갑 관리**: 새 지갑 생성, 저장된 지갑 목록, 삭제 기능이 한 줄로 배치되어 있습니다. 선택된 지갑은 전체 UI의 기본 Account가 됩니다.

- **Account Info**: 현재 연결된 지갑의 XRPL 형식 주소(rAddress), Public Key, Seed 정보를 출력합니다. **현재 SEED는 개발 편의상 출력되게 해놓았지만, 메인넷 지갑을 운용하거나 실 서비스를 구현중인 경우 SEED값은 절대 노출하지 않기를 권장합니다.**

- **Girin Wallet 연동**: `Girin Wallet Connect` 버튼이 브라우저로 `girin:open-qr-connect` 이벤트를 보내 QR 스캔 연결을 시작합니다. Girin Wallet의 푸시형 워크플로와 연계할 때 사용합니다.(미구현)

- **Faucet**: Testnet/Devnet에서 클릭 한 번으로 자금을 지원 받을 수 있고, 결과 메시지는 바로 아래 상태 영역에 표시됩니다.

- **Account Snapshot**:

  - XRP/MPT/IOU 잔고, Sequence, OwnerCount, 예약량을 한눈에 확인.
  
  - 계정 Flags(`parseAccountRootFlags`) 결과를 카드 형태로 보여 주어 현재 연결된 지갑의 asf(RequireDestTag, DisallowXRP) 설정을 빠르게 파악할 수 있습니다.

- **Account Activity & Alerts**: 네트워크 오류나 RPC 응답 실패 시 상태 배지를 통해 즉시 피드백을 제공합니다.

---

## 3. 우측 Transaction Workspace

> 트랜잭션 JSON 작성과 제출/기록을 담당하는 메인 편집 영역

- **Tx Editor**: 기본 템플릿(`defaultTxTemplate`)이 들어 있는 textarea. Sidebar의 Transaction Library에서 특정 트랜잭션에 대해 `Insert`를 누르면 해당 트랜잭션의 템플릿이 이곳에 즉시 삽입됩니다.

- **Transaction Submit Button**:
  
  - `Transaction Submit`: 현재 연결된 지갑으로, 연결된 네트워크에 트랜잭션을 제출합니다.

- **Result Panel**: `engine_result`, `engine_result_message`, `hash`, ledger index 등을 카드 형태로 표시하여 제출 성공/실패를 바로 확인할 수 있습니다.

- **Transaction History & Detail**:

  - `History` 모달: 현재 연결된 지갑의 `account_tx` 기준 상위 20개 트랜잭션의 요약 리스트를 제공합니다
  - `Detail` 모달: 선택한 트랜잭션의 전체 JSON을 렌더링해 제공합니다.

---

## 4. Sidebar Tools

> Tx 작성/디버깅을 돕는 보조 유틸 모음

- **사용법 툴팁**: `사용법` 버튼을 hover 하면 현재 문서가 팝업으로 열려 언제든 요약 가이드를 확인할 수 있습니다.

- **XRP Ledger 소개**: XRPL 생태계에 대한 Notion 문서 링크로 이동합니다.

- **Transaction Library**:

  - 트랜잭션 템플릿 검색/필터 → `Insert` 로 에디터에 즉시 삽입.

  - 각 항목은 Docs / `xrpl.js` / `xrpl-py` 공식 링크를 함께 제공.

  - Tooltip Markdown에 사용 목적과 팁을 수록.

- **Error Codes**:

  - `tec`, `tef`, `tem`, `tel` 등의 Prefix별 오류를 검색/열람.

  - Tooltip 가이드로 TransactionResult 해석법을 요약해 놓았습니다.

- **Flags**:

  - Account/Tx/Ledger 관련 flag 리스트를 Decimal/설명/문서 링크와 함께 제공.

  - 검색으로 필요한 flag를 빠르게 찾고 상세 링크로 이동할 수 있습니다.

- **Developer Links / XRPL Community**:

  - XRPL 공식 Docs, xrpl.org, XRPL Explorer 등의 개발 관련 사이트들과 XRPL Discord, Forum, X 등 커뮤니티 채널을 모았습니다.

- **Updates**:

  - 기능 추가/수정 로그와 향후 개선 계획을 모달에서 확인할 수 있습니다.

각 Modal 헤더에는 동일한 Markdown Tooltip을 달아두어, 버튼 위에서 hover만 해도 세부 설명을 즉시 열람할 수 있습니다.

---

## 5. Workflow Tips

> Dev Console을 사용할 때 추천하는 실전 흐름

1. **네트워크 · 지갑 설정**  

   - 원하는 네트워크 선택 → 새 지갑 생성 또는 Girin Wallet 연결 → 필요 시 Faucet으로 초기 자금 확보.

2. **계정 상태 확인**  

   - 좌측 Snapshot에서 잔고/OwnerCount/Flags 점검 → 필요하면 Flags 모달로 세부 설정 확인.

3. **트랜잭션 작성** 

   - Transaction Library에서 템플릿 삽입 → 값 수정 → Error Codes / Flags / Docs 링크를 참고하며 옵션 조정.

4. **제출 & 검증**  

   - `Submit` 버튼으로 원장에 반영 → Result Panel과 History 모달로 Tx 상태를 추적.

5. **지식 확장**  

   - 막히는 부분은 사용법 툴팁, XRPL GPT, Notion 문서, Developer Links, Community 채널을 통해 즉시 찾아보고 해결.

이 순서를 반복하면 **“상태 파악 → 템플릿 활용 → Tx 전송 → 결과 확인 → 학습”** 사이클을 빠르게 돌릴 수 있습니다. Dev Console이 제공하는 보조 툴을 적극 활용해 XRPL 실험을 효율적으로 진행하세요.

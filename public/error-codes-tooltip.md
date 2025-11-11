# 🚨 XRPL Error Codes 파헤치기

---

> 🧭 **TransactionResult(Codes)란?**  
> XRPL에서 트랜잭션을 제출하면 검증 결과가 **`TransactionResult`** 필드에 기록됩니다.  
> `tesSUCCESS`만이 유일한 성공 코드이며, 그 밖의 Prefix(`tec`, `ter`, `tem`, `tel`)는 모두 실패를 의미합니다.  
> 이 필드만 보면 *트랜잭션이 원장에 반영되었는지, 실패했다면 왜 실패했는지* 즉시 알 수 있습니다.

---

## 1. 🔍 주요 Error Prefix

- **`tec` (Transaction Engine Claim)**
  - 의미: 검증 원장에 **포함**되지만 목적 동작은 **실패**. **수수료만 차감**되고 **시퀀스 소모**.
  - 주로 발생: 상대 계정 미개설/리저브 부족/유동성·경로 부족 등.
  - 예시: `tecINSUF_RESERVE`, `tecNO_DST`, `tecUNFUNDED_PAYMENT`, `tecPATH_DRY`


- **`tef` (Failure — no retry)**
  - 의미: 형식은 유효하지만 **원인 수정 없이 재시도해도 성공 불가**(현재 규칙/상태에서 영구 실패).
  - 예시: `tefPAST_SEQ`, `tefALREADY`, `tefMAX_LEDGER`
  - 조치: **원인을 수정**(시퀀스/유효 레저 범위/중복 제출 등) 후 **새 트랜잭션으로 재제출**.


- **`ter` (Retry)**
  - 의미: **일시적 실패**. 조건이 바뀌면 재시도 시 성공 가능.
  - 주로 발생: 네트워크 상태 변화, 시퀀스/리저브 부족 등.
  - 예시: `terINSUF_FEE_B`, `terNO_ACCOUNT`


- **`tem` (Malformed)**
  - 의미: 트랜잭션 **구조 자체가 잘못됨**.
  - 주로 발생: 필수 필드 누락, 형식 오류, 부적절한 flag 등.
  - 예시: `temBAD_AMOUNT`, `temINVALID`


- **`tel` (Local)**
  - 의미: **로컬 노드에서만 발생**.
  - 주로 발생: 로컬 검증 실패, 네트워크 불일치 등.
  - 예시: `telINSUF_FEE_P`, `telWRONG_NETWORK`

> ⚠️ `tesSUCCESS` 이외의 코드는 모두 실패입니다. Prefix + 메시지를 함께 읽으면 무엇을 수정해야 하는지 빠르게 파악할 수 있습니다.

---

## 2. 🛠️ Error Codes 활용 체크리스트

1. **Ledger 반영 여부 판단**  
   - `tesSUCCESS`: 정상 반영  
   - `tec*`: 수수료만 차감, 원장 미반영  
   - `ter*`, `tel*`: 환경을 정비한 뒤 재시도 필요

2. **실패 원인 추적**  
   - `TransactionResult` → Prefix → 상세 메시지 순으로 확인  
   - 필요 시 XRPL Docs에서 코드별 설명을 추가로 조회

3. **디버깅 루틴 자동화**  
   - 제출 직후 `engine_result`, `engine_result_message`, `TransactionResult`를 함께 저장  
   - 반복되는 실패는 공통 원인을 문서화하고 팀과 공유

> 💡 Error Codes 패널은 prefix별 케이스를 빠르게 찾을 수 있게 도와줍니다. 실패 코드만 잘 읽어도 XRPL 트랜잭션 디버깅의 80%가 해결됩니다.

# ⚑ **XRPL에서 flag란?**

---

## 1. 🌱 flag의 정의 & 용도

> 💡 **의의**  
> `flag`는 XRPL 트랜잭션 혹은 Ledger Object에 부여되는 **비트 단위 설정값**으로, 해당 객체 및 트랜잭션의 동작 방식을 조정합니다.

> 🎯 **용도**  
> - 계정(Account) 기능 제어 (ex. RequireDestTag, DisallowXRP 등)  
> - 트러스트라인 권한 설정 (ex. NoRipple, Freeze 등)  
> - 오퍼 거래 정책 (ex. Passive, Sell 등)  
> - AMM, NFT, 체크 등 다양한 기능별 제어

---

## 2. 🧭 계정용 `asf`, 트랜잭션용 `tf`

> 🔁 `asf`는 **계정 상태를 변경**하는 데 쓰이며, `AccountSet` 트랜잭션의 `SetFlag` 또는 `ClearFlag` 필드로 설정/해제합니다.  
> 🔂 `tf`는 **트랜잭션 동작 방식**을 지정하며, 해당 트랜잭션 객체의 `Flags` 필드에 기록됩니다.

### ✅ 핵심 비교

- **`asf` (AccountSetFlag)**  
  - 역할: 계정 설정에 사용하는 flag  
  - 사용: `AccountSet` 트랜잭션  
  - 예시: `asfRequireDest` → 모든 수신에 destination tag 요구

- **`tf` (Transaction Flag)**  
  - 역할: 트랜잭션 실행 방식을 제어  
  - 사용: 거의 모든 트랜잭션 타입  
  - 예시  
    - `tfPassive`, `tfSell` → `OfferCreate` 트랜잭션에서 사용  
    - `tfFullyCanonicalSig` → 기본 서명 방식 지정

### 🧾 코드 예시: `AccountSet`으로 `RequireDestTag` 활성화

```json
{
  "TransactionType": "AccountSet",
  "Account": "r...",
  "SetFlag": 1,  // asfRequireDest
  "Fee": "10",
  "Sequence": 100
}
```

### 🧾 코드 예시: `OfferCreate`에서 `Sell` flag 사용

```json
{
  "TransactionType": "OfferCreate",
  "Account": "r...",
  "TakerPays": {...},
  "TakerGets": {...},
  "Flags": 0x00080000  // tfSell
}
```

> 🚨 `SetFlag`, `ClearFlag`는 `asf` 용도로만 사용하고, `Flags`는 모든 트랜잭션의 `tf` 제어에 사용됩니다.

---

## 3. 🧱 Ledger 전용 flag (`lf`) & 되돌릴 수 없는 flag

### 📌 Ledger 전용 flag (`lf`, LedgerFlags)

> - Ledger 내부에만 존재하며 직접 설정 불가. XRPL 내부 로직이나 자동화 조건에 의해 결정됩니다.  
> - 예시  
>   - `lsfPasswordSpent`: 계정 패스워드가 사용된 적이 있는지  
>   - `lsfDisableMaster`: master key 사용 불가 상태  
>   - `lsfNoFreeze`: 계정이 Freeze 권한을 포기한 상태

### ❗ 되돌릴 수 없는 flag (일방 설정)

- **`asfDisableMaster` (4)**  
  → 마스터 키 비활성화 (되돌릴 수 없음).  
  ⚠️ 반드시 Regular Key 또는 MultiSig를 설정해야 합니다.
- **`asfNoFreeze` (6)**  
  → 발행자가 발행한 IOU를 Freeze하지 못하도록 영구 선언.
- **`asfAllowTrustLineClawback` (16)**  
  → 발행자가 Trustline에서 자산을 회수(Clawback)할 수 있도록 허용.

> ✅ 한 번 설정하면 되돌릴 수 없는 flag는 **충분한 검토 후 적용**하세요.

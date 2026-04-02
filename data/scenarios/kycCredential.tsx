import type { ScenarioDef } from "./types";

export const kycCredential: ScenarioDef = {
  id: "kyc-credential",
  title: "KYC 인증 기반 거래",
  subtitle: "Credential + DepositPreauth로 인증된 사용자만 거래 허용",
  description: (
    <>
      토큰 증권, 스테이블코인 등 규제 환경에서는
      <br />KYC를 완료한 사용자만 토큰을 거래할 수 있어야 합니다.
      <br /><br />
      XRPL의 <strong>Credential</strong>과 <strong>DepositPreauth</strong>를 조합하면
      <br />특정 인증을 보유한 사용자만 입금/거래를 허용하는 구조를 만들 수 있습니다.
    </>
  ),
  steps: [
    {
      type: "info",
      title: "시나리오 개요",
      content: (
        <>
          <p>이 시나리오에서는 4개의 역할이 등장합니다.</p>
          <br />
          <p><strong>인증기관(Issuer)</strong>: KYC 인증서를 발급하는 기관</p>
          <p><strong>플랫폼(Platform)</strong>: 인증된 사용자만 입금을 허용하는 토큰 플랫폼</p>
          <p><strong>인증 사용자(User)</strong>: KYC를 완료한 사용자</p>
          <p><strong>미인증 사용자(Unauthorized)</strong>: KYC를 완료하지 않은 사용자</p>
          <br />
          <p>1. 지갑 4개 생성</p>
          <p>2. 인증기관이 사용자에게 KYC Credential 발급</p>
          <p>3. 사용자가 Credential 수락</p>
          <p>4. 플랫폼이 DepositPreauth 설정 (KYC Credential 보유자만 허용)</p>
          <p>5. <strong style={{ color: "#FF6B6B" }}>미인증 사용자 → 플랫폼 전송 시도 (실패)</strong></p>
          <p>6. <strong style={{ color: "#66FF99" }}>인증 사용자 → 플랫폼 전송 시도 (성공)</strong></p>
        </>
      ),
    },
    { type: "wallet", role: "issuer", label: "인증기관 지갑", description: "KYC 인증서를 발급하는 신뢰 기관" },
    { type: "wallet", role: "platform", label: "플랫폼 지갑", description: "인증된 사용자만 입금을 허용하는 플랫폼" },
    { type: "wallet", role: "user", label: "인증 사용자 지갑", description: "KYC를 완료한 사용자" },
    { type: "wallet", role: "unauthorized", label: "미인증 사용자 지갑", description: "KYC를 완료하지 않은 사용자" },
    {
      type: "tx",
      role: "platform",
      title: "플랫폼 DepositAuth 활성화 (AccountSet)",
      explanation: (
        <>
          플랫폼 계정에 <strong>DepositAuth</strong> 플래그를 설정합니다.
          <br /><br />
          이 플래그가 활성화되면 사전 승인(DepositPreauth) 없이는
          <br />누구도 이 계정에 XRP/토큰을 보낼 수 없습니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "AccountSet",
        Account: w.platform,
        SetFlag: 9,
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "issuer",
      title: "KYC Credential 발급 (CredentialCreate)",
      explanation: (
        <>
          인증기관이 <strong>인증 사용자</strong>에게 KYC Credential을 발급합니다.
          <br /><br />
          <strong>CredentialType</strong>: "KYC_VERIFIED"를 hex로 인코딩한 값
          <br /><strong>Subject</strong>: 인증을 받는 사용자의 주소
          <br /><br />
          미인증 사용자에게는 Credential을 발급하지 않습니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "CredentialCreate",
        Account: w.issuer,
        Subject: w.user,
        CredentialType: "4B59435F564552494649454400",
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "user",
      title: "Credential 수락 (CredentialAccept)",
      explanation: (
        <>
          인증 사용자가 발급된 KYC Credential을 수락하여 활성화합니다.
          <br /><br />
          수락 후 이 Credential은 온체인에 기록됩니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "CredentialAccept",
        Account: w.user,
        Issuer: w.issuer,
        CredentialType: "4B59435F564552494649454400",
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "platform",
      title: "DepositPreauth 설정 (KYC Credential 보유자 허용)",
      explanation: (
        <>
          플랫폼이 <strong>AuthorizeCredentials</strong>를 사용하여
          <br />특정 인증기관이 발급한 KYC Credential 보유자만
          <br />입금을 허용하도록 설정합니다.
          <br /><br />
          개별 계정을 하나하나 승인하는 것이 아니라,
          <br /><strong>해당 Credential을 보유한 누구든지</strong> 입금할 수 있게 됩니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "DepositPreauth",
        Account: w.platform,
        AuthorizeCredentials: [
          {
            Credential: {
              Issuer: w.issuer,
              CredentialType: "4B59435F564552494649454400",
            },
          },
        ],
        Fee: "12",
      }),
    },
    {
      type: "info",
      title: "이제 비교 테스트를 해보겠습니다",
      content: (
        <>
          <p>DepositPreauth가 설정된 상태에서 두 가지 전송을 시도합니다.</p>
          <br />
          <p style={{ color: "#FF6B6B" }}>
            <strong>1. 미인증 사용자 → 플랫폼 전송</strong>: KYC Credential이 없으므로 <strong>거부</strong>될 것입니다.
          </p>
          <br />
          <p style={{ color: "#66FF99" }}>
            <strong>2. 인증 사용자 → 플랫폼 전송</strong>: KYC Credential을 보유하고 있으므로 <strong>성공</strong>할 것입니다.
          </p>
        </>
      ),
    },
    {
      type: "tx",
      role: "unauthorized",
      title: "미인증 사용자 → 플랫폼 전송 (실패 예상)",
      expectFailure: true,
      explanation: (
        <>
          KYC Credential이 <strong>없는</strong> 미인증 사용자가
          <br />플랫폼에 1 XRP를 전송합니다.
          <br /><br />
          DepositAuth가 설정되어 있고 이 사용자는
          <br />인증 Credential이 없으므로 <strong style={{ color: "#FF6B6B" }}>거부될 것입니다.</strong>
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "Payment",
        Account: w.unauthorized,
        Destination: w.platform,
        Amount: "1000000",
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "user",
      title: "인증 사용자 → 플랫폼 전송 (성공 예상)",
      explanation: (
        <>
          KYC Credential을 <strong>보유한</strong> 인증 사용자가
          <br />플랫폼에 1 XRP를 전송합니다.
          <br /><br />
          DepositPreauth에서 이 사용자의 Credential을 확인하고
          <br /><strong style={{ color: "#66FF99" }}>입금이 허용됩니다.</strong>
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "Payment",
        Account: w.user,
        Destination: w.platform,
        Amount: "1000000",
        CredentialIDs: ["__CREDENTIAL_HASH__"],
        Fee: "12",
      }),
    },
    {
      type: "complete",
      summary: (
        <>
          KYC 인증 기반 거래 구조를 체험했습니다.
          <br /><br />
          <strong>비교 결과:</strong>
          <br />• <span style={{ color: "#FF6B6B" }}>미인증 사용자</span>: Credential 없음 → 전송 거부
          <br />• <span style={{ color: "#66FF99" }}>인증 사용자</span>: Credential 보유 → 전송 성공
          <br /><br />
          <strong>전체 구조:</strong>
          <br />• 인증기관: CredentialCreate → KYC 인증서 발급
          <br />• 사용자: CredentialAccept → 인증서 수락/활성화
          <br />• 플랫폼: AccountSet(DepositAuth) + DepositPreauth(AuthorizeCredentials)
          <br /><br />
          W3C Verifiable Credentials 표준 기반으로,
          <br />개별 계정이 아닌 <strong>인증서 기반</strong>으로 접근을 제어할 수 있습니다.
        </>
      ),
    },
  ],
};

import type { ScenarioDef } from "./types";

export const rewardToken: ScenarioDef = {
  id: "reward-token",
  title: "포인트/리워드 토큰",
  subtitle: "MPT + Clawback으로 기업형 토큰 관리",
  description: (
    <>
      커머스 플랫폼의 적립 포인트, 멤버십 리워드 등을
      <br />XRPL의 <strong>MPT(Multi-Purpose Token)</strong>로 발행하고 관리합니다.
      <br /><br />
      <strong>Clawback</strong> 기능을 활용하면
      <br />유효기간 만료, 부정 사용 등의 사유로 토큰을 회수할 수 있습니다.
    </>
  ),
  steps: [
    {
      type: "info",
      title: "시나리오 개요",
      content: (
        <>
          <p>이 시나리오에서는 다음을 체험합니다.</p>
          <br />
          <p>1. 플랫폼(발행자) 지갑 생성</p>
          <p>2. 고객(수신자) 지갑 생성</p>
          <p>3. 포인트 토큰 발행 (MPTokenIssuanceCreate)</p>
          <p>4. 고객이 포인트 수신 허가 (MPTokenAuthorize)</p>
          <p>5. 고객에게 포인트 적립 (Payment)</p>
          <p>6. 포인트 회수 (Clawback)</p>
        </>
      ),
    },
    { type: "wallet", role: "issuer", label: "플랫폼 지갑", description: "포인트를 발행하는 커머스 플랫폼" },
    { type: "wallet", role: "user", label: "고객 지갑", description: "포인트를 적립받는 고객" },
    {
      type: "tx",
      role: "issuer",
      title: "포인트 토큰 발행 (MPTokenIssuanceCreate)",
      explanation: (
        <>
          플랫폼이 포인트 토큰을 생성합니다.
          <br /><br />
          <strong>MaximumAmount</strong>: 발행 가능한 최대 수량
          <br /><strong>Flags: 80</strong> = Clawback(16) + Transfer(64) 플래그 활성화
          <br /><br />
          Clawback 플래그를 설정해야 나중에 토큰 회수가 가능합니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "MPTokenIssuanceCreate",
        Account: w.issuer,
        MaximumAmount: "1000000000",
        Flags: 80,
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "user",
      title: "고객이 포인트 수신 허가 (MPTokenAuthorize)",
      explanation: (
        <>
          고객이 이 포인트 토큰을 수신할 수 있도록 허가합니다.
          <br /><br />
          MPT는 IOU의 TrustSet과 유사하게,
          <br />수신자가 사전에 수신 의사를 표시해야 합니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "MPTokenAuthorize",
        Account: w.user,
        MPTokenIssuanceID: "__MPT_ISSUANCE_ID__",
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "issuer",
      title: "고객에게 포인트 적립 (Payment)",
      explanation: (
        <>
          플랫폼이 고객에게 <strong>5,000 포인트</strong>를 적립합니다.
          <br /><br />
          MPT Payment는 IOU와 달리 <strong>mpt_issuance_id</strong>로 토큰을 지정합니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "Payment",
        Account: w.issuer,
        Destination: w.user,
        Amount: {
          mpt_issuance_id: "__MPT_ISSUANCE_ID__",
          value: "5000",
        },
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "issuer",
      title: "포인트 회수 (Clawback)",
      explanation: (
        <>
          유효기간 만료 또는 부정 사용으로 인해
          <br />고객의 포인트 <strong>1,000 포인트</strong>를 회수합니다.
          <br /><br />
          Clawback은 발행자만 실행할 수 있으며,
          <br />발행 시 Clawback 플래그를 설정한 경우에만 가능합니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "Clawback",
        Account: w.issuer,
        Amount: {
          mpt_issuance_id: "__MPT_ISSUANCE_ID__",
          value: "1000",
        },
        Holder: w.user,
        Fee: "12",
      }),
    },
    {
      type: "complete",
      summary: (
        <>
          MPT 기반 포인트/리워드 토큰의 발행-적립-회수를 체험했습니다.
          <br /><br />
          <strong>핵심 구조:</strong>
          <br />• MPTokenIssuanceCreate: 토큰 생성 (Clawback 플래그 포함)
          <br />• MPTokenAuthorize: 수신자 사전 허가
          <br />• Payment (MPT): 토큰 적립/전송
          <br />• Clawback: 발행자에 의한 토큰 회수
        </>
      ),
    },
  ],
};

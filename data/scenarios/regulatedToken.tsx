import type { ScenarioDef } from "./types";

export const regulatedToken: ScenarioDef = {
  id: "regulated-token",
  title: "규제 준수형 토큰 발행",
  subtitle: "Clawback / Freeze / RequireAuth로 규제 대응",
  description: (
    <>
      금융 규제 환경에서 토큰을 발행할 때는
      <br />발행자가 토큰의 유통을 통제할 수 있는 권한이 필요합니다.
      <br /><br />
      XRPL의 <strong>Clawback</strong>(회수), <strong>Freeze</strong>(동결),
      <br /><strong>RequireAuth</strong>(사전 승인) 기능을 조합하면
      <br />규제를 준수하는 토큰 발행 구조를 만들 수 있습니다.
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
          <p>1. 발행자 지갑 생성</p>
          <p>2. 사용자 지갑 생성</p>
          <p>3. 발행자 계정 설정 (Clawback + RequireAuth + DefaultRipple)</p>
          <p>4. 사용자가 트러스트라인 설정</p>
          <p>5. 발행자가 트러스트라인 승인 (TrustSet)</p>
          <p>6. 토큰 발행 (Payment)</p>
          <p>7. 트러스트라인 동결 (Freeze)</p>
          <p>8. 토큰 회수 (Clawback)</p>
        </>
      ),
    },
    { type: "wallet", role: "issuer", label: "발행자 지갑", description: "규제 준수 토큰을 발행하는 금융기관" },
    { type: "wallet", role: "user", label: "사용자 지갑", description: "토큰을 수신할 승인된 사용자" },
    {
      type: "tx",
      role: "issuer",
      title: "발행자 계정 설정",
      explanation: (
        <>
          발행자 계정에 규제 관련 플래그를 설정합니다.
          <br /><br />
          <strong>asfAllowTrustLineClawback (16)</strong>: 토큰 회수 권한 활성화
          <br /><br />
          이 플래그는 한번 설정하면 해제할 수 없으므로 신중히 설정해야 합니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "AccountSet",
        Account: w.issuer,
        SetFlag: 16,
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "issuer",
      title: "RequireAuth 설정",
      explanation: (
        <>
          <strong>asfRequireAuth (2)</strong>: 트러스트라인 사전 승인 필수
          <br /><br />
          이 플래그를 설정하면, 사용자가 트러스트라인을 만들어도
          <br />발행자가 별도로 승인해야만 토큰을 수신할 수 있습니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "AccountSet",
        Account: w.issuer,
        SetFlag: 2,
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "issuer",
      title: "DefaultRipple 설정",
      explanation: (
        <>
          <strong>asfDefaultRipple (8)</strong>: 토큰 자유 유통 허용
          <br /><br />
          승인된 사용자들 간에 토큰이 자유롭게 이동할 수 있도록 합니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "AccountSet",
        Account: w.issuer,
        SetFlag: 8,
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "user",
      title: "사용자가 트러스트라인 설정",
      explanation: (
        <>
          사용자가 발행자의 <strong>SEC 토큰</strong>에 대한 트러스트라인을 설정합니다.
          <br /><br />
          RequireAuth가 설정되어 있으므로, 이 트러스트라인만으로는
          <br />아직 토큰을 수신할 수 없습니다. 발행자의 승인이 필요합니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "TrustSet",
        Account: w.user,
        LimitAmount: {
          currency: "SEC",
          issuer: w.issuer,
          value: "1000000",
        },
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "issuer",
      title: "발행자가 트러스트라인 승인",
      explanation: (
        <>
          발행자가 사용자의 트러스트라인을 승인합니다.
          <br /><br />
          <strong>Flags: 0x00010000 (tfSetfAuth)</strong>를 사용하여
          <br />해당 사용자의 SEC 토큰 보유를 허가합니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "TrustSet",
        Account: w.issuer,
        LimitAmount: {
          currency: "SEC",
          issuer: w.user,
          value: "0",
        },
        Flags: 65536,
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "issuer",
      title: "토큰 발행 (Payment)",
      explanation: (
        <>
          발행자가 승인된 사용자에게 <strong>10,000 SEC</strong> 토큰을 발행합니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "Payment",
        Account: w.issuer,
        Destination: w.user,
        Amount: {
          currency: "SEC",
          issuer: w.issuer,
          value: "10000",
        },
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "issuer",
      title: "트러스트라인 동결 (Freeze)",
      explanation: (
        <>
          의심 거래 발생 시 발행자가 해당 사용자의
          <br /><strong>SEC 토큰 트러스트라인을 동결</strong>합니다.
          <br /><br />
          동결되면 해당 사용자는 SEC 토큰을 전송할 수 없게 됩니다.
          <br /><strong>Flags: 0x00100000 (tfSetFreeze)</strong>
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "TrustSet",
        Account: w.issuer,
        LimitAmount: {
          currency: "SEC",
          issuer: w.user,
          value: "0",
        },
        Flags: 1048576,
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "issuer",
      title: "토큰 회수 (Clawback)",
      explanation: (
        <>
          발행자가 사용자로부터 <strong>5,000 SEC</strong> 토큰을 강제 회수합니다.
          <br /><br />
          Clawback은 asfAllowTrustLineClawback 플래그가 설정된 경우에만 가능합니다.
          <br />규제 기관의 요청, 법적 판결 등에 따라 실행될 수 있습니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "Clawback",
        Account: w.issuer,
        Amount: {
          currency: "SEC",
          issuer: w.user,
          value: "5000",
        },
        Fee: "12",
      }),
    },
    {
      type: "complete",
      summary: (
        <>
          규제 준수형 토큰의 전체 라이프사이클을 체험했습니다.
          <br /><br />
          <strong>규제 도구 요약:</strong>
          <br />• <strong>RequireAuth</strong>: 승인된 사용자만 토큰 보유 가능
          <br />• <strong>Freeze</strong>: 의심 거래 시 특정 사용자 동결
          <br />• <strong>Clawback</strong>: 규제 요청 시 토큰 강제 회수
          <br /><br />
          이 세 가지를 조합하면 금융 규제 환경에서도
          <br />XRPL 위에서 토큰을 발행/관리할 수 있습니다.
        </>
      ),
    },
  ],
};

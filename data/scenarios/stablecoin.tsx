import type { ScenarioDef } from "./types";

export const stablecoin: ScenarioDef = {
  id: "stablecoin",
  title: "스테이블코인 발행",
  subtitle: "IOU 구조로 KRW/USD 토큰 발행 및 유통",
  description: (
    <>
      XRPL의 IOU(트러스트라인) 구조를 사용하면
      <br />원화, 달러 등 법정화폐에 연동된 스테이블코인을 발행할 수 있습니다.
      <br /><br />
      발행자가 토큰을 만들고, 수신자가 트러스트라인을 설정하면
      <br />토큰을 주고받을 수 있는 구조입니다.
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
          <p>1. 발행자(Issuer) 지갑 생성</p>
          <p>2. 수신자(Holder) 지갑 생성</p>
          <p>3. 발행자 계정에 DefaultRipple 플래그 설정</p>
          <p>4. 수신자가 KRW 토큰에 대한 트러스트라인 설정</p>
          <p>5. 발행자가 수신자에게 KRW 토큰 발행</p>
        </>
      ),
    },
    { type: "wallet", role: "issuer", label: "발행자 지갑", description: "스테이블코인을 발행하는 금융기관" },
    { type: "wallet", role: "receiver", label: "수신자 지갑", description: "스테이블코인을 수신할 사용자" },
    {
      type: "tx",
      role: "issuer",
      title: "발행자 계정 설정 (DefaultRipple)",
      explanation: (
        <>
          발행자 계정에 <strong>DefaultRipple</strong> 플래그를 설정합니다.
          <br /><br />
          이 플래그가 있어야 발행한 토큰이 사용자 간에 자유롭게 유통될 수 있습니다.
          <br />설정하지 않으면 토큰이 발행자를 거쳐야만 이동 가능합니다.
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
      role: "receiver",
      title: "수신자가 KRW 트러스트라인 설정",
      explanation: (
        <>
          수신자가 발행자의 <strong>KRW 토큰</strong>을 수신할 수 있도록
          <br />트러스트라인을 설정합니다.
          <br /><br />
          트러스트라인은 &ldquo;이 발행자의 이 토큰을 최대 얼마까지 받겠다&rdquo;는 선언입니다.
          <br />수신자가 먼저 설정해야 토큰을 받을 수 있습니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "TrustSet",
        Account: w.receiver,
        LimitAmount: {
          currency: "KRW",
          issuer: w.issuer,
          value: "10000000",
        },
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "issuer",
      title: "발행자가 KRW 토큰 발행 (전송)",
      explanation: (
        <>
          발행자가 수신자에게 <strong>100,000 KRW</strong> 토큰을 전송합니다.
          <br /><br />
          IOU 구조에서 발행자가 처음 전송하는 행위가 곧 &ldquo;발행&rdquo;입니다.
          <br />발행자의 잔액은 음수(의무)로, 수신자의 잔액은 양수(자산)로 기록됩니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "Payment",
        Account: w.issuer,
        Destination: w.receiver,
        Amount: {
          currency: "KRW",
          issuer: w.issuer,
          value: "100000",
        },
        Fee: "12",
      }),
    },
    {
      type: "complete",
      summary: (
        <>
          IOU 구조의 스테이블코인 발행/유통을 체험했습니다.
          <br /><br />
          <strong>핵심 구조:</strong>
          <br />• 발행자: DefaultRipple 설정 → 토큰 자유 유통
          <br />• 수신자: TrustSet → 수신 허용 선언
          <br />• 발행: Payment → 발행자가 토큰 전송 = 발행
        </>
      ),
    },
  ],
};

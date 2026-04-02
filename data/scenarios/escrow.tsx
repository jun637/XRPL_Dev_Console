import type { ScenarioDef } from "./types";

export const escrow: ScenarioDef = {
  id: "escrow",
  title: "에스크로 결제",
  subtitle: "조건 충족 시 자동 릴리즈되는 안전결제",
  description: (
    <>
      중고거래, 프리랜서 플랫폼 등에서
      <br />대금을 안전하게 보관했다가 조건 충족 시 지급하는 에스크로 구조입니다.
      <br /><br />
      XRPL의 <strong>Escrow</strong>를 사용하면
      <br />스마트 컨트랙트 없이도 시간 기반 조건부 결제가 가능합니다.
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
          <p>1. 구매자 지갑 생성</p>
          <p>2. 판매자 지갑 생성</p>
          <p>3. 구매자가 에스크로 생성 (XRP 예치)</p>
          <p>4. 조건 충족 후 에스크로 실행 (판매자에게 지급)</p>
        </>
      ),
    },
    { type: "wallet", role: "sender", label: "구매자 지갑", description: "대금을 에스크로에 예치하는 구매자" },
    { type: "wallet", role: "receiver", label: "판매자 지갑", description: "상품/서비스를 제공하는 판매자" },
    {
      type: "tx",
      role: "sender",
      title: "에스크로 생성 (XRP 예치)",
      explanation: (
        <>
          구매자가 <strong>10 XRP</strong>를 에스크로에 예치합니다.
          <br /><br />
          <strong>FinishAfter</strong>를 현재 시각 + 10초로 설정하여
          <br />10초 후부터 에스크로를 실행(릴리즈)할 수 있게 합니다.
          <br /><br />
          실제 서비스에서는 배송 완료, 검수 승인 등의 조건을
          <br />시간 또는 Crypto Condition으로 설정합니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "EscrowCreate",
        Account: w.sender,
        Destination: w.receiver,
        Amount: "10000000",
        FinishAfter: "__RIPPLE_TIME_PLUS_10__",
        Fee: "12",
      }),
    },
    {
      type: "info",
      title: "에스크로 대기",
      content: (
        <>
          <p>에스크로가 생성되었습니다.</p>
          <p>FinishAfter 시간(10초)이 지나면 다음 스텝에서 에스크로를 실행할 수 있습니다.</p>
          <br />
          <p><strong>10초 정도 기다린 후</strong> 다음 버튼을 눌러주세요.</p>
        </>
      ),
    },
    {
      type: "tx",
      role: "receiver",
      title: "에스크로 실행 (대금 수령)",
      explanation: (
        <>
          조건 시간이 경과한 후, 누구든 에스크로를 실행하여
          <br />예치된 XRP를 판매자에게 릴리즈할 수 있습니다.
          <br /><br />
          <strong>Owner</strong>: 에스크로 생성자 (구매자)
          <br /><strong>OfferSequence</strong>: 에스크로 생성 시 사용된 시퀀스 번호
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "EscrowFinish",
        Account: w.receiver,
        Owner: w.sender,
        OfferSequence: "__ESCROW_SEQUENCE__",
        Fee: "12",
      }),
    },
    {
      type: "complete",
      summary: (
        <>
          에스크로 기반 안전결제를 체험했습니다.
          <br /><br />
          <strong>XRPL Escrow의 장점:</strong>
          <br />• 스마트 컨트랙트 없이 조건부 결제 구현
          <br />• 시간 조건 (FinishAfter / CancelAfter)
          <br />• Crypto Condition으로 복잡한 조건도 가능
          <br />• 에스크로 중 XRP는 Ledger에 안전하게 잠김
        </>
      ),
    },
  ],
};

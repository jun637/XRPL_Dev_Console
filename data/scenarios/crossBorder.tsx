import type { ScenarioDef } from "./types";

export const crossBorder: ScenarioDef = {
  id: "cross-border",
  title: "크로스보더 송금",
  subtitle: "XRP를 브릿지 자산으로 활용한 해외송금",
  description: (
    <>
      해외송금 서비스에서 XRP를 브릿지 자산으로 활용하면
      <br />기존 은행 송금 대비 빠르고 저렴한 국제 송금이 가능합니다.
      <br /><br />
      이 시나리오에서는 송금인이 XRP로 전환하여
      <br />수취인에게 전송하는 구조를 체험합니다.
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
          <p>1. 송금인 지갑 생성 (한국 측)</p>
          <p>2. 수취인 지갑 생성 (해외 측)</p>
          <p>3. 송금인이 수취인에게 XRP 직접 송금</p>
          <p>4. 송금 결과 확인</p>
        </>
      ),
    },
    { type: "wallet", role: "sender", label: "송금인 지갑", description: "한국 측 송금인" },
    { type: "wallet", role: "receiver", label: "수취인 지갑", description: "해외 측 수취인" },
    {
      type: "tx",
      role: "sender",
      title: "송금인 → 수취인 XRP 송금",
      explanation: (
        <>
          송금인이 수취인에게 10 XRP를 직접 전송합니다.
          <br /><br />
          XRPL에서 XRP 송금은 <strong>3~5초</strong> 내에 최종 확정(finality)됩니다.
          <br />기존 SWIFT 송금(1~3일)과 비교하면 획기적으로 빠릅니다.
          <br /><br />
          실제 서비스에서는 송금인이 원화 → XRP 전환 후 송금하고,
          <br />수취인 측에서 XRP → 현지 통화로 전환하는 구조입니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "Payment",
        Account: w.sender,
        Destination: w.receiver,
        Amount: "10000000",
        Fee: "12",
      }),
    },
    {
      type: "complete",
      summary: (
        <>
          XRP를 브릿지 자산으로 활용한 크로스보더 송금을 체험했습니다.
          <br /><br />
          XRPL의 장점:
          <br />• 결제 최종성 3~5초
          <br />• 수수료 0.000012 XRP (약 0.001원)
          <br />• 24/7 운영 (은행 영업시간 무관)
        </>
      ),
    },
  ],
};

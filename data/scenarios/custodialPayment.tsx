import type { ScenarioDef } from "./types";

export const custodialPayment: ScenarioDef = {
  id: "custodial-payment",
  title: "결제 서비스 (Custodial)",
  subtitle: "DestinationTag를 활용한 고객별 입금 구분",
  description: (
    <>
      간편결제, 거래소 등 Custodial 서비스에서는
      <br />하나의 마스터 지갑으로 다수의 고객 입금을 관리합니다.
      <br /><br />
      XRPL의 <strong>DestinationTag</strong>를 사용하면
      <br />하나의 주소에서 고객별 입금을 구분할 수 있습니다.
      <br />은행의 &ldquo;가상 계좌번호&rdquo;와 같은 역할입니다.
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
          <p>1. 플랫폼(거래소) 지갑 생성</p>
          <p>2. 고객 지갑 생성</p>
          <p>3. 고객이 플랫폼에 XRP 입금 (DestinationTag로 고객 식별)</p>
          <p>4. 플랫폼이 고객에게 XRP 출금</p>
        </>
      ),
    },
    { type: "wallet", role: "platform", label: "플랫폼 지갑", description: "거래소/결제 서비스의 마스터 지갑" },
    { type: "wallet", role: "user", label: "고객 지갑", description: "서비스를 이용하는 고객의 지갑" },
    {
      type: "tx",
      role: "user",
      title: "고객 → 플랫폼 입금 (DestinationTag 포함)",
      explanation: (
        <>
          고객이 플랫폼 주소로 XRP를 입금합니다.
          <br /><strong>DestinationTag: 12345</strong>로 이 고객의 입금임을 식별합니다.
          <br /><br />
          실제 서비스에서는 고객마다 고유한 DestinationTag를 부여하고,
          <br />입금 시 태그를 확인하여 어떤 고객의 입금인지 매칭합니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "Payment",
        Account: w.user,
        Destination: w.platform,
        DestinationTag: 12345,
        Amount: "5000000",
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "platform",
      title: "플랫폼 → 고객 출금",
      explanation: (
        <>
          플랫폼이 고객에게 XRP를 출금합니다.
          <br />출금 시에는 DestinationTag가 필요하지 않습니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "Payment",
        Account: w.platform,
        Destination: w.user,
        Amount: "2000000",
        Fee: "12",
      }),
    },
    {
      type: "complete",
      summary: (
        <>
          Custodial 결제 서비스의 기본 구조를 체험했습니다.
          <br /><br />
          <strong>DestinationTag</strong>를 활용하면 하나의 XRPL 주소로
          <br />수천 명의 고객 입금을 구분할 수 있습니다.
          <br /><br />
          실제 서비스에서는 RequireDest 플래그를 설정하여
          <br />태그 없는 입금을 방지하는 것이 권장됩니다.
        </>
      ),
    },
  ],
};

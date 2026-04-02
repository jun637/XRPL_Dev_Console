import type { ReactNode } from "react";

/** Hover tooltip texts for UI elements — aimed at Web2/fintech newcomers. */
export const TOOLTIP_TEXTS: Record<string, ReactNode> = {
  // Header
  networkTabs: (
    <>
      XRPL은 <strong>Mainnet</strong>(실제 자산), <strong>Testnet</strong>(테스트용), <strong>Devnet</strong>(개발용)
      <br />세 가지 네트워크를 운영합니다.
      <br /><br />
      Testnet/Devnet은 실제 자산이 아닌 테스트용 XRP를 사용하므로
      <br />자유롭게 실험할 수 있습니다.
    </>
  ),
  connectionStatus: (
    <>
      현재 선택한 네트워크의 XRPL 노드와
      <br />WebSocket 연결 상태를 나타냅니다.
      <br /><br />
      🟢 초록색: 정상 연결
    </>
  ),

  // Wallet
  connectWallet: (
    <>
      <strong>Create New</strong>: 새 XRPL 지갑을 생성합니다.
      <br />
      <strong>Load Existing</strong>: 기존 시드(Seed)를 입력해 지갑을 불러옵니다.
      <br />
      <strong>Girin Wallet</strong>: Girin Wallet 앱과 QR로 연결합니다.
    </>
  ),
  savedWallet: (
    <>
      이전에 저장해둔 지갑 목록을 불러옵니다.
      <br /><br />
      지갑 정보는 브라우저 로컬 저장소에 저장되며,
      <br />브라우저 데이터를 삭제하면 함께 사라집니다.
    </>
  ),
  faucet: (
    <>
      <strong>Testnet / Devnet 전용</strong> 기능입니다.
      <br /><br />
      버튼을 누르면 현재 지갑으로
      <br />무료 테스트용 XRP가 지급됩니다.
      <br />
      Mainnet에서는 사용할 수 없습니다.
    </>
  ),
  walletAddress: (
    <>
      XRPL 계정의 고유 주소입니다.
      <br />다른 사람에게 XRP나 토큰을 받으려면 이 주소를 전달하면 됩니다.
      <br /><br />
      은행 계좌번호와 비슷한 역할입니다.
    </>
  ),
  publicKey: (
    <>
      이 지갑의 <strong>공개키</strong>입니다.
      <br />트랜잭션 서명 검증에 사용되며, 공개되어도 안전합니다.
    </>
  ),
  seed: (
    <>
      이 지갑의 비밀키(Private Key)를 생성하는 <strong>시드 값</strong>입니다.
      <br /><br />
      이 값을 알면 누구든 이 지갑의 자산을 사용할 수 있으므로,
      <br /><strong style={{ color: "#FF6B6B" }}>절대 타인에게 공유하지 마세요.</strong>
    </>
  ),

  saveWallet: (
    <>
      현재 연결된 지갑의 주소, 시드 등의 정보를
      <br />브라우저에 저장합니다.
      <br /><br />
      저장된 지갑은 <strong>Saved Wallet</strong>에서 다시 불러올 수 있습니다.
    </>
  ),
  flags: (
    <>
      이 계정에 설정된 <strong>플래그(옵션)</strong> 목록을 확인합니다.
      <br /><br />
      플래그는 계정의 동작 방식을 제어하는 설정값입니다.
      <br />예: 수신 거부, 동결 허용, 기본 Rippling 등
    </>
  ),
  trustline: (
    <>
      이 계정이 설정한 <strong>트러스트라인</strong> 목록을 확인합니다.
      <br /><br />
      트러스트라인은 특정 발행자의 토큰(IOU)을 수신하기 위해
      <br />사전에 설정하는 신뢰 관계입니다.
    </>
  ),
  xrpBalance: (
    <>
      이 계정이 보유한 <strong>XRP</strong> 수량입니다.
      <br /><br />
      XRPL에서 계정을 유지하려면
      <br />최소 Reserve(현재 1 XRP)가 필요합니다.
    </>
  ),
  iouBalance: (
    <>
      이 계정이 보유한 <strong>IOU(발행 토큰)</strong> 잔액입니다.
      <br /><br />
      IOU는 트러스트라인을 통해 수신한 토큰으로,
      <br />스테이블코인 등이 이 방식으로 발행됩니다.
    </>
  ),
  mptBalance: (
    <>
      이 계정이 보유한 <strong>MPT(Multi-Purpose Token)</strong> 잔액입니다.
      <br /><br />
      MPT는 XRPL의 새로운 토큰 표준으로,
      <br />RWA/STO 등 다양한 자산을 표현할 수 있습니다.
    </>
  ),
  sequence: (
    <>
      이 계정의 현재 <strong>시퀀스 번호</strong>입니다.
      <br /><br />
      트랜잭션을 제출할 때마다 1씩 증가하며,
      <br />트랜잭션의 순서와 중복 방지에 사용됩니다.
    </>
  ),
  ownerCount: (
    <>
      이 계정이 소유한 <strong>Ledger 오브젝트</strong>의 수입니다.
      <br />(트러스트라인, 오퍼 등)
      <br /><br />
      오브젝트가 많을수록 더 많은 XRP가 Reserve로 잠깁니다.
    </>
  ),

  // TX Editor
  txJsonEditor: (
    <div style={{ maxWidth: 720 }}>
      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
        XRPL에서는 모든 동작이 &ldquo;트랜잭션&rdquo;으로 이루어집니다.
      </p>
      <p>
        송금, 토큰 발행, 트러스트라인 설정, 오퍼 생성 등
        <br />무엇을 하든 결국 <strong>하나의 JSON을 작성해서 네트워크에 제출</strong>하는 구조입니다.
      </p>

      <p style={{ fontWeight: 600, marginTop: 10, marginBottom: 4 }}>작성 방법:</p>
      <p>
        1. <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 4 }}>TransactionType</code>: 어떤 동작인지 지정
        <br />
        2. 해당 타입에 맞는 필드를 채움
        <br />
        3. <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 4 }}>Account</code>: 비워두면 현재 지갑 주소가 자동 입력됩니다
      </p>

      <p style={{ fontWeight: 600, marginTop: 12, marginBottom: 6 }}>예시: XRP 송금 (Payment)</p>
      <pre style={{
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "12px 16px",
        fontSize: 12,
        lineHeight: 1.6,
        overflowX: "auto",
      }}>{`{
  // 트랜잭션 타입: "Payment"는 송금을 의미합니다.
  "TransactionType": "Payment",

  // 보내는 사람: 비워두면 현재 연결된 지갑 주소가 자동 입력됩니다.
  "Account": "",

  // 받는 사람: 수신자의 XRPL 주소를 입력합니다.
  "Destination": "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",

  // 보낼 금액: XRP는 drops 단위로 입력합니다.
  // 1 XRP = 1,000,000 drops
  "Amount": "1000000",

  // 수수료: 보통 "12" drops (0.000012 XRP)이면 충분합니다.
  "Fee": "12"
}`}</pre>

      <p style={{ marginTop: 12, fontWeight: 700, color: "#D4FF9A" }}>
        즉, 이 입력창의 JSON만 올바르게 작성하면
        <br />XRPL 위에서 원하는 모든 동작을 실행할 수 있습니다.
      </p>

      <p style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
        좌측 사이드바의 <strong>Transaction Library</strong>에서
        트랜잭션 타입별 템플릿을 바로 불러올 수 있습니다.
      </p>

      <p style={{ marginTop: 12 }}>
        <a
          href="https://xrpl.org/docs/references/protocol/transactions"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#D4FF9A", textDecoration: "underline" }}
        >
          📖 XRPL 공식 문서: Transaction Types &amp; Fields 상세 보기
        </a>
      </p>
    </div>
  ),

  signAndSubmit: (
    <>
      에디터에 작성한 트랜잭션 JSON을
      <br />현재 지갑의 키로 <strong>서명</strong>하고 네트워크에 <strong>제출</strong>합니다.
      <br /><br />
      제출 결과와 트랜잭션 해시를 확인할 수 있습니다.
    </>
  ),
  txHistory: (
    <>
      현재 연결된 계정의 <strong>최근 트랜잭션 내역</strong>을 조회합니다.
      <br /><br />
      각 트랜잭션의 해시를 클릭하면
      <br />XRPL Explorer에서 상세 내용을 확인할 수 있습니다.
    </>
  ),
};

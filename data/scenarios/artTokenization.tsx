import type { ScenarioDef } from "./types";

export const artTokenization: ScenarioDef = {
  id: "art-tokenization",
  title: "미술품 토큰화 (RWA)",
  subtitle: "MPT로 미술품 지분을 토큰화하고 OTC 거래",
  description: (
    <>
      실물 미술품의 소유권을 XRPL의 <strong>MPT(Multi-Purpose Token)</strong>로
      <br />토큰화하여 분할 소유 및 거래가 가능하게 합니다.
      <br /><br />
      AMM/DEX가 아닌 <strong>Payment 기반 OTC 거래</strong>로
      <br />거래 상대방을 특정할 수 있어 규제 대응이 용이합니다.
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
          <p>1. 갤러리(발행자) 지갑 생성</p>
          <p>2. 구매자(투자자) 지갑 생성</p>
          <p>3. 미술품 토큰 발행 (MPTokenIssuanceCreate)</p>
          <p>4. 구매자가 토큰 수신 허가 (MPTokenAuthorize)</p>
          <p>5. 미술품 토큰 OTC 판매 (Payment)</p>
        </>
      ),
    },
    { type: "wallet", role: "issuer", label: "갤러리 지갑", description: "미술품을 토큰화하는 갤러리/플랫폼" },
    { type: "wallet", role: "receiver", label: "구매자 지갑", description: "미술품 지분을 구매하는 투자자" },
    {
      type: "tx",
      role: "issuer",
      title: "미술품 토큰 발행 (MPTokenIssuanceCreate)",
      explanation: (
        <>
          갤러리가 미술품 지분을 나타내는 MPT를 발행합니다.
          <br /><br />
          <strong>MaximumAmount: 100</strong>: 총 100 지분으로 분할
          <br /><strong>Flags: 64</strong>: Transfer 플래그 활성화 (토큰 전송 허용)
          <br /><strong>MPTokenMetadata</strong>: 작품 정보를 hex로 인코딩하여 온체인에 기록
          <br /><br />
          이 예시에서는 다음 정보가 메타데이터에 포함됩니다:
          <pre style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 11,
            lineHeight: 1.5,
            marginTop: 8,
          }}>{`{
  "name": "Starry Night Over the Rhône",
  "artist": "Vincent van Gogh",
  "year": 1888,
  "medium": "Oil on canvas",
  "dimensions": "72.5 cm × 92 cm",
  "appraised_value": "USD 100,000,000",
  "custodian": "KFIP Gallery Seoul",
  "total_shares": 100
}`}</pre>
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "MPTokenIssuanceCreate",
        Account: w.issuer,
        MaximumAmount: "100",
        Flags: 64,
        // Hex-encoded JSON metadata:
        // {"name":"Starry Night Over the Rhône","artist":"Vincent van Gogh","year":1888,"medium":"Oil on canvas","dimensions":"72.5 cm × 92 cm","appraised_value":"USD 100,000,000","custodian":"KFIP Gallery Seoul","total_shares":100}
        MPTokenMetadata: "7B226E616D65223A22537461727279204E69676874204F76657220746865205268C3B46E65222C22617274697374223A2256696E63656E742076616E20476F6768222C2279656172223A313838382C226D656469756D223A224F696C206F6E2063616E766173222C2264696D656E73696F6E73223A2237322E3520636D20C39720393220636D222C226170707261697365645F76616C7565223A2255534420313030303030303030222C22637573746F6469616E223A224B4649502047616C6C6572792053656F756C222C22746F74616C5F736861726573223A3130307D",
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "receiver",
      title: "구매자가 토큰 수신 허가 (MPTokenAuthorize)",
      explanation: (
        <>
          구매자가 이 미술품 토큰을 수신할 수 있도록 허가합니다.
          <br /><br />
          MPT는 수신자가 사전에 수신 의사를 표시해야 토큰을 받을 수 있습니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "MPTokenAuthorize",
        Account: w.receiver,
        MPTokenIssuanceID: "__MPT_ISSUANCE_ID__",
        Fee: "12",
      }),
    },
    {
      type: "tx",
      role: "issuer",
      title: "미술품 토큰 OTC 판매 (10 지분 전송)",
      explanation: (
        <>
          갤러리가 구매자에게 <strong>10 지분</strong>을 전송합니다.
          <br /><br />
          이것은 OTC(장외거래) 방식의 판매입니다.
          <br />AMM/DEX와 달리 거래 상대방이 특정되므로
          <br />KYC/AML 규제를 준수하기에 용이합니다.
          <br /><br />
          대금(XRP)은 별도 Payment로 주고받거나 오프체인에서 정산합니다.
        </>
      ),
      buildTx: (w) => ({
        TransactionType: "Payment",
        Account: w.issuer,
        Destination: w.receiver,
        Amount: {
          mpt_issuance_id: "__MPT_ISSUANCE_ID__",
          value: "10",
        },
        Fee: "12",
      }),
    },
    {
      type: "complete",
      summary: (
        <>
          미술품 RWA 토큰화 및 OTC 거래를 체험했습니다.
          <br /><br />
          <strong>핵심 구조:</strong>
          <br />• MPTokenIssuanceCreate: 실물자산 지분 토큰 생성
          <br />• MPTokenAuthorize: 구매자 수신 허가
          <br />• Payment (MPT): OTC 방식 지분 판매
          <br /><br />
          AMM/DEX 대신 Payment로 거래하면
          <br />거래 상대방 특정이 가능하여 규제 환경에 적합합니다.
        </>
      ),
    },
  ],
};

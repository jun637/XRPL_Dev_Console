import type { SidebarContext } from "@/components/sidebar/types";

export type Recipe = {
  id: string;
  title: string;
  isMainnetActive: boolean;
  build: (ctx?: SidebarContext) => Record<string, unknown>;
};
// 27 ~ 466 - Tx Library Recipe 배열 
export const RECIPES: Recipe[] = [
  // ─────────────────────────────
  // Payment
  // ─────────────────────────────
  {
    id: "payment-xrp",
    title: "Payment (XRP)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Payment",
      Account: "보내는 주소",
      Destination: "받는 주소",
      Amount: "XRP drops 문자열 (예: '1000000')",
      DestinationTag: "수취자 태그 (옵션)"
    }),
  },
  {
    id: "payment-iou",
    title: "Payment (IOU)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Payment",
      Account: "보내는 주소",
      Destination: "받는 주소",
      Amount: { currency: "토큰코드", issuer: "발행자 주소", value: "수량" },
    }),
  },
  {
    id: "payment-mpt",
    title: "Payment (MPT)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Payment",
      Account: "보내는 주소",
      Destination: "받는 주소",
      Amount: {
      mpt_issuance_id: "전송하려는 MPT의 ISSUANCE ID",
      value: "5000"
    }
    }),
  },
  {
    id: "payment-amm-swap",
    title: "Payment (AMM Swap)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Payment",
      Account: "스왑 실행 계정",
      Destination: "수취자 주소(본인 가능)",
      SendMax: { currency: "입력자산", issuer: "입력자산 발행자", value: "최대 지불" },
      Amount: { currency: "출력자산", issuer: "출력자산 발행자", value: "원하는 수량" },
      DeliverMin: { currency: "출력자산", issuer: "출력자산 발행자", value: "최소 수령 (옵션)" },
      Paths: "AMM 경유 경로 배열 (옵션)",
      DestinationTag: "수취자 태그 (옵션)",
      InvoiceID: "64바이트 hex (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Account / Trust
  // ─────────────────────────────
  {
    id: "accountset",
    title: "AccountSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AccountSet",
      Account: "계정 주소",
      SetFlag: "설정할 플래그 번호 (옵션)",
      ClearFlag: "해제할 플래그 번호 (옵션)",
    }),
  },
  {
    id: "accountdelete",
    title: "AccountDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AccountDelete",
      Account: "삭제할 계정 주소",
      Destination: "잔액을 받을 주소"
    }),
  },
  {
    id: "trustset",
    title: "TrustSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "TrustSet",
      Account: "설정 계정 주소",
      LimitAmount: { currency: "토큰코드", issuer: "발행자 주소", value: "한도" }
    }),
  },

  // ─────────────────────────────
  // DEX (Offer)
  // ─────────────────────────────
  {
    id: "offercreate-permissioned",
    title: "OfferCreate (Permissioned)",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "OfferCreate",
      Account: "오퍼 제출 계정",
      TakerGets: { currency: "내주는 자산", issuer: "발행자", value: "수량" },
      TakerPays: { currency: "받는 자산", issuer: "발행자", value: "수량" },
      DomainID: "Permissioned DEX 도메인 ID",
      Expiration: "만료 시각(UNIX) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "offercreate-general",
    title: "OfferCreate (General)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "OfferCreate",
      Account: "오퍼 제출 계정",
      TakerGets: "XRP drops 문자열 또는 IOU 객체",
      TakerPays: "XRP drops 문자열 또는 IOU 객체",
      Expiration: "만료 시각(UNIX) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "offercancel",
    title: "OfferCancel",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "OfferCancel",
      Account: "계정 주소",
      OfferSequence: "취소할 오퍼의 시퀀스",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Escrow
  // ─────────────────────────────
  {
    id: "escrowcreate-xrp",
    title: "EscrowCreate (XRP)",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "EscrowCreate",
      Account: "에스크로 생성 계정",
      Destination: "수취자 주소",
      Amount: "XRP drops 문자열",
      FinishAfter: "해당 시간 이후 완료 가능(UNIX) (옵션)",
      CancelAfter: "해당 시간 이후 취소 가능(UNIX) (옵션)",
      Condition: "PREIMAGE-SHA-256 조건(hex) (옵션)",
      DestinationTag: "수취자 태그 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "escrowcreate-iou",
    title: "EscrowCreate (IOU)",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "EscrowCreate",
      Account: "에스크로 생성 계정",
      Destination: "수취자 주소",
      Amount: { currency: "토큰코드", issuer: "발행자 주소", value: "수량" },
      FinishAfter: "해당 시간 이후 완료 가능(UNIX) (옵션)",
      CancelAfter: "해당 시간 이후 취소 가능(UNIX) (옵션)",
      Condition: "PREIMAGE-SHA-256 조건(hex) (옵션)",
      DestinationTag: "수취자 태그 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "escrowcreate-mpt",
    title: "EscrowCreate (MPT)",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "EscrowCreate",
      Account: "에스크로 생성 계정",
      Destination: "수취자 주소",
      Amount: { currency: "MPT코드", issuer: "발행자 주소", value: "수량" },
      FinishAfter: "해당 시간 이후 완료 가능(UNIX) (옵션)",
      CancelAfter: "해당 시간 이후 취소 가능(UNIX) (옵션)",
      Condition: "PREIMAGE-SHA-256 조건(hex) (옵션)",
      DestinationTag: "수취자 태그 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "escrowfinish",
    title: "EscrowFinish",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "EscrowFinish",
      Account: "완료 트랜잭션 제출 계정",
      Owner: "EscrowCreate를 보낸 계정 주소",
      OfferSequence: "EscrowCreate 시퀀스",
      Fulfillment: "조건 충족 Proof(hex) (옵션)",
      Condition: "조건(hex) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "escrowcancel",
    title: "EscrowCancel",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "EscrowCancel",
      Account: "취소 트랜잭션 제출 계정",
      Owner: "EscrowCreate를 보낸 계정 주소",
      OfferSequence: "EscrowCreate 시퀀스",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Batch
  // ─────────────────────────────
  {
    id: "batch",
    title: "Batch",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "Batch",
      Transactions: "내부 트랜잭션 배열 (각 내부 트랜잭션에 tfInnerBatchTxn(0x40000000) 플래그 설정정 필요)",
      Flags: "tfAllOrNothing / tfOnlyOne / tfUntilFailure / tfIndependent 중 선택 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  // ─────────────────────────────
  // AMM
  // ─────────────────────────────
  {
    id: "ammcreate",
    title: "AMMCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMCreate",
      Account: "풀 생성 계정",
      Amount: { currency: "자산1", issuer: "발행자1", value: "예치 수량" },
      Amount2: { currency: "자산2", issuer: "발행자2", value: "예치 수량" },
      TradingFee: "거래 수수료(0~1000, 1=0.01%) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ammdeposit",
    title: "AMMDeposit",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMDeposit",
      Account: "예치하는 계정",
      Asset: { currency: "자산1", issuer: "발행자1" },
      Asset2: { currency: "자산2", issuer: "발행자2" },
      Amount: { currency: "자산1", issuer: "발행자1", value: "예치 수량 (옵션)" },
      Amount2: { currency: "자산2", issuer: "발행자2", value: "예치 수량 (옵션)" },
      LPTokenOut: { currency: "LP 토큰", issuer: "AMM LP 발행자", value: "받고자 하는 LP 수량 (옵션)" },
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ammwithdraw",
    title: "AMMWithdraw",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMWithdraw",
      Account: "인출하는 계정",
      Asset: { currency: "자산1", issuer: "발행자1" },
      Asset2: { currency: "자산2", issuer: "발행자2" },
      LPTokenIn: { currency: "LP 토큰", issuer: "AMM LP 발행자", value: "소각할 LP 수량 (옵션)" },
      Amount: { currency: "자산1", issuer: "발행자1", value: "인출 수량 (옵션)" },
      Amount2: { currency: "자산2", issuer: "발행자2", value: "인출 수량 (옵션)" },
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ammdelete",
    title: "AMMDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMDelete",
      Account: "풀 삭제 트랜잭션 제출 계정",
      Asset: { currency: "자산1", issuer: "발행자1" },
      Asset2: { currency: "자산2", issuer: "발행자2" },
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ammbid",
    title: "AMMBid",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMBid",
      Account: "입찰 계정",
      Asset: { currency: "자산1", issuer: "발행자1" },
      Asset2: { currency: "자산2", issuer: "발행자2" },
      BidMin: { currency: "입찰 자산", issuer: "발행자", value: "최소 수량 (옵션)" },
      BidMax: { currency: "입찰 자산", issuer: "발행자", value: "최대 수량 (옵션)" },
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ammvote",
    title: "AMMVote",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMVote",
      Account: "투표 계정",
      Asset: { currency: "자산1", issuer: "발행자1" },
      Asset2: { currency: "자산2", issuer: "발행자2" },
      TradingFee: "제안/투표할 거래 수수료(0~1000, 1=0.01%)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ammclawback",
    title: "AMMClawback",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "AMMClawback",
      Account: "발행자(회수 주체) 주소",
      Asset: { currency: "자산1", issuer: "발행자1" },
      Asset2: { currency: "자산2", issuer: "발행자2" },
      Holder: "회수 대상 보유자 주소",
      Amount: { currency: "회수할 자산", issuer: "발행자1 또는 2", value: "수량" },
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Credentials
  // ─────────────────────────────
  {
    id: "credentialcreate",
    title: "CredentialCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CredentialCreate",
      Account: "발급자(issuer) 주소",
      Subject: "피발급자(subject) 주소",
      CredentialType: "자격증명 유형",
      URI: "관련 문서/레지스트리 URI (옵션)",
      Expiration: "만료 시각(UNIX) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "credentialaccept",
    title: "CredentialAccept",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CredentialAccept",
      Account: "수령자(holder) 주소",
      Issuer: "발급자 주소",
      CredentialType: "자격증명 유형",
      URI: "관련 문서/레지스트리 URI (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "credentialdelete",
    title: "CredentialDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CredentialDelete",
      Account: "삭제 요청자 주소(일반적으로 발급자)",
      Subject: "피발급자(subject) 주소",
      CredentialType: "자격증명 유형",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Checks
  // ─────────────────────────────
  {
    id: "checkcancel",
    title: "CheckCancel",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CheckCancel",
      Account: "체크 취소를 제출할 계정 주소",
      CheckID: "64자리 체크 ID(헥사)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "checkcash",
    title: "CheckCash",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CheckCash",
      Account: "체크의 Destination(수취자) 주소",
      CheckID: "64자리 체크 ID(헥사)",
      Amount: "교환 금액 (XRP drops | IOU 객체) (옵션)",
      DeliverMin: "최소 수령 금액 (XRP drops | IOU 객체) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "checkcreate",
    title: "CheckCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "CheckCreate",
      Account: "체크 발행자 주소",
      Destination: "수취자 주소",
      SendMax: "최대 금액 (XRP drops | IOU 객체)",
      DestinationTag: "수취자 태그 (옵션)",
      Expiration: "만료 시각(UNIX) (옵션)",
      InvoiceID: "64바이트 hex (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Clawback / DepositPreauth / DID
  // ─────────────────────────────
  {
    id: "clawback",
    title: "Clawback",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "Clawback",
      Account: "회수자(발행자) 주소",
      Amount: { currency: "회수할 토큰", issuer: "보유자 주소", value: "회수할 수량" },
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "depositpreauth",
    title: "DepositPreauth",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "DepositPreauth",
      Account: "예치 사전승인(DepositAuth) 설정 계정",
      Authorize: "사전 승인할 계정 주소 (Authorize/Unauthorize 중 택1)",
      Unauthorize: "사전 승인 해제할 계정 주소 (Authorize/Unauthorize 중 택1)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "diddelete",
    title: "DIDDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "DIDDelete",
      Account: "DID 소유자 주소",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "didset",
    title: "DIDSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "DIDSet",
      Account: "DID 소유자 주소",
      Data: "임의 데이터(hex) (옵션)",
      DIDDocument: "DID Document JSON(hex) (옵션)",
      URI: "hex-encoded URI (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  // ─────────────────────────────
  // MPToken (Issuance / Authorize)
  // ─────────────────────────────
  {
    id: "mptokenissuancecreate",
    title: "MPTokenIssuanceCreate",
    isMainnetActive: true,
    build: (ctx) => ({
        "TransactionType": "MPTokenIssuanceCreate",
        "Account": "rQfhnkSE62fGmdhXr2FE2vjCVnQdceoN61",
        "AssetScale": 4,
        "TransferFee": 0,
        "MaximumAmount": "5000000000",
        "Fee": "12",
        "Flags": {
          tfMPTCanClawback: true,
          tfMPTCanEscrow: true,
          tfMPTCanLock: true,
          tfMPTCanTrade: true,
          tfMPTCanTransfer: true,
          tfMPTRequireAuth: false
        }
    }),
  },
  {
    id: "mptokenissuancedestroy",
    title: "MPTokenIssuanceDestroy",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "MPTokenIssuanceDestroy",
      Account: "발행자(issuer) 주소",
      IssuanceID: "삭제할 발행(issuance) 식별자",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "mptokenissuanceset",
    title: "MPTokenIssuanceSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "MPTokenIssuanceSet",
      Account: "발행자(issuer) 주소",
      IssuanceID: "대상 issuance ID (Create 트랜잭션 해시 클릭 후 Explorer에서 확인)",
      // 잠금/해제는 Flags 비트로 설정
      Flags: "tfMPTLock 또는 tfMPTUnlock 설정 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "mptokenauthorize",
    title: "MPTokenAuthorize",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "MPTokenAuthorize",
      Account: "제출 계정(보유자 또는 발행자)",
      Asset: { currency: "MPT 코드", issuer: "발행자 주소" },
      Holder: "보유자 주소 (발행자가 권한 취소/부여 시 필수) (옵션)",
      Flags: "tfMPTUnauthorize 설정 시 보유 의사 철회/권한 취소 동작 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // Permissioned DEX Domain
  // ─────────────────────────────
  {
    id: "permissioneddomainset",
    title: "PermissionedDomainSet",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "PermissionedDomainSet",
      Account: "도메인 소유자 주소",
      DomainID: "도메인 식별자",
      Description: "도메인 설명 (옵션)",
      Rules: "권한/규칙 JSON (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "permissioneddomaindelete",
    title: "PermissionedDomainDelete",
    isMainnetActive: false,
    build: (ctx) => ({
      TransactionType: "PermissionedDomainDelete",
      Account: "도메인 소유자 주소",
      DomainID: "삭제할 도메인 식별자",
      Memos: "메모 배열 (옵션)"
    }),
  },

  // ─────────────────────────────
  // NFTs (XLS-20)
  // ─────────────────────────────
  {
    id: "nftokenacceptoffer",
    title: "NFTokenAcceptOffer",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenAcceptOffer",
      Account: "수락 트랜잭션 제출 계정",
      // 둘 중 하나(단일), 또는 둘 다(브로커드 모드)
      NFTokenBuyOffer: "구매 오퍼 ID (옵션)",
      NFTokenSellOffer: "판매 오퍼 ID (옵션)",
      BrokerFee: { currency: "수수료 통화", issuer: "발행자 주소", value: "수수료 수량 (옵션)" },
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "nftokenburn",
    title: "NFTokenBurn",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenBurn",
      Account: "소각 트랜잭션 제출 계정",
      NFTokenID: "소각할 NFT ID",
      Owner: "소유자 주소(타 계정의 NFT 소각 시 필요) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "nftokencanceloffer",
    title: "NFTokenCancelOffer",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenCancelOffer",
      Account: "취소 트랜잭션 제출 계정",
      NFTokenOffers: ["취소할 오퍼 ID들"],
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "nftokencreateoffer",
    title: "NFTokenCreateOffer",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenCreateOffer",
      Account: "오퍼 생성 계정(판매자 또는 구매자)",
      NFTokenID: "대상 NFT ID",
      // 판매 오퍼: Amount는 받으려는 대가 / 구매 오퍼: 구매자가 지불할 금액
      Amount: "XRP drops | IOU 객체",
      Owner: "NFT 소유자 주소(구매 오퍼일 때 필요) (옵션)",
      Destination: "오퍼 수락 가능 계정 제한 (옵션)",
      Expiration: "만료 시각(UNIX) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "nftokenmint",
    title: "NFTokenMint",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenMint",
      Account: "민팅 계정(발행자)",
      NFTokenTaxon: "분류 번호(0~) (같은 컬렉션 묶음 용도)",
      URI: "hex-encoded 메타데이터 URI (옵션)",
      TransferFee: "이차 판매 수수료(bps) (옵션)",
      Issuer: "대리 발행 시 지정(옵션)",
      Flags: "tfBurnable|tfOnlyXRP|tfTrustLine|tfTransferable 등 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "nftokenmodify",
    title: "NFTokenModify",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "NFTokenModify",
      Account: "수정 트랜잭션 제출 계정",
      NFTokenID: "수정할 NFT ID",
      URI: "새 hex-encoded URI (옵션)",
      TransferFee: "새 이차 판매 수수료(bps) (옵션)",
      Flags: "수정 관련 플래그 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "oracle-delete",
    title: "OracleDelete",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "OracleDelete",
      Account: "오라클 소유자 주소",
      OracleDocumentID: "오라클 문서 ID",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "oracle-set",
    title: "OracleSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "OracleSet",
      Account: "오라클 소유자 주소",
      OracleDocumentID: "오라클 문서 ID",
      LastUpdateTime: "최종 업데이트 시각(UNIX)",
      PriceDataSeries: "가격 데이터 시리즈 배열",
      Provider: "프로바이더 식별자(HEX ASCII) (옵션)",
      AssetClass: "자산 클래스(HEX ASCII) (옵션)",
      URI: "오라클 메타데이터 URI (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "set-regular-key",
    title: "SetRegularKey",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "SetRegularKey",
      Account: "마스터 키 보유 계정 주소",
      RegularKey: "새 Regular Key 주소 (미설정 시 기존 RegularKey 제거) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "signer-list-set",
    title: "SignerListSet",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "SignerListSet",
      Account: "멀티시그 소유 계정 주소",
      SignerQuorum: "요구 정족수",
      SignerEntries: "서명자 엔트리 배열",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "ticket-create",
    title: "TicketCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "TicketCreate",
      Account: "티켓 발급 계정 주소",
      TicketCount: "발급할 티켓 개수",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "payment-channel-claim",
    title: "PaymentChannelClaim",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "PaymentChannelClaim",
      Account: "채널 소유자 또는 수신자 주소",
      Channel: "채널 ID(64바이트 HEX)",
      Balance: "새 누적 잔액(drops) (옵션)",
      Amount: "서명된 청구 금액(drops) (옵션)",
      Signature: "오프레저 청구 서명(HEX) (옵션)",
      PublicKey: "서명 공개키(HEX) (옵션)",
      Flags: "tfClose(131072) 또는 tfRenew(65536) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "payment-channel-create",
    title: "PaymentChannelCreate",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "PaymentChannelCreate",
      Account: "채널 개설자(송신자) 주소",
      Amount: "송금 총액(drops)",
      Destination: "수신자 주소",
      SettleDelay: "정산 지연 시간(초)",
      PublicKey: "송신자 공개키(HEX)",
      CancelAfter: "만료 시각(UNIX) (옵션)",
      DestinationTag: "수신자 태그 (옵션)",
      SourceTag: "송신자 태그 (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  },
  {
    id: "payment-channel-fund",
    title: "PaymentChannelFund",
    isMainnetActive: true,
    build: (ctx) => ({
      TransactionType: "PaymentChannelFund",
      Account: "채널 소유자 주소",
      Channel: "채널 ID(64바이트 HEX)",
      Amount: "추가 펀딩 금액(drops)",
      Expiration: "만료 시각(UNIX) (옵션)",
      Memos: "메모 배열 (옵션)"
    }),
  }
  
];

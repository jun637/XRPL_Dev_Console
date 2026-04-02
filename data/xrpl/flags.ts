export type FlagItem = {
  id: string;
  flag: number;
  title: string;
  description: string;
  detailUrl?: string;
};
// Flags 라이브러리 배열
export const FLAG_ITEMS: FlagItem[] = [
     // ─────────────────────────────────────────────
    // AccountSet (asf flags: SetFlag/ClearFlag 값)
    // ─────────────────────────────────────────────
    {
      id: "asf-require-dest",
      flag: 1,
      title: "asfRequireDest",
      description:
        "이 계정으로의 XRPL 입금에 Destination Tag를 요구. 수취인 실수 예방에 유용, 주로 거래소의 XRPL 지갑에서 사용됨",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-require-auth",
      flag: 2,
      title: "asfRequireAuth",
      description:
        "타 계정이 이 계정의 Trustline 토큰(IOU)을 보유하려면 사전 승인 필요",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-disallow-xrp",
      flag: 3,
      title: "asfDisallowXRP",
      description:
        "클라이언트가 이 계정으로의 XRP 송금/표시를 회피하도록 권고(프로토콜 강제는 아님)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-disable-master",
      flag: 4,
      title: "asfDisableMaster",
      description:
        "마스터 키 사용 금지. RegularKey/멀티시그로만 서명 가능",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-account-txn-id",
      flag: 5,
      title: "asfAccountTxnID",
      description:
        "최근 전송 트랜잭션의 해시를 AccountTxnID 필드에 저장/추적",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-no-freeze",
      flag: 6,
      title: "asfNoFreeze",
      description:
        "해당 계정이 Trustline 동결을 사용할 수 없도록 영구 비활성화(되돌릴 수 없음)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-global-freeze",
      flag: 7,
      title: "asfGlobalFreeze",
      description:
        "해당 계정이 발행한 모든 토큰을 전역 동결",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-default-ripple",
      flag: 8,
      title: "asfDefaultRipple",
      description:
        "계정의 Trustline에서 기본적으로 rippling 허용. 발행자 계정에 권장",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-deposit-auth",
      flag: 9,
      title: "asfDepositAuth",
      description:
        "본인이 보내는 거래 또는 사전 인가된 계정으로부터만 입금 허용",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-authorized-nft-minter",
      flag: 10,
      title: "asfAuthorizedNFTokenMinter",
      description:
        "대리 민팅 계정(NFTokenMinter) 지정 허용",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-disallow-incoming-nft-offer",
      flag: 12,
      title: "asfDisallowIncomingNFTokenOffer",
      description: "들어오는 NFT 오퍼 차단",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-disallow-incoming-check",
      flag: 13,
      title: "asfDisallowIncomingCheck",
      description: "들어오는 Check 차단",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-disallow-incoming-paychan",
      flag: 14,
      title: "asfDisallowIncomingPayChan",
      description: "들어오는 Payment Channel 차단",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-disallow-incoming-trustline",
      flag: 15,
      title: "asfDisallowIncomingTrustline",
      description: "들어오는 Trustline 생성 차단",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-allow-trustline-clawback",
      flag: 16,
      title: "asfAllowTrustLineClawback",
      description:
        "발행자가 Trustline에서 자산을 회수(Clawback)할 수 있도록 허용. 한번 설정하면 되돌릴 수 없음",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
    {
      id: "asf-allow-trustline-locking",
      flag: 17,
      title: "asfAllowTrustLineLocking",
      description:
        "Trust Line 토큰의 Escrow(잠금) 기능 허용, IOU TokenEscrow를 위한 Flag",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/accountset"
    },
  
    {
      id: "tf-fully-canonical-sig",
      flag: 2147483648,
      title: "tfFullyCanonicalSig",
      description:
        "모든 트랜잭션에 적용 가능한 전역 플래그. 완전 정규 서명을 요구합니다 (hex 0x80000000). RequireFullyCanonicalSig 개정 이후 기본 보호가 적용되지만, 병렬 네트워크/레거시 환경에서 명시적 사용을 권장",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/common-fields"
    },
  
    // ─────────────────────────────────────────────
    // Payment (type-based flags)
    // ─────────────────────────────────────────────
    {
      id: "tf-payment-no-direct-ripple",
      flag: 65536,
      title: "tfNoRippleDirect",
      description:
        "직접 경로(rippling)를 사용하지 않도록 요청 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/payment"
    },
    {
      id: "tf-payment-partial-payment",
      flag: 131072,
      title: "tfPartialPayment",
      description:
        "부분 결제를 허용 (hex 0x00020000). 수취인이 전체 금액 대신 일부 금액 수령 가능",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/payment"
    },
    {
      id: "tf-payment-limit-quality",
      flag: 262144,
      title: "tfLimitQuality",
      description:
        "지정한 한계를 초과하면 결제 거부 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/payment"
    },
  
    // ─────────────────────────────────────────────
    // OfferCreate (type-based flags)
    // ─────────────────────────────────────────────
    {
      id: "tf-offercreate-passive",
      flag: 65536,
      title: "tfPassive",
      description:
        "수동 오퍼. 즉시 체결을 시도하지 않고 호가만 게시 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/offercreate"
    },
    {
      id: "tf-offercreate-ioc",
      flag: 131072,
      title: "tfImmediateOrCancel",
      description:
        "즉시 체결되지 않는 잔여 수량은 즉시 취소 (IOC) (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/offercreate"
    },
    {
      id: "tf-offercreate-fok",
      flag: 262144,
      title: "tfFillOrKill",
      description:
        "전량이 즉시 체결되지 않으면 전체 취소 (FOK) (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/offercreate"
    },
    {
      id: "tf-offercreate-sell",
      flag: 524288,
      title: "tfSell",
      description:
        "지정 수량을 팔도록 해석 (sell side) (hex 0x00080000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/offercreate"
    },
    {
      id: "tf-hybrid",
      flag: 1048576,
      title: "tfHybrid",
      description:
        "Permissioned DEX와 오픈 DEX를 모두 사용하는 하이브리드 오퍼로 생성. 이 플래그 사용 시 DomainID 필드가 필수. (PermissionedDEX amendment 필요, 현재 메인넷 미활성 / hex 0x00100000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/offercreate"
    },
    // ─────────────────────────────────────────────
    // TrustSet (type-based flags)
    // ─────────────────────────────────────────────
    {
      id: "tf-trustset-set-auth",
      flag: 65536,
      title: "tfSetfAuth",
      description:
        "상대 Trustline에 Auth 비트 설정 (hex 0x00010000). 발행자가 승인 기반 자산을 운용할 때 사용",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
    {
      id: "tf-trustset-set-noripple",
      flag: 131072,
      title: "tfSetNoRipple",
      description:
        "해당 Trustline에서 rippling 비활성화 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
    {
      id: "tf-trustset-clear-noripple",
      flag: 262144,
      title: "tfClearNoRipple",
      description:
        "해당 Trustline에서 rippling 비활성화 해제 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
    {
      id: "tf-trustset-set-freeze",
      flag: 1048576,
      title: "tfSetFreeze",
      description:
        "해당 Trustline을 동결 (hex 0x00100000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
    {
      id: "tf-trustset-clear-freeze",
      flag: 2097152,
      title: "tfClearFreeze",
      description:
        "해당 Trustline 동결 해제 (hex 0x00200000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
    {
      id: "tf-trustset-set-deep-freeze",
      flag: 4194304,
      title: "tfSetDeepFreeze",
      description:
        "Deep Freeze 설정 (hex 0x00400000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
    {
      id: "tf-trustset-clear-deep-freeze",
      flag: 8388608,
      title: "tfClearDeepFreeze",
      description:
        "Deep Freeze 해제 (hex 0x00800000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/trustset"
    },
  
    // ─────────────────────────────────────────────
    // PaymentChannelClaim (type-based flags)
    // ─────────────────────────────────────────────
    {
      id: "tf-paychan-renew",
      flag: 65536,
      title: "tfRenew",
      description:
        "Payment Channel의 유효기간을 갱신 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/paymentchannelclaim"
    },
    {
      id: "tf-paychan-close",
      flag: 131072,
      title: "tfClose",
      description:
        "Payment Channel을 닫음 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/paymentchannelclaim"
    },
  
    // ─────────────────────────────────────────────
    // AMMDeposit / AMMWithdraw (type-based flags)
    // ─────────────────────────────────────────────
    // AMMDeposit
    {
      id: "tf-ammdeposit-lptoken",
      flag: 65536,
      title: "tfLPToken (AMMDeposit)",
      description: "LP 토큰 수량 기준으로 입금 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit"
    },
    {
      id: "tf-ammdeposit-single-asset",
      flag: 524288,
      title: "tfSingleAsset (AMMDeposit)",
      description: "단일 자산만 입금 (hex 0x00080000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit"
    },
    {
      id: "tf-ammdeposit-two-asset",
      flag: 1048576,
      title: "tfTwoAsset (AMMDeposit)",
      description: "양 자산을 비율에 맞춰 입금 (hex 0x00100000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit"
    },
    {
      id: "tf-ammdeposit-one-asset-lptoken",
      flag: 2097152,
      title: "tfOneAssetLPToken (AMMDeposit)",
      description: "단일 자산 + 목표 LP토큰 수량 조합 입금 (hex 0x00200000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit"
    },
    {
      id: "tf-ammdeposit-limit-lptoken",
      flag: 4194304,
      title: "tfLimitLPToken (AMMDeposit)",
      description: "LP 토큰 발행 상한 설정 (hex 0x00400000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit"
    },
    {
      id: "tf-ammdeposit-two-asset-if-empty",
      flag: 8388608,
      title: "tfTwoAssetIfEmpty (AMMDeposit)",
      description: "풀 초기화 시 두 자산 모두 필요 (hex 0x00800000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit"
    },
  
    // AMMWithdraw
    {
      id: "tf-ammwithdraw-lptoken",
      flag: 65536,
      title: "tfLPToken (AMMWithdraw)",
      description: "LP 토큰 수량 기준으로 출금 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-ammwithdraw-withdraw-all",
      flag: 131072,
      title: "tfWithdrawAll (AMMWithdraw)",
      description: "보유 지분 전체 출금 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-ammwithdraw-one-asset-withdraw-all",
      flag: 262144,
      title: "tfOneAssetWithdrawAll (AMMWithdraw)",
      description: "단일 자산으로 전량 출금 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-ammwithdraw-single-asset",
      flag: 524288,
      title: "tfSingleAsset (AMMWithdraw)",
      description: "단일 자산 출금 (hex 0x00080000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-ammwithdraw-two-asset",
      flag: 1048576,
      title: "tfTwoAsset (AMMWithdraw)",
      description: "양 자산 비율 출금 (hex 0x00100000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-ammwithdraw-one-asset-lptoken",
      flag: 2097152,
      title: "tfOneAssetLPToken (AMMWithdraw)",
      description: "단일 자산 + 목표 LP토큰 수량 조합 출금 (hex 0x00200000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-ammwithdraw-limit-lptoken",
      flag: 4194304,
      title: "tfLimitLPToken (AMMWithdraw)",
      description: "LP 토큰 소각/회수 상한 설정 (hex 0x00400000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw"
    },
    {
      id: "tf-claw-two-assets",
      flag: 1,
      title: "tfClawTwoAssets",
      description:
        "지정한 Asset 금액과, AMM 풀의 자산 비율에 따른 대응 Asset2 금액을 함께 회수(두 자산 모두 Account 필드의 발행자가 발행한 자산이어야 함). 이 플래그를 사용하지 않으면 지정한 Asset만 회수되고, 해당 비율의 Asset2는 Holder에게 반환됨 (hex 0x00000001)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/ammclawback"
    },
  
    // ─────────────────────────────────────────────
    // NFTokenMint / NFTokenCreateOffer (type-based flags)
    // ─────────────────────────────────────────────
    {
      id: "tf-nftmint-burnable",
      flag: 1,
      title: "tfBurnable",
      description: "보유자가 NFT 소각 가능",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint"
    },
    {
      id: "tf-nftmint-onlyxrp",
      flag: 2,
      title: "tfOnlyXRP",
      description: "NFT 전송/거래 시 XRP만 사용하도록 제한",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint"
    },
    {
      id: "tf-nftmint-trustline",
      flag: 4,
      title: "tfTrustLine",
      description: "NFT와 관련된 트러스트라인 요구",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint"
    },
    {
      id: "tf-nftmint-transferable",
      flag: 8,
      title: "tfTransferable",
      description: "NFT 소유권 이전 허용",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint"
    },
    {
      id: "tf-nftmint-mutable",
      flag: 16,
      title: "tfMutable",
      description: "NFT 발행 후 메타데이터 수정 허용",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint"
    },
    {
      id: "tf-nftcreateoffer-sell",
      flag: 1,
      title: "tfSellNFToken",
      description: "판매 오퍼로 해석(미설정 시 구매 오퍼)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/nftokencreateoffer"
    },
    // ─────────────────────────────────────────────
    // Transaction Flags (tf*) 
    // ─────────────────────────────────────────────
    // MPtokenIssuance/Authorize/Set tf
    {
      id: "tf-mpt-can-lock",
      flag: 2,
      title: "tfMPTCanLock",
      description:
        "개별 및 글로벌 잠금(LOCK) 허용 (hex 0x00000002)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate"
    },
    {
      id: "tf-mpt-require-auth",
      flag: 4,
      title: "tfMPTRequireAuth",
      description:
        "개별 보유자 승인(Authorization) 필요 (hex 0x00000004)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate"
    },
    {
      id: "tf-mpt-can-escrow",
      flag: 8,
      title: "tfMPTCanEscrow",
      description:
        "보유 잔액을 에스크로(escrow)로 예치 가능 (hex 0x00000008)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate"
    },
    {
      id: "tf-mpt-can-trade",
      flag: 16,
      title: "tfMPTCanTrade",
      description:
        "XRPL DEX에서 보유 잔액 거래 가능 (hex 0x00000010)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate"
    },
    {
      id: "tf-mpt-can-transfer",
      flag: 32,
      title: "tfMPTCanTransfer",
      description:
        "발행자가 아닌 다른 계정으로 토큰 전송 가능 (hex 0x00000020)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate"
    },
    {
      id: "tf-mpt-can-clawback",
      flag: 64,
      title: "tfMPTCanClawback",
      description:
        "발행자가 Clawback 트랜잭션으로 개별 보유자 잔액 회수 가능 (hex 0x00000040)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate"
    },
    {
      id: "tf-mpt-unauthorize",
      flag: 1,
      title: "tfMPTUnauthorize",
      description:
        "보유자: 잔액이 0이면 해당 MPT 보유 의사 철회 및 MPToken 엔트리 삭제(잔액>0이면 실패). 발행자: 지정 보유자의 보유 권한 취소(해당 MPT가 allow-listing을 사용하지 않으면 실패). (hex 0x00000001)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenauthorize"
    },
    {
      id: "tf-mpt-lock",
      flag: 1,
      title: "tfMPTLock",
      description:
        "해당 MPT 발행분의 잔액을 잠금(lock) 처리 (hex 0x00000001)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuanceset"
    },
    {
      id: "tf-mpt-unlock",
      flag: 2,
      title: "tfMPTUnlock",
      description:
        "해당 MPT 발행분의 잔액 잠금 해제(unlock) (hex 0x00000002)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuanceset"
    },
    // ─────────────────────────────────────────────
    // Transaction Flags (tf*) 
    // ─────────────────────────────────────────────
    // Batch tf
    {
      id: "tf-all-or-nothing",
      flag: 65536,
      title: "tfAllOrNothing",
      description:
        "모든 트랜잭션이 성공해야 하며 하나라도 실패하면 전체 배치가 실패 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/batch"
    },
    {
      id: "tf-only-one",
      flag: 131072,
      title: "tfOnlyOne",
      description:
        "가장 먼저 성공한 트랜잭션만 적용되고 이후 트랜잭션은 실패하거나 건너뜀 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/batch"
    },
    {
      id: "tf-until-failure",
      flag: 262144,
      title: "tfUntilFailure",
      description:
        "첫 실패가 발생할 때까지 순서대로 적용하며 이후 트랜잭션은 건너뜀 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/batch"
    },
    {
      id: "tf-independent",
      flag: 524288,
      title: "tfIndependent",
      description:
        "실패 여부와 무관하게 모든 트랜잭션을 적용 (hex 0x00080000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/batch"
    },
    {
      id: "tf-inner-batch-txn",
      flag: 1073741824,
      title: "tfInnerBatchTxn",
      description:
        "해당 트랜잭션이 Batch 트랜잭션 내부에 있음을 표시. Batch 기능 사용 시 모든 내부 트랜잭션에 이 플래그를 설정해야 함 (hex 0x40000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/transactions/types/batch"
    },
    // ─────────────────────────────────────────────
    // Ledger Flags (lsf*) — AccountRoot / Offer / RippleState
    // ─────────────────────────────────────────────
    // AccountRoot lsf
    {
      id: "lsf-allow-trustline-clawback",
      flag: 2147483648,
      title: "lsfAllowTrustLineClawback",
      description:
        "계정에 Clawback 기능이 활성화됨 (hex 0x80000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-allow-trustline-locking",
      flag: 1073741824,
      title: "lsfAllowTrustLineLocking",
      description:
        "Trust Line 토큰 에스크로(잠금) 기능 활성 (hex 0x40000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-default-ripple",
      flag: 8388608,
      title: "lsfDefaultRipple",
      description: "기본 rippling 허용 (hex 0x00800000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-deposit-auth",
      flag: 16777216,
      title: "lsfDepositAuth",
      description:
        "DepositAuth 활성 (hex 0x01000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-disable-master",
      flag: 1048576,
      title: "lsfDisableMaster",
      description: "마스터 키 비활성화 (hex 0x00100000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-disallow-incoming-check",
      flag: 134217728,
      title: "lsfDisallowIncomingCheck",
      description: "들어오는 Check 차단 (hex 0x08000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-disallow-incoming-nft-offer",
      flag: 67108864,
      title: "lsfDisallowIncomingNFTokenOffer",
      description: "들어오는 NFT 오퍼 차단 (hex 0x04000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-disallow-incoming-paychan",
      flag: 268435456,
      title: "lsfDisallowIncomingPayChan",
      description: "들어오는 Payment Channel 차단 (hex 0x10000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-disallow-incoming-trustline",
      flag: 536870912,
      title: "lsfDisallowIncomingTrustline",
      description: "들어오는 트러스트라인 차단 (hex 0x20000000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-disallow-xrp",
      flag: 524288,
      title: "lsfDisallowXRP",
      description:
        "클라이언트가 이 계정으로의 XRP 송금/표시를 피하도록 권고 (hex 0x00080000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-global-freeze",
      flag: 4194304,
      title: "lsfGlobalFreeze",
      description: "발행한 모든 자산 동결 (hex 0x00400000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-no-freeze",
      flag: 2097152,
      title: "lsfNoFreeze",
      description:
        "해당 계정은 신뢰선 동결을 사용할 수 없음(영구) (hex 0x00200000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-password-spent",
      flag: 65536,
      title: "lsfPasswordSpent",
      description:
        "무료 SetRegularKey 1회 사용 기록 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-require-auth",
      flag: 262144,
      title: "lsfRequireAuth",
      description:
        "발행 토큰 보유에 개별 승인 필요 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
    {
      id: "lsf-require-desttag",
      flag: 131072,
      title: "lsfRequireDestTag",
      description:
        "입금 시 Destination Tag 필수 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/accountroot"
    },
  
    // Offer (ledger) lsf
    {
      id: "lsf-offer-passive",
      flag: 65536,
      title: "lsfPassive",
      description: "수동 오퍼 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/offer"
    },
    {
      id: "lsf-offer-sell",
      flag: 131072,
      title: "lsfSell",
      description: "판매 오퍼 표시 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/offer"
    },
    {
      id: "lsf-offer-hybrid",
      flag: 262144,
      title: "lsfHybrid",
      description: "하이브리드 오퍼 표시 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/offer"
    },
  
    // RippleState (ledger) lsf
    {
      id: "lsf-ripplestate-low-reserve",
      flag: 65536,
      title: "lsfLowReserve",
      description: "low 쪽(소유자)이 리저브 필요 상태 (hex 0x00010000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-high-reserve",
      flag: 131072,
      title: "lsfHighReserve",
      description: "high 쪽이 리저브 필요 상태 (hex 0x00020000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-low-auth",
      flag: 262144,
      title: "lsfLowAuth",
      description: "low 쪽 Auth 설정 (hex 0x00040000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-high-auth",
      flag: 524288,
      title: "lsfHighAuth",
      description: "high 쪽 Auth 설정 (hex 0x00080000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-low-noripple",
      flag: 1048576,
      title: "lsfLowNoRipple",
      description: "low 쪽 NoRipple (hex 0x00100000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-high-noripple",
      flag: 2097152,
      title: "lsfHighNoRipple",
      description: "high 쪽 NoRipple (hex 0x00200000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-low-freeze",
      flag: 4194304,
      title: "lsfLowFreeze",
      description: "low 쪽 신뢰선 동결 (hex 0x00400000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-high-freeze",
      flag: 8388608,
      title: "lsfHighFreeze",
      description: "high 쪽 신뢰선 동결 (hex 0x00800000)",
      detailUrl:
        "https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/ripplestate"
    },
    {
      id: "lsf-ripplestate-low-deep-freeze",
      flag: 33554432,
      title: "lsfLowDeepFreeze",
      description: "low 쪽 Deep Freeze (hex 0x02000000)",
      detailUrl:
        "https://js.xrpl.org/enums/LedgerEntry.RippleStateFlags.html"
    },
    {
      id: "lsf-ripplestate-high-deep-freeze",
      flag: 67108864,
      title: "lsfHighDeepFreeze",
      description: "high 쪽 Deep Freeze (hex 0x04000000)",
      detailUrl:
        "https://js.xrpl.org/enums/LedgerEntry.RippleStateFlags.html"
    },
    {
      id: "lsf-ripplestate-amm-node",
      flag: 16777216,
      title: "lsfAMMNode",
      description: "해당 신뢰선이 AMM 노드와 연관됨 (hex 0x01000000)",
      detailUrl:
        "https://js.xrpl.org/enums/LedgerEntry.RippleStateFlags.html"
    }
  ];


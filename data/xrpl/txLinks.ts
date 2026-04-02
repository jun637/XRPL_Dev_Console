export type TxLink = {
  title: string;
  jsref?: string;
  pyref?: string;
  docref?: string;
};

export const TX_LINKS: TxLink[] = [
  {
    title: "Payment (XRP)",
    jsref: "https://js.xrpl.org/interfaces/Payment.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Payment",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/payment",
  },
  {
    title: "Payment (IOU)",
    jsref: "https://js.xrpl.org/interfaces/Payment.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Payment",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/payment",
  },
  {
    title: "Payment (MPT)",
    jsref: "https://js.xrpl.org/interfaces/Payment.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Payment",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/payment",
  },
  {
    title: "Payment (AMM Swap)",
    jsref: "https://js.xrpl.org/interfaces/Payment.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Payment",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/payment",
  },
  {
    title: "AccountSet",
    jsref: "https://js.xrpl.org/interfaces/AccountSet.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AccountSet",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/accountset",
  },
  {
    title: "AccountDelete",
    jsref: "https://js.xrpl.org/interfaces/AccountDelete.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AccountDelete",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/accountdelete",
  },
  {
    title: "TrustSet",
    jsref: "https://js.xrpl.org/interfaces/TrustSet.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.TrustSet",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/trustset",
  },
  {
    title: "OfferCreate (Permissioned)",
    jsref: "https://js.xrpl.org/interfaces/OfferCreate.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OfferCreate",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/offercreate",
  },
  {
    title: "OfferCreate (General)",
    jsref: "https://js.xrpl.org/interfaces/OfferCreate.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OfferCreate",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/offercreate",
  },
  {
    title: "OfferCancel",
    jsref: "https://js.xrpl.org/interfaces/OfferCancel.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OfferCancel",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/offercancel",
  },
  {
    title: "EscrowCreate (XRP)",
    jsref: "https://js.xrpl.org/interfaces/EscrowCreate.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowCreate",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/escrowcreate",
  },
  {
    title: "EscrowCreate (IOU)",
    jsref: "https://js.xrpl.org/interfaces/EscrowCreate.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowCreate",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/escrowcreate",
  },
  {
    title: "EscrowCreate (MPT)",
    jsref: "https://js.xrpl.org/interfaces/EscrowCreate.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowCreate",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/escrowcreate",
  },
  {
    title: "EscrowFinish",
    jsref: "https://js.xrpl.org/interfaces/EscrowFinish.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowFinish",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/escrowfinish",
  },
  {
    title: "EscrowCancel",
    jsref: "https://js.xrpl.org/interfaces/EscrowCancel.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.EscrowCancel",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/escrowcancel",
  },
  {
    title: "Batch",
    jsref: "https://js.xrpl.org/interfaces/Batch.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Batch",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/batch",
  },
  {
    title: "AMMCreate",
    jsref: "https://js.xrpl.org/interfaces/AMMCreate.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMCreate",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammcreate",
  },
  {
    title: "AMMDeposit",
    jsref: "https://js.xrpl.org/interfaces/AMMDeposit.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMDeposit",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammdeposit",
  },
  {
    title: "AMMWithdraw",
    jsref: "https://js.xrpl.org/interfaces/AMMWithdraw.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMWithdraw",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammwithdraw",
  },
  {
    title: "AMMDelete",
    jsref: "https://js.xrpl.org/interfaces/AMMDelete.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMDelete",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammdelete",
  },
  {
    title: "AMMBid",
    jsref: "https://js.xrpl.org/interfaces/AMMBid.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMBid",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammbid",
  },
  {
    title: "AMMVote",
    jsref: "https://js.xrpl.org/interfaces/AMMVote.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMVote",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammvote",
  },
  {
    title: "AMMClawback",
    jsref: "https://js.xrpl.org/interfaces/AMMClawback.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.AMMClawback",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/ammclawback",
  },
  {
    title: "CredentialCreate",
    jsref: "https://js.xrpl.org/interfaces/CredentialCreate.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CredentialCreate",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/credentialcreate",
  },
  {
    title: "CredentialAccept",
    jsref: "https://js.xrpl.org/interfaces/CredentialAccept.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CredentialAccept",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/credentialaccept",
  },
  {
    title: "CredentialDelete",
    jsref: "https://js.xrpl.org/interfaces/CredentialDelete.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CredentialDelete",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/credentialdelete",
  },
  {
    title: "CheckCancel",
    jsref: "https://js.xrpl.org/interfaces/CheckCancel.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CheckCancel",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/checkcancel",
  },
  {
    title: "CheckCash",
    jsref: "https://js.xrpl.org/interfaces/CheckCash.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CheckCash",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/checkcash",
  },
  {
    title: "CheckCreate",
    jsref: "https://js.xrpl.org/interfaces/CheckCreate.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.CheckCreate",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/checkcreate",
  },
  {
    title: "Clawback",
    jsref: "https://js.xrpl.org/interfaces/Clawback.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.Clawback",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/clawback",
  },
  {
    title: "DepositPreauth",
    jsref: "https://js.xrpl.org/interfaces/DepositPreauth.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.DepositPreauth",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/depositpreauth",
  },
  {
    title: "DIDDelete",
    jsref: "https://js.xrpl.org/interfaces/DIDDelete.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.DIDDelete",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/diddelete",
  },
  {
    title: "DIDSet",
    jsref: "https://js.xrpl.org/interfaces/DIDSet.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.DIDSet",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/didset",
  },
  {
    title: "MPTokenIssuanceCreate",
    jsref: "https://js.xrpl.org/interfaces/MPTokenIssuanceCreate.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.MPTokenIssuanceCreate",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate",
  },
  {
    title: "MPTokenIssuanceDestroy",
    jsref: "https://js.xrpl.org/interfaces/MPTokenIssuanceDestroy.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.MPTokenIssuanceDestroy",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancedestroy",
  },
  {
    title: "MPTokenIssuanceSet",
    jsref: "https://js.xrpl.org/interfaces/MPTokenIssuanceSet.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.MPTokenIssuanceSet",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuanceset",
  },
  {
    title: "MPTokenAuthorize",
    jsref: "https://js.xrpl.org/interfaces/MPTokenAuthorize.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.MPTokenAuthorize",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/mptokenauthorize",
  },
  {
    title: "PermissionedDomainSet",
    jsref: "https://js.xrpl.org/interfaces/PermissionedDomainSet.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PermissionedDomainSet",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/permissioneddomainset",
  },
  {
    title: "PermissionedDomainDelete",
    jsref: "https://js.xrpl.org/interfaces/PermissionedDomainDelete.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PermissionedDomainDelete",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/permissioneddomaindelete",
  },
  {
    title: "NFTokenAcceptOffer",
    jsref: "https://js.xrpl.org/interfaces/NFTokenAcceptOffer.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenAcceptOffer",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokenacceptoffer",
  },
  {
    title: "NFTokenBurn",
    jsref: "https://js.xrpl.org/interfaces/NFTokenBurn.html",
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenBurn",
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokenburn",
  },
  { 
    title: "NFTokenAcceptOffer", 
    jsref: "https://js.xrpl.org/interfaces/NFTokenAcceptOffer.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenAcceptOffer", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokenacceptoffer" },
  { 
    title: "NFTokenBurn", 
    jsref: "https://js.xrpl.org/interfaces/NFTokenBurn.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenBurn", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokenburn" },
  { 
    title: "NFTokenCancelOffer", 
    jsref: "https://js.xrpl.org/interfaces/NFTokenCancelOffer.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenCancelOffer", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokencanceloffer" },
  { 
    title: "NFTokenCreateOffer", 
    jsref: "https://js.xrpl.org/interfaces/NFTokenCreateOffer.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenCreateOffer", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokencreateoffer" },
  { 
    title: "NFTokenMint", 
    jsref: "https://js.xrpl.org/interfaces/NFTokenMint.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenMint", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmint" },
  { 
    title: "NFTokenModify", 
    jsref: "https://js.xrpl.org/interfaces/NFTokenModify.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.NFTokenModify", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/nftokenmodify" },
  { 
    title: "OracleDelete", 
    jsref: "https://js.xrpl.org/interfaces/OracleDelete.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OracleDelete", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/oracledelete" },
  { 
    title: "OracleSet", 
    jsref: "https://js.xrpl.org/interfaces/OracleSet.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.OracleSet", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/oracleset" },
  { 
    title: "SetRegularKey", 
    jsref: "https://js.xrpl.org/interfaces/SetRegularKey.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.SetRegularKey", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/setregularkey" },
  { 
    title: "SignerListSet", 
    jsref: "https://js.xrpl.org/interfaces/SignerListSet.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.SignerListSet", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/signerlistset" },
  { 
    title: "TicketCreate", 
    jsref: "https://js.xrpl.org/interfaces/TicketCreate.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.TicketCreate", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/ticketcreate" },
  { 
    title: "PaymentChannelClaim", 
    jsref: "https://js.xrpl.org/interfaces/PaymentChannelClaim.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PaymentChannelClaim", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/paymentchannelclaim" },
  { 
    title: "PaymentChannelCreate", 
    jsref: "https://js.xrpl.org/interfaces/PaymentChannelCreate.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PaymentChannelCreate", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/paymentchannelcreate" },
  { 
    title: "PaymentChannelFund", 
    jsref: "https://js.xrpl.org/interfaces/PaymentChannelFund.html", 
    pyref: "https://xrpl-py.readthedocs.io/en/stable/source/xrpl.models.transactions.html#xrpl.models.transactions.PaymentChannelFund", 
    docref: "https://xrpl.org/docs/references/protocol/transactions/types/paymentchannelfund" }
];
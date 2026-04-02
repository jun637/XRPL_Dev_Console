export type DevLinkIcon = "doc" | "js" | "py" | "globe" | "x" | "telegram" | "discord";

export type DevLink = {
  id: string;
  title: string;
  desc: string;
  href: string;
  icon: DevLinkIcon;
};

export const COMMUNITY_LINKS: DevLink[] = [
  { id: "xrpl-korea", title: "XRPL Korea", desc: "XRPL Korea 공식 웹사이트", href: "https://www.xrplkorea.org/", icon: "globe" },
  { id: "xrpl-korea-x", title: "XRPL Korea X", desc: "XRPL Korea 공식 X 계정", href: "https://x.com/xrplkorea", icon: "x" },
  { id: "xrpl-korea-telegram", title: "XRPL Korea Telegram", desc: "XRPL Korea 공식 텔레그램 커뮤니티", href: "https://t.me/XRPLKorea", icon: "telegram" },
  { id: "xrpl-discord-kr", title: "XRP Ledger Discord KR 채널", desc: "XRP Ledger 공식 디스코드 한국어 채널", href: "https://discord.com/channels/886050993802985492/1130924837662109716", icon: "discord" },
];

export const DEV_LINKS: DevLink[] = [
  { id: "xrpl-docs", title: "XRPL Docs", desc: "XRPL 공식 문서 개요와 프로토콜 레퍼런스", href: "https://xrpl.org/docs", icon: "doc" },
  { id: "xrpl-dev-portal", title: "xrpl-dev-portal", desc: "XRPL 예제 코드와 가이드 모음", href: "https://github.com/XRPLF/xrpl-dev-portal", icon: "doc" },
  { id: "xrpl-js", title: "xrpl.js", desc: "XRPL Javascript SDK 레퍼런스", href: "https://js.xrpl.org", icon: "js" },
  { id: "xrpl-py", title: "xrpl-py", desc: "XRPL Python SDK 레퍼런스", href: "https://xrpl-py.readthedocs.io/en/stable", icon: "py" },
  { id: "explorer-mainnet", title: "XRPL Explorer", desc: "XRPL 메인넷 트랜잭션 익스플로러", href: "https://livenet.xrpl.org", icon: "globe" },
  { id: "xrpscan", title: "XRPScan", desc: "XRPL 전체 익스플로러", href: "https://xrpscan.com", icon: "globe" },
];

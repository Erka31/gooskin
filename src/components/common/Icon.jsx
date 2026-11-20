// Нэг өнгийн stroke icon-ууд (24×24). Өнгө нь currentColor-оос авна.
const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7.5" />
      <path d="m20.5 20.5-4.2-4.2" />
    </>
  ),
  bag: (
    <>
      <path d="M5 7h14l-1.2 12.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-.5A6.5 6.5 0 0 1 10.5 14h3a6.5 6.5 0 0 1 6.5 6.5v.5" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 5h11v11h-11z" />
      <path d="M13.5 9h4.2l3.3 3.5V16h-7.5" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 21.5s8-3.8 8-10V5.2L12 2.5 4 5.2v6.3c0 6.2 8 10 8 10Z" />
      <path d="m8.8 12 2.2 2.2 4.3-4.4" />
    </>
  ),
  sparkle: (
    <path d="M12 2.5l2 6.2 6.5 1.3-6.5 1.3-2 6.2-2-6.2-6.5-1.3 6.5-1.3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
  ),
  refresh: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5" />
      <path d="M3.5 3.5v5h5" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3zM20.5 14v.5M14 20.5h.5M17.5 20.5H21V17" />
    </>
  ),
  bank: (
    <>
      <path d="M3 21h18M5 18V10M9.5 18V10M14.5 18V10M19 18V10" />
      <path d="M12 3 2.5 8h19z" />
    </>
  ),
  cash: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
  check: <path d="M20 6.5 9 17.5l-5-5" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M5 15V5.5A2.5 2.5 0 0 1 7.5 3H15" />
    </>
  ),
  x: <path d="M18 6 6 18M6 6l12 12" />,
  arrowLeft: <path d="M19 12H5M11 18l-6-6 6-6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: (
    <path d="M3.5 6h17M9 6V4h6v2M6 6l1 14h10l1-14M10 10.5v6M14 10.5v6" />
  ),
  phone: (
    <path d="M21.5 16.6v2.9a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6 19.6 19.6 0 0 1-3-8.6A2 2 0 0 1 3.8 1.7h2.9a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.7 9.5a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1Z" />
  ),
  mail: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m21.5 7.5-9.5 6-9.5-6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.5s7-6 7-11.5a7 7 0 1 0-14 0c0 5.5 7 11.5 7 11.5Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  package: (
    <>
      <path d="M21 7.5 12 2.5 3 7.5v9l9 5 9-5z" />
      <path d="m3 7.5 9 5 9-5M12 12.5v9" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3H9" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  heart: (
    <path d="M12 20.5s-8.5-5-8.5-11A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.5 3.1c0 6-8.5 11-8.5 11Z" />
  ),
};

export default function Icon({ name, size = 20, className = "", stroke = 1.8 }) {
  return (
    <svg
      className={"icon " + className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

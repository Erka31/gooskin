import { linkClick } from "../../lib/router";

// Сайт доторх холбоос: хуудсыг дахин ачаалалгүй шилжинэ
export default function Link({ to, scroll, children, ...rest }) {
  return (
    <a href={to} onClick={(e) => linkClick(e, to, { scroll })} {...rest}>
      {children}
    </a>
  );
}

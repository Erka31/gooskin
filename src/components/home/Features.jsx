import Icon from "../common/Icon";
import { money } from "../../lib/api";

// Дэлгүүрийн давуу талууд
export default function Features({ freeFrom }) {
  const items = [
    ["truck", "Үнэгүй хүргэлт", `${money(freeFrom)}-с дээш захиалгад`],
    ["shield", "100% оригинал", "Албан ёсны нийлүүлэгчээс"],
    ["lock", "Аюулгүй төлбөр", "QPay, данс, бэлэн, карт"],
    ["refresh", "7 хоногт буцаалт", "Нээгээгүй барааг буцаана"],
  ];
  return (
    <section className="features">
      {items.map(([icon, title, text]) => (
        <div className="feature" key={title}>
          <span className="f-icon">
            <Icon name={icon} size={22} />
          </span>
          <div>
            <b>{title}</b>
            <small>{text}</small>
          </div>
        </div>
      ))}
    </section>
  );
}

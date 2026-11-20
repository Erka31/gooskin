import Icon from "../common/Icon";
import { money } from "../../lib/api";

// Үнийн задаргаа + үнэгүй хүргэлт хүртэлх progress bar
export default function CartSummary({ totals, config, compact }) {
  const { subtotal, delivery, total } = totals;
  const left = Math.max(0, config.freeDeliveryFrom - subtotal);
  const pct = Math.min(100, (subtotal / config.freeDeliveryFrom) * 100);

  return (
    <div className={"summary" + (compact ? " compact" : "")}>
      <div className="free-ship">
        <p>
          <Icon name="truck" size={16} />
          {left > 0 ? (
            <>
              Дахиад <b>{money(left)}</b>-ийн бараа нэмбэл хүргэлт үнэгүй
            </>
          ) : (
            <b>Танд хүргэлт үнэгүй! 🎉</b>
          )}
        </p>
        <div className="bar">
          <span style={{ width: pct + "%" }} />
        </div>
      </div>
      <div className="sum-line">
        <span>Барааны дүн</span>
        <span>{money(subtotal)}</span>
      </div>
      <div className="sum-line">
        <span>Хүргэлт</span>
        <span className={delivery === 0 ? "free" : ""}>
          {delivery === 0 ? "Үнэгүй" : money(delivery)}
        </span>
      </div>
      <div className="sum-total">
        <span>Нийт төлөх</span>
        <b>{money(total)}</b>
      </div>
    </div>
  );
}

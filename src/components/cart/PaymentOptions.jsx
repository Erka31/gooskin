import Icon from "../common/Icon";
import { PAYMENT_META } from "../../constants";

// Төлбөрийн хэлбэр сонгох картууд
export default function PaymentOptions({ options, value, onChange }) {
  return (
    <div className="pay-options" role="radiogroup" aria-label="Төлбөрийн хэлбэр">
      {options.map((key) => {
        const m = PAYMENT_META[key] || { icon: "cash", title: key, desc: "" };
        const on = value === key;
        return (
          <label key={key} className={"pay-opt" + (on ? " on" : "")}>
            <input
              type="radio"
              name="payment"
              checked={on}
              onChange={() => onChange(key)}
            />
            <span className="po-icon">
              <Icon name={m.icon} size={22} />
            </span>
            <span className="po-text">
              <b>
                {m.title}
                {m.tag && <em>{m.tag}</em>}
              </b>
              <small>{m.desc}</small>
            </span>
            <span className="po-radio" />
          </label>
        );
      })}
    </div>
  );
}

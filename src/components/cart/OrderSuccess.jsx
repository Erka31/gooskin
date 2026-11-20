import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import { api, money } from "../../lib/api";
import { SHOP_INFO, PAYMENT_META } from "../../constants";

// Утгыг хуулах товчтой мөр
function CopyRow({ label, value, display }) {
  const [copied, setCopied] = useState(false);
  const copy = () =>
    navigator.clipboard
      ?.writeText(String(value))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  return (
    <div className="copy-row">
      <span>{label}</span>
      <b>{display ?? value}</b>
      <button type="button" onClick={copy} aria-label={label + " хуулах"}>
        <Icon name={copied ? "check" : "copy"} size={16} />
        {copied ? "Хуулсан" : "Хуулах"}
      </button>
    </div>
  );
}

// Төлбөрийн хэлбэр бүрийн дараагийн алхмууд
function PaymentInstructions({ order }) {
  const ref = "#" + order.id;
  const amount = money(order.total);

  if (order.payment === "Дансаар шилжүүлэх") {
    return (
      <div className="pay-box">
        <h4>
          <Icon name="bank" size={18} /> Дансны мэдээлэл
        </h4>
        <CopyRow label="Банк" value={SHOP_INFO.bank.name} />
        <CopyRow
          label="Данс"
          value={SHOP_INFO.bank.account.replace(/\s/g, "")}
          display={SHOP_INFO.bank.account}
        />
        <CopyRow label="Хүлээн авагч" value={SHOP_INFO.bank.holder} />
        <CopyRow label="Дүн" value={order.total} display={amount} />
        <CopyRow label="Гүйлгээний утга" value={ref} />
        <p className="pay-warn">
          Гүйлгээний утгад <b>{ref}</b> гэж заавал бичнэ үү. Төлбөр орсны дараа
          захиалгыг баталгаажуулж хүргэлтэд гаргана.
        </p>
      </div>
    );
  }

  if (order.payment === "QPay" && order.qpay) {
    return <QpayBox order={order} />;
  }

  if (order.payment === "QPay") {
    // QPay API тохируулаагүй үед: ажилтан гараар нэхэмжлэх илгээнэ
    return (
      <div className="pay-box">
        <h4>
          <Icon name="qr" size={18} /> QPay-ээр төлөх
        </h4>
        <ol className="pay-steps">
          <li>
            Манай ажилтан <b>{order.phone}</b> дугаарт QPay нэхэмжлэх илгээнэ
            (ажлын цагаар 30 минутын дотор).
          </li>
          <li>Нэхэмжлэхийг нээж өөрийн банкны апп-аар төлнө.</li>
          <li>
            <b>{amount}</b> төлсний дараа захиалга баталгаажна.
          </li>
        </ol>
        <p className="pay-warn">
          Яаралтай бол <a href={"tel:" + SHOP_INFO.phone}>{SHOP_INFO.phone}</a>{" "}
          руу залгаарай.
        </p>
      </div>
    );
  }

  return (
    <div className="pay-box">
      <h4>
        <Icon name={PAYMENT_META[order.payment]?.icon || "cash"} size={18} />{" "}
        Хүргэлтээр төлөх
      </h4>
      <p>
        Барааг хүлээн авахдаа <b>{amount}</b>-ийг{" "}
        {order.payment?.startsWith("Карт") ? "картаар" : "бэлнээр"} төлнө.
        Хүргэлтийн өмнө бид <b>{order.phone}</b> дугаар руу залгаж
        баталгаажуулна.
      </p>
    </div>
  );
}

// QPay QR + банкны апп-ын холбоос + төлбөрийг 5 секунд тутам шалгах
function QpayBox({ order }) {
  const [paid, setPaid] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const check = async () => {
    setChecking(true);
    setError("");
    try {
      const r = await api(`/orders/${order.id}/check-payment`, {
        method: "POST",
        body: { key: order.key },
      });
      if (r.paid) setPaid(true);
      else setError("Төлбөр хараахан орж ирээгүй байна");
    } catch (e) {
      setError(e.message);
    } finally {
      setChecking(false);
    }
  };

  // 10 минутын турш 5 секунд тутам автоматаар шалгана
  useEffect(() => {
    if (paid) return;
    let n = 0;
    const t = setInterval(async () => {
      if (++n > 120) return clearInterval(t);
      try {
        const r = await api(`/orders/${order.id}/check-payment`, {
          method: "POST",
          body: { key: order.key },
        });
        if (r.paid) {
          setPaid(true);
          clearInterval(t);
        }
      } catch {
        /* дараагийн удаа дахин оролдоно */
      }
    }, 5000);
    return () => clearInterval(t);
  }, [order.id, order.key, paid]);

  if (paid) {
    return (
      <div className="pay-box paid-box">
        <h4>
          <Icon name="check" size={18} /> Төлбөр амжилттай орлоо
        </h4>
        <p>Таны захиалга баталгаажлаа. Удахгүй хүргэлтэд гаргана.</p>
      </div>
    );
  }

  const q = order.qpay;
  return (
    <div className="pay-box">
      <h4>
        <Icon name="qr" size={18} /> QPay-ээр төлөх · {money(order.total)}
      </h4>
      {q.qr_image && (
        <img
          className="qpay-qr"
          src={"data:image/png;base64," + q.qr_image}
          alt="QPay QR код"
        />
      )}
      <p className="hint center">
        Банкны апп-аараа QR уншуулна уу. Утсаар орсон бол доорх банкаа сонгоно.
      </p>
      {q.urls?.length > 0 && (
        <div className="bank-apps">
          {q.urls.map((u) => (
            <a key={u.name + u.link} href={u.link} title={u.description}>
              {u.logo && <img src={u.logo} alt="" loading="lazy" />}
              <span>{u.description || u.name}</span>
            </a>
          ))}
        </div>
      )}
      <button
        type="button"
        className="btn-ghost block"
        onClick={check}
        disabled={checking}
      >
        {checking ? "Шалгаж байна..." : "Төлбөр шалгах"}
      </button>
      {error && <p className="hint center">{error}</p>}
    </div>
  );
}

export default function OrderSuccess({ order, onClose }) {
  return (
    <div className="drawer-body">
      <div className="co-scroll done">
        <div className="done-badge">
          <Icon name="check" size={34} stroke={2.6} />
        </div>
        <h3>Захиалга амжилттай!</h3>
        <p className="done-sub">
          Захиалгын дугаар <b>#{order.id}</b> · Нийт <b>{money(order.total)}</b>
        </p>
        <PaymentInstructions order={order} />
        <ul className="timeline">
          <li className="on">
            <span /> Захиалга хүлээн авлаа
          </li>
          <li>
            <span /> Төлбөр, захиалга баталгаажна
          </li>
          <li>
            <span /> Хүргэлтэд гарна (24–48 цаг)
          </li>
        </ul>
      </div>
      <div className="drawer-foot">
        <button className="primary block" onClick={onClose}>
          Дэлгүүр үргэлжлүүлэх
        </button>
      </div>
    </div>
  );
}

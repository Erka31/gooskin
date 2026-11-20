import { useState, useEffect } from "react";
import CartSummary from "./CartSummary";
import PaymentOptions from "./PaymentOptions";
import Icon from "../common/Icon";
import ProductImage from "../common/ProductImage";
import { api, money } from "../../lib/api";
import { DISTRICTS, PAYMENT_META } from "../../constants";

// Төлбөрийн алхам: хүргэлтийн мэдээлэл → төлбөрийн хэлбэр → баталгаажуулах
export default function Checkout({
  items,
  totals,
  config,
  user,
  onLogin,
  onDone,
  onOrdered,
}) {
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    district: DISTRICTS[0],
    address: "",
    note: "",
    payment: config.payments[0],
  });
  const [agree, setAgree] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Нэвтэрсний дараа нэр, утсыг бөглөх
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: f.name || user.name,
      phone: f.phone || user.phone || "",
    }));
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    if (!agree) {
      setError("Үйлчилгээний нөхцөлийг зөвшөөрнө үү");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await api("/orders", {
        method: "POST",
        body: {
          name: form.name,
          phone: form.phone,
          address: `${form.district}, ${form.address}`,
          note: form.note,
          payment: form.payment,
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
        },
      });
      onOrdered();
      onDone({ ...res, phone: form.phone, name: form.name });
    } catch (err) {
      setError(err.message);
      onOrdered(); // нөөц өөрчлөгдсөн байж болзошгүй
    } finally {
      setSending(false);
    }
  };

  const prepaid = PAYMENT_META[form.payment]?.prepaid;

  return (
    <form className="drawer-body checkout" onSubmit={submit}>
      <div className="co-scroll">
        {!user && (
          <div className="co-login">
            <Icon name="user" size={18} />
            <span>
              Бүртгэлтэй юу?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onLogin();
                }}
              >
                Нэвтрэх
              </a>{" "}
              — захиалгаа хянах боломжтой.
            </span>
          </div>
        )}

        <fieldset className="co-section">
          <legend>
            <span className="num">1</span> Хүргэлтийн мэдээлэл
          </legend>
          <div className="field-row">
            <label className="field">
              <span>Нэр</span>
              <input
                required
                autoComplete="name"
                value={form.name}
                onChange={set("name")}
                placeholder="Таны нэр"
              />
            </label>
            <label className="field">
              <span>Утас</span>
              <input
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="8888 8888"
              />
            </label>
          </div>
          <label className="field">
            <span>Дүүрэг</span>
            <select value={form.district} onChange={set("district")}>
              {DISTRICTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Дэлгэрэнгүй хаяг</span>
            <input
              required
              autoComplete="street-address"
              value={form.address}
              onChange={set("address")}
              placeholder="Хороо, байр, орц, давхар, тоот"
            />
          </label>
          <label className="field">
            <span>Тэмдэглэл (заавал биш)</span>
            <textarea
              rows={2}
              value={form.note}
              onChange={set("note")}
              placeholder="Жишээ нь: орцны код, хүргэх цаг"
            />
          </label>
        </fieldset>

        <fieldset className="co-section">
          <legend>
            <span className="num">2</span> Төлбөрийн хэлбэр
          </legend>
          <PaymentOptions
            options={config.payments}
            value={form.payment}
            onChange={(payment) => setForm({ ...form, payment })}
          />
          <p className="co-note">
            <Icon name={prepaid ? "lock" : "truck"} size={15} />
            {prepaid
              ? "Захиалга өгсний дараа төлбөрийн заавар гарч ирнэ. Төлбөр баталгаажмагц хүргэлтэд гаргана."
              : "Төлбөрөө барааг хүлээн авахдаа төлнө. Урьдчилгаа шаардлагагүй."}
          </p>
        </fieldset>

        <fieldset className="co-section">
          <legend>
            <span className="num">3</span> Захиалгын дүн
          </legend>
          <ul className="co-items">
            {items.map((i) => (
              <li key={i.id}>
                <span className="ci-emoji">
                  <ProductImage p={i} />
                </span>
                <span className="ci-name">
                  {i.name}
                  <small>× {i.qty}</small>
                </span>
                <b>{money(i.price * i.qty)}</b>
              </li>
            ))}
          </ul>
          <CartSummary totals={totals} config={config} compact />
        </fieldset>
      </div>

      <div className="drawer-foot">
        <label className="agree">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>
            <a href="/p/terms" target="_blank" rel="noreferrer">
              Үйлчилгээний нөхцөл
            </a>
            -ийг зөвшөөрч байна
          </span>
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary block" type="submit" disabled={sending}>
          {sending ? (
            "Илгээж байна..."
          ) : (
            <>
              <Icon name="lock" size={17} />
              {prepaid ? "Захиалаад төлөх" : "Захиалга баталгаажуулах"} ·{" "}
              {money(totals.total)}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

import ContactForm from "./ContactForm";
import Link from "../components/common/Link";
import Icon from "../components/common/Icon";
import { PAGES } from "./content";
import { SHOP_INFO } from "../constants";

export default function InfoPage({ slug }) {
  const page = PAGES[slug];
  return (
    <main className="page">
      <div className="page-hero">
        <nav className="crumbs">
          <Link to="/">Нүүр</Link> <span>/</span> {page.title}
        </nav>
        <h1>{page.title}</h1>
      </div>
      <div className="page-body">
        {page.body && <div className="prose">{page.body}</div>}
        {page.faq && (
          <div className="faq">
            {page.faq.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        )}
        {page.contact && (
          <div className="contact-grid">
            <div className="contact-cards">
              <a href={"tel:" + SHOP_INFO.phone}>
                <Icon name="phone" size={20} />
                <span>
                  <small>Утас · {SHOP_INFO.hours}</small>
                  <b>{SHOP_INFO.phone}</b>
                </span>
              </a>
              <a href={"mailto:" + SHOP_INFO.email}>
                <Icon name="mail" size={20} />
                <span>
                  <small>И-мэйл</small>
                  <b>{SHOP_INFO.email}</b>
                </span>
              </a>
              <div>
                <Icon name="truck" size={20} />
                <span>
                  <small>Онлайн дэлгүүр</small>
                  <b>Биет дэлгүүргүй · зөвхөн хүргэлтээр</b>
                </span>
              </div>
              <p className="hint">Ихэвчлэн 1 ажлын өдрийн дотор хариулна.</p>
            </div>
            <ContactForm />
          </div>
        )}
        <p className="back">
          <Link to="/#products">
            <Icon name="arrowLeft" size={16} /> Дэлгүүр рүү буцах
          </Link>
        </p>
      </div>
    </main>
  );
}

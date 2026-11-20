import useEsc from "../../hooks/useEsc";
import Icon from "./Icon";

export default function Modal({ onClose, wide, children }) {
  useEsc(onClose);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div
        className={"modal" + (wide ? " wide" : "")}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close modal-close"
          onClick={onClose}
          aria-label="Хаах"
        >
          <Icon name="x" size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

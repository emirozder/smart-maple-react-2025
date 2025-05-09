import React, { type ReactNode } from "react";
import "../../styles/Modal.scss";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  customTitle?: ReactNode;
  children: ReactNode;
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  customTitle,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {customTitle ?? (title && <h2 className="modal-title">{title}</h2>)}
        <div className="modal-body">{children}</div>
        <button className="modal-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;

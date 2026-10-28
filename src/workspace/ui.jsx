import { useEffect, useId, useRef, useState } from "react";

import { displayName } from "./utils";

export function Avatar({ user }) {
  const [failedUrl, setFailedUrl] = useState(null);
  return user?.avatarUrl && failedUrl !== user.avatarUrl
    ? <img className="avatar user-avatar" src={user.avatarUrl} alt={displayName(user)} onError={() => setFailedUrl(user.avatarUrl)} referrerPolicy="no-referrer" />
    : <span className="avatar user-avatar" aria-label={displayName(user)}>{displayName(user).slice(0, 1).toUpperCase()}</span>;
}

export function Alert({ children }) { return children ? <div className="api-notice form-error" role="alert">{children}</div> : null; }
export function Empty({ children }) { return <div className="empty-state">{children}</div>; }

export function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus?.(); };
  }, []);
  return <dialog ref={ref} className="modal-card workspace-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose?.(); }}>
    <div className="modal-heading"><h2 id={titleId}>{title}</h2><button type="button" className="close-button" disabled={!onClose} aria-label="Fermer la fenêtre" onClick={onClose}>×</button></div>
    {children}
  </dialog>;
}

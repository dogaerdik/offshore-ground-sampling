import { createPortal } from "react-dom";

interface Props {
  sampleId: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  sampleId,
  onConfirm,
  onCancel,
}: Props) {
  return createPortal(
    <div className="backdrop" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Delete sample #{sampleId}?</h2>
        <p className="dialog-confirm-text">This action cannot be undone.</p>
        <div className="dialog-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

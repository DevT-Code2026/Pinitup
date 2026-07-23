import { useEffect, useRef } from "react";
import {
  X,
  Gem,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
  Copy,
} from "lucide-react";
import "./ExecutionDetailModal.css";

const STATUS_CONFIG = {
  queued: { label: "Queued", icon: Clock, bg: "#f3f4f6", color: "#6b7280" },
  running: { label: "Running", icon: Loader2, bg: "#eff6ff", color: "#2563eb" },
  completed: { label: "Completed", icon: CheckCircle, bg: "#ecfdf5", color: "#16a34a" },
  failed: { label: "Failed", icon: XCircle, bg: "#fef2f2", color: "#dc2626" },
  refunded: { label: "Refunded", icon: RotateCcw, bg: "#fffbeb", color: "#d97706" },
};

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(start, end) {
  if (!start || !end) return "—";
  const ms = new Date(end) - new Date(start);
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function DetailRow({ label, value, copyable = false, mono = false }) {
  if (!value && value !== 0) return null;
  return (
    <div className="edm-row">
      <span className="edm-row__label">{label}</span>
      <div className="edm-row__value-wrap">
        <span className={`edm-row__value ${mono ? "edm-row__value--mono" : ""}`}>
          {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
        </span>
        {copyable && (
          <button
            className="edm-row__copy"
            onClick={() => copyToClipboard(String(value))}
            aria-label={`Copy ${label}`}
            type="button"
          >
            <Copy size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ExecutionDetailModal({ execution, onClose }) {
  const overlayRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!execution) return null;

  const statusCfg = STATUS_CONFIG[execution.status] || STATUS_CONFIG.queued;
  const StatusIcon = statusCfg.icon;

  return (
    <div
      className="edm-overlay"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Execution details"
    >
      <div className="edm-modal">
        <div className="edm-modal__header">
          <div>
            <h2 className="edm-modal__title">Execution Details</h2>
            <p className="edm-modal__subtitle">{execution.workflowName}</p>
          </div>
          <button
            ref={closeRef}
            className="edm-modal__close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="edm-modal__body">
          {/* Status */}
          <div className="edm-status-row">
            <div
              className="edm-status-badge"
              style={{ background: statusCfg.bg, color: statusCfg.color }}
            >
              <StatusIcon
                size={14}
                className={execution.status === "running" ? "edm-spinner" : ""}
              />
              <span>{statusCfg.label}</span>
            </div>

            {execution.refunded && (
              <div className="edm-status-badge edm-status-badge--refund">
                <RotateCcw size={13} />
                <span>{execution.creditsSpent} credits refunded</span>
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="edm-grid">
            <DetailRow label="Workflow" value={execution.workflowName} />
            <DetailRow label="Provider" value={execution.provider} />
            <DetailRow
              label="Credits"
              value={`${execution.creditsSpent} credits`}
            />
            <DetailRow
              label="Duration"
              value={formatDuration(execution.startedAt, execution.completedAt)}
            />
            <DetailRow label="Started" value={formatDateTime(execution.startedAt)} />
            <DetailRow label="Completed" value={formatDateTime(execution.completedAt)} />
            <DetailRow
              label="Execution Reference"
              value={execution.executionReference}
              copyable
              mono
            />
            {execution.refundReference && (
              <DetailRow
                label="Refund Reference"
                value={execution.refundReference}
                copyable
                mono
              />
            )}
          </div>

          {/* Input */}
          {execution.input && Object.keys(execution.input).length > 0 && (
            <div className="edm-section">
              <h3 className="edm-section__title">Input</h3>
              <pre className="edm-code">{JSON.stringify(execution.input, null, 2)}</pre>
            </div>
          )}

          {/* Output */}
          {execution.output && (
            <div className="edm-section">
              <h3 className="edm-section__title">Output</h3>
              <pre className="edm-code edm-code--success">
                {typeof execution.output === "string"
                  ? execution.output
                  : JSON.stringify(execution.output, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {execution.error && (
            <div className="edm-section">
              <h3 className="edm-section__title edm-section__title--error">Error</h3>
              <pre className="edm-code edm-code--error">{execution.error}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

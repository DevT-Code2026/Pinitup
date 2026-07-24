import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  Gem,
  Sparkles,
  Brain,
  PenTool,
  Globe,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Image,
  FileText,
  ArrowRightLeft,
  Upload,
  X,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";

import LoadingSkeleton from "../components/dashboard/LoadingSkeleton";
import ErrorState from "../components/dashboard/ErrorState";

import { getWorkflows, uploadWorkflowImage, executeWorkflow } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

import "./Workflows.css";

const PROVIDERS = {
  gemini: { icon: Sparkles, bg: "#eef2ff", color: "#4f46e5", label: "Gemini" },
  openai: { icon: Brain, bg: "#ecfdf5", color: "#16a34a", label: "OpenAI" },
  claude: { icon: PenTool, bg: "#fef3c7", color: "#d97706", label: "Claude" },
  pruna: { icon: Zap, bg: "#fce7f3", color: "#db2777", label: "Pruna" },
  segmind: { icon: Globe, bg: "#f0fdf4", color: "#15803d", label: "Segmind" },
};

function getProviderMeta(provider) {
  return PROVIDERS[provider] || { icon: Globe, bg: "#f3f4f6", color: "#6b7280", label: provider };
}

export default function Workflows() {
  const location = useLocation();
  const workflowGridRef = useRef(null);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [executingMap, setExecutingMap] = useState({});
  const [resultMap, setResultMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const [toast, setToast] = useState({ message: "", type: "success" });
  const mountedRef = useRef(true);

  const [filesMap, setFilesMap] = useState({});
  const [previewMap, setPreviewMap] = useState({});
  const [uploadingMap, setUploadingMap] = useState({});
  const [uploadErrorMap, setUploadErrorMap] = useState({});
  const fileInputRefs = useRef({});

  const { credits, isAuthenticated, refreshWallet } = useAuth();

  const fetchWorkflows = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const res = await getWorkflows();
      if (!mountedRef.current) return;
      setWorkflows(res.data.workflows || []);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.response?.data?.message || "Failed to load workflows.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchWorkflows();
    return () => {
      mountedRef.current = false;
      Object.values(previewMap).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fetchWorkflows]);

  useEffect(() => {
    if (location.state?.promptId && workflowGridRef.current && !loading) {
      workflowGridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.state?.promptId, loading]);

  const handleFileSelect = (slug, field, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/") || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadErrorMap((prev) => ({ ...prev, [`${slug}-${field}`]: "JPG, PNG, or WebP only" }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadErrorMap((prev) => ({ ...prev, [`${slug}-${field}`]: "Image must be under 10MB" }));
      return;
    }

    const key = `${slug}-${field}`;
    if (previewMap[key]) URL.revokeObjectURL(previewMap[key]);

    const preview = URL.createObjectURL(file);
    setFilesMap((prev) => ({ ...prev, [key]: file }));
    setPreviewMap((prev) => ({ ...prev, [key]: preview }));
    setUploadErrorMap((prev) => ({ ...prev, [key]: "" }));
    setErrorMap((prev) => ({ ...prev, [slug]: "" }));
  };

  const handleRemoveImage = (slug, field) => {
    const key = `${slug}-${field}`;
    if (previewMap[key]) URL.revokeObjectURL(previewMap[key]);
    setFilesMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setPreviewMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setUploadErrorMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key].value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (slug, field, e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(slug, field, file);
  };

  const handleExecute = async (slug) => {
    const coupleFile = filesMap[`${slug}-couple`];
    const memeFile = filesMap[`${slug}-meme`];
    if (!coupleFile || !memeFile) return;

    setExecutingMap((prev) => ({ ...prev, [slug]: true }));
    setUploadingMap((prev) => ({ ...prev, [slug]: true }));
    setErrorMap((prev) => ({ ...prev, [slug]: "" }));
    setResultMap((prev) => ({ ...prev, [slug]: "" }));
    setUploadErrorMap((prev) => ({ ...prev, [`${slug}-couple`]: "", [`${slug}-meme`]: "" }));

    try {
      const uploadRes = await uploadWorkflowImage(coupleFile, memeFile);
      if (!mountedRef.current) return;

      const { coupleImage, memeImage } = uploadRes.data;
      setUploadingMap((prev) => ({ ...prev, [slug]: false }));

      const execRes = await executeWorkflow(slug, { coupleImage, memeImage });
      if (!mountedRef.current) return;

      const data = execRes.data;

      if (data.refunded) {
        setToast({
          message: `Execution failed. ${data.refundCredits} credits were automatically refunded.`,
          type: "error",
        });
        refreshWallet();
      } else {
        setResultMap((prev) => ({ ...prev, [slug]: data.execution }));
        refreshWallet();
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const isUploadError = err.config?.url?.includes("/workflows/upload");
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";

      if (isUploadError) {
        setUploadErrorMap((prev) => ({ ...prev, [`${slug}-couple`]: msg, [`${slug}-meme`]: msg }));
      } else {
        setErrorMap((prev) => ({ ...prev, [slug]: msg }));
      }
    } finally {
      if (mountedRef.current) {
        setExecutingMap((prev) => ({ ...prev, [slug]: false }));
        setUploadingMap((prev) => ({ ...prev, [slug]: false }));
      }
    }
  };

  const renderUploadField = (slug, field, label, sublabel) => {
    const key = `${slug}-${field}`;
    const file = filesMap[key];
    const preview = previewMap[key];
    const uploadError = uploadErrorMap[key];

    return (
      <div className="wf-card__upload-field">
        <div className="wf-card__upload-label">
          <span className="wf-card__upload-label-text">{label}</span>
          <span className="wf-card__upload-label-hint">{sublabel}</span>
        </div>
        {preview ? (
          <div className="wf-card__preview">
            <img src={preview} alt={label} className="wf-card__preview-img" />
            <button
              className="wf-card__preview-remove"
              onClick={() => handleRemoveImage(slug, field)}
              aria-label={`Remove ${label}`}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label
            className="wf-card__dropzone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(slug, field, e)}
          >
            <input
              ref={(el) => { fileInputRefs.current[key] = el; }}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="wf-card__file-input"
              onChange={(e) => handleFileSelect(slug, field, e.target.files?.[0])}
            />
            <Upload size={18} className="wf-card__dropzone-icon" />
            <span className="wf-card__dropzone-text">
              Drop or <span className="wf-card__dropzone-link">browse</span>
            </span>
            <span className="wf-card__dropzone-hint">JPG, PNG, WebP — max 10 MB</span>
          </label>
        )}
        {uploadError && (
          <div className="wf-card__upload-error">
            <AlertTriangle size={13} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    );
  };

  let content;

  if (loading) {
    content = <LoadingSkeleton />;
  } else if (error) {
    content = <ErrorState message={error} onRetry={fetchWorkflows} />;
  } else if (workflows.length === 0) {
    content = (
      <motion.div
        className="wf-empty"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="wf-empty__icon">
          <Zap size={40} />
        </div>
        <h2 className="wf-empty__title">No workflows available</h2>
        <p className="wf-empty__description">
          AI workflows will appear here once they are configured by the admin.
        </p>
      </motion.div>
    );
  } else {
    content = (
      <>
        <motion.div
          className="wf-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="wf-header__title">AI Workflows</h1>
          <p className="wf-header__subtitle">
            Upload your photos and let AI create something amazing.
          </p>
        </motion.div>

        <div className="wf-grid" ref={workflowGridRef}>
          {workflows.map((wf, index) => {
            const providerMeta = getProviderMeta(wf.provider);
            const ProviderIcon = providerMeta.icon;
            const isExecuting = executingMap[wf.slug];
            const isUploading = uploadingMap[wf.slug];
            const result = resultMap[wf.slug];
            const execError = errorMap[wf.slug];
            const hasBoth = Boolean(filesMap[`${wf.slug}-couple`] && filesMap[`${wf.slug}-meme`]);
            const insufficientCredits = isAuthenticated && credits !== null && credits < wf.creditCost;
            const isBusy = isExecuting || isUploading;

            return (
              <motion.div
                key={wf.id}
                className="wf-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <div className="wf-card__top">
                  <div
                    className="wf-card__icon"
                    style={{ background: providerMeta.bg, color: providerMeta.color }}
                  >
                    <ProviderIcon size={22} />
                  </div>
                  <div className="wf-card__badges">
                    <span
                      className="wf-card__provider-badge"
                      style={{ background: providerMeta.bg, color: providerMeta.color }}
                    >
                      {providerMeta.label}
                    </span>
                    <span className="wf-card__cost-badge">
                      <Gem size={12} />
                      {wf.creditCost}
                    </span>
                  </div>
                </div>

                <h3 className="wf-card__name">{wf.name}</h3>

                {wf.description && (
                  <p className="wf-card__description">{wf.description}</p>
                )}

                <div className="wf-card__meta-row">
                  <div className="wf-card__meta-item">
                    <Image size={13} />
                    <span>Image to Image</span>
                  </div>
                  <div className="wf-card__meta-item">
                    <ArrowRightLeft size={13} />
                    <span>Provider API</span>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="wf-card__auth-hint">
                    Log in to use this workflow
                  </div>
                )}

                {isAuthenticated && insufficientCredits && (
                  <div className="wf-card__insufficient">
                    <AlertTriangle size={14} />
                    <span>
                      Insufficient credits — have {credits ?? 0}, need {wf.creditCost}
                    </span>
                  </div>
                )}

                {isAuthenticated && !result && (
                  <div className="wf-card__upload-section">
                    {renderUploadField(wf.slug, "couple", "Your Photo", "The couple or group photo")}
                    {renderUploadField(wf.slug, "meme", "Meme Reference", "The meme to recreate")}
                    {isUploading && (
                      <div className="wf-card__uploading-status">
                        <Loader2 size={14} className="wf-card__spinner" />
                        <span>Uploading images...</span>
                      </div>
                    )}
                  </div>
                )}

                {isAuthenticated && result && (
                  <div className="wf-card__result">
                    {result.output?.imageUrl ? (
                      <div className="wf-card__result-image-wrap">
                        <img
                          src={result.output.imageUrl}
                          alt="Generated output"
                          className="wf-card__result-image"
                        />
                        <div className="wf-card__result-caption">
                          <CheckCircle size={14} />
                          <span>Generated successfully</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        <span>{result.output?.message || "Executed successfully"}</span>
                      </>
                    )}
                  </div>
                )}

                {isAuthenticated && execError && (
                  <div className="wf-card__exec-error">
                    <AlertTriangle size={14} />
                    <span>{execError}</span>
                  </div>
                )}

                <div className="wf-card__footer">
                  {isAuthenticated ? (
                    <button
                      className={`wf-card__generate-btn ${result && !isBusy ? "wf-card__generate-btn--success" : ""}`}
                      disabled={!hasBoth || isBusy || insufficientCredits}
                      onClick={() => handleExecute(wf.slug)}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={14} className="wf-card__spinner" />
                          Uploading...
                        </>
                      ) : isExecuting ? (
                        <>
                          <Loader2 size={14} className="wf-card__spinner" />
                          Generating...
                        </>
                      ) : result ? (
                        <>
                          <CheckCircle size={14} />
                          Completed
                        </>
                      ) : (
                        <>
                          <Zap size={14} />
                          Generate
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="wf-card__login-hint">
                      Sign in to generate
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div className="wf-page">
      <Navbar />

      <motion.main
        className="wf-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="wf-container">
          {content}
        </div>
      </motion.main>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
}

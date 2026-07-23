import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Plus,
  Loader2,
  Power,
  PowerOff,
  Trash2,
  Pencil,
  Search,
  Zap,
  Sparkles,
  Brain,
  PenTool,
  Globe,
  Gem,
  CheckCircle,
  AlertTriangle,
  Settings,
  BarChart3,
  X,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Toast from "../components/Toast";
import ErrorState from "../components/dashboard/ErrorState";

import {
  getAdminWorkflows,
  createWorkflow,
  updateWorkflow,
  deactivateWorkflow,
} from "../services/api";

import "./AdminWorkflows.css";

const PROVIDERS = [
  { value: "gemini", label: "Gemini", icon: Sparkles, bg: "#eef2ff", color: "#4f46e5" },
  { value: "openai", label: "OpenAI", icon: Brain, bg: "#ecfdf5", color: "#16a34a" },
  { value: "claude", label: "Claude", icon: PenTool, bg: "#fef3c7", color: "#d97706" },
  { value: "pruna", label: "Pruna", icon: Zap, bg: "#fce7f3", color: "#db2777" },
  { value: "segmind", label: "Segmind", icon: Globe, bg: "#f0fdf4", color: "#15803d" },
];

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function getProviderMeta(provider) {
  return PROVIDERS.find((p) => p.value === provider) || PROVIDERS[3];
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  provider: "gemini",
  creditCost: "",
  status: "active",
};

export default function AdminWorkflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const mountedRef = useRef(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (confirmDelete && !deleting) setConfirmDelete(null);
      else if (confirmToggle && !toggling) setConfirmToggle(null);
      else if (modal && !submitting) setModal(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal, confirmDelete, deleting, confirmToggle, toggling]);

  const fetchWorkflows = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const res = await getAdminWorkflows();
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
    return () => { mountedRef.current = false; };
  }, [fetchWorkflows]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchWorkflows();
    setRefreshing(false);
  };

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((wf) => {
      if (statusFilter !== "all" && wf.status !== statusFilter) return false;
      if (providerFilter !== "all" && wf.provider !== providerFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          wf.name.toLowerCase().includes(q) ||
          (wf.description && wf.description.toLowerCase().includes(q)) ||
          wf.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [workflows, statusFilter, providerFilter, searchQuery]);

  const stats = useMemo(() => {
    const active = workflows.filter((w) => w.status === "active").length;
    const inactive = workflows.filter((w) => w.status === "inactive").length;
    const totalCost = workflows.reduce((sum, w) => sum + (w.creditCost || 0), 0);
    return { total: workflows.length, active, inactive, totalCost };
  }, [workflows]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSlugEdited(false);
    setModal("create");
  };

  const openEdit = (wf) => {
    setForm({
      name: wf.name,
      slug: wf.slug,
      description: wf.description || "",
      provider: wf.provider,
      creditCost: String(wf.creditCost),
      status: wf.status,
    });
    setSlugEdited(true);
    setModal({ type: "edit", workflow: wf });
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((p) => ({
      ...p,
      name,
      slug: slugEdited ? p.slug : slugify(name),
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createWorkflow({
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name.trim()),
        description: form.description.trim(),
        provider: form.provider,
        creditCost: Number(form.creditCost),
        status: form.status,
      });
      setToast({ message: "Workflow created successfully", type: "success" });
      setModal(null);
      fetchWorkflows();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to create workflow",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || submitting || modal?.type !== "edit") return;
    setSubmitting(true);
    try {
      await updateWorkflow(modal.workflow.id, {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name.trim()),
        description: form.description.trim(),
        provider: form.provider,
        creditCost: Number(form.creditCost),
        status: form.status,
      });
      setToast({ message: "Workflow updated successfully", type: "success" });
      setModal(null);
      fetchWorkflows();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to update workflow",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async () => {
    if (!confirmToggle || toggling) return;
    setToggling(true);
    try {
      await deactivateWorkflow(confirmToggle.id);
      setToast({
        message: confirmToggle.status === "active"
          ? "Workflow deactivated"
          : "Workflow activated",
        type: "success",
      });
      setConfirmToggle(null);
      fetchWorkflows();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to update status",
        type: "error",
      });
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete || deleting) return;
    setDeleting(true);
    try {
      await deactivateWorkflow(confirmDelete.id);
      setToast({ message: "Workflow deleted successfully", type: "success" });
      setConfirmDelete(null);
      fetchWorkflows();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to delete workflow",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const updateForm = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="aw-page">
      <Navbar />

      <motion.main className="aw-main" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="aw-container">

          {/* Header */}
          <div className="aw-header">
            <div className="aw-header__left">
              <h1 className="aw-header__title">Workflow Management</h1>
              <p className="aw-header__subtitle">
                Create, configure, and manage AI workflows for your platform.
              </p>
            </div>
            <div className="aw-header__actions">
              <button
                className={`aw-btn-icon ${refreshing ? "aw-btn-icon--loading" : ""}`}
                onClick={handleRefresh}
                title="Refresh"
                aria-label="Refresh workflows"
              >
                <RefreshCw size={17} className={refreshing ? "btn-spin" : ""} />
              </button>
              <button className="aw-btn-primary" onClick={openCreate}>
                <Plus size={17} /> New Workflow
              </button>
            </div>
          </div>

          {/* Stats */}
          {!loading && !error && workflows.length > 0 && (
            <motion.div
              className="aw-stats"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <div className="aw-stat">
                <div className="aw-stat__icon aw-stat__icon--blue">
                  <BarChart3 size={18} />
                </div>
                <div className="aw-stat__content">
                  <span className="aw-stat__value">{stats.total}</span>
                  <span className="aw-stat__label">Total</span>
                </div>
              </div>
              <div className="aw-stat">
                <div className="aw-stat__icon aw-stat__icon--green">
                  <CheckCircle size={18} />
                </div>
                <div className="aw-stat__content">
                  <span className="aw-stat__value">{stats.active}</span>
                  <span className="aw-stat__label">Active</span>
                </div>
              </div>
              <div className="aw-stat">
                <div className="aw-stat__icon aw-stat__icon--gray">
                  <PowerOff size={18} />
                </div>
                <div className="aw-stat__content">
                  <span className="aw-stat__value">{stats.inactive}</span>
                  <span className="aw-stat__label">Inactive</span>
                </div>
              </div>
              <div className="aw-stat">
                <div className="aw-stat__icon aw-stat__icon--purple">
                  <Gem size={18} />
                </div>
                <div className="aw-stat__content">
                  <span className="aw-stat__value">{stats.totalCost}</span>
                  <span className="aw-stat__label">Total Credits</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Toolbar */}
          {!loading && !error && workflows.length > 0 && (
            <motion.div
              className="aw-toolbar"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="aw-toolbar__search">
                <Search size={16} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="aw-toolbar__search-input"
                  aria-label="Search workflows"
                />
                {searchQuery && (
                  <button
                    className="aw-toolbar__search-clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="aw-toolbar__filters">
                <div className="aw-toolbar__tabs">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      className={`aw-toolbar__tab ${statusFilter === tab.value ? "aw-toolbar__tab--active" : ""}`}
                      onClick={() => setStatusFilter(tab.value)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <select
                  className="aw-toolbar__select"
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  aria-label="Filter by provider"
                >
                  <option value="all">All Providers</option>
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          {/* Content */}
          {loading ? (
            <div className="aw-loading">
              <Loader2 size={28} className="aw-spinner" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchWorkflows} />
          ) : workflows.length === 0 ? (
            <motion.div
              className="aw-empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="aw-empty__icon">
                <Zap size={40} />
              </div>
              <h3 className="aw-empty__title">No workflows yet</h3>
              <p className="aw-empty__description">
                Create your first AI workflow to start generating content with credit-based execution.
              </p>
              <button className="aw-btn-primary" onClick={openCreate}>
                <Plus size={17} /> Create First Workflow
              </button>
            </motion.div>
          ) : filteredWorkflows.length === 0 ? (
            <motion.div
              className="aw-empty aw-empty--subtle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search size={32} color="#9ca3af" />
              <h3 className="aw-empty__title">No matches</h3>
              <p className="aw-empty__description">
                Try adjusting your search or filters.
              </p>
            </motion.div>
          ) : (
            <div className="aw-grid">
              {filteredWorkflows.map((wf, index) => {
                const providerMeta = getProviderMeta(wf.provider);
                const ProviderIcon = providerMeta.icon;

                return (
                  <motion.div
                    key={wf.id}
                    className={`aw-card ${wf.status === "inactive" ? "aw-card--inactive" : ""}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                  >
                    <div className="aw-card__header">
                      <div
                        className="aw-card__provider-icon"
                        style={{ background: providerMeta.bg, color: providerMeta.color }}
                      >
                        <ProviderIcon size={20} />
                      </div>
                      <div className="aw-card__header-right">
                        <span
                          className="aw-card__status"
                          data-status={wf.status}
                        >
                          <span className="aw-card__status-dot" />
                          {wf.status === "active" ? "Active" : "Inactive"}
                        </span>
                        <div className="aw-card__actions">
                          <button
                            className="aw-card__action"
                            title={wf.status === "active" ? "Deactivate" : "Activate"}
                            onClick={() => setConfirmToggle(wf)}
                          >
                            {wf.status === "active" ? <PowerOff size={14} /> : <Power size={14} />}
                          </button>
                          <button
                            className="aw-card__action"
                            title="Edit"
                            onClick={() => openEdit(wf)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="aw-card__action aw-card__action--danger"
                            title="Delete"
                            onClick={() => setConfirmDelete(wf)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="aw-card__body">
                      <h3 className="aw-card__name">{wf.name}</h3>
                      {wf.description && (
                        <p className="aw-card__desc">{wf.description}</p>
                      )}
                    </div>

                    <div className="aw-card__footer">
                      <span
                        className="aw-card__badge aw-card__badge--provider"
                        style={{ background: providerMeta.bg, color: providerMeta.color }}
                      >
                        {providerMeta.label}
                      </span>
                      <span className="aw-card__badge aw-card__badge--slug">
                        {wf.slug}
                      </span>
                      <span className="aw-card__cost">
                        <Gem size={12} />
                        {wf.creditCost}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.main>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="aw-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && setModal(null)}
            role="dialog"
            aria-modal="true"
            aria-label={modal === "create" ? "Create workflow" : "Edit workflow"}
          >
            <motion.div
              className="aw-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aw-modal__header">
                <div>
                  <h2 className="aw-modal__title">
                    {modal === "create" ? "Create Workflow" : "Edit Workflow"}
                  </h2>
                  <p className="aw-modal__subtitle">
                    {modal === "create"
                      ? "Configure a new AI workflow for your platform."
                      : `Editing "${modal.workflow.name}"`}
                  </p>
                </div>
                <button
                  className="aw-modal__close"
                  onClick={() => setModal(null)}
                  disabled={submitting}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                className="aw-modal__form"
                onSubmit={modal === "create" ? handleCreate : handleEdit}
              >
                <div className="aw-form-section">
                  <h3 className="aw-form-section__title">Basic Information</h3>

                  <div className="aw-field">
                    <label className="aw-field__label">
                      Workflow Name <span className="aw-field__required">*</span>
                    </label>
                    <input
                      className="aw-field__input"
                      type="text"
                      value={form.name}
                      onChange={handleNameChange}
                      required
                      autoFocus
                      placeholder="e.g. Image Generation"
                    />
                  </div>

                  <div className="aw-field">
                    <label className="aw-field__label">
                      Slug
                      <span className="aw-field__hint">Auto-generated from name</span>
                    </label>
                    <input
                      className="aw-field__input aw-field__input--mono"
                      type="text"
                      value={form.slug}
                      onChange={(e) => { setSlugEdited(true); setForm((p) => ({ ...p, slug: e.target.value })); }}
                      placeholder="image-generation"
                    />
                  </div>

                  <div className="aw-field">
                    <label className="aw-field__label">Description</label>
                    <textarea
                      className="aw-field__input aw-field__textarea"
                      value={form.description}
                      onChange={updateForm("description")}
                      placeholder="Describe what this workflow does..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="aw-form-section">
                  <h3 className="aw-form-section__title">Configuration</h3>

                  <div className="aw-form-row">
                    <div className="aw-field">
                      <label className="aw-field__label">
                        Provider <span className="aw-field__required">*</span>
                      </label>
                      <div className="aw-field__select-group">
                        {PROVIDERS.map((p) => {
                          const Icon = p.icon;
                          return (
                            <button
                              key={p.value}
                              type="button"
                              className={`aw-field__select-option ${form.provider === p.value ? "aw-field__select-option--active" : ""}`}
                              style={form.provider === p.value ? { background: p.bg, color: p.color, borderColor: p.color } : {}}
                              onClick={() => setForm((prev) => ({ ...prev, provider: p.value }))}
                            >
                              <Icon size={15} />
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="aw-form-row aw-form-row--2col">
                    <div className="aw-field">
                      <label className="aw-field__label">
                        Credit Cost <span className="aw-field__required">*</span>
                      </label>
                      <div className="aw-field__input-group">
                        <Gem size={15} className="aw-field__input-icon" />
                        <input
                          className="aw-field__input aw-field__input--prefixed"
                          type="number"
                          min="0"
                          step="1"
                          value={form.creditCost}
                          onChange={updateForm("creditCost")}
                          required
                          placeholder="15"
                        />
                      </div>
                    </div>

                    <div className="aw-field">
                      <label className="aw-field__label">Status</label>
                      <div className="aw-field__radio-group">
                        <label className={`aw-field__radio ${form.status === "active" ? "aw-field__radio--active" : ""}`}>
                          <input
                            type="radio"
                            name="status"
                            value="active"
                            checked={form.status === "active"}
                            onChange={updateForm("status")}
                          />
                          <span className="aw-field__radio-dot" />
                          <span className="aw-field__radio-label">Active</span>
                        </label>
                        <label className={`aw-field__radio ${form.status === "inactive" ? "aw-field__radio--active" : ""}`}>
                          <input
                            type="radio"
                            name="status"
                            value="inactive"
                            checked={form.status === "inactive"}
                            onChange={updateForm("status")}
                          />
                          <span className="aw-field__radio-dot" />
                          <span className="aw-field__radio-label">Draft</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="aw-modal__footer">
                  <button
                    type="button"
                    className="aw-btn-secondary"
                    onClick={() => setModal(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="aw-btn-primary"
                    disabled={submitting || !form.name.trim() || !form.creditCost}
                  >
                    {submitting ? (
                      <Loader2 size={16} className="aw-spinner-inline" />
                    ) : modal === "create" ? (
                      <>
                        <Plus size={16} /> Create Workflow
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Toggle */}
      <AnimatePresence>
        {confirmToggle && (
          <motion.div
            className="aw-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="aw-modal aw-modal--sm"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aw-modal__header">
                <h2 className="aw-modal__title">
                  {confirmToggle.status === "active" ? "Deactivate" : "Activate"} Workflow
                </h2>
                <button className="aw-modal__close" onClick={() => !toggling && setConfirmToggle(null)} disabled={toggling} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="aw-modal__confirm-body">
                <div className={`aw-modal__confirm-icon ${confirmToggle.status === "active" ? "aw-modal__confirm-icon--warn" : "aw-modal__confirm-icon--success"}`}>
                  {confirmToggle.status === "active" ? <PowerOff size={22} /> : <Power size={22} />}
                </div>
                <p className="aw-modal__confirm-text">
                  {confirmToggle.status === "active"
                    ? <>Deactivate <strong>{confirmToggle.name}</strong>? It will no longer appear for users.</>
                    : <>Activate <strong>{confirmToggle.name}</strong>? It will become available to users.</>
                  }
                </p>
              </div>
              <div className="aw-modal__footer">
                <button className="aw-btn-secondary" onClick={() => setConfirmToggle(null)} disabled={toggling}>Cancel</button>
                <button className="aw-btn-primary" onClick={handleToggle} disabled={toggling}>
                  {toggling ? <Loader2 size={16} className="aw-spinner-inline" /> : confirmToggle.status === "active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="aw-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="aw-modal aw-modal--sm"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aw-modal__header">
                <h2 className="aw-modal__title">Delete Workflow</h2>
                <button className="aw-modal__close" onClick={() => !deleting && setConfirmDelete(null)} disabled={deleting} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="aw-modal__confirm-body">
                <div className="aw-modal__confirm-icon aw-modal__confirm-icon--danger">
                  <AlertTriangle size={22} />
                </div>
                <p className="aw-modal__confirm-text">
                  Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="aw-modal__footer">
                <button className="aw-btn-secondary" onClick={() => setConfirmDelete(null)} disabled={deleting}>Cancel</button>
                <button className="aw-btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 size={16} className="aw-spinner-inline" /> : "Delete Workflow"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Plus, Loader2, Power, PowerOff, Trash2, Settings } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Toast from "../components/Toast";
import ErrorState from "../components/dashboard/ErrorState";

import {
  getAdminWorkflows,
  createWorkflow,
  updateWorkflow,
  deactivateWorkflow,
} from "../services/api";

import "./AdminWorkflows.css";

const EMPTY_FORM = { name: "", description: "", provider: "gemini", creditCost: "" };

export default function AdminWorkflows() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const mountedRef = useRef(true);

  const [modal, setModal] = useState(null); // null | "create" | { workflow, ... }
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    if (refreshing) return;
    try {
      setRefreshing(true);
      await fetchWorkflows();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchWorkflows();
    return () => { mountedRef.current = false; };
  }, [fetchWorkflows]);

  // ===================== Create =====================
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal("create");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createWorkflow({
        name: form.name.trim(),
        description: form.description.trim(),
        provider: form.provider,
        creditCost: Number(form.creditCost),
      });
      setToast({ message: "Workflow created", type: "success" });
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

  // ===================== Edit =====================
  const openEdit = (wf) => {
    setForm({
      name: wf.name,
      description: wf.description || "",
      provider: wf.provider,
      creditCost: String(wf.creditCost),
    });
    setModal({ type: "edit", workflow: wf });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || submitting || modal?.type !== "edit") return;
    setSubmitting(true);
    try {
      await updateWorkflow(modal.workflow.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        provider: form.provider,
        creditCost: Number(form.creditCost),
      });
      setToast({ message: "Workflow updated", type: "success" });
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

  // ===================== Toggle status =====================
  const openToggle = (wf) => setConfirmToggle(wf);

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

  // ===================== Delete (soft) =====================
  const openDelete = (wf) => setConfirmDelete(wf);

  const handleDelete = async () => {
    if (!confirmDelete || deleting) return;
    setDeleting(true);
    try {
      await deactivateWorkflow(confirmDelete.id);
      setToast({ message: "Workflow deleted", type: "success" });
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
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <motion.main className="aw-main" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="aw-container">

          <div className="aw-header">
            <div className="aw-header__left">
              <h1>Workflows</h1>
              <p>Manage AI workflows and credit pricing</p>
            </div>
            <div className="aw-header__actions">
              <button
                className={`aw-refresh-btn ${refreshing ? "aw-refresh-btn--loading" : ""}`}
                onClick={handleRefresh}
                title="Refresh"
                aria-label="Refresh workflows"
              >
                <RefreshCw size={18} className={refreshing ? "btn-spin" : ""} />
              </button>
              <button className="aw-create-btn" onClick={openCreate}>
                <Plus size={18} /> New Workflow
              </button>
            </div>
          </div>

          {loading ? (
            <div className="wf-loading">
              <Loader2 size={28} className="wf-spinner" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchWorkflows} />
          ) : workflows.length === 0 ? (
            <div className="aw-empty">
              <div className="aw-empty__icon"><Settings size={40} /></div>
              <h3>No workflows yet</h3>
              <p>Create an AI workflow to get started.</p>
              <button className="aw-create-btn" onClick={openCreate}>
                <Plus size={18} /> Create first workflow
              </button>
            </div>
          ) : (
            <div className="aw-table-wrap">
              <table className="aw-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Provider</th>
                    <th>Cost</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((wf) => (
                    <tr key={wf.id}>
                      <td>
                        <div className="aw-cell__name">{wf.name}</div>
                        {wf.description && (
                          <div className="aw-cell__slug">{wf.description.slice(0, 60)}{wf.description.length > 60 ? "…" : ""}</div>
                        )}
                      </td>
                      <td>{wf.slug}</td>
                      <td>
                        <span className={`aw-cell__provider aw-cell__provider--${wf.provider}`}>
                          {wf.provider}
                        </span>
                      </td>
                      <td className="aw-cell__cost">{wf.creditCost}</td>
                      <td>
                        <span className="aw-cell__status">
                          <span className={`aw-cell__status-dot aw-cell__status-dot--${wf.status}`} />
                          {wf.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="aw-cell-actions">
                          <button
                            className={`aw-action-btn ${wf.status === "active" ? "aw-action-btn--deactivate" : "aw-action-btn--activate"}`}
                            title={wf.status === "active" ? "Deactivate" : "Activate"}
                            onClick={() => openToggle(wf)}
                          >
                            {wf.status === "active" ? <PowerOff size={15} /> : <Power size={15} />}
                          </button>
                          <button
                            className="aw-action-btn"
                            title="Edit"
                            onClick={() => openEdit(wf)}
                          >
                            <Settings size={15} />
                          </button>
                          <button
                            className="aw-action-btn aw-action-btn--delete"
                            title="Delete"
                            onClick={() => openDelete(wf)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.main>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="stm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && setModal(null)}
            role="dialog"
            aria-modal="true"
            aria-label={modal === "create" ? "Create workflow" : "Edit workflow"}
          >
            <motion.div
              className="stm-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="stm-header">
                <h2 className="stm-title">
                  {modal === "create" ? "New Workflow" : "Edit Workflow"}
                </h2>
                <button className="stm-close" onClick={() => setModal(null)} disabled={submitting} aria-label="Close">
                  <span style={{ fontSize: 18, lineHeight: 1 }}>&times;</span>
                </button>
              </div>

              <form
                className="stm-create-form"
                onSubmit={modal === "create" ? handleCreate : handleEdit}
              >
                <div className="aw-field">
                  <label className="aw-field__label">Name</label>
                  <input
                    className="aw-field__input"
                    type="text"
                    value={form.name}
                    onChange={updateForm("name")}
                    required
                    autoFocus
                    placeholder="e.g. Image Generation"
                  />
                </div>

                <div className="aw-field">
                  <label className="aw-field__label">Description</label>
                  <input
                    className="aw-field__input"
                    type="text"
                    value={form.description}
                    onChange={updateForm("description")}
                    placeholder="Optional description"
                  />
                </div>

                <div className="aw-form-row">
                  <div className="aw-field">
                    <label className="aw-field__label">Provider</label>
                    <select
                      className="aw-field__select"
                      value={form.provider}
                      onChange={updateForm("provider")}
                    >
                      <option value="gemini">Gemini</option>
                      <option value="openai">OpenAI</option>
                      <option value="claude">Claude</option>
                    </select>
                  </div>
                  <div className="aw-field">
                    <label className="aw-field__label">Credit Cost</label>
                    <input
                      className="aw-field__input"
                      type="number"
                      min="0"
                      step="1"
                      value={form.creditCost}
                      onChange={updateForm("creditCost")}
                      required
                      placeholder="e.g. 15"
                    />
                  </div>
                </div>

                <div className="stm-create-actions">
                  <button
                    type="button"
                    className="stm-btn stm-btn--ghost"
                    onClick={() => setModal(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="stm-btn stm-btn--primary"
                    disabled={submitting || !form.name.trim() || !form.creditCost}
                  >
                    {submitting ? <Loader2 size={16} className="stm-spinner" /> : modal === "create" ? "Create" : "Save"}
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
            className="stm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm status change"
          >
            <motion.div
              className="stm-modal stm-modal--sm"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="stm-header">
                <h2 className="stm-title">
                  {confirmToggle.status === "active" ? "Deactivate" : "Activate"} Workflow
                </h2>
                <button className="stm-close" onClick={() => !toggling && setConfirmToggle(null)} disabled={toggling} aria-label="Close">
                  <span style={{ fontSize: 18, lineHeight: 1 }}>&times;</span>
                </button>
              </div>
              <p className="stm-confirm-text">
                {confirmToggle.status === "active"
                  ? <>Deactivate <strong>{confirmToggle.name}</strong>? It will no longer appear for users.</>
                  : <>Activate <strong>{confirmToggle.name}</strong>? It will become available to users.</>
                }
              </p>
              <div className="stm-create-actions">
                <button className="stm-btn stm-btn--ghost" onClick={() => setConfirmToggle(null)} disabled={toggling}>Cancel</button>
                <button className="stm-btn stm-btn--primary" onClick={handleToggle} disabled={toggling}>
                  {toggling ? <Loader2 size={16} className="stm-spinner" /> : confirmToggle.status === "active" ? "Deactivate" : "Activate"}
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
            className="stm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm delete workflow"
          >
            <motion.div
              className="stm-modal stm-modal--sm"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="stm-header">
                <h2 className="stm-title">Delete Workflow</h2>
                <button className="stm-close" onClick={() => !deleting && setConfirmDelete(null)} disabled={deleting} aria-label="Close">
                  <span style={{ fontSize: 18, lineHeight: 1 }}>&times;</span>
                </button>
              </div>
              <p className="stm-confirm-text">
                Are you sure you want to delete &ldquo;{confirmDelete.name}&rdquo;? This cannot be undone.
              </p>
              <div className="stm-create-actions">
                <button className="stm-btn stm-btn--ghost" onClick={() => setConfirmDelete(null)} disabled={deleting}>Cancel</button>
                <button className="stm-btn stm-btn--danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 size={16} className="stm-spinner" /> : "Delete"}
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

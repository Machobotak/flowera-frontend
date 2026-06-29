"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import ToastContainer from "@/components/toast-container";
import DeleteConfirmModal from "@/components/seller-product/delete-confirm-modal";
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "@/utils/admin-api";
import type { AdminUser, CreateAdminUserPayload } from "@/types/admin";

/* ─────────────────── Form Modal ─────────────────── */

function UserFormModal({
  isOpen,
  user,
  isSubmitting,
  onSubmit,
  onClose,
}: {
  isOpen: boolean;
  user: AdminUser | null;
  isSubmitting: boolean;
  onSubmit: (data: Partial<CreateAdminUserPayload> & { name: string; email: string; id?: number }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPassword("");
      setPhone(user.phone_number || "");
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const isEdit = !!user;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || (!isEdit && !password.trim())) return;
    onSubmit({
      ...(isEdit ? { id: user.id } : {}),
      name: name.trim(),
      email: email.trim(),
      ...(password.trim() ? { password: password.trim() } : {}),
      ...(phone.trim() ? { phone_number: phone.trim() } : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease]"
        onClick={() => !isSubmitting && onClose()}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-[slideUp_0.2s_ease]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
          <h3 className="font-headline text-[18px] font-bold text-on-surface">
            {isEdit ? "Edit User" : "Tambah User"}
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Nama lengkap"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5">
              Password {isEdit && <span className="font-normal text-outline">(kosongkan jika tidak diubah)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5">
              Telepon <span className="font-normal text-outline">(opsional)</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="08123456789"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-outline-variant/40 rounded-xl text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-[14px] font-semibold hover:shadow-float transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {isEdit ? "Update" : "Tambah"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────── Page ─────────────────── */

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const { toasts, addToast, removeToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminUsers();
      if (res.status === "success") {
        setUsers(res.data ?? []);
      } else {
        setError(res.message || "Gagal memuat user");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Gagal memuat user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ── Create / Update ── */
  const handleFormSubmit = async (data: Partial<CreateAdminUserPayload> & { name: string; email: string; id?: number }) => {
    setIsSubmitting(true);
    try {
      if (data.id) {
        const { id, ...payload } = data;
        const res = await updateAdminUser(id, payload);
        if (res.status === "success") {
          addToast("User berhasil diupdate", "success");
          await fetchUsers();
          setFormModalOpen(false);
        } else {
          addToast(res.message || "Gagal mengupdate user", "error");
        }
      } else {
        const res = await createAdminUser(data as CreateAdminUserPayload);
        if (res.status === "success") {
          addToast("User berhasil dibuat", "success");
          await fetchUsers();
          setFormModalOpen(false);
        } else {
          addToast(res.message || "Gagal membuat user", "error");
        }
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || err.message || "Gagal menyimpan user", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await deleteAdminUser(deleteTarget.id);
      if (res.status === "success") {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        addToast(`User "${deleteTarget.name}" berhasil dihapus`, "success");
      } else {
        addToast(res.message || "Gagal menghapus user", "error");
      }
    } catch (err: any) {
      addToast(err.response?.data?.message || err.message || "Gagal menghapus user", "error");
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setFormModalOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormModalOpen(true);
  };

  /* ── Filter ── */
  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  /* ── Render ── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[14px] text-on-surface-variant">Memuat user...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-[40px] text-error">error</span>
        <p className="text-[14px] text-error">{error}</p>
        <button onClick={fetchUsers} className="px-6 py-3 bg-primary text-white rounded-xl text-[14px] font-semibold">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-[24px] font-semibold text-on-surface">Manajemen User</h2>
          <p className="text-[13px] text-on-surface-variant mt-1">
            Kelola semua pengguna terdaftar di platform.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-3 bg-primary text-white rounded-xl text-[14px] font-semibold hover:shadow-float transition-all active:scale-95 flex items-center gap-2 self-start"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Tambah User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/60 pointer-events-none">search</span>
        <input
          type="text"
          placeholder="Cari user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/30 rounded-xl text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">#</th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">Nama</th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">Email</th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">Telepon</th>
                <th className="text-center px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">Role</th>
                <th className="text-center px-6 py-3 text-[12px] font-semibold text-on-surface-variant tracking-wider uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    {search.trim() ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40">search_off</span>
                        <p className="text-[13px]">Tidak ada user yang cocok.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40">person_off</span>
                        <p className="text-[13px]">Belum ada user.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => {
                  const roles: string[] = [];
                  if (u.admin) roles.push("Admin");
                  if (u.seller) roles.push("Seller");
                  if (roles.length === 0) roles.push("User");

                  return (
                    <tr key={u.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4 text-[13px] text-on-surface-variant">{i + 1}</td>
                      <td className="px-6 py-4">
                        <p className="text-[14px] font-medium text-on-surface">{u.name}</p>
                        {u.seller?.store && (
                          <p className="text-[11px] text-on-surface-variant">🏪 {u.seller.store.name}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-on-surface-variant">{u.email}</td>
                      <td className="px-6 py-4 text-[13px] text-on-surface-variant">{u.phone_number || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.admin
                            ? "bg-error-container text-error"
                            : u.seller
                            ? "bg-secondary-container text-secondary"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}>
                          {roles.join(", ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(u)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-container/30 text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error-container/30 text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[12px] text-on-surface-variant text-right">
        {filtered.length} user
      </p>

      {/* Modals */}
      <UserFormModal
        isOpen={formModalOpen}
        user={editingUser}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
        onClose={() => setFormModalOpen(false)}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title="Hapus User"
        itemName={deleteTarget?.name ?? ""}
        description="User"
        isDeleting={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Hapus"
        confirmingLabel="Menghapus..."
      />
    </div>
  );
}

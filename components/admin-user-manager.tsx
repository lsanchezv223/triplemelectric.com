"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

type TeamUser = {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  role: "ADMIN" | "EMPLOYEE";
  isActive: boolean;
  hourlyRate: number | null;
  hasPassword: boolean;
  pendingInviteExpiresAt: string | null;
};

type Props = {
  currentAdminId: string;
  users: TeamUser[];
};

export function AdminUserManager({ currentAdminId, users }: Props) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  );

  return (
    <>
      <section className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Users</p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">Current team access</h3>
          </div>
          <p className="text-sm text-sand/60">{users.length} account{users.length === 1 ? "" : "s"}</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-white/10">
          <div className="hidden grid-cols-[1.2fr_1fr_120px_120px_160px_120px] gap-4 border-b border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-sand/60 md:grid">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Rate</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-white/10">
            {users.map((user) => {
              const status = user.pendingInviteExpiresAt
                ? `Invite until ${new Date(user.pendingInviteExpiresAt).toLocaleDateString()}`
                : user.isActive
                  ? user.hasPassword
                    ? "Active"
                    : "Pending setup"
                  : "Disabled";

              return (
                <div key={user.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_1fr_120px_120px_160px_120px] md:items-center md:gap-4">
                  <div>
                    <p className="font-semibold text-white">{user.fullName}</p>
                    <p className="mt-1 text-sm text-sand/60">@{user.username}</p>
                  </div>
                  <p className="text-sm text-sand/75">{user.email || "No email"}</p>
                  <p className="text-sm text-sand/75">{user.role === "ADMIN" ? "Admin" : "Employee"}</p>
                  <p className="text-sm text-sand/75">{user.hourlyRate ? `$${user.hourlyRate.toFixed(2)}/h` : "No rate"}</p>
                  <p className="text-sm text-sand/75">{status}</p>
                  <div className="md:text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {selectedUser ? (
        <EditUserModal
          currentAdminId={currentAdminId}
          user={selectedUser}
          onClose={() => setSelectedUserId(null)}
          onRefresh={() => router.refresh()}
        />
      ) : null}
    </>
  );
}

function EditUserModal({
  currentAdminId,
  user,
  onClose,
  onRefresh
}: {
  currentAdminId: string;
  user: TeamUser;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState<"ADMIN" | "EMPLOYEE">(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [hourlyRate, setHourlyRate] = useState(user.hourlyRate ? String(user.hourlyRate) : "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const isSelf = user.id === currentAdminId;

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          username,
          email,
          role,
          isActive,
          hourlyRate: hourlyRate || null
        })
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error || "Unable to save changes.");
        return;
      }

      setSuccess("User updated successfully.");
      onRefresh();
    } catch {
      setError("Unable to save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordLink() {
    setError("");
    setSuccess("");
    setIsSendingLink(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}/password-link`, {
        method: "POST"
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error || "Unable to send the password link.");
        return;
      }

      setSuccess("Password link sent successfully.");
      onRefresh();
    } catch {
      setError("Unable to send the password link.");
    } finally {
      setIsSendingLink(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[1.75rem] border border-white/10 bg-[#07111f] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">User settings</p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold text-white">{user.fullName}</h3>
            <p className="mt-2 text-sm text-sand/65">Update access details, send a password link, or disable the account.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-sand/70 transition hover:border-white/25 hover:text-white"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6 px-6 py-6 md:px-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="edit-full-name" className="block text-sm font-semibold text-sand">
                Full name
              </label>
              <input
                id="edit-full-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-username" className="block text-sm font-semibold text-sand">
                Username
              </label>
              <input
                id="edit-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="space-y-2">
              <label htmlFor="edit-email" className="block text-sm font-semibold text-sand">
                Email
              </label>
              <input
                id="edit-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-role" className="block text-sm font-semibold text-sand">
                Role
              </label>
              <select
                id="edit-role"
                value={role}
                onChange={(event) => setRole(event.target.value as "ADMIN" | "EMPLOYEE")}
                disabled={isSelf}
                className="w-full rounded-2xl border border-white/15 bg-[#08101c] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300 disabled:opacity-60"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-hourly-rate" className="block text-sm font-semibold text-sand">
              Hourly rate
            </label>
            <input
              id="edit-hourly-rate"
              type="number"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(event.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              placeholder="25.00"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <label className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Account enabled</p>
                <p className="mt-1 text-sm text-sand/65">
                  Disabled users cannot sign in. {isSelf ? "Your own account cannot be disabled here." : ""}
                </p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={isSelf}
                className="mt-1 h-5 w-5 rounded border-white/20 bg-white/5"
              />
            </label>
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handlePasswordLink}
              disabled={isSendingLink}
              className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSendingLink ? "Sending link..." : "Send password link"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-sand/80 transition hover:border-white/30 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

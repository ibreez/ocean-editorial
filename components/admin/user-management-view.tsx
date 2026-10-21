"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  UserX,
  History,
  Lock,
} from "lucide-react";
import type { EditorialUser, EditorialRole } from "@/types/cms";
import type { AuditEvent } from "@/lib/cms/audit";
import { updateUserRoleAction, toggleUserStatusAction } from "@/app/admin/actions";
import { formatDhivehiDateTime } from "@/lib/format-date";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface UserManagementViewProps {
  currentUser: EditorialUser;
  initialUsers: EditorialUser[];
  initialAuditLogs: AuditEvent[];
}

const ROLE_CONFIG: Record<
  EditorialRole,
  { label: string; en: string; badgeClass: string; desc: string }
> = {
  admin: {
    label: "އެޑްމިނިސްޓްރޭޓަރ",
    en: "Administrator",
    badgeClass: "bg-[#0F766E] text-white",
    desc: "ހުރިހާ އެޑިޓޯރިއަލް އޮޕަރޭޝަންތަކާއި ޔޫޒަރ މެނޭޖްމަންޓް",
  },
  editor: {
    label: "އެޑިޓަރ",
    en: "Editor",
    badgeClass: "bg-[#155E9A] text-white",
    desc: "ޚަބަރު ރިވިއުކުރުމާއި ޝާއިޢުކުރުން އަދި ބްރޭކިންގ ނިއުސް",
  },
  journalist: {
    label: "ނޫސްވެރިޔާ",
    en: "Journalist",
    badgeClass: "bg-[#53635F] text-white",
    desc: "ޑްރާފްޓް ލިޔުމާއި އެޑިޓަރުންގެ ރިވިއުއަށް ފޮނުވުން",
  },
};

export function UserManagementView({
  currentUser,
  initialUsers,
  initialAuditLogs,
}: UserManagementViewProps) {
  const [users, setUsers] = React.useState<EditorialUser[]>(initialUsers);
  const [auditLogs, setAuditLogs] = React.useState<AuditEvent[]>(initialAuditLogs);
  const [activeTab, setActiveTab] = React.useState<"users" | "audit">("users");

  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Handle Role Change
  const handleRoleChange = async (targetUserId: string, newRole: EditorialRole) => {
    setUpdatingUserId(targetUserId);
    setFeedback(null);

    try {
      const res = await updateUserRoleAction(targetUserId, newRole);
      if (res.success && res.data) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUserId ? res.data! : u))
        );
        setFeedback({ success: true, message: res.message });
      } else {
        setFeedback({ success: false, message: res.message });
      }
    } catch (err: unknown) {
      setFeedback({
        success: false,
        message: err instanceof Error ? err.message : "ރޯލް ބަދަލުކުރުމުގައި މައްސަލައެއް ދިމާވެއްޖެ.",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Handle Status Toggle (Active / Deactivated)
  const handleToggleStatus = async (targetUserId: string, currentStatus: boolean) => {
    setUpdatingUserId(targetUserId);
    setFeedback(null);

    const newStatus = !currentStatus;
    try {
      const res = await toggleUserStatusAction(targetUserId, newStatus);
      if (res.success && res.data) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUserId ? res.data! : u))
        );
        setFeedback({ success: true, message: res.message });
      } else {
        setFeedback({ success: false, message: res.message });
      }
    } catch (err: unknown) {
      setFeedback({
        success: false,
        message: err instanceof Error ? err.message : "ސްޓޭޓަސް ބަދަލުކުރުމުގައި މައްސަލައެއް ދިމާވެއްޖެ.",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 font-thaana text-right">
      {/* Breadcrumb */}
      <nav aria-label="އެޑްމިން ބްރެޑްކްރަމްބް" className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] mb-6">
        <Link href="/admin" className="hover:underline">
          އެޑިޓޯރިއަލް ޑޭޝްބޯޑް
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-[#AAB9B2] rtl:rotate-0" aria-hidden="true" />
        <span className="text-[#182624]">ޔޫޒަރުންނާއި ސެކިއުރިޓީ ރޯލްތައް</span>
      </nav>

      {/* Header */}
      <div className="pb-6 border-b border-[#DCE4DF] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#123B3A]">
            އެޑިޓޯރިއަލް ސްޓާފް އަދި ރޯލް މެނޭޖްމަންޓް
          </h1>
          <p className="text-xs sm:text-sm text-[#53635F] mt-1 font-sans">
            Editorial Staff Access Control, Role Assignments & Security Audit Trail
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#EDF2EF] p-1 rounded-[8px] border border-[#DCE4DF]">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={cn(
              "px-3.5 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer min-h-[36px]",
              activeTab === "users"
                ? "bg-white text-[#123B3A] shadow-xs"
                : "text-[#53635F] hover:text-[#182624]"
            )}
          >
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              <span>ޔޫޒަރުން ({users.length})</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={cn(
              "px-3.5 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer min-h-[36px]",
              activeTab === "audit"
                ? "bg-white text-[#123B3A] shadow-xs"
                : "text-[#53635F] hover:text-[#182624]"
            )}
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" aria-hidden="true" />
              <span>އޮޑިޓް ލޮގް ({auditLogs.length})</span>
            </span>
          </button>
        </div>
      </div>

      {/* Security Architecture & Privilege Escalation Guard Banner */}
      <div className="p-4 rounded-[10px] bg-[#EDF2EF] border border-[#DCE4DF] mb-6 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-[#53635F] leading-relaxed">
          <p className="font-bold text-[#182624] mb-1">
            ޕްރިވިލެޖް އެސްކަލޭޝަން ރައްކާތެރިކަން (Privilege Escalation Protection)
          </p>
          <p>
            އެޑްމިނިސްޓްރޭޓަރުންނަށް އަމިއްލަ އެކައުންޓުގެ ރޯލް ދަށްކުރުމާއި، އަމިއްލަ އެކައުންޓް ބަންދުކުރުން ވަނީ ސަރވަރ-ސައިޑުން ހިފެހެއްޓިފައެވެ. ކޮންމެ ރޯލް ބަދަލުވުމެއް އޮޓޮމެޓިކުން ސެކިއުރިޓީ އޮޑިޓް ލޮގުގައި ރެކޯޑުކުރެވެއެވެ.
          </p>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          role="status"
          className={cn(
            "p-4 rounded-[10px] mb-6 text-xs sm:text-sm font-semibold flex items-start gap-3 border shadow-xs animate-in fade-in duration-200",
            feedback.success
              ? "bg-[#E3FCEF] border-[#ABF5D1] text-[#216E4E]"
              : "bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]"
          )}
        >
          {feedback.success ? (
            <CheckCircle2 className="w-5 h-5 text-[#216E4E] shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#B42318] shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="leading-relaxed">
            <p className="font-bold">{feedback.success ? "ކާމިޔާބުވި!" : "ސަމާލުކަމަށް:"}</p>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Tab 1: Editorial Users List */}
      {activeTab === "users" && (
        <div className="bg-white rounded-[10px] border border-[#DCE4DF] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#DCE4DF] bg-[#F7F7F2]/40 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#123B3A]">
              އެޑިޓޯރިއަލް އެކައުންޓުތައް ({users.length})
            </h2>
            <span className="text-xs text-[#53635F]">
              Logged in as: <strong className="text-[#123B3A]">{currentUser.name}</strong> (Admin)
            </span>
          </div>

          <div className="divide-y divide-[#DCE4DF]">
            {users.map((user) => {
              const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.journalist;
              const isSelf = user.id === currentUser.id;
              const isUpdating = updatingUserId === user.id;

              return (
                <div
                  key={user.id}
                  className={cn(
                    "p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors",
                    !user.isActive && "bg-[#F7F7F2]/60 opacity-75"
                  )}
                >
                  {/* Left: User Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold",
                          roleConfig.badgeClass
                        )}
                      >
                        {roleConfig.label}
                      </span>

                      {user.isActive ? (
                        <span className="px-2 py-0.5 rounded-[4px] bg-[#E3FCEF] text-[#216E4E] text-[10px] font-bold border border-[#ABF5D1]">
                          އެކްޓިވް
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-[4px] bg-[#FEF3F2] text-[#B42318] text-[10px] font-bold border border-[#FECDCA]">
                          ބަންދުކުރެވިފައި
                        </span>
                      )}

                      {isSelf && (
                        <span className="px-2 py-0.5 rounded-[4px] bg-[#EDF2EF] text-[#123B3A] text-[10px] font-bold border border-[#DCE4DF]">
                          ތިޔަބޭފުޅާ (You)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#182624]">
                      {user.dhivehiName || user.name}
                      {user.dhivehiName && (
                        <span className="text-xs text-[#687671] font-sans font-normal mr-2">
                          ({user.name})
                        </span>
                      )}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-[#687671]">
                      <span className="font-sans dir-ltr text-right text-[11px]">
                        {user.email}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[11px] text-[#53635F]">
                        {roleConfig.desc}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 md:pt-0">
                    {/* Role Selector */}
                    <div className="flex items-center gap-1.5">
                      <label htmlFor={`role-${user.id}`} className="text-xs font-bold text-[#687671]">
                        ރޯލް:
                      </label>
                      <select
                        id={`role-${user.id}`}
                        disabled={isUpdating || (isSelf && user.role === "admin")}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as EditorialRole)}
                        className="px-2.5 py-1.5 rounded-[6px] bg-[#F7F7F2] border border-[#DCE4DF] text-xs font-bold text-[#182624] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] disabled:opacity-50 min-h-[36px]"
                        title={isSelf ? "އަމިއްލަ އެކައުންޓުގެ ރޯލް ދަށެއް ނުކުރެވޭނެ" : "ރޯލް ބަދަލުކުރައްވާ"}
                      >
                        <option value="admin">އެޑްމިނިސްޓްރޭޓަރ</option>
                        <option value="editor">އެޑިޓަރ</option>
                        <option value="journalist">ނޫސްވެރިޔާ</option>
                      </select>
                    </div>

                    {/* Active/Deactivate Toggle */}
                    <button
                      type="button"
                      disabled={isUpdating || isSelf}
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      className={cn(
                        "px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all inline-flex items-center gap-1.5 min-h-[36px] disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]",
                        user.isActive
                          ? "bg-[#FEF3F2] text-[#B42318] hover:bg-[#FECDCA]/60 border border-[#FECDCA]"
                          : "bg-[#E3FCEF] text-[#216E4E] hover:bg-[#ABF5D1]/60 border border-[#ABF5D1]"
                      )}
                      title={isSelf ? "އަމިއްލަ އެކައުންޓް ބަންދެއް ނުކުރެވޭނެ" : undefined}
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>ބަންދުކުރައްވާ</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>އެކްޓިވޭޓް</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Security & Audit Trail */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-[10px] border border-[#DCE4DF] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#DCE4DF] bg-[#F7F7F2]/40 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#123B3A]">
                ސެކިއުރިޓީ އަދި އެޑިޓޯރިއަލް އޮޑިޓް ލޮގް
              </h2>
              <p className="text-xs text-[#53635F] mt-0.5 font-sans">
                Immutable security event history (Zero-credential logging)
              </p>
            </div>
            <span className="text-xs font-mono text-[#687671] tabular-nums">
              {auditLogs.length} Events
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#687671]">
              އެއްވެސް އޮޑިޓް އިވެންޓެއް ރެކޯޑުކުރެވިފައެއް ނެތެވެ.
            </div>
          ) : (
            <div className="divide-y divide-[#DCE4DF]">
              {auditLogs.map((log) => {
                const isSuccess = log.outcome === "SUCCESS";
                const isDenied = log.outcome === "DENIED";

                return (
                  <div key={log.id} className="p-4 hover:bg-[#F7F7F2]/60 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {/* Outcome Badge */}
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-[4px] text-[10px] font-bold font-mono",
                            isSuccess
                              ? "bg-[#E3FCEF] text-[#216E4E] border border-[#ABF5D1]"
                              : isDenied
                              ? "bg-[#FFF9E6] text-[#8A5700] border border-[#FFE082]"
                              : "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]"
                          )}
                        >
                          {log.outcome}
                        </span>

                        {/* Event Type */}
                        <span className="text-xs font-bold font-mono text-[#123B3A]">
                          {log.eventType}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <span className="text-[11px] font-mono text-[#687671] flex items-center gap-1 tabular-nums dir-ltr">
                        <Clock className="w-3 h-3 text-[#AAB9B2]" aria-hidden="true" />
                        <span>{formatDhivehiDateTime(log.timestamp)}</span>
                      </span>
                    </div>

                    <div className="text-xs text-[#182624] font-sans">
                      <span className="font-semibold text-[#0F766E]">{log.action}</span>
                      {log.userEmail && (
                        <span className="text-[#53635F] mr-2">
                          by <strong className="text-[#182624]">{log.userEmail}</strong>
                          {log.userRole && <span> ({log.userRole})</span>}
                        </span>
                      )}
                      {log.targetId && (
                        <span className="text-[#53635F] mr-2">
                          [target: <span className="font-mono">{log.targetId}</span>]
                        </span>
                      )}
                    </div>

                    {/* Details if present */}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-1 text-[11px] text-[#687671] font-mono dir-ltr bg-[#F7F7F2] p-1.5 rounded-[4px]">
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  ShieldCheck,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { signInAction, signInWithOidcAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [authMode, setAuthMode] = React.useState<"email" | "oidc">("email");
  const [email, setEmail] = React.useState("admin@oceaneditorial.mv");
  const [oidcToken, setOidcToken] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const sampleAccounts = [
    {
      role: "admin",
      label: "އެޑްމިނިސްޓްރޭޓަރ (Admin)",
      email: "admin@oceaneditorial.mv",
      name: "އަޙްމަދު ރިޟްވާން",
      desc: "ފުރިހަމަ އެޑްމިން ހުއްދަތަކާއި ޔޫޒަރ މެނޭޖްމަންޓް",
    },
    {
      role: "editor",
      label: "އެޑިޓަރ (Editor)",
      email: "editor@oceaneditorial.mv",
      name: "މަރިޔަމް ޝަފީޤާ",
      desc: "ޚަބަރު ރިވިއުކުރުމާއި ޝާއިޢުކުރުން އަދި ބްރޭކިންގ ނިއުސް",
    },
    {
      role: "journalist",
      label: "ނޫސްވެރިޔާ (Journalist)",
      email: "journalist@oceaneditorial.mv",
      name: "ޢަލީ ޒާހިރު",
      desc: "ޑްރާފްޓް ލިޔުމާއި އެޑިޓަރުންގެ ރިވިއުއަށް ފޮނުވުން (ޝާއިޢުނުކުރެވޭ)",
    },
  ];

  const handleSignIn = async (targetEmail: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await signInAction(targetEmail);
      if (res.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "ލޮގިންވުމުގައި މައްސަލައެއް ދިމާވެއްޖެ.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOidcSignIn = async (token: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await signInWithOidcAction(token);
      if (res.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "SSO ލޮގިންވުމުގައި މައްސަލައެއް ދިމާވެއްޖެ.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "email") {
      if (!email.trim()) return;
      handleSignIn(email.trim());
    } else {
      if (!oidcToken.trim()) return;
      handleOidcSignIn(oidcToken.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white rounded-[12px] border border-[#DCE4DF] shadow-card text-right font-thaana">
      {/* Brand & Title */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-[10px] bg-[#123B3A] text-white mx-auto flex items-center justify-center font-bold text-lg mb-3 shadow-xs">
          OE
        </div>
        <h1 className="text-2xl font-black text-[#123B3A]">
          އެޑިޓޯރިއަލް ލޮގިން
        </h1>
        <p className="text-xs text-[#53635F] mt-1 font-sans">
          Ocean Editorial Newsroom Staff Sign-In
        </p>
      </div>

      {/* Security Architecture Notice */}
      <div className="p-3.5 bg-[#EDF2EF] rounded-[8px] border border-[#DCE4DF] mb-6 flex items-start gap-2.5 text-xs text-[#53635F] leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-bold text-[#123B3A] mb-0.5">ސަރވަރ-ސައިޑް އޮތެންޓިކޭޝަން</p>
          <p>
            ސެޝަން ރައްކާތެރިކުރެވިފައިވަނީ <span className="font-mono text-[11px] font-bold">HTTP-Only SameSite</span> ސައިންޑް ކުކީސް މެދުވެރިކޮށެވެ. ޕްރޮޑަކްޝަންގައި ސެކިއުރިޓީ އައިޑެންޓިޓީ ޕްރޮވައިޑަރ އެއް ނެތްނަމަ ސިސްޓަމް އޮޓޮމެޓިކުން ފެއިލް-ކްލޯޒްޑް (Fail-Closed) ވާނެއެވެ.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="p-3 rounded-[8px] bg-[#FEF3F2] border border-[#FECDCA] text-xs font-bold text-[#B42318] mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Auth Mode Tabs */}
      <div className="flex rounded-[8px] bg-[#F0F4F2] p-1 mb-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => { setAuthMode("email"); setErrorMsg(null); }}
          className={cn(
            "flex-1 py-1.5 rounded-[6px] text-center transition-colors cursor-pointer",
            authMode === "email" ? "bg-white text-[#123B3A] shadow-xs" : "text-[#53635F] hover:text-[#123B3A]"
          )}
        >
          ސްޓޭޖިންގ އީމެއިލް
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode("oidc"); setErrorMsg(null); }}
          className={cn(
            "flex-1 py-1.5 rounded-[6px] text-center transition-colors cursor-pointer",
            authMode === "oidc" ? "bg-white text-[#123B3A] shadow-xs" : "text-[#53635F] hover:text-[#123B3A]"
          )}
        >
          OIDC / SSO ޓޯކަން
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {authMode === "email" ? (
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-[#182624] mb-1.5">
              އެޑިޓޯރިއަލް އީމެއިލް އެޑްރެސް:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#687671] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="journalist@oceaneditorial.mv"
                className="w-full pl-3.5 pr-9 py-2.5 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] text-xs sm:text-sm font-sans text-[#182624] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] dir-ltr text-left"
              />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="login-oidc" className="block text-xs font-bold text-[#182624] mb-1.5">
              OIDC ID Token (JWT):
            </label>
            <textarea
              id="login-oidc"
              required
              rows={3}
              value={oidcToken}
              onChange={(e) => setOidcToken(e.target.value)}
              placeholder="eyJhbGciOiJSUzI1NiIsImtpZCI6..."
              className="w-full p-2.5 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] text-xs font-mono text-[#182624] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] dir-ltr text-left"
            />
            <p className="text-[11px] text-[#687671] mt-1 font-sans">
              Enter verified token issued by Google Workspace / Okta / Azure AD provider.
            </p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full py-2.5 rounded-[8px] bg-[#123B3A] hover:bg-[#0F766E] text-white font-bold text-sm min-h-[44px]"
        >
          <KeyRound className="w-4 h-4" />
          <span>{authMode === "email" ? "ލޮގިންވެވަޑައިގަންނަވާ" : "SSO މެދުވެރިކޮށް ލޮގިންވުން"}</span>
        </Button>
      </form>

      {/* Authorized Newsroom Test Accounts Selector (Staging Mode Only) */}
      <div className="mt-8 pt-6 border-t border-[#DCE4DF]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#FFF9E6] text-[#8A5700] border border-[#FFE082]">
            Staging Simulation
          </span>
          <p className="text-xs font-bold text-[#687671]">
            ޚާއްޞަ ޓެސްޓް އެކައުންޓުތައް:
          </p>
        </div>

        <div className="space-y-2">
          {sampleAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setEmail(acc.email);
                handleSignIn(acc.email);
              }}
              className="w-full p-2.5 rounded-[8px] border border-[#DCE4DF] hover:border-[#0F766E] hover:bg-[#F7F7F2] transition-colors text-right flex items-center justify-between group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
            >
              <div className="text-[11px] text-[#0F766E] font-bold group-hover:underline">
                ލޮގިން &larr;
              </div>

              <div>
                <div className="text-xs font-bold text-[#182624]">
                  {acc.name} <span className="text-[11px] text-[#687671]">({acc.label})</span>
                </div>
                <div className="text-[11px] text-[#687671] font-sans dir-ltr text-right">
                  {acc.email}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

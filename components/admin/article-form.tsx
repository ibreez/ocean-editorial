"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import type { CmsArticle, CmsArticleStatus, CmsCategory, CmsAuthor } from "@/types/cms";
import { WORKFLOW_TRANSITIONS, canTransitionWorkflow } from "@/types/cms";
import { saveArticleDraftAction, checkSlugAvailabilityAction } from "@/app/admin/actions";
import { isValidSlug } from "@/lib/input-validation";
import { cn } from "@/lib/utils";

import type { EditorialUser } from "@/types/cms";
import { canUserEditArticle } from "@/lib/cms/permissions";

export interface ArticleFormProps {
  currentUser?: EditorialUser | null;
  initialArticle?: CmsArticle | null;
  categories: CmsCategory[];
  authors: CmsAuthor[];
}

export function ArticleForm({
  currentUser,
  initialArticle,
  categories,
  authors,
}: ArticleFormProps) {
  const router = useRouter();

  const isEditing = Boolean(initialArticle);
  const canEdit = !isEditing || (currentUser && initialArticle ? canUserEditArticle(currentUser, initialArticle) : true);

  // Form State
  const [title, setTitle] = React.useState(initialArticle?.title || "");
  const [englishTitle, setEnglishTitle] = React.useState(initialArticle?.englishTitle || "");
  const [slug, setSlug] = React.useState(initialArticle?.slug || "");
  const [summary, setSummary] = React.useState(initialArticle?.summary || "");
  const [categorySlug, setCategorySlug] = React.useState(
    initialArticle?.categorySlug || categories[0]?.slug || ""
  );
  const [authorSlug, setAuthorSlug] = React.useState(
    initialArticle?.author.slug || authors[0]?.slug || ""
  );
  const [status, setStatus] = React.useState<CmsArticleStatus>(
    initialArticle?.status || "draft"
  );
  const [featured, setFeatured] = React.useState(Boolean(initialArticle?.featured));
  const [breaking, setBreaking] = React.useState(Boolean(initialArticle?.breaking));

  // Extract body paragraphs
  const initialBodyText = React.useMemo(() => {
    if (!initialArticle?.body) return "";
    return initialArticle.body
      .filter((b) => b.type === "paragraph")
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n\n");
  }, [initialArticle]);

  const [bodyText, setBodyText] = React.useState(initialBodyText);

  // Live Slug Uniqueness & Validation State
  const [slugStatus, setSlugStatus] = React.useState<{
    checking: boolean;
    valid: boolean | null;
    available: boolean | null;
    message?: string;
  }>({ checking: false, valid: null, available: null });

  // Submission State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverFeedback, setServerFeedback] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Auto-generate slug from English title if empty
  const handleGenerateSlug = () => {
    const source = englishTitle || title;
    const generated = source
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80);
    setSlug(generated);
  };

  // Live check slug availability when changed
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (!slug) {
        setSlugStatus({ checking: false, valid: null, available: null });
        return;
      }

      if (!isValidSlug(slug)) {
        setSlugStatus({
          checking: false,
          valid: false,
          available: false,
          message: "ސްލަގްގައި ހިމެނޭނީ ހަމައެކަނި އިނގިރޭސި އަކުރާއި، ނަންބަރާއި، ހައިފަން (-) އެކަންޏެވެ.",
        });
        return;
      }

      setSlugStatus((prev) => ({ ...prev, checking: true }));
      try {
        const res = await checkSlugAvailabilityAction(slug, initialArticle?.id);
        setSlugStatus({
          checking: false,
          valid: res.isValid,
          available: res.isAvailable,
          message: res.isAvailable
            ? "މި ސްލަގް ބޭނުންކުރެވިދާނެ (Available)"
            : "މި ސްލަގް މިހާރުވެސް އެހެން ޚަބަރެއްގައި ބޭނުންކުރެވިފައިވެއެވެ.",
        });
      } catch {
        setSlugStatus({ checking: false, valid: true, available: null });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [slug, initialArticle?.id]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerFeedback(null);

    const formData = new FormData();
    if (initialArticle?.id) {
      formData.append("articleId", initialArticle.id);
    }
    formData.append("title", title);
    formData.append("englishTitle", englishTitle);
    formData.append("slug", slug);
    formData.append("summary", summary);
    formData.append("categorySlug", categorySlug);
    formData.append("authorSlug", authorSlug);
    formData.append("status", status);
    formData.append("bodyText", bodyText);
    if (featured) formData.append("featured", "true");
    if (breaking) formData.append("breaking", "true");

    try {
      const result = await saveArticleDraftAction(formData);
      setServerFeedback({
        success: result.success,
        message: result.message,
      });
    } catch (err: unknown) {
      setServerFeedback({
        success: false,
        message: err instanceof Error ? err.message : "ސަރވަރ އޮޕަރޭޝަން ފެއިލްވެއްޖެ.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb & Navigation */}
      <nav aria-label="އެޑްމިން ބްރެޑްކްރަމްބް" className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] mb-6">
        <Link href="/admin" className="hover:underline">
          އެޑިޓޯރިއަލް ޑޭޝްބޯޑް
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-[#AAB9B2] rtl:rotate-0" aria-hidden="true" />
        <span className="text-[#182624]">
          {isEditing ? "ޚަބަރު އިޞްލާޙްކުރުން" : "އައު ޚަބަރެއް ލިޔުއްވުން"}
        </span>
      </nav>

      {/* Page Title & Status Header */}
      <div className="pb-6 border-b border-[#DCE4DF] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#123B3A]">
            {isEditing ? "ޚަބަރު އިޞްލާޙްކުރައްވާ" : "އައު ޚަބަރެއް ލިޔުއްވާ (Draft)"}
          </h1>
          <p className="text-xs sm:text-sm text-[#53635F] mt-1 font-sans">
            {isEditing ? `Editing CMS Article: ${initialArticle?.slug}` : "Create a new editorial draft"}
          </p>
        </div>

        {isEditing && (
          <div className="px-3 py-1.5 rounded-[6px] bg-[#EDF2EF] border border-[#DCE4DF] text-xs font-bold text-[#182624]">
            ޙާލަތު: <span className="text-[#0F766E]">{status}</span>
          </div>
        )}
      </div>

      {/* Security & Active Session Banner */}
      <div className="p-4 rounded-[10px] bg-[#EDF2EF] border border-[#DCE4DF] mb-6 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-[#53635F] leading-relaxed">
          <p className="font-bold text-[#182624] mb-1">
            ސަރވަރ-ސައިޑް އެޑިޓޯރިއަލް އޮތެންޓިކޭޝަން އަދި RBAC އެކްޓިވް
          </p>
          <p>
            ލޮގިންވެފައިވަނީ: <span className="font-bold text-[#123B3A]">{currentUser?.dhivehiName || currentUser?.name}</span> ({currentUser?.role}) ގޮތުގައެވެ. ކޮންމެ ބަދަލެއް ސޭވްކުރުމުގެ ކުރިން ސަރވަރ-ސައިޑް ހުއްދަތައް ޔަޤީންކޮށް، ސެކިއުރިޓީ އޮޑިޓް ލޮގުގައި ރެކޯޑުކުރެވޭނެއެވެ.
          </p>
        </div>
      </div>

      {!canEdit && (
        <div className="p-4 rounded-[10px] bg-[#FFF9E6] border border-[#FFE082] mb-6 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#8A5700] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-[#8A5700] leading-relaxed">
            <p className="font-bold mb-1">
              ހަމައެކަނި ބައްލަވާލެއްވުމަށް (Read-Only Mode)
            </p>
            <p>
              މި ޚަބަރަކީ ޝާއިޢުކުރެވިފައިވާ ނުވަތަ އެހެން ނޫސްވެރިއެއްގެ ޚަބަރަކަށް ވާތީ، މި ޚަބަރަށް ބަދަލު ގެނައުމުގެ ހުއްދައެއް ނޫސްވެރިޔާއަކަށް ނޯންނާނެއެވެ. ބަދަލު ގެނެވޭނީ އެޑިޓަރުންނަށާއި އެޑްމިނިސްޓްރޭޓަރުންނަށެވެ.
            </p>
          </div>
        </div>
      )}

      {/* Server Action Feedback Message */}
      {serverFeedback && (
        <div
          role="status"
          className={cn(
            "p-4 rounded-[10px] mb-6 text-xs sm:text-sm font-semibold flex items-start gap-3 border shadow-xs animate-in fade-in duration-200",
            serverFeedback.success
              ? "bg-[#E3FCEF] border-[#ABF5D1] text-[#216E4E]"
              : "bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]"
          )}
        >
          {serverFeedback.success ? (
            <CheckCircle2 className="w-5 h-5 text-[#216E4E] shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#B42318] shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="leading-relaxed">
            <p className="font-bold">
              {serverFeedback.success ? "ކާމިޔާބުވި!" : "ސަމާލުކަމަށް:"}
            </p>
            <p>{serverFeedback.message}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Dhivehi Title */}
        <div className="bg-white p-5 sm:p-6 rounded-[10px] border border-[#DCE4DF] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#123B3A] pb-2 border-b border-[#DCE4DF]">
            ޚަބަރުގެ މައިގަނޑު މަޢުލޫމާތު
          </h2>

          <div>
            <label htmlFor="article-title" className="block text-xs font-bold text-[#182624] mb-1.5">
              ޚަބަރުގެ ސުރުޚީ (Dhivehi Headline) <span className="text-[#D94343]">*</span>
            </label>
            <input
              id="article-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ދިވެހި ސުރުޚީ ލިޔުއްވާ..."
              className="w-full px-3.5 py-2.5 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] text-sm text-[#182624] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] font-thaana"
            />
          </div>

          {/* 2. English Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="article-eng-title" className="block text-xs font-bold text-[#182624] mb-1.5">
                އިނގިރޭސި ސުރުޚީ (English Headline - Optional)
              </label>
              <input
                id="article-eng-title"
                type="text"
                value={englishTitle}
                onChange={(e) => setEnglishTitle(e.target.value)}
                placeholder="English headline for international SEO..."
                className="w-full px-3.5 py-2 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] text-xs sm:text-sm text-[#182624] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="article-slug" className="text-xs font-bold text-[#182624]">
                  ސްލަގް URL Slug <span className="text-[#D94343]">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="text-[11px] text-[#0F766E] hover:underline font-sans cursor-pointer"
                >
                  Auto-generate
                </button>
              </div>
              <input
                id="article-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="maldives-renewable-energy..."
                className="w-full px-3.5 py-2 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] text-xs font-mono text-[#182624] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] dir-ltr"
              />
              {slugStatus.message && (
                <p
                  className={cn(
                    "text-[11px] mt-1 font-medium",
                    slugStatus.available
                      ? "text-[#216E4E]"
                      : slugStatus.valid === false || slugStatus.available === false
                      ? "text-[#B42318]"
                      : "text-[#687671]"
                  )}
                >
                  {slugStatus.message}
                </p>
              )}
            </div>
          </div>

          {/* 3. Summary / Standfirst */}
          <div className="pt-2">
            <label htmlFor="article-summary" className="block text-xs font-bold text-[#182624] mb-1.5">
              ޚުލާޞާ / ސްޓޭންޑްފަރސްޓް (Summary) <span className="text-[#D94343]">*</span>
            </label>
            <textarea
              id="article-summary"
              required
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="ޚަބަރުގެ މައިގަނޑު ޚުލާޞާ ލިޔުއްވާ..."
              className="w-full px-3.5 py-2.5 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] text-xs sm:text-sm text-[#182624] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] font-thaana leading-relaxed"
            />
          </div>
        </div>

        {/* 2. Taxonomy & Metadata */}
        <div className="bg-white p-5 sm:p-6 rounded-[10px] border border-[#DCE4DF] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#123B3A] pb-2 border-b border-[#DCE4DF]">
            ބަޔާއި ލިޔުންތެރިޔާ (Taxonomy & Author)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Select */}
            <div>
              <label htmlFor="article-category" className="block text-xs font-bold text-[#182624] mb-1.5">
                ޚަބަރުގެ ބައި (Category) <span className="text-[#D94343]">*</span>
              </label>
              <select
                id="article-category"
                required
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] text-xs sm:text-sm text-[#182624] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] min-h-[40px]"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.englishName})
                  </option>
                ))}
              </select>
            </div>

            {/* Author Select */}
            <div>
              <label htmlFor="article-author" className="block text-xs font-bold text-[#182624] mb-1.5">
                ލިޔުންތެރިޔާ (Author / Byline) <span className="text-[#D94343]">*</span>
              </label>
              <select
                id="article-author"
                required
                value={authorSlug}
                onChange={(e) => setAuthorSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] text-xs sm:text-sm text-[#182624] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] min-h-[40px]"
              >
                {authors.map((au) => (
                  <option key={au.slug} value={au.slug}>
                    {au.name} ({au.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Workflow Status Selector */}
            <div>
              <label htmlFor="article-status" className="block text-xs font-bold text-[#182624] mb-1.5">
                އެޑިޓޯރިއަލް ޙާލަތު (Workflow Status) <span className="text-[#D94343]">*</span>
              </label>
              <select
                id="article-status"
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as CmsArticleStatus)}
                className="w-full px-3 py-2 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] text-xs sm:text-sm text-[#182624] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] min-h-[40px]"
              >
                <option value="draft">ޑްރާފްޓް (Draft)</option>
                <option value="in_review">ރިވިއުގައި (In Review)</option>
                {currentUser?.role !== "journalist" && (
                  <>
                    <option value="scheduled">ޝެޑިއުލްޑް (Scheduled)</option>
                    <option value="published">ޝާއިޢުކުރެވިފައި (Published)</option>
                    <option value="archived">އާކައިވް (Archived)</option>
                  </>
                )}
              </select>
              {currentUser?.role === "journalist" && (
                <p className="text-[11px] text-[#53635F] mt-1">
                  ނޫސްވެރިންނަށް ޚަބަރު ސީދާ ޝާއިޢެއް ނުކުރެވޭނެއެވެ. އެޑިޓަރ ރިވިއުއަށް ފޮނުއްވާށެވެ.
                </p>
              )}
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[#DCE4DF]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                disabled={currentUser?.role === "journalist"}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E] disabled:opacity-50"
              />
              <span className="text-xs font-bold text-[#182624]">
                މައި ޚަބަރު / ފީޗަރޑް (Featured)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={breaking}
                disabled={currentUser?.role === "journalist"}
                onChange={(e) => setBreaking(e.target.checked)}
                className="w-4 h-4 rounded text-[#D94343] focus:ring-[#D94343] disabled:opacity-50"
              />
              <span className="text-xs font-bold text-[#182624]">
                ބްރޭކިންގ ނިއުސް (Breaking News)
                {currentUser?.role === "journalist" && (
                  <span className="text-[11px] text-[#687671] block font-normal">
                    (ބްރޭކިންގ ނިއުސް ޖެއްސޭނީ އެޑިޓަރުންނަށް)
                  </span>
                )}
              </span>
            </label>
          </div>
        </div>

        {/* 3. Body Content Paragraphs */}
        <div className="bg-white p-5 sm:p-6 rounded-[10px] border border-[#DCE4DF] shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-[#123B3A] pb-2 border-b border-[#DCE4DF]">
            ޚަބަރުގެ މައިގަނޑު ލިޔުން (Article Body)
          </h2>

          <p className="text-xs text-[#53635F]">
            ޕެރެގްރާފްތައް ވަކިކުރުމަށް ދެ ފަހަރު އެންޓަރ (Enter) އަށް ފިއްތަވާށެވެ.
          </p>

          <textarea
            rows={10}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="ޚަބަރުގެ މައިގަނޑު ލިޔުން މިތަނުގައި ލިޔުއްވާ..."
            className="w-full px-4 py-3 rounded-[8px] bg-[#F7F7F2] border border-[#DCE4DF] text-sm text-[#182624] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] font-thaana leading-loose"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between gap-4 pt-4">
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-[8px] bg-[#EDF2EF] hover:bg-[#DCE4DF] text-xs sm:text-sm font-bold text-[#182624] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] min-h-[44px] inline-flex items-center"
          >
            އަނބުރާ ޑޭޝްބޯޑަށް
          </Link>

          {canEdit ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-[8px] bg-[#123B3A] hover:bg-[#0F766E] text-white text-xs sm:text-sm font-bold transition-all shadow-xs inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] min-h-[44px] cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-white" aria-hidden="true" />
              <span>{isSubmitting ? "ސޭވްކުރެވެނީ..." : "ޑްރާފްޓް ސޭވްކުރައްވާ (Save Draft)"}</span>
            </button>
          ) : (
            <div className="text-xs font-bold text-[#8A5700] bg-[#FFF9E6] px-4 py-2.5 rounded-[8px] border border-[#FFE082]">
              އިޞްލާޙްކުރުމުގެ ހުއްދައެއް ނެތް (Locked)
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

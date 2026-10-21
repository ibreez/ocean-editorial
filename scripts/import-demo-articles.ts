/**
 * CLI Migration Script: Import Demo Articles into Ocean Editorial CMS
 *
 * Usage:
 *   npx tsx scripts/import-demo-articles.ts --dry-run                 (Default: reports plan without changes)
 *   npx tsx scripts/import-demo-articles.ts --execute                 (Imports into active repository)
 *   npx tsx scripts/import-demo-articles.ts --execute --target=postgres (Targets managed PostgreSQL database)
 */

import { importDemoArticles } from "../lib/cms/importer";
import { isDatabaseConfigured, redactDatabaseUrl } from "../lib/cms/db";

async function main() {
  const args = process.argv.slice(2);
  const isExecute = args.includes("--execute");
  const isDryRun = !isExecute || args.includes("--dry-run");

  let targetOption: "postgres" | "memory" | "auto" = "auto";
  if (args.includes("--target=postgres")) targetOption = "postgres";
  if (args.includes("--target=memory")) targetOption = "memory";

  console.log("==================================================================");
  console.log("Ocean Editorial (ކަނޑު އެޑިޓޯރިއަލް) — Demo Content Importer");
  console.log(`Mode:           ${isDryRun ? "DRY RUN (Simulated)" : "EXECUTE (Live Migration)"}`);
  console.log(`Database State: ${isDatabaseConfigured() ? "Configured (" + redactDatabaseUrl(process.env.DATABASE_URL) + ")" : "Unset (Staging in-memory mode)"}`);
  console.log(`Target:         ${targetOption.toUpperCase()}`);
  console.log("==================================================================\n");

  if (targetOption === "postgres" && !isDatabaseConfigured()) {
    console.error("[ABORT] Cannot target PostgreSQL: DATABASE_URL is not configured.");
    console.error("Please configure DATABASE_URL in your environment before running persistent imports.");
    process.exit(1);
  }

  const report = await importDemoArticles({
    dryRun: isDryRun,
    target: targetOption,
  });

  console.log(`Storage Engine:      ${report.storageEngine.toUpperCase()}`);
  console.log(`Total Inspected:     ${report.totalInspected}`);
  console.log(`Eligible to Import:  ${report.importedCount}`);
  console.log(`Skipped (Exists):    ${report.skippedCount}`);
  console.log(`Invalid:             ${report.invalidCount}\n`);

  console.log("Detailed Inspection List:");
  report.items.forEach((item, idx) => {
    const symbol = item.status === "imported" ? "✓" : item.status === "skipped" ? "⚠" : "✗";
    console.log(
      `  [${idx + 1}] ${symbol} [${item.status.toUpperCase()}] ${item.slug}`
    );
    console.log(`      Title: ${item.title}`);
    if (item.reason) {
      console.log(`      Reason: ${item.reason}`);
    }
  });

  console.log("\nEnforced Invariants:");
  report.notes.forEach((note) => console.log(`  • ${note}`));

  if (isDryRun) {
    console.log("\n[INFO] Dry run completed safely with 0 database modifications.");
    console.log("[INFO] To execute against a provisioned PostgreSQL instance, run: npx tsx scripts/import-demo-articles.ts --execute --target=postgres");
  } else {
    console.log(`\n[SUCCESS] Import execution completed against ${report.storageEngine.toUpperCase()} repository.`);
  }
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});

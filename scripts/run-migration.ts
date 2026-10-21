/**
 * Controlled Database Migration Runner for Ocean Editorial CMS
 *
 * Usage:
 *   npx tsx scripts/run-migration.ts --dry-run   (Statically validates SQL schema files)
 *   npx tsx scripts/run-migration.ts --execute   (Applies pending migrations to configured DATABASE_URL)
 */

import fs from "fs";
import path from "path";
import { isDatabaseConfigured, withTransaction, redactDatabaseUrl } from "../lib/cms/db";

interface MigrationFile {
  name: string;
  version: string;
  filePath: string;
  sql: string;
}

export function loadMigrationFiles(): MigrationFile[] {
  const migrationsDir = path.join(process.cwd(), "migrations");
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  return files.map((fileName) => {
    const filePath = path.join(migrationsDir, fileName);
    const sql = fs.readFileSync(filePath, "utf-8");
    const version = fileName.split("_")[0];
    return {
      name: fileName,
      version,
      filePath,
      sql,
    };
  });
}

/**
 * Strips comments from SQL before inspection so comments do not mask destructive statements
 * or trigger false positives.
 */
export function stripSqlComments(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove multi-line comments
    .replace(/--.*$/gm, ""); // remove single-line comments
}

/**
 * Pre-flight static verification of migration SQL files.
 * Catches accidental destructive commands and non-idempotent table definitions.
 */
export function staticallyValidateSql(sql: string, fileName: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const cleanSql = stripSqlComments(sql);

  // 1. Verify safe syntax: No destructive commands allowed in controlled migrations
  const dangerousPatterns = [
    { pattern: /\bDROP\s+DATABASE\b/i, label: "DROP DATABASE" },
    { pattern: /\bDROP\s+SCHEMA\b/i, label: "DROP SCHEMA" },
    { pattern: /\bDROP\s+TABLE\b/i, label: "DROP TABLE" },
    { pattern: /\bTRUNCATE\b/i, label: "TRUNCATE" },
    { pattern: /\bALTER\s+TABLE\s+[\s\S]*?\bDROP\s+COLUMN\b/i, label: "ALTER TABLE DROP COLUMN" },
  ];

  for (const { pattern, label } of dangerousPatterns) {
    if (pattern.test(cleanSql)) {
      errors.push(`Potentially destructive statement detected: "${label}" in ${fileName}.`);
    }
  }

  // 2. Verify table definitions have IF NOT EXISTS
  const createTableMatches = cleanSql.match(/CREATE\s+TABLE\s+(?!IF\s+NOT\s+EXISTS)/gi);
  if (createTableMatches && createTableMatches.length > 0) {
    errors.push(`Table creation without "IF NOT EXISTS" detected in ${fileName}.`);
  }

  // 3. Verify index definitions have IF NOT EXISTS
  const createIndexMatches = cleanSql.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?!IF\s+NOT\s+EXISTS)/gi);
  if (createIndexMatches && createIndexMatches.length > 0) {
    errors.push(`Index creation without "IF NOT EXISTS" detected in ${fileName}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

async function runMigrations() {
  const args = process.argv.slice(2);
  const isExecute = args.includes("--execute");
  const isDryRun = !isExecute || args.includes("--dry-run");

  console.log("==================================================================");
  console.log("Ocean Editorial (ކަނޑު އެޑިޓޯރިއަލް) — PostgreSQL Migration Runner");
  console.log(`Execution Mode: ${isDryRun ? "DRY-RUN (Static Inspection)" : "LIVE DATABASE EXECUTION"}`);
  console.log("==================================================================\n");

  const migrationFiles = loadMigrationFiles();
  if (migrationFiles.length === 0) {
    console.log("[WARN] No SQL migration files found in migrations/ directory.");
    return;
  }

  console.log(`Discovered ${migrationFiles.length} migration file(s):`);
  let hasStaticErrors = false;

  for (const file of migrationFiles) {
    const validation = staticallyValidateSql(file.sql, file.name);
    if (!validation.valid) {
      hasStaticErrors = true;
      console.error(`  ✗ [INVALID] ${file.name}:`);
      validation.errors.forEach((err) => console.error(`      • ${err}`));
    } else {
      console.log(`  ✓ [VALID] ${file.name} (version: ${file.version})`);
    }
  }

  if (hasStaticErrors) {
    console.error("\n[ERROR] Migration files failed static safety checks.");
    process.exit(1);
  }

  if (isDryRun) {
    console.log("\n[INFO] Static validation completed with 0 errors.");
    console.log(`[INFO] Database Status: ${isDatabaseConfigured() ? "Configured (" + redactDatabaseUrl(process.env.DATABASE_URL) + ")" : "Not configured (safe staging mode)"}`);
    console.log("\nTo apply migrations to your provisioned managed PostgreSQL database:");
    console.log("  1. Configure DATABASE_URL in your server environment or .env");
    console.log("  2. Run: npx tsx scripts/run-migration.ts --execute\n");
    return;
  }

  // Live Execution Flow
  if (!isDatabaseConfigured()) {
    console.error("\n[ABORT] Cannot execute migrations: DATABASE_URL is not configured.");
    console.error("Please set a valid PostgreSQL connection string before executing live migrations.");
    process.exit(1);
  }

  console.log(`\nConnecting to: ${redactDatabaseUrl(process.env.DATABASE_URL)}`);

  try {
    await withTransaction(async (client) => {
      // 1. Ensure migrations tracking table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 2. Fetch applied migrations
      const appliedRes = await client.query<{ version: string }>(
        "SELECT version FROM schema_migrations ORDER BY version ASC;"
      );
      const appliedVersions = new Set(appliedRes.rows.map((r) => r.version));

      // 3. Apply pending migrations
      for (const file of migrationFiles) {
        if (appliedVersions.has(file.version)) {
          console.log(`  [SKIPPED] Migration ${file.version} (${file.name}) already applied.`);
          continue;
        }

        console.log(`  [APPLYING] Migration ${file.version}: ${file.name}...`);
        await client.query(file.sql);
        await client.query(
          "INSERT INTO schema_migrations (version, name) VALUES ($1, $2);",
          [file.version, file.name]
        );
        console.log(`  ✓ [SUCCESS] Applied ${file.name}.`);
      }
    });

    console.log("\n[SUCCESS] All database migrations applied successfully.");
  } catch (err: unknown) {
    console.error("\n[MIGRATION_FAILED] Transaction rolled back due to error:", err);
    process.exit(1);
  }
}

runMigrations().catch((err) => {
  console.error("Fatal migration error:", err);
  process.exit(1);
});

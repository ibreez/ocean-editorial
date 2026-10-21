import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

/**
 * Server-Side PostgreSQL Database Connection & Pool Management
 *
 * Designed for managed PostgreSQL services (Neon, Supabase, Cloud SQL, AWS RDS).
 * Adheres strictly to security and reliability standards:
 * - Server-only execution (never imported in client components).
 * - Sanitized logging: Credentials and connection strings are always redacted.
 * - Serverless-friendly connection pooling with bounded max connections and idle timeouts.
 * - Parameterized queries only (SQL injection defense).
 */

let poolInstance: Pool | null = null;

/**
 * Redacts database connection strings to protect passwords in logs and error reports.
 * Example: postgres://admin:secretPass@db.oceaneditorial.mv:5432/ocean -> postgres://admin:***@db.oceaneditorial.mv:5432/ocean
 */
export function redactDatabaseUrl(url?: string): string {
  if (!url) return "[DATABASE_URL_UNSET]";
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = "***";
    }
    return parsed.toString();
  } catch {
    // If not a standard URL string, redact everything between colon and at-sign
    return url.replace(/:([^@]+)@/, ":***@");
  }
}

/**
 * Checks whether PostgreSQL database configuration is present and structurally valid.
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(url && (url.startsWith("postgres://") || url.startsWith("postgresql://")));
}

export function resolveDatabaseSslConfig(
  isProduction: boolean,
  env: Record<string, string | undefined> = process.env
): boolean | { rejectUnauthorized: boolean; ca?: string } | undefined {
  const sslRequired = env.DATABASE_SSL !== "false";
  if (!sslRequired) return false;

  // In production, TLS certificates MUST be verified (rejectUnauthorized: true) unconditionally.
  // In local development, self-signed certificates may be tolerated if DATABASE_REJECT_UNAUTHORIZED=false.
  const rejectUnauthorized = isProduction
    ? true
    : env.DATABASE_REJECT_UNAUTHORIZED !== "false";

  return {
    rejectUnauthorized,
    ca: env.DATABASE_CA_CERT || undefined,
  };
}

/**
 * Returns the singleton PostgreSQL connection pool, or null if unconfigured.
 */
export function getDatabasePool(): Pool | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (poolInstance) {
    return poolInstance;
  }

  const databaseUrl = process.env.DATABASE_URL!.trim();
  const maxConnections = Math.min(
    Math.max(1, parseInt(process.env.DATABASE_MAX_CONNECTIONS || "10", 10)),
    30
  );

  const isProduction = process.env.NODE_ENV === "production";
  const sslConfig = resolveDatabaseSslConfig(isProduction);

  poolInstance = new Pool({
    connectionString: databaseUrl,
    max: maxConnections,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: sslConfig,
  });

  // Handle unexpected idle client errors
  poolInstance.on("error", (err) => {
    console.error("[POSTGRES_POOL_ERROR] Unexpected idle client error:", err.message);
  });

  return poolInstance;
}

/**
 * Closes the active database connection pool (for test cleanup and graceful server shutdown).
 */
export async function closeDatabasePool(): Promise<void> {
  if (poolInstance) {
    try {
      await poolInstance.end();
    } catch {
      // Ignore cleanup errors
    } finally {
      poolInstance = null;
    }
  }
}

/**
 * Executes a parameterized query using the connection pool.
 * Automatically redacts any database credentials from error diagnostics.
 */
export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<R>> {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error("DATABASE_UNAVAILABLE: Managed PostgreSQL connection string is not configured.");
  }

  const start = Date.now();
  try {
    const res = await pool.query<R>(text, params);
    return res;
  } catch (err: unknown) {
    const duration = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(
      `[POSTGRES_QUERY_ERROR] Query failed after ${duration}ms: ${errorMsg}. Text: ${text.slice(0, 100)}...`
    );
    throw new Error(`Database query error: ${sanitizeDatabaseError(err)}`);
  }
}

/**
 * Executes a callback within an atomic PostgreSQL transaction.
 * Automatically issues BEGIN, COMMIT, and ROLLBACK on error.
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error("DATABASE_UNAVAILABLE: Managed PostgreSQL connection string is not configured.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Strips internal SQL details and sensitive database schema parameters from user-facing errors.
 */
export function sanitizeDatabaseError(err: unknown): string {
  if (!(err instanceof Error)) return "Unknown database error.";
  const msg = err.message;

  // Handle standard PostgreSQL error codes
  if (msg.includes("unique constraint") || msg.includes("duplicate key")) {
    return "A record with this unique identifier or slug already exists.";
  }
  if (msg.includes("foreign key constraint") || msg.includes("violates foreign key")) {
    return "Referenced entity does not exist in the database.";
  }
  if (msg.includes("check constraint")) {
    return "The provided record violates database validation constraints.";
  }
  if (msg.includes("connection timeout") || msg.includes("ECONNREFUSED")) {
    return "Database connection timeout or service unreachable.";
  }

  // Return a generic safe message in production
  if (process.env.NODE_ENV === "production") {
    return "Database operation failed. Please check system logs for diagnostics.";
  }
  return msg;
}

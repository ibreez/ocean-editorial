-- Ocean Editorial (ކަނޑު އެޑިޓޯރިއަލް)
-- Migration 002: Security Audit Logs & Session Event Tracking
-- Compatible with Cloud SQL, Supabase, Neon, AWS RDS PostgreSQL

CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES editorial_users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_role VARCHAR(30),
    action VARCHAR(100) NOT NULL,
    target_id VARCHAR(100),
    outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('SUCCESS', 'DENIED', 'FAILURE')),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance & Query Indexes for Security Auditing
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON security_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON security_audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_outcome ON security_audit_logs(outcome);

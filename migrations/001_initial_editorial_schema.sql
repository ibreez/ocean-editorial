-- Ocean Editorial (ކަނޑު އެޑިޓޯރިއަލް)
-- Migration 001: Initial Editorial Schema for Managed PostgreSQL
-- Compatible with Cloud SQL, Supabase, Neon, AWS RDS PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Editorial Users & Roles
CREATE TABLE IF NOT EXISTS editorial_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    dhivehi_name VARCHAR(255),
    role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'editor', 'journalist')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Editorial Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL, -- Dhivehi category name
    english_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Editorial Authors & Journalists
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL, -- Dhivehi byline name
    english_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL, -- Editorial job title
    avatar TEXT,
    bio TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Editorial Articles
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) UNIQUE NOT NULL,
    title TEXT NOT NULL, -- Dhivehi headline
    english_title TEXT,
    summary TEXT NOT NULL, -- Dhivehi standfirst / deck
    english_summary TEXT,
    body JSONB NOT NULL DEFAULT '[]'::jsonb, -- Structured ArticleBlock[]
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'scheduled', 'published', 'archived')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    breaking BOOLEAN NOT NULL DEFAULT FALSE,
    image JSONB, -- { src, alt, caption, credit }
    video JSONB, -- { src, title, caption, credit, poster }
    tags TEXT[] NOT NULL DEFAULT '{}',
    read_time_minutes INTEGER NOT NULL DEFAULT 3,
    is_opinion BOOLEAN NOT NULL DEFAULT FALSE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_by UUID REFERENCES editorial_users(id) ON DELETE SET NULL,
    last_editor UUID REFERENCES editorial_users(id) ON DELETE SET NULL,
    revision_count INTEGER NOT NULL DEFAULT 1,
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Article Revisions (Audit Trail)
CREATE TABLE IF NOT EXISTS article_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body JSONB NOT NULL,
    status VARCHAR(30) NOT NULL,
    edited_by UUID REFERENCES editorial_users(id) ON DELETE SET NULL,
    change_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (article_id, revision_number)
);

-- 6. Media Assets
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    alt TEXT NOT NULL,
    caption TEXT,
    credit TEXT,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT,
    width INTEGER,
    height INTEGER,
    uploaded_by UUID REFERENCES editorial_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_breaking ON articles(breaking) WHERE breaking = TRUE;
CREATE INDEX IF NOT EXISTS idx_article_revisions_article_id ON article_revisions(article_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);

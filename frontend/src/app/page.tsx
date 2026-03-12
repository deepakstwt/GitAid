import "@/client/styles/landing.css";
import Link from "next/link";
import {
  Github,
  Zap,
  Shield,
  Users,
  Code2,
  Brain,
  GitBranch,
  BarChart3,
  ArrowRight,
  Sparkles,
  GitCommit,
  Search,
  Lock,
  Terminal,
  Star,
  CheckCircle2,
} from "lucide-react";

export default async function Home() {
  const features = [
    {
      icon: Brain,
      title: "Automated Change Intelligence",
      desc: "Instant breakdown of any commit. Our engine explains intent, identifies side effects, and catches architecture drift before it merges.",
      size: "col-8",
      label: "Intelligence"
    },
    {
      icon: Search,
      title: "Natural Language Search",
      desc: "Query your repository history using plain English. Stop guessing keywords and start finding intent.",
      size: "col-4",
      label: "Discovery"
    },
    {
      icon: Users,
      title: "Team Velocity & Health",
      desc: "Real-time visibility into contributor health, bottleneck detection, and cross-team knowledge sharing.",
      size: "col-4",
      label: "Management"
    },
    {
      icon: GitBranch,
      title: "Omnisync Infrastructure",
      desc: "Enterprise-grade real-time repository sync. Zero latency between GitHub events and platform intelligence.",
      size: "col-8",
      label: "Infrastructure"
    },
    {
      icon: BarChart3,
      title: "Advanced Engineering Metrics",
      desc: "Moving beyond DORA. Track cycle time, PR complexity, and deep code quality trends automatically.",
      size: "col-6",
      label: "Analytics"
    },
    {
      icon: Lock,
      title: "Enterprise Rigor",
      desc: "SOC 2 Type II compliant. End-to-end encryption, isolated compute, and granular RBAC for the most secure teams.",
      size: "col-6",
      label: "Security"
    },
  ];

  const testimonials = [
    {
      text: "GitAid transformed how our team understands our codebase. The AI insights are genuinely useful — not just noise.",
      name: "Sarah Chen",
      role: "Engineering Lead @ Stripe",
      initials: "SC",
      bg: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    },
    {
      text: "The semantic search alone is worth it. I can find any commit or change in seconds without remembering exact wording.",
      name: "Marcus Reid",
      role: "Staff Engineer @ Vercel",
      initials: "MR",
      bg: "linear-gradient(135deg, #0ea5e9, #6366f1)",
    },
    {
      text: "Onboarding new engineers used to take weeks. With GitAid they understand the whole repo history in hours.",
      name: "Priya Kapoor",
      role: "CTO @ LinearB",
      initials: "PK",
      bg: "linear-gradient(135deg, #a855f7, #ec4899)",
    },
  ];

  const marqueeItems = [
    "Next.js", "TypeScript", "PostgreSQL", "Redis", "OpenAI",
    "GitHub API", "tRPC", "Clerk", "Tailwind", "Prisma",
    "Next.js", "TypeScript", "PostgreSQL", "Redis", "OpenAI",
    "GitHub API", "tRPC", "Clerk", "Tailwind", "Prisma",
  ];

  return (
    <main className="lp-root">
      {/* ── Background ──────────────────────────────── */}
      <div className="lp-bg-canvas" aria-hidden="true">
        <div className="lp-grid" />
        <div className="lp-aurora-1" />
        <div className="lp-aurora-2" />
        <div className="lp-aurora-3" />
      </div>

      {/* ── Navigation ─────────────────────────────── */}
      <nav className="lp-nav" role="navigation" aria-label="Main navigation">
        <div className="lp-nav-inner">
          {/* Logo */}
          <Link href="/" className="lp-logo">
            <div className="lp-logo-icon">
              <Github size={15} color="#08080c" />
            </div>
            <span className="lp-logo-text">GitAid</span>
          </Link>

          {/* Nav Links */}
          <div className="lp-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <a href="#features" className="lp-nav-link" style={{ display: 'none' }}>Features</a>
            <Link href="/sign-in" className="lp-btn-ghost">Sign In</Link>
            <Link href="/sign-up" className="lp-btn-primary" id="nav-get-started">
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="lp-hero" aria-label="Hero section">
        <div className="lp-hero-split">

          {/* ── LEFT: Text + mini-cards ──────────────── */}
          <div className="lp-hero-left">

            <div className="lp-hero-badge" role="status">
              <span className="lp-hero-badge-dot" aria-hidden="true" />
              <span>Now in public beta — sign up free</span>
            </div>

            <h1 className="lp-hero-h1">
              Git history,<br />
              finally<br />
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>understood.</span>
            </h1>

            <p className="lp-hero-sub">
              AI commit analysis, semantic search, and deep repo insights —
              built for engineering teams who move fast.
            </p>

            <div className="lp-hero-ctas">
              <Link href="/sign-up" className="lp-btn-cta-primary" id="hero-start-free"
                style={{ background: '#fff', color: '#08080c', border: '1px solid #fff', fontWeight: 700 }}>
                Get started free <ArrowRight size={15} />
              </Link>
              <Link href="/dashboard" className="lp-btn-cta-secondary" id="hero-view-demo">
                <Github size={15} />
                View demo
              </Link>
            </div>

            {/* 4 mini-cards 2×2 */}
            <div className="lp-hero-minicards" style={{ marginTop: '2rem' }}>
              <div className="lp-minicard">
                <div className="lp-minicard-icon" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <Brain size={15} color="#818cf8" />
                </div>
                <div className="lp-minicard-body">
                  <div className="lp-minicard-title">AI Analysis</div>
                  <div className="lp-minicard-desc">Every commit, understood</div>
                </div>
              </div>
              <div className="lp-minicard">
                <div className="lp-minicard-icon" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <Search size={15} color="#c084fc" />
                </div>
                <div className="lp-minicard-body">
                  <div className="lp-minicard-title">Semantic Search</div>
                  <div className="lp-minicard-desc">Plain English queries</div>
                </div>
              </div>
              <div className="lp-minicard">
                <div className="lp-minicard-icon" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
                  <Users size={15} color="#38bdf8" />
                </div>
                <div className="lp-minicard-body">
                  <div className="lp-minicard-title">Team Context</div>
                  <div className="lp-minicard-desc">Roles & contributions</div>
                </div>
              </div>
              <div className="lp-minicard">
                <div className="lp-minicard-icon" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <BarChart3 size={15} color="#fbbf24" />
                </div>
                <div className="lp-minicard-body">
                  <div className="lp-minicard-title">Analytics</div>
                  <div className="lp-minicard-desc">Velocity & health scores</div>
                </div>
              </div>
            </div>

          </div>{/* end lp-hero-left */}

          {/* ── RIGHT: Product preview panel ─────────── */}
          <div className="lp-hero-right" aria-label="GitAid product preview">

            {/* Main product card */}
            <div className="lp-preview-card">
              {/* Titlebar */}
              <div className="lp-preview-titlebar">
                <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>
                  <span className="lp-titlebar-dot red" />
                  <span className="lp-titlebar-dot amber" />
                  <span className="lp-titlebar-dot green" />
                </div>
                <div className="lp-preview-url">
                  <Shield size={10} style={{ opacity: 0.4 }} />
                  app.gitaid.dev/dashboard
                </div>
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                  <span className="lp-preview-synced">✓ Live</span>
                </div>
              </div>

              {/* Content grid */}
              <div className="lp-preview-body">
                {/* Sidebar */}
                <aside className="lp-preview-sidebar">
                  <div className="lp-preview-sidebar-brand">
                    <div className="lp-sidebar-logo" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>GitAid</span>
                  </div>
                  {[
                    { icon: BarChart3, label: 'Dashboard', active: true },
                    { icon: GitCommit, label: 'Commits', active: false },
                    { icon: Search, label: 'Search', active: false },
                    { icon: Users, label: 'Team', active: false },
                    { icon: GitBranch, label: 'Branches', active: false },
                  ].map(({ icon: Icon, label, active }) => (
                    <div key={label} className={`lp-preview-nav-item${active ? ' active' : ''}`}>
                      <Icon size={13} color={active ? '#a5b4fc' : 'rgba(255,255,255,0.3)'} />
                      <span>{label}</span>
                    </div>
                  ))}
                </aside>

                {/* Main area */}
                <div className="lp-preview-main">
                  <div className="lp-preview-section-title">
                    <Brain size={12} color="#818cf8" />
                    Commit Intelligence
                  </div>

                  {/* Commit rows */}
                  {[
                    { tag: 'feat', msg: 'Add vector embedding pipeline', author: 'SC', bg: '#6366f1', time: '2m', impact: 'High' },
                    { tag: 'fix',  msg: 'Race condition in webhook processor', author: 'MR', bg: '#0ea5e9', time: '18m', impact: 'Med' },
                    { tag: 'chore', msg: 'Upgrade prisma 5.10, next 15.1', author: 'PK', bg: '#a855f7', time: '1h', impact: 'Low' },
                    { tag: 'docs', msg: 'Document auth flow & API endpoints', author: 'SC', bg: '#6366f1', time: '3h', impact: 'Low' },
                  ].map(({ tag, msg, author, bg, time, impact }) => (
                    <div key={msg} className="lp-preview-commit-row">
                      <div className="lp-commit-avatar" style={{ background: bg, width: 22, height: 22, fontSize: '0.5625rem' }}>{author}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="lp-commit-message" style={{ fontSize: '0.6875rem' }}>{msg}</div>
                        <div className="lp-commit-meta" style={{ fontSize: '0.5625rem' }}>
                          <span className={`lp-commit-tag ${tag}`}>{tag}</span>
                          <span style={{ color: 'rgba(255,255,255,0.25)' }}>{time} ago</span>
                        </div>
                      </div>
                      <div className="lp-preview-impact" data-level={impact.toLowerCase()}>
                        {impact}
                      </div>
                    </div>
                  ))}

                  {/* AI insight box */}
                  <div className="lp-preview-ai-box">
                    <div className="lp-preview-ai-header">
                      <div className="lp-ai-panel-dot" />
                      <Brain size={11} color="#a5b4fc" />
                      <span>GitAid AI — Analysis complete</span>
                    </div>
                    <div className="lp-preview-ai-lines">
                      <div className="lp-ai-text-line" style={{ width: '90%' }} />
                      <div className="lp-ai-text-line" style={{ width: '75%' }} />
                      <div className="lp-ai-text-line" style={{ width: '55%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Two small stat cards below the main preview */}
            <div className="lp-preview-stats-row">
              <div className="lp-preview-stat-card">
                <div className="lp-preview-stat-num" style={{ color: '#818cf8' }}>98%</div>
                <div className="lp-preview-stat-label">Commit coverage</div>
              </div>
              <div className="lp-preview-stat-card">
                <div className="lp-preview-stat-num" style={{ color: '#4ade80' }}>1,247</div>
                <div className="lp-preview-stat-label">Commits indexed</div>
              </div>
              <div className="lp-preview-stat-card">
                <div className="lp-preview-stat-num" style={{ color: '#38bdf8' }}>4 members</div>
                <div className="lp-preview-stat-label">Active this week</div>
              </div>
            </div>

          </div>{/* end lp-hero-right */}

        </div>{/* end lp-hero-split */}
      </section>

      {/* ── Marquee ────────────────────────────────── */}
      <div className="lp-marquee-section" aria-label="Built with industry-leading technologies">
        <div className="lp-marquee-label">Built with the best in the industry</div>
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px',
            background: 'linear-gradient(90deg, #050507, transparent)',
            zIndex: 2, pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px',
            background: 'linear-gradient(-90deg, #050507, transparent)',
            zIndex: 2, pointerEvents: 'none'
          }} />
          <div className="lp-marquee-track">
            {marqueeItems.map((item, i) => (
              <span key={i} className="lp-marquee-item">
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'rgba(99,102,241,0.5)', display: 'inline-block'
                }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ───────────────────────────────── */}
      <section className="lp-section" id="features" aria-label="Features">
        <div className="lp-section-inner">
          <div className="lp-section-eyebrow">
            <Zap size={12} />
            Capabilities
          </div>
          <h2 className="lp-section-heading">
            Everything your team<br />needs to ship better code
          </h2>
          <p className="lp-section-sub">
            Powerful tools designed for engineering teams who want deep visibility 
            into their repositories without the overhead.
          </p>

          <div className="lp-bento-grid" style={{ marginTop: '3.5rem' }}>
            {features.map(({ icon: Icon, title, desc, size, label }) => (
              <div key={title} className={`lp-bento-card ${size} lp-technical-card`}>
                <div className="lp-technical-border" />
                <div className="lp-bento-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />
                   {label}
                </div>
                <div className="lp-feature-icon-technical">
                  <Icon size={18} />
                </div>
                <h3 className="lp-bento-title" style={{ fontSize: '1.125rem' }}>{title}</h3>
                <p className="lp-bento-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── Bento Showcase ─────────────────────────── */}
      <section className="lp-section" aria-label="Product showcase">
        <div className="lp-section-inner">
          <div className="lp-section-eyebrow">
            <Terminal size={12} />
            How it works
          </div>
          <h2 className="lp-section-heading">
            From commit to insight<br />in seconds
          </h2>

          <div className="lp-bento-grid">
            {/* Large card — Semantic Search */}
            <div className="lp-bento-card col-7">
              <div className="lp-bento-label">Semantic Search</div>
              <div className="lp-bento-title">Ask your codebase anything</div>
              <div className="lp-bento-desc">
                Natural language questions. Instant, accurate answers surfaced from thousands of commits.
              </div>
              <div className="lp-code-block">
                {[
                  { num: '1', parts: [{ t: 'keyword', v: 'const ' }, { t: 'func', v: 'results' }, { t: 'punct', v: ' = await ' }, { t: 'func', v: 'semanticSearch' }, { t: 'punct', v: '(' }] },
                  { num: '2', parts: [{ t: 'string', v: '  "How was auth refactored last month?"' }] },
                  { num: '3', parts: [{ t: 'punct', v: ');' }] },
                  { num: '4', parts: [{ t: 'comment', v: '// → Returns 12 relevant commits with context' }] },
                ].map(row => (
                  <div key={row.num} className="lp-code-line">
                    <span className="lp-code-num">{row.num}</span>
                    <span>
                      {row.parts.map((p, pi) => (
                        <span key={pi} className={`lp-code-${p.t}`}>{p.v}</span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight card */}
            <div className="lp-bento-card col-5" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="lp-bento-label">AI Analysis</div>
              <div className="lp-bento-title">Understand any commit instantly</div>
              <div className="lp-bento-desc">
                Our AI reads your diff and explains what changed, why it matters, and what to watch out for.
              </div>
              <div style={{
                marginTop: 'auto',
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 10, padding: '1rem',
              }}>
                <div style={{ fontSize: '0.6875rem', color: '#a5b4fc', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Brain size={11} /> AI Summary
                </div>
                <div style={{ fontSize: '0.78125rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  This commit introduces a rate-limiting middleware to the webhook processor, preventing duplicate event processing under high load. The change affects 3 files with 47 additions.
                </div>
              </div>
            </div>

            {/* Stats card */}
            <div className="lp-bento-card col-4">
              <div className="lp-bento-label">Analytics</div>
              <div className="lp-bento-title">Velocity at a glance</div>
              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { label: 'Commits this week', val: 47, pct: 85, color: '#8b5cf6' },
                  { label: 'Active contributors', val: 8, pct: 65, color: '#38bdf8' },
                  { label: 'Code quality score', val: '94%', pct: 94, color: '#4ade80' },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{m.label}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{m.val}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 2, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team collaboration card */}
            <div className="lp-bento-card col-8">
              <div className="lp-bento-label">Collaboration</div>
              <div className="lp-bento-title">Your whole team, one workspace</div>
              <div className="lp-bento-desc">
                Role-based access, contribution tracking, and inline discussions — all synced with GitHub.
              </div>
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                {[
                  { initials: 'SC', name: 'Sarah C.', commits: 142, color: '#6366f1' },
                  { initials: 'MR', name: 'Marcus R.', commits: 98, color: '#0ea5e9' },
                  { initials: 'PK', name: 'Priya K.', commits: 76, color: '#a855f7' },
                  { initials: 'JL', name: 'Jay L.', commits: 54, color: '#10b981' },
                ].map(c => (
                  <div key={c.initials} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.5rem 0.75rem',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: c.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6875rem', fontWeight: 700, color: '#fff', flexShrink: 0
                    }}>{c.initials}</div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)' }}>{c.commits} commits</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits + Live GitAid Notifications ───── */}
      <div className="lp-divider" />

      <section className="lp-benefits-section" aria-label="Why GitAid">
        <div className="lp-benefits-inner">

          {/* LEFT — Pain points + value prop */}
          <div>
            <div className="lp-benefits-eyebrow">
              <Brain size={12} />
              Why GitAid
            </div>
            <h2 className="lp-benefits-heading">
              Stop flying blind<br />on your codebase
            </h2>
            <p className="lp-benefits-sub">
              GitAid eliminates the guesswork from repository management. 
              Get rich context, instant AI insights, and full team alignment — all in one place.
            </p>

            <ul className="lp-pain-list" aria-label="Key benefits">
              {[
                "Spending hours digging through commit history by hand",
                "Losing context when teammates join or leave",
                "No visibility into what code actually changed and why",
                "Semantic gaps — grep finds text, not meaning",
                "Inconsistent PR reviews with no historical context",
                "Slow onboarding that takes weeks, not days",
              ].map((point) => (
                <li key={point} className="lp-pain-item">
                  <span className="lp-pain-check" aria-hidden="true">
                    <CheckCircle2 size={11} strokeWidth={2.5} color="#818cf8" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <Link href="/sign-up" className="lp-benefits-cta" id="benefits-cta">
              Fix your workflow <ArrowRight size={15} />
            </Link>
          </div>

          {/* RIGHT — Infinite scrolling live GitAid activity feed */}
          <div className="lp-notif-column" aria-label="Live GitAid activity feed" aria-live="polite">
            {/*
              lp-notif-track scrolls upward infinitely.
              Cards are duplicated so the loop is seamless (2× set).
              Hover anywhere on the column to pause.
            */}
            <div className="lp-notif-track">

              {/* ── SET 1 (original) ──────────────────── */}

              {/* Card A — AI Analysis complete */}
              <div className="lp-notif-card" style={{ '--notif-accent': '#818cf8', '--notif-icon-bg': 'rgba(99,102,241,0.1)', '--notif-icon-border': 'rgba(99,102,241,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap">
                  <Brain size={18} color="#818cf8" />
                </div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row">
                    <span className="lp-notif-title">
                      <span style={{ display:'inline-block', width:7, height:7, borderRadius:'50%', background:'#818cf8', marginRight:6, verticalAlign:'middle', boxShadow:'0 0 6px #818cf8', animation:'lp-pulse-ring 2s ease-out infinite' }} />
                      GitAid · AI Analysis Complete
                    </span>
                    <span className="lp-notif-time">just now</span>
                  </div>
                  <div className="lp-notif-body">feat: add semantic search pipeline — impact: high, 3 breaking changes detected</div>
                </div>
              </div>

              {/* Card B — Commit indexed */}
              <div className="lp-notif-card" style={{ '--notif-accent': '#4ade80', '--notif-icon-bg': 'rgba(34,197,94,0.1)', '--notif-icon-border': 'rgba(34,197,94,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap">
                  <GitCommit size={18} color="#4ade80" />
                </div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row">
                    <span className="lp-notif-title">GitAid · Commit Indexed</span>
                    <span className="lp-notif-time">1m ago</span>
                  </div>
                  <div className="lp-notif-body">fix: resolve race condition in webhook processor — by @m.reid</div>
                </div>
              </div>

              {/* Card C — Semantic Search */}
              <div className="lp-notif-card" style={{ '--notif-accent': '#c084fc', '--notif-icon-bg': 'rgba(168,85,247,0.1)', '--notif-icon-border': 'rgba(168,85,247,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap">
                  <Search size={18} color="#c084fc" />
                </div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row">
                    <span className="lp-notif-title">GitAid · Semantic Search</span>
                    <span className="lp-notif-time">3m ago</span>
                  </div>
                  <div className="lp-notif-body">"How was auth refactored last month?" — 12 relevant commits found</div>
                </div>
              </div>

              {/* Card D — Team member joined */}
              <div className="lp-notif-card" style={{ '--notif-accent': '#38bdf8', '--notif-icon-bg': 'rgba(56,189,248,0.1)', '--notif-icon-border': 'rgba(56,189,248,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap">
                  <Users size={18} color="#38bdf8" />
                </div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row">
                    <span className="lp-notif-title">GitAid · Team</span>
                    <span className="lp-notif-time">18m ago</span>
                  </div>
                  <div className="lp-notif-body">Priya Kapoor joined your workspace — 76 commits synced instantly</div>
                </div>
              </div>

              {/* Card E — Repo Sync */}
              <div className="lp-notif-card" style={{ '--notif-accent': '#fb923c', '--notif-icon-bg': 'rgba(251,146,60,0.1)', '--notif-icon-border': 'rgba(251,146,60,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap">
                  <GitBranch size={18} color="#fb923c" />
                </div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row">
                    <span className="lp-notif-title">GitAid · Repo Sync</span>
                    <span className="lp-notif-time">1h ago</span>
                  </div>
                  <div className="lp-notif-body">acme-corp/api-server synced — 1,247 commits analyzed and embedded</div>
                </div>
              </div>

              {/* Card F — PR Review */}
              <div className="lp-notif-card" style={{ '--notif-accent': '#f472b6', '--notif-icon-bg': 'rgba(244,114,182,0.1)', '--notif-icon-border': 'rgba(244,114,182,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap">
                  <Code2 size={18} color="#f472b6" />
                </div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row">
                    <span className="lp-notif-title">GitAid · Code Insight</span>
                    <span className="lp-notif-time">2h ago</span>
                  </div>
                  <div className="lp-notif-body">PR #412 — auth middleware refactor: 94% code quality, 2 suggestions</div>
                </div>
              </div>

              {/* Card G — Analytics */}
              <div className="lp-notif-card" style={{ '--notif-accent': '#fbbf24', '--notif-icon-bg': 'rgba(251,191,36,0.1)', '--notif-icon-border': 'rgba(251,191,36,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap">
                  <BarChart3 size={18} color="#fbbf24" />
                </div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row">
                    <span className="lp-notif-title">GitAid · Weekly Report</span>
                    <span className="lp-notif-time">Yesterday</span>
                  </div>
                  <div className="lp-notif-body">Team velocity up 23% — 47 commits, 8 contributors, 0 regressions</div>
                </div>
              </div>

              {/* ── SET 2 (duplicate for seamless loop) ── */}

              <div className="lp-notif-card" aria-hidden="true" style={{ '--notif-accent': '#818cf8', '--notif-icon-bg': 'rgba(99,102,241,0.1)', '--notif-icon-border': 'rgba(99,102,241,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap"><Brain size={18} color="#818cf8" /></div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row">
                    <span className="lp-notif-title"><span style={{ display:'inline-block', width:7, height:7, borderRadius:'50%', background:'#818cf8', marginRight:6, verticalAlign:'middle', boxShadow:'0 0 6px #818cf8', animation:'lp-pulse-ring 2s ease-out infinite' }} />GitAid · AI Analysis Complete</span>
                    <span className="lp-notif-time">just now</span>
                  </div>
                  <div className="lp-notif-body">feat: add semantic search pipeline — impact: high, 3 breaking changes detected</div>
                </div>
              </div>

              <div className="lp-notif-card" aria-hidden="true" style={{ '--notif-accent': '#4ade80', '--notif-icon-bg': 'rgba(34,197,94,0.1)', '--notif-icon-border': 'rgba(34,197,94,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap"><GitCommit size={18} color="#4ade80" /></div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row"><span className="lp-notif-title">GitAid · Commit Indexed</span><span className="lp-notif-time">1m ago</span></div>
                  <div className="lp-notif-body">fix: resolve race condition in webhook processor — by @m.reid</div>
                </div>
              </div>

              <div className="lp-notif-card" aria-hidden="true" style={{ '--notif-accent': '#c084fc', '--notif-icon-bg': 'rgba(168,85,247,0.1)', '--notif-icon-border': 'rgba(168,85,247,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap"><Search size={18} color="#c084fc" /></div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row"><span className="lp-notif-title">GitAid · Semantic Search</span><span className="lp-notif-time">3m ago</span></div>
                  <div className="lp-notif-body">"How was auth refactored last month?" — 12 relevant commits found</div>
                </div>
              </div>

              <div className="lp-notif-card" aria-hidden="true" style={{ '--notif-accent': '#38bdf8', '--notif-icon-bg': 'rgba(56,189,248,0.1)', '--notif-icon-border': 'rgba(56,189,248,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap"><Users size={18} color="#38bdf8" /></div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row"><span className="lp-notif-title">GitAid · Team</span><span className="lp-notif-time">18m ago</span></div>
                  <div className="lp-notif-body">Priya Kapoor joined your workspace — 76 commits synced instantly</div>
                </div>
              </div>

              <div className="lp-notif-card" aria-hidden="true" style={{ '--notif-accent': '#fb923c', '--notif-icon-bg': 'rgba(251,146,60,0.1)', '--notif-icon-border': 'rgba(251,146,60,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap"><GitBranch size={18} color="#fb923c" /></div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row"><span className="lp-notif-title">GitAid · Repo Sync</span><span className="lp-notif-time">1h ago</span></div>
                  <div className="lp-notif-body">acme-corp/api-server synced — 1,247 commits analyzed and embedded</div>
                </div>
              </div>

              <div className="lp-notif-card" aria-hidden="true" style={{ '--notif-accent': '#f472b6', '--notif-icon-bg': 'rgba(244,114,182,0.1)', '--notif-icon-border': 'rgba(244,114,182,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap"><Code2 size={18} color="#f472b6" /></div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row"><span className="lp-notif-title">GitAid · Code Insight</span><span className="lp-notif-time">2h ago</span></div>
                  <div className="lp-notif-body">PR #412 — auth middleware refactor: 94% code quality, 2 suggestions</div>
                </div>
              </div>

              <div className="lp-notif-card" aria-hidden="true" style={{ '--notif-accent': '#fbbf24', '--notif-icon-bg': 'rgba(251,191,36,0.1)', '--notif-icon-border': 'rgba(251,191,36,0.2)' } as React.CSSProperties}>
                <div className="lp-notif-icon-wrap"><BarChart3 size={18} color="#fbbf24" /></div>
                <div className="lp-notif-content">
                  <div className="lp-notif-row"><span className="lp-notif-title">GitAid · Weekly Report</span><span className="lp-notif-time">Yesterday</span></div>
                  <div className="lp-notif-body">Team velocity up 23% — 47 commits, 8 contributors, 0 regressions</div>
                </div>
              </div>

            </div>{/* end lp-notif-track */}
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── Testimonials ───────────────────────────── */}
      <section className="lp-section" aria-label="Testimonials">
        <div className="lp-section-inner">
          <div className="lp-section-eyebrow">
            <Star size={12} />
            Testimonials
          </div>
          <h2 className="lp-section-heading">
            Loved by engineers<br />at great companies
          </h2>

          <div className="lp-testimonials-grid">
            {testimonials.map(({ text, name, role, initials, bg }) => (
              <div key={name} className="lp-testimonial-card">
                <div className="lp-testimonial-stars" aria-label="5 stars">
                  {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                </div>
                <p className="lp-testimonial-text">"{text}"</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar" style={{ background: bg, color: '#fff' }}>
                    {initials}
                  </div>
                  <div>
                    <div className="lp-testimonial-name">{name}</div>
                    <div className="lp-testimonial-role">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── CTA ────────────────────────────────────── */}
      <section className="lp-cta-section" aria-label="Call to action">
        <div className="lp-cta-card">
          <h2 className="lp-cta-title">
            Start understanding your<br />codebase today
          </h2>
          <p className="lp-cta-sub">
            Join thousands of engineering teams who use GitAid to ship faster 
            and debug smarter. Free plan available — no credit card required.
          </p>
          <div className="lp-cta-actions">
            <Link href="/sign-up" className="lp-btn-cta-primary" id="cta-get-started">
              Get started free <ArrowRight size={15} />
            </Link>
            <Link href="/dashboard" className="lp-btn-cta-secondary" id="cta-view-demo">
              <Github size={15} />
              View demo
            </Link>
          </div>
          <p className="lp-cta-note">
            <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4, color: '#4ade80' }} />
            Free plan · No credit card · Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="lp-footer" aria-label="Site footer">
        <div className="lp-footer-inner">
          {/* Brand */}
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">
              <div className="lp-footer-logo-icon">
                <Github size={14} color="#fff" />
              </div>
              <span className="lp-footer-logo-text">GitAid</span>
            </div>
            <p className="lp-footer-tagline">
              AI-native GitHub management built for modern engineering teams.
            </p>
          </div>

          {/* Product */}
          <div>
            <div className="lp-footer-col-title">Product</div>
            <nav className="lp-footer-links" aria-label="Product links">
              {['Features', 'Pricing', 'Documentation', 'Changelog', 'API'].map(item => (
                <a key={item} href="#" className="lp-footer-link">{item}</a>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <div className="lp-footer-col-title">Company</div>
            <nav className="lp-footer-links" aria-label="Company links">
              {['About', 'Blog', 'Careers', 'Press', 'Contact'].map(item => (
                <a key={item} href="#" className="lp-footer-link">{item}</a>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <div className="lp-footer-col-title">Legal</div>
            <nav className="lp-footer-links" aria-label="Legal links">
              {['Privacy Policy', 'Terms of Service', 'Security', 'Status', 'Cookie Policy'].map(item => (
                <a key={item} href="#" className="lp-footer-link">{item}</a>
              ))}
            </nav>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span className="lp-footer-copy">© 2025 GitAid, Inc. All rights reserved.</span>
          <div className="lp-footer-socials">
            <a href="#" className="lp-footer-social" aria-label="GitHub">
              <Github size={17} />
            </a>
            <a href="#" className="lp-footer-social" aria-label="Twitter/X">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="lp-footer-social" aria-label="LinkedIn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

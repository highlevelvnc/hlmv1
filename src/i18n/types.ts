export interface Dict {
  // ── Meta ────────────────────────────────────────────────────────────────
  meta_title: string;
  meta_description: string;

  // ── Header ──────────────────────────────────────────────────────────────
  nav_process: string;
  nav_services: string;
  nav_results: string;
  header_cta: string;

  // ── Hero (HeroParticles) ────────────────────────────────────────────────
  hero_title: string;
  hero_sub: string;
  hero_body: string;
  hero_cta: string;
  hero_scroll: string;

  // ── Particle sections ───────────────────────────────────────────────────
  section_brain1_title: string;
  section_brain1_sub: string;
  section_brain2_title: string;
  section_brain2_sub: string;
  section_globe_title: string;
  section_globe_sub: string;
  section_dash_title: string;
  section_dash_sub: string;

  // ── ScrollSequence ──────────────────────────────────────────────────────
  scroll_s1_label: string;
  scroll_s1_title: string;
  scroll_s1_desc: string;
  scroll_s2_label: string;
  scroll_s2_title: string;
  scroll_s2_desc: string;
  scroll_s3_label: string;
  scroll_s3_title: string;
  scroll_s3_desc: string;

  // ── ValueProp ───────────────────────────────────────────────────────────
  vp_tag: string;
  vp_h1: string;
  vp_h2: string;
  vp_body1: string;
  vp_body2: string;

  // ── Services ────────────────────────────────────────────────────────────
  svc_tag: string;
  svc1_name: string; svc1_desc: string;
  svc2_name: string; svc2_desc: string;
  svc3_name: string; svc3_desc: string;
  svc4_name: string; svc4_desc: string;
  svc5_name: string; svc5_desc: string;

  // ── Differentiation ─────────────────────────────────────────────────────
  diff_tag: string;
  diff_headline: string;
  diff1_label: string; diff1_body: string;
  diff2_label: string; diff2_body: string;
  diff3_label: string; diff3_body: string;
  diff4_label: string; diff4_body: string;

  // ── Proof ───────────────────────────────────────────────────────────────
  proof_tag: string;
  m1_label: string;
  m2_label: string;
  m3_label: string;
  m4_label: string;
  t1_quote: string; t1_author: string; t1_company: string;
  t2_quote: string; t2_author: string; t2_company: string;

  // ── CTA ─────────────────────────────────────────────────────────────────
  cta_tag: string;
  cta_headline: string;
  cta_body: string;
  cta_name: string;
  cta_email: string;
  cta_message: string;
  cta_submit: string;
  cta_sending: string;
  cta_success: string;
  cta_error: string;
  cta_or_email: string;
  err_required: string;
  err_email: string;

  // ── BrainOrb labels ─────────────────────────────────────────────────────
  orb_traffic: string;
  orb_leads: string;
  orb_pipeline: string;
  orb_revenue: string;
  orb_roas: string;
  orb_automation: string;
  orb_scoring: string;
  orb_conversion: string;
}

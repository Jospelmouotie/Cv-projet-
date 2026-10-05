/**
 * Lightweight analytics module for Job Landing Pages (SEO programmatique)
 * Tracks impressions, CTA clicks, and CV conversions by job slug
 */

export interface JobAnalyticsEvent {
  id: string;
  type: 'visit' | 'cta_click' | 'cv_created';
  slug: string;
  metier: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

const STORAGE_KEY = 'moncv_job_analytics_events';

function getStoredEvents(): JobAnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvent(event: JobAnalyticsEvent): void {
  try {
    const events = getStoredEvents();
    // Keep max 500 events to prevent unbounded localStorage growth
    events.unshift(event);
    if (events.length > 500) {
      events.length = 500;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.debug('Analytics storage issue:', err);
  }
}

export function trackJobPageView(slug: string, metier: string, metadata?: Record<string, any>): void {
  const event: JobAnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: 'visit',
    slug,
    metier,
    timestamp: new Date().toISOString(),
    metadata
  };
  saveEvent(event);
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'job_landing_view', { job_slug: slug, job_title: metier });
  }
}

export function trackJobCtaClick(slug: string, metier: string, templateId: string): void {
  const event: JobAnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: 'cta_click',
    slug,
    metier,
    timestamp: new Date().toISOString(),
    metadata: { templateId }
  };
  saveEvent(event);
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'job_cta_click', { job_slug: slug, job_title: metier, template_id: templateId });
  }
}

export function trackJobCvCreated(slug: string, metier: string): void {
  const event: JobAnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: 'cv_created',
    slug,
    metier,
    timestamp: new Date().toISOString()
  };
  saveEvent(event);
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'job_cv_created', { job_slug: slug, job_title: metier });
  }
}

export interface JobStats {
  slug: string;
  metier: string;
  visits: number;
  ctaClicks: number;
  cvCreated: number;
  conversionRatePct: number;
}

export function getJobAnalyticsSummary(): JobStats[] {
  const events = getStoredEvents();
  const map = new Map<string, { metier: string; visits: number; ctaClicks: number; cvCreated: number }>();

  for (const ev of events) {
    const curr = map.get(ev.slug) || { metier: ev.metier, visits: 0, ctaClicks: 0, cvCreated: 0 };
    if (ev.type === 'visit') curr.visits++;
    if (ev.type === 'cta_click') curr.ctaClicks++;
    if (ev.type === 'cv_created') curr.cvCreated++;
    map.set(ev.slug, curr);
  }

  const result: JobStats[] = [];
  map.forEach((val, slug) => {
    const conversionRatePct = val.visits > 0 ? Math.round((val.cvCreated / val.visits) * 100) : 0;
    result.push({
      slug,
      metier: val.metier,
      visits: val.visits,
      ctaClicks: val.ctaClicks,
      cvCreated: val.cvCreated,
      conversionRatePct
    });
  });

  return result.sort((a, b) => b.visits - a.visits);
}

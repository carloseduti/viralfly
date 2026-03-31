'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function LandingPage() {
  const { t } = useTranslation('landing');
  const { t: tc } = useTranslation('common');

  return (
    <div className="bg-[#070d1f] text-[#dfe4fe] min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#070d1f]/60 backdrop-blur-xl">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-bold tracking-tighter text-primary font-heading">
            {tc('brand')}
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-slate-400 font-medium hover:text-primary transition-colors duration-300 text-sm">
              {tc('nav.platform')}
            </a>
            <a href="#workflow" className="text-slate-400 font-medium hover:text-primary transition-colors duration-300 text-sm">
              {tc('nav.solutions')}
            </a>
            <a href="#pricing" className="text-slate-400 font-medium hover:text-primary transition-colors duration-300 text-sm">
              {tc('nav.pricing')}
            </a>
            <a href="#" className="text-slate-400 font-medium hover:text-primary transition-colors duration-300 text-sm">
              {tc('nav.company')}
            </a>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden md:block text-slate-400 font-medium hover:text-primary transition-colors duration-300 text-sm">
              {tc('nav.logIn')}
            </Link>
            <Link
              href="/login"
              className="bg-primary text-[#001a63] px-6 py-2.5 rounded-full font-semibold hover:scale-95 transition-all duration-200 text-sm"
            >
              {tc('nav.getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-8 pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/15 text-primary text-xs font-semibold mb-8">
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>auto_awesome</span>
              {t('hero.badge')}
            </div>

            {/* Heading */}
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-[#dfe4fe] max-w-4xl leading-[1.1] tracking-tight mb-8">
              {t('hero.titlePart1')}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.titleGradient')}
              </span>
              {t('hero.titlePart2')}
            </h1>

            <p className="text-[#a5aac2] text-lg md:text-xl max-w-2xl mb-12">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="bg-primary text-[#001a63] px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[0.98] transition-transform"
              >
                {t('hero.cta1')}
              </Link>
              <button
                type="button"
                className="px-8 py-4 rounded-xl border border-outline-variant/30 font-bold text-lg hover:bg-surface-bright transition-colors"
                style={{ background: 'rgba(28, 37, 62, 0.6)', backdropFilter: 'blur(20px)' }}
              >
                {t('hero.cta2')}
              </button>
            </div>
          </div>

          {/* Kinetic Video Visual */}
          <div className="mt-20 max-w-6xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-black rounded-2xl border border-outline-variant/15 overflow-hidden aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full h-full object-cover opacity-80"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA14Ruju9ZFu_wBAflCHeEys8OtRvCM7FokvPQNDPOJgP4Ui3txI46ubXoi3bgObQDefZx7nROS4bvB5S3vO9zXBHw40IesfY7F8mMVhKIY7d05-AF8h_xggNBPxDrSc3TeISosQXSFk7r_c29HOO1lCXI6tSRQ6y2z9k-DGU4N0TmIsg_gteIzhCq2wIeTLng_7y2uX5ZYPeLYNFmVyDKY0YZ9_Kj0bTDm1Bwz40AM9O3BeAcwp6x9W_HGsrbx7RF7-ekI8XZFjSkz"
                alt="Futuristic video editing interface showing a cinematic camera motion path being applied to a high-end sneaker product against a vibrant neon background"
              />
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/50 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '2.5rem' }}>play_arrow</span>
                </div>
              </div>
              {/* Timeline HUD Overlay */}
              <div className="absolute bottom-6 left-6 right-6 h-12 bg-surface-container-highest/60 backdrop-blur-md rounded-lg flex items-center px-4 gap-4">
                <div className="h-1 w-full bg-outline-variant/30 rounded-full relative">
                  <div className="absolute top-0 left-0 h-full w-1/3 bg-primary rounded-full shadow-[0_0_12px_rgba(149,170,255,0.6)]" />
                  <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white" />
                </div>
                <span className="text-[10px] font-mono text-[#a5aac2] shrink-0">00:04 / 00:15</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="px-8 py-24 bg-surface-container-low relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {t('features.sectionTitle')}
              </h2>
              <p className="text-[#a5aac2]">{t('features.sectionSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 — Nano Banana */}
              <div className="p-8 rounded-2xl bg-surface-container gradient-border flex flex-col gap-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">imagesmode</span>
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold mb-3">{t('features.nanoBanana.title')}</h3>
                  <p className="text-[#a5aac2] text-sm leading-relaxed">{t('features.nanoBanana.description')}</p>
                </div>
                <div className="mt-auto pt-6 border-t border-outline-variant/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="rounded-lg w-full h-32 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5ebjHrD5E8wKdolpHnAL3EHNxfHYUpfMzWlZhoqHoEv0R-LAdyq8O6fpE2B9vBy0iZrfPmyxKjYE8aO3KB_06XDPmYEHQfIr9JcOFb8-OanN2cW_tVYtmw_g-JZEDDodD8wEI5_YKmqgrhbiPMLv2xnnxjoiDB_m0kaUoSW1mQ7zkilxFYRYqCNawi8jKX8ZsHO26DOzU4Pyotnaj54UQxBb0ckEWGtxb6Rjv2kHUSaD95bYeyDrz4YgVBMd5QAQSkwQIft87tA3-"
                    alt="Close up of a luxury perfume bottle surrounded by surreal floating crystals and silk ribbons, rendered in 8k quality"
                  />
                </div>
              </div>

              {/* Feature 2 — AI Scriptwriting */}
              <div className="p-8 rounded-2xl bg-surface-container gradient-border flex flex-col gap-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">edit_note</span>
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold mb-3">{t('features.scriptwriting.title')}</h3>
                  <p className="text-[#a5aac2] text-sm leading-relaxed">{t('features.scriptwriting.description')}</p>
                </div>
                <div className="mt-auto bg-black p-4 rounded-lg border border-outline-variant/10">
                  <div className="h-2 w-3/4 bg-primary/20 rounded mb-2" />
                  <div className="h-2 w-full bg-outline-variant/20 rounded mb-2" />
                  <div className="h-2 w-1/2 bg-outline-variant/20 rounded" />
                </div>
              </div>

              {/* Feature 3 — 1-Click Pipeline */}
              <div className="p-8 rounded-2xl bg-surface-container gradient-border flex flex-col gap-6">
                <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">rocket_launch</span>
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold mb-3">{t('features.pipeline.title')}</h3>
                  <p className="text-[#a5aac2] text-sm leading-relaxed">{t('features.pipeline.description')}</p>
                </div>
                <div className="mt-auto flex gap-2">
                  {(['music_note', 'closed_caption', 'movie'] as const).map((icon) => (
                    <div
                      key={icon}
                      className="h-10 w-10 rounded bg-surface-bright border border-outline-variant/20 flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[#a5aac2]" style={{ fontSize: '1rem' }}>{icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pipeline Section */}
        <section id="workflow" className="px-8 py-32 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-heading text-4xl font-bold mb-6 tracking-tight">
              {t('workflow.sectionTitle')}
            </h2>
            <p className="text-[#a5aac2] max-w-2xl mx-auto">{t('workflow.sectionSubtitle')}</p>
          </div>
          <div className="relative">
            {/* Progress Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Steps 1–3 */}
              {(
                [
                  { key: 'step1', num: '01' },
                  { key: 'step2', num: '02' },
                  { key: 'step3', num: '03' },
                ] as const
              ).map(({ key, num }) => (
                <div key={key} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center mb-6 shadow-xl">
                    <span className="text-primary font-bold">{num}</span>
                  </div>
                  <h4 className="font-bold text-lg mb-2">{t(`workflow.${key}.title`)}</h4>
                  <p className="text-sm text-[#a5aac2]">{t(`workflow.${key}.description`)}</p>
                </div>
              ))}
              {/* Step 4 — Export (filled primary) */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary border border-white/20 flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
                  <span className="material-symbols-outlined text-[#001a63]">done_all</span>
                </div>
                <h4 className="font-bold text-lg mb-2">{t('workflow.step4.title')}</h4>
                <p className="text-sm text-[#a5aac2]">{t('workflow.step4.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="px-8 py-32 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold mb-4">{t('pricing.sectionTitle')}</h2>
              <p className="text-[#a5aac2]">{t('pricing.sectionSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Starter */}
              <div className="p-10 rounded-2xl bg-[#070d1f] gradient-border flex flex-col hover:-translate-y-2 transition-transform duration-300">
                <div className="mb-8">
                  <span className="text-sm font-semibold text-[#a5aac2] uppercase tracking-widest">
                    {t('pricing.starter.name')}
                  </span>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold">{t('pricing.starter.price')}</span>
                    <span className="text-[#a5aac2] ml-2">{t('pricing.starter.period')}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {(t('pricing.starter.features', { returnObjects: true }) as string[]).map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.125rem' }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="w-full py-3 rounded-xl border border-outline-variant/30 font-bold hover:bg-surface-bright transition-colors text-center text-sm"
                >
                  {t('pricing.starter.cta')}
                </Link>
              </div>

              {/* Pro */}
              <div className="p-10 rounded-2xl bg-surface-container border-2 border-primary/50 relative shadow-2xl shadow-primary/10 flex flex-col scale-105 z-20">
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-[#001a63] px-4 py-1 rounded-full text-xs font-bold">
                  {t('pricing.pro.badge')}
                </div>
                <div className="mb-8">
                  <span className="text-sm font-semibold text-primary uppercase tracking-widest">
                    {t('pricing.pro.name')}
                  </span>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-bold">{t('pricing.pro.price')}</span>
                    <span className="text-[#a5aac2] ml-2">{t('pricing.pro.period')}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {(t('pricing.pro.features', { returnObjects: true }) as string[]).map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.125rem' }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-sm font-bold text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>bolt</span>
                    {t('pricing.pro.highlight')}
                  </li>
                </ul>
                <Link
                  href="/login"
                  className="w-full py-4 rounded-xl bg-primary text-[#001a63] font-extrabold hover:opacity-90 transition-opacity text-center text-sm"
                >
                  {t('pricing.pro.cta')}
                </Link>
              </div>

              {/* Enterprise */}
              <div className="p-10 rounded-2xl bg-[#070d1f] gradient-border flex flex-col hover:-translate-y-2 transition-transform duration-300">
                <div className="mb-8">
                  <span className="text-sm font-semibold text-[#a5aac2] uppercase tracking-widest">
                    {t('pricing.enterprise.name')}
                  </span>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold">{t('pricing.enterprise.price')}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {(t('pricing.enterprise.features', { returnObjects: true }) as string[]).map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.125rem' }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="w-full py-3 rounded-xl border border-outline-variant/30 font-bold hover:bg-surface-bright transition-colors text-center text-sm"
                >
                  {t('pricing.enterprise.cta')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#070d1f] w-full border-t border-outline-variant/15">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-12 w-full max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0">
            <div className="text-xl font-bold text-slate-200 mb-2">{tc('brand')}</div>
            <p className="text-slate-500 text-sm">{tc('footer.copyright')} · Precision Cinematography.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm font-medium">{tc('footer.privacy')}</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm font-medium">{tc('footer.terms')}</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm font-medium">{tc('footer.security')}</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm font-medium">{tc('footer.status')}</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm font-medium">{tc('footer.apiDocs')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

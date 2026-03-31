'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/language-switcher';
import { LogoutButton } from '@/components/logout-button';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', labelKey: 'nav.dashboard' },
  { href: '/campaigns', icon: 'inventory_2', labelKey: 'nav.products' },
  { href: '#', icon: 'video_library', labelKey: 'nav.videoHistory' },
  { href: '#', icon: 'analytics', labelKey: 'nav.analytics' },
  { href: '#', icon: 'settings', labelKey: 'nav.settings' }
];

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation('common');

  return (
    <>
      {isOpen && <div className="sidebar-overlay lg:hidden" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="material-symbols-outlined text-primary-action" style={{ fontSize: '1.5rem' }}>
            bolt
          </span>
          <span className="font-heading text-lg font-bold text-on-surface">{t('brand')}</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && item.href !== '#');
            return (
              <Link
                key={item.href + item.labelKey}
                href={item.href}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                onClick={onClose}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
                  {item.icon}
                </span>
                {t(item.labelKey)}
              </Link>
            );
          })}

          <Link href="/campaigns/new" className="btn mt-4 w-full text-center" onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
              add
            </span>
            {t('nav.createNewVideo')}
          </Link>
        </nav>

        <div className="space-y-1 border-t border-outline-variant/15 px-3 py-4">
          <LanguageSwitcher />
          <Link href="#" className="sidebar-link">
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
              help
            </span>
            {t('nav.helpCenter')}
          </Link>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

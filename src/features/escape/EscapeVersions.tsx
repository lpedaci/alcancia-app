import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { DEMO_TODAY } from '@/app/config';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { type Badge, BADGES, type Version, VERSIONS } from './engine';

/**
 * Versions and badges of the escape room (D-310): the person chooses the version before playing
 * (initial, intermediate or advanced) and each one gives its badge (bronze, silver, gold) when the
 * five rooms are solved in it. Badges are kept between games and can be downloaded as an image,
 * without personal data.
 */
export function VersionPicker({ value, onChange, badges }: { value: Version; onChange: (v: Version) => void; badges: Badge[] }) {
  const { t } = useTranslation();
  return (
    <fieldset className="@container flex min-w-0 flex-col gap-2">
      <legend className="pb-2 text-title-medium text-on-surface">{t('escape.versions.legend')}</legend>
      <div className="grid grid-cols-1 gap-2 @xl:grid-cols-3">
        {VERSIONS.map((id, i) => {
          const version = i as Version;
          const badge = BADGES[i]!;
          const earned = badges.includes(badge);
          const selected = value === version;
          return (
            <label
              key={id}
              className={cn(
                'relative flex min-h-14 cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors duration-150',
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary',
                selected ? 'bg-primary-container text-on-primary-container ring-2 ring-primary ring-inset' : 'bg-surface-container text-on-surface hover:bg-surface-container-high',
              )}
            >
              <input type="radio" name="escape-version" value={id} checked={selected} onChange={() => onChange(version)} className="sr-only" />
              <Icon name={selected ? 'radio_button_checked' : 'radio_button_unchecked'} size={20} className={cn('mt-0.5 shrink-0', selected ? 'text-primary' : 'text-on-surface-variant')} />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-label-large">{t(`escape.versions.${id}.title`)}</span>
                <span className={cn('text-body-small', selected ? 'text-on-primary-container' : 'text-on-surface-variant')}>{t(`escape.versions.${id}.body`)}</span>
                <span className="flex items-center gap-1 pt-1 text-label-medium">
                  <Icon name={earned ? 'check_circle' : 'workspace_premium'} size={16} className="shrink-0" />
                  {earned ? t('escape.versions.earned', { badge: t(`escape.badges.short.${badge}`) }) : t('escape.versions.gives', { badge: t(`escape.badges.short.${badge}`) })}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The three badges, earned or not, each with its download when earned. */
export function BadgeStrip({ badges, highlight }: { badges: Badge[]; highlight?: Badge }) {
  const { t } = useTranslation();
  return (
    <ul aria-label={t('escape.badges.list')} className="@container grid grid-cols-1 gap-2 @xl:grid-cols-3">
      {BADGES.map((badge, i) => {
        const earned = badges.includes(badge);
        return (
          <li
            key={badge}
            className={cn(
              'flex min-w-0 flex-col gap-2 rounded-lg p-3',
              earned ? 'bg-tertiary-container text-on-tertiary-container' : 'border border-dashed border-outline-variant text-on-surface-variant',
              highlight === badge && 'ring-2 ring-tertiary ring-inset',
            )}
          >
            <span className="flex items-center gap-2">
              <Icon name={earned ? 'workspace_premium' : 'lock'} size={20} className="shrink-0" />
              <span className="text-title-small">{t(`escape.badges.${badge}`)}</span>
            </span>
            <span className="text-body-small">
              {earned ? t('escape.badges.earnedBody', { version: t(`escape.versions.${VERSIONS[i]}.title`).toLowerCase() }) : t('escape.badges.missingBody', { version: t(`escape.versions.${VERSIONS[i]}.title`).toLowerCase() })}
            </span>
            {earned && (
              <Button variant="outlined" size="xs" leadingIcon="download" className="w-full medium:w-auto medium:self-start" onClick={() => downloadBadge(badge, t)}>
                {t('escape.badges.download')}
                <span className="sr-only"> {t(`escape.badges.${badge}`)}</span>
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** A color token resolved by the browser, so the image keeps the palette without loose values (2.1). */
const token = (name: string, fallback: string) =>
  (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue(`--md-sys-color-${name}`).trim()) || fallback;

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The badge as an SVG image: flat, with the tertiary tokens of the palette (read from the page), the name of the game,
 * the version and the date. No name nor data of the person (privacy by design).
 */
export function badgeSvg(badge: Badge, t: TFunction): string {
  const i = BADGES.indexOf(badge);
  const version = t(`escape.versions.${VERSIONS[i]}.title`).toLowerCase();
  const paper = token('surface-container-lowest', 'white');
  const container = token('tertiary-container', 'lightcyan');
  const accent = token('tertiary', 'teal');
  const ink = token('on-tertiary-container', 'darkslategray');
  const lines = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" role="img" aria-label="${escapeXml(t(`escape.badges.${badge}`))}">`,
    `<rect width="600" height="600" rx="48" fill="${paper}"/>`,
    `<rect x="24" y="24" width="552" height="552" rx="36" fill="${container}"/>`,
    `<circle cx="300" cy="210" r="104" fill="${accent}"/>`,
    `<circle cx="300" cy="210" r="80" fill="none" stroke="${paper}" stroke-width="6"/>`,
    `<text x="300" y="232" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="600" fill="${paper}">${i + 1}</text>`,
    `<path d="M244 300 L220 390 L262 372 L284 406 L300 316 Z M356 300 L380 390 L338 372 L316 406 L300 316 Z" fill="${accent}"/>`,
    `<text x="300" y="456" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="600" fill="${ink}">${escapeXml(t(`escape.badges.${badge}`))}</text>`,
    `<text x="300" y="496" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="20" fill="${ink}">${escapeXml(t('escape.badges.svgLine', { version }))}</text>`,
    `<text x="300" y="532" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="16" fill="${ink}">${escapeXml(t('escape.badges.svgFoot', { date: formatDate(DEMO_TODAY) }))}</text>`,
    '</svg>',
  ];
  return lines.join('');
}

function downloadBadge(badge: Badge, t: TFunction) {
  const blob = new Blob([badgeSvg(badge, t)], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${t('escape.badges.fileName', { badge: t(`escape.badges.short.${badge}`) })}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

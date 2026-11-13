import type { ContentSource } from '@/app/content-sources';
import type { IconName } from '@/components/ui/Icon';

/** One icon per kind of source, the same in the compact chips and in the Fuentes page. */
export const SOURCE_KIND_ICON: Record<ContentSource['kind'], IconName> = {
  workshop: 'school',
  presentation: 'menu_book',
  official: 'account_balance',
  formula: 'calculate',
};

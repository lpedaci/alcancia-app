import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PERSON_PHOTOS } from '@/assets/people';
import { Avatar } from './Avatar';

describe('Avatar (D-165)', () => {
  it('shows the photo of a demo person, decorative and with the role ring', () => {
    const { container } = render(<Avatar name="Mariana López" role="participant" personId="p-mariana" />);
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('src', PERSON_PHOTOS['p-mariana']);
    expect(img).toHaveAttribute('alt', '');
    expect(img.className).toContain('ring-role-participant');
  });

  it('keeps initials for everyone else', () => {
    const { container } = render(<Avatar name="Lucía Herrera" role="participant" personId="p-lucia-herrera" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toBe('LH');
  });

  it('has a photo for each of the five demo people', () => {
    expect(Object.keys(PERSON_PHOTOS).sort()).toEqual(['p-diego', 'p-kevin', 'p-mariana', 'p-paula', 'p-ricardo']);
  });
});

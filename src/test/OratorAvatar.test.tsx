import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OratorAvatar, getOratorInitials } from '../components/common/OratorAvatar';

describe('OratorAvatar and getOratorInitials', () => {
  it('extracts correct initials stripping titles and honorifics', () => {
    expect(getOratorInitials('Dr. Arthur Vance')).toBe('AV');
    expect(getOratorInitials('Geoffrey Anyona')).toBe('GA');
    expect(getOratorInitials('Qsmceoglvn')).toBe('QS');
    expect(getOratorInitials('Coach Qassim')).toBe('QA');
    expect(getOratorInitials('Prof. Jane Doe')).toBe('JD');
    expect(getOratorInitials('')).toBe('GO');
  });

  it('renders monogram initials when src is empty or undefined', () => {
    render(<OratorAvatar src="" name="Dr. Arthur Vance" />);
    expect(screen.getByText('AV')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders img with referrerPolicy no-referrer when src is provided', () => {
    render(<OratorAvatar src="https://example.com/photo.jpg" name="Geoffrey Anyona" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveAttribute('referrerPolicy', 'no-referrer');
  });

  it('falls back to monogram initials if image triggers onError', () => {
    render(<OratorAvatar src="https://broken-link.com/avatar.jpg" name="Dr. Arthur Vance" />);
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(screen.getByText('AV')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

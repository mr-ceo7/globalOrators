import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { GlobalOratorsLogo, NubianFitLogo } from '../components/common/GlobalOratorsLogo';

describe('GlobalOratorsLogo Component Tests', () => {
  test('should render default mark variant with svg and paths', () => {
    const { container } = render(<GlobalOratorsLogo className="w-10 h-10" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '400 215 460 460');
    expect(svg).toHaveClass('w-10');
    expect(svg).toHaveClass('h-10');

    // Globe circle and crescent path
    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('cx', '592.2');
    expect(circle).toHaveAttribute('cy', '444.6');

    // Title / aria-label
    expect(svg).toHaveAttribute('aria-label', 'Global Orators Project');
  });

  test('should render full lockup variant with stacked typography', () => {
    const { container } = render(<GlobalOratorsLogo variant="full" className="w-48 h-auto" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '90 220 1080 820');

    // Typography path element
    const typo = container.querySelector('#go-typography');
    expect(typo).toBeInTheDocument();
  });

  test('should render horizontal variant with mark and styled brand typography', () => {
    const { container, getByText } = render(<GlobalOratorsLogo variant="horizontal" className="h-12" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '400 215 460 460');

    expect(getByText('The')).toBeInTheDocument();
    expect(getByText('GLOBAL')).toBeInTheDocument();
    expect(getByText('ORATORS')).toBeInTheDocument();
    expect(getByText('Project')).toBeInTheDocument();
  });

  test('should support theme and currentColor color modes', () => {
    const { container: themeContainer } = render(<GlobalOratorsLogo colorMode="theme" />);
    const circleTheme = themeContainer.querySelector('[data-testid="go-globe-rim"]');
    expect(circleTheme).toHaveAttribute('stroke', 'var(--app-fg, #0D3A35)');

    const { container: currentContainer } = render(<GlobalOratorsLogo colorMode="currentColor" />);
    const circleCurrent = currentContainer.querySelector('[data-testid="go-globe-rim"]');
    expect(circleCurrent).toHaveAttribute('stroke', 'currentColor');
  });

  test('should provide backwards-compatible NubianFitLogo alias', () => {
    expect(NubianFitLogo).toBe(GlobalOratorsLogo);
    const { container } = render(<NubianFitLogo className="h-8 w-8" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

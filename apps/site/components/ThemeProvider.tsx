import type { ThemeConfig } from '@siteforge/types';

interface Props {
  theme: ThemeConfig;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: Props) {
  const cssVars = {
    '--color-primary': theme.colors.primary,
    '--color-accent': theme.colors.accent,
    '--color-bg': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-text': theme.colors.text,
    '--color-text-secondary': theme.colors.textSecondary,
    '--color-border': theme.colors.border,
    '--font-heading': `'${theme.typography.headingFont}', sans-serif`,
    '--font-body': `'${theme.typography.bodyFont}', sans-serif`,
    '--font-size-base': theme.typography.baseFontSize,
    '--font-weight-heading': theme.typography.headingWeight,
    '--line-height': theme.typography.lineHeight,
    '--max-width': theme.layout.maxWidth,
    '--border-radius': theme.layout.borderRadius,
    '--spacing': theme.layout.spacing,
  } as React.CSSProperties;

  const fontFamilies = [
    ...new Set([theme.typography.headingFont, theme.typography.bodyFont]),
  ]
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join('&');

  const cssVarString = Object.entries(cssVars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');

  return (
    <>
      <style>{`:root{${cssVarString}}`}</style>
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`}
      />
      {children}
    </>
  );
}

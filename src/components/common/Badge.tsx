import React from 'react';

export type BadgeVariant = 'reviewed' | 'critical' | 'flagged' | 'unreviewed' | string;

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

/**
 * Reusable presentational Badge component.
 * Standardizes status, relevance, and certainty indicators across features.
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'unreviewed',
  className = '',
  children,
}) => {
  const normalizedVariant = variant.startsWith('badge-') ? variant.slice(6) : variant;
  const badgeClass = `badge badge-${normalizedVariant} ${className}`.trim();
  return <span className={badgeClass}>{children}</span>;
};

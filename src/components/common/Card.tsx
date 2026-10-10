import React from 'react';

/**
 * Reusable Card container component illustrating React composition via `children`.
 */
export interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, className = '', children }: CardProps) {
  const combinedClassName = className ? `card ${className}` : 'card';

  return (
    <div className={combinedClassName}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </div>
  );
}

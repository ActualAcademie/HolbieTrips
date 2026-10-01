import type { ReactNode } from 'react';

type PageProps = {
  title: string;
  kicker: string;
  children: ReactNode;
};

/** Provides the shared heading and spacing used by authenticated pages. */
export function Page({ title, kicker, children }: PageProps) {
  return (
    <section className="section page">
      <p className="eyebrow">{kicker}</p>
      <h1>{title}</h1>
      {children}
    </section>
  );
}

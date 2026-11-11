import type { ReactNode } from 'react';
import styles from './SectionHeading.module.css';

export function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id} className={styles.heading} aria-label={typeof children === 'string' ? children : undefined}><span aria-hidden="true" /><span data-motion-title="">{children}</span><span aria-hidden="true" /></h2>;
}

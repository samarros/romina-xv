import type { AnchorHTMLAttributes } from 'react';
import styles from './ActionLink.module.css';

export function ActionLink({ className = '', children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={`${styles.link} ${className}`} {...props}>{children}</a>;
}

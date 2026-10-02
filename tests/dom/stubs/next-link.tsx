import * as React from 'react';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: React.ReactNode;
  prefetch?: boolean;
};

export default function Link({ href, children, ...rest }: Props) {
  return React.createElement('a', { href, ...rest }, children);
}

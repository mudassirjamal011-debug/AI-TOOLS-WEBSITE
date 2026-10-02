export const routerCalls: { href: string }[] = [];

export function useRouter() {
  return {
    push: (href: string) => routerCalls.push({ href }),
    replace: (href: string) => routerCalls.push({ href }),
    prefetch: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
  };
}

export function usePathname() {
  return '/';
}

export function useSearchParams() {
  return new URLSearchParams();
}

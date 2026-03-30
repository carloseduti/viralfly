const PRIVATE_PREFIXES = [
  '/dashboard',
  '/campaigns',
  '/scripts',
  '/videos',
  '/publications'
];

export function isPrivatePath(pathname: string) {
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isLoginPath(pathname: string) {
  return pathname === '/login';
}

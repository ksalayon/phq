const HeaderNavItems = Object.freeze({
  Overview: '',
} as const);

export type HeaderNavKey = keyof typeof HeaderNavItems;
export type HeaderNavPath = (typeof HeaderNavItems)[HeaderNavKey];

export interface HeaderNavItem {
  path: HeaderNavPath;
  label: HeaderNavKey;
}

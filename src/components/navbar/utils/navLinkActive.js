export function isNavLinkActive(pathname, href) {
  if (!href) {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isNavGroupActive(pathname, subItems = []) {
  return subItems.some((item) => isNavLinkActive(pathname, item.href));
}

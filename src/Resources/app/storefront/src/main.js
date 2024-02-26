
window.PluginManager.override(
  'CookiePermission',
  () => import('./mcs-cookie-permission/mcs-cookie-permission.plugin'),
  '[data-cookie-permission]'
);

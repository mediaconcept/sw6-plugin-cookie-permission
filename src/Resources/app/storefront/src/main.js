
window.PluginManager.override(
  'CookieConfiguration',
  () => import('./mcs-cookie-permission/mcs-cookie-permission.plugin'),
  '[data-cookie-permission]'
);

// import storefront plugin
import Plugin from './mcs-cookie-permission/mcs-cookie-permission.plugin';

// register plugin
const PluginManager = window.PluginManager;
PluginManager.register('McsCookiePermission', Plugin, '[data-mcs-cookie-permission]');

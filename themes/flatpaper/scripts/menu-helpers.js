'use strict';

/* eslint-disable */
/**
 * Shared accent-menu helpers for theme.menu entries, used by both
 * _partial/header.ejs (desktop accent menu) and _partial/sidebar-right.ejs
 * (mobile drawer menu). A theme.menu entry may be:
 *   - "label: /path"                       (string href)
 *   - "label: { path/href/url/link, icon, label/name/title }"
 *   - a parent with `item:` holding an array or a label->entry map
 *
 * Returns the function bundle from a single helper call so templates keep
 * their existing local names: `var m = flatpaper_menu_helpers(); var
 * menuHref = m.href; ...`. `active` needs the calling view's context
 * (is_home / page.path), hence the helper-returning-closures shape.
 */

hexo.extend.helper.register('flatpaper_menu_helpers', function () {
  const ctx = this;

  function children(item) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    var raw = item.item;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(function (child, index) {
        var isObj = child && typeof child === 'object' && !Array.isArray(child);
        var childText = isObj ? (child.label || child.name || child.title || ('Item ' + (index + 1))) : String(child);
        return { label: childText, item: child };
      });
    }
    if (typeof raw === 'object') {
      return Object.keys(raw).map(function (childLabel) {
        return { label: childLabel, item: raw[childLabel] };
      });
    }
    return [];
  }

  function href(item) {
    var isObj = item && typeof item === 'object' && !Array.isArray(item);
    return isObj ? (item.path || item.href || item.url || item.link || '') : item;
  }

  function icon(item) {
    return (item && typeof item === 'object' && !Array.isArray(item)) ? item.icon : null;
  }

  // Image icons: http(s) URLs or local paths ending in an image extension
  // are rendered as <img class="nav-img-icon">; anything else goes through
  // the icon registry (see _partial/icons.ejs).
  function iconImg(item) {
    var raw = icon(item);
    if (!raw || typeof raw !== 'string') return null;
    if (raw.indexOf('http') === 0) return raw;
    if (/\.(png|jpe?g|webp|gif|svg|ico)([?#]|$)/i.test(raw)) return raw;
    return null;
  }

  function text(label, item) {
    return (item && typeof item === 'object' && !Array.isArray(item)) ? (item.label || item.name || item.title || label) : label;
  }

  function active(hrefValue) {
    var rawHref = String(hrefValue || '').trim();
    if (!rawHref || rawHref.charAt(0) === '#' || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(rawHref)) return false;
    var hrefPath = normalizePath(rawHref);
    if (!hrefPath) return ctx.is_home();
    var pagePath = normalizePath(ctx.page && ctx.page.path);
    return pagePath === hrefPath || pagePath.indexOf(hrefPath + '/') === 0;
  }

  function normalizePath(value) {
    return String(value || '')
      .split(/[?#]/)[0]
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .replace(/(^|\/)index\.html$/i, '')
      .replace(/\/+$/, '');
  }

  return { children: children, href: href, icon: icon, iconImg: iconImg, text: text, active: active };
});

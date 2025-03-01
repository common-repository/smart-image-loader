=== Smart Image Loader ===
Contributors: Nils Poltoraczyk, Bayer und Preuss GmbH
Tags: performance, speed, lazy loading, image, above the fold
Requires at least: 3.8.3
Tested up to: 4.9.3
Stable tag: 0.5.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Smart Image Loader is a fire-and-forget priority and lazy loader for image sources. Can be a huge performance boost especially for one pagers.


== Description ==

Smart Image Loader loads images which are visible in the initial viewport of your website before any images whose position is "below the fold", outside the current viewport. Those images can be loaded as soon as the visible images are finished loading or "lazy loaded" when they would become visible. This can be useful for bandwidth saving on mobile devices.

**There is no need to insert any additional code into your website, just install the plug-in.**

The default settings are fine in most cases, but you may want to adjust them for optimization.

Smart Image Loader is tested and works down to Internet Explorer 7, disabled below.

Note: there is currently no support for (CSS) background images.


== Installation ==

1. Unzip and upload the contents to your `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress


== Changelog ==

= 0.5.1 =
* forcing priority loaded images to be visible by css their properties
* tested with wordpress 4.9.9

= 0.5.0 =
* fixed minor bug that would try to write sizes attribute even when none are defined

= 0.4.8 =
* fixed error server would throw when HTTP_USER_AGENT isn't sent

= 0.4.7 =
* deactivate plugin completely in wordpress backend

= 0.4.6 =
* made enhanced accuracy option mandatory
* very minor performance tweaks

= 0.4.5 =
* removed iOS hacks

= 0.4.4 =
* support for responsive images ('srcset')

= 0.4.3 =
* support for featured images (post thumbnails)
* disabled iOS hacks for newer versions

= 0.4.2 =
* removed file reference causing an invalid request

= 0.4.1 =
* fixed visible detection
* test with Wordpress 4.2


= 0.4.0 =
* fixed some rather serious issues
* fixed js strict error in unminified file
* exposing sil_refresh() _before_ document ready
* added more events! document.sil_load, document.sil_load_visible, document.sil_load_all

= 0.3.9 =
* fixed bug where some images would not load on older android versions (2.x)
* fixed issue where images would load too late when no absolute width and height was given and refresh on scroll was off

= 0.3.8 =
* fixed images not being loaded when js would ignore no-js class

= 0.3.7 =
* fixed error "Cannot redeclare file_get_html()" caused by other plugin already including simple_html_dom

= 0.3.6 =
* fixed noscript view

= 0.3.5 =
* adressed php warning caused by mt_rand

= 0.3.4 =
* force data refresh for every source being inserted to adress img tags without proper sizes set causing a reflow

= 0.3.3 =
* switched from class to data attribute due to a php dom parser bug

= 0.3.2 =
* fixed a bug where images inserted via [caption] shortcode were being ignored
* fixed bug where enhanced accuracy would always be on
* removed overflow/offset checking for now because it was buggy anyway

= 0.3.1 =
* added fancy tag word

= 0.3.0 =
* enhanced accuracy option (checking actual visibility in addition to viewport relative position)
* splitted refresh option into resize and scroll event
* performance tweaks
* tested with WordPress 4.0

= 0.2.3 =
* using title instead of alt attribute for the sake of w3c conformity

= 0.2.2 =
* switched to css transform for the rubberbanding effect emulation
* more accurate image load handling

= 0.2.1 =
* first release



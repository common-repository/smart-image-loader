<?php
/*
Plugin Name: Smart Image Loader
Plugin URI: https://wordpress.org/plugins/smart-image-loader
Description: Load images visible at page load ('above the fold') first for a fast page loading impression. Optional lazy loading for images 'below the fold'.
Version: 0.5.1
Text Domain: smart-image-loader
Author: Bayer und Preuss
Author URI: www.bayerundpreuss.com

Copyright 2014 Bayer und Preuss  (email : smartimageloader@bayerundpreuss.com)

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License, version 2, as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

Credits to S.C. Chen, John Schlick, Rus Carroll for
http://sourceforge.net/projects/simplehtmldom/
*/

if ( !class_exists('simple_html_dom') && !function_exists('file_get_html') )
{
	require_once("simple_html_dom.php");
}

// for usage in a static html file
function wrap_images_from_document_line( $line )
{
	$html_string = _get_html_string_from_parentfile( $line );
	$html        = get_wrapped_html( $html_string );

	exit( $html );
}

function get_wrapped_html( $html_string )
{
	if ( isset($_SERVER['HTTP_USER_AGENT']) && preg_match('/(?i)msie [1-6]/', $_SERVER['HTTP_USER_AGENT']) || strlen($html_string) === 0 )
		return $html_string;

	$html            = str_get_html( $html_string );
	$selector        = 'img';
	$exclude_class   = 'not-smart';
	$placeholder     = '';
	$exclude_classes = array();

	if ( function_exists('get_option') )
	{
		$selector        = get_option('sil-selector', 'img');
		$placeholder     = get_option('sil-placeholder', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
		$exclude_classes = get_option('sil-exclude', 'not-smart');
		$exclude_classes = str_replace(' ', '', $exclude_classes);
		$exclude_classes = explode(',', $exclude_classes);
	}


	foreach( $html->find($selector) as $element )
	{

		$classes = explode(' ', $element->class);

		if ( count( array_intersect($classes, $exclude_classes) ) > 0 || preg_match( '/\.php/', $element->src) ) continue;


		if ( !isset($GLOBALS['sil_id']) ) $GLOBALS['sil_id'] = 0;

		$class_id = 'sil-' . $GLOBALS['sil_id']++;

		$element_empty_html = str_get_html( $element->outertext );
		$element_empty      = $element_empty_html->find( $selector, 0 );
		$element_empty->src = $placeholder;
		$element_empty->srcset = "";

		$element_empty->setAttribute('data-sil', $class_id);

		$element->outertext = $element_empty->outertext . PHP_EOL . '<span><noscript data-sil="' . $class_id . '" data-src="' . $element->src . '" data-srcset="' . $element->srcset . '">' . $element->outertext . '</noscript></span>' . PHP_EOL;
	}

	return $html;
}

function _get_html_string_from_parentfile( $line )
{
	$this_filename = substr( $_SERVER['SCRIPT_NAME'], strrpos( $_SERVER['SCRIPT_NAME'], '/' )+1 );
	$this_file     = file( $this_filename );
	$this_file     = array_slice( $this_file, $line  );
	$html_string   = implode( $this_file );

	return $html_string;
}

if ( !function_exists('wp_register_script') ) return;
// wordpress stuff starts here


function _inject_imagewrapper_js()
{
	wp_enqueue_script('smart-image-loader', '/wp-content/plugins/smart-image-loader/smart_image_loader.min.js', array('jquery'));
?>
	<script>
		var sil_options = {
			selector:              <?= '"' . get_option('sil-selector', 'img') . '"' ?>,
			exclude:               <?= '"' . get_option('sil-exclude', 'not-smart') . '"' ?>,
			cleanup:               <?= get_option('sil-cleanup', 'true') ? 'true' : 'false' ?>,
			meat:                  <?= get_option('sil-meat', '100') ?>,
			refresh_resize:        <?= get_option('sil-refresh-resize', 'false') ? 'true' : 'false' ?>,
			refresh_scroll:        <?= get_option('sil-refresh-scroll', 'false') ? 'true' : 'false' ?>,
			lazy_load_at:          <?= get_option('sil-lazy-load-at', '1024') ?>,
			fade:                  <?= get_option('sil-fade', 'false') ? 'true' : 'false' ?>,
			placeholder:           <?= '"' . get_option('sil-placeholder', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') . '"' ?>,
			loader:                <?= get_option('sil-loader', 'false') ? 'true' : 'false' ?>
		};
	</script>
<?php
}add_action( 'wp_enqueue_scripts', '_inject_imagewrapper_js' );


function sil_noscript()
{
	?>
	<noscript>
		<style type="text/css">
			img[data-sil] { display: none; }
		</style>
	</noscript>
	<?php
	if ( false && get_option('sil-loader') ) {
	?>
	<style type="text/css">
		img[data-sil]
		{
			background-image: url('/wp-content/plugins/smart-image-loader/loading.gif');
			background-repeat: no-repeat;
			background-position: center center;
		}
	</style>
	<?php
	}
}add_action('wp_head', 'sil_noscript');


function sil_settings_links($links)
{
	$url = get_admin_url().'plugins.php?page=smart-image-loader/options.php';

	$settings_link = '<a href="' . $url . '">' . __( 'Settings' ) . '</a>';
	array_unshift($links, $settings_link);
	return $links;
}add_filter("plugin_action_links_smart-image-loader/plugin.php", 'sil_settings_links');


function sil_admin_menu(){
	add_submenu_page('','smart-image-loader','smart-image-loader','manage_options','smart-image-loader/options.php');
}add_action('admin_menu', 'sil_admin_menu');


function add_sil_options() {
	add_option( 'sil-selector', 'img');
	add_option( 'sil-exclude', 'not-smart');
	add_option( 'sil-cleanup', 'true');
	add_option( 'sil-meat', '100');
	add_option( 'sil-refresh-resize', 'true');
	add_option( 'sil-refresh-scroll', 'false');
	add_option( 'sil-lazy-load-at', '1024');
	add_option( 'sil-fade', 'false');
	add_option( 'sil-placeholder', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
	add_option( 'sil-loader', 'false');
}add_action( 'admin_menu', 'add_sil_options' );


function register_sil_settings() {
	register_setting( 'sil-settings-group', 'sil-selector' );
	register_setting( 'sil-settings-group', 'sil-exclude' );
	register_setting( 'sil-settings-group', 'sil-cleanup' );
	register_setting( 'sil-settings-group', 'sil-meat' );
	register_setting( 'sil-settings-group', 'sil-refresh-resize' );
	register_setting( 'sil-settings-group', 'sil-refresh-scroll' );
	register_setting( 'sil-settings-group', 'sil-lazy-load-at' );
	register_setting( 'sil-settings-group', 'sil-fade' );
	register_setting( 'sil-settings-group', 'sil-placeholder' );
	register_setting( 'sil-settings-group', 'sil-loader' );
}add_action( 'admin_menu', 'register_sil_settings' );

if ( !is_admin() ){
	add_filter( 'the_content', 'get_wrapped_html' );
	add_filter( 'post_thumbnail_html', 'get_wrapped_html' );
}

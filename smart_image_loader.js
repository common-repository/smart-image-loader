(function($) {

	// Version: 0.5.1

	"use strict";

	// Options
	var sil_options = window.sil_options || {

		// CSS Selector for images to affect (jQuery)
		selector: 'img',

		// Clean up DOM after source is inserted (the noscript tag). This is just cosmetics, turn off if performance is critical
		cleanup: true,

		// Threshold distance from actual visibility to insert the source (in pixels)
		meat: 100,

		// update the images position data on resize event. You can also refresh manually in your script with sil_refresh().
		refresh_resize: true,

		// update the images position data on resize event. You can also refresh manually in your script with sil_refresh().
		refresh_scroll: false,

		// Maximum screen width where to switch from priority to lazy loading. Set to 0 for no lazy loading
		lazy_load_at: 1024,

		// Fade in lazy loaded images. Fancy.
		fade: false,

		// Value of empty image source.
		placeholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',

		// when priority loading, never load images that are not visible due to css rules. This rule is not available in the plugin options front end because I think it is too advanced to be relevant.
		force_visible: true
	};

	var d = document,
		w = window,
		$document = $(d),
		$wrapping_image,
		$wrapped_images,
		$loading_images,
		$html_body,
		$noscripts,
		host,

		window_width,
		window_height,
		doc_height,
		scroll_top,
		scroll_left,

		prev_x,
		prev_y,

		all_loaded,
		initialized,

		scroll_event,
		scroll_event_last,
		resize_event,
		resize_event_last,

		lazyload = !!( w.matchMedia && w.matchMedia('(max-device-width: '+sil_options.lazy_load_at+'px)').matches ),



	// HELPER
	//////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////

	viewport = function()
	{

		var e = w,
			a = 'inner';
		if ( !( 'innerWidth' in w ) )
		{
			a = 'client';
			e = d.documentElement || d.body;
		}
		return { width : e[ a+'Width' ] , height : e[ a+'Height' ]};

	},


	getStyle = function(el, property)
	{
		if ( window.getComputedStyle )
		{
			return document.defaultView.getComputedStyle(el,null)[property];
		}
		if ( el.currentStyle )
		{
			return el.currentStyle[property];
		}
	},


	scrolled = function()
	{

		return scroll_event_last !== scroll_event;

	},


	resized = function()
	{

		return resize_event_last !== resize_event;

	},

	is_visible_in_viewport = function(v)
	{

		var element,
			$element,
			data,
			element_offset_top,
			element_offset_left,
			element_width,
			element_height,
			element_visibile,
			is_not_above_screen,
			is_not_below_screen,
			is_not_right_of_screen,
			is_not_left_of_screen,
			is_not_hidden,
			options;

		if ( v.nodeType && v.nodeType == 1 )
			element = v;

		else if ( this.nodeType && this.nodeType == 1 )
			element = this;

		$element         = $(element);
		data             = $element.data();
		options          = sil_options;
		element_visibile = data['visibility'];

		is_not_above_screen    = data['offsetTop'] + data['height'] > scroll_top - options.meat;
		is_not_left_of_screen  = data['offsetLeft'] + data['width'] > scroll_left - options.meat;
		is_not_below_screen    = data['offsetTop'] < scroll_top + window_height + options.meat;
		is_not_right_of_screen = data['offsetLeft'] < scroll_left + window_width + options.meat;


		return is_not_above_screen && is_not_left_of_screen && is_not_below_screen && is_not_right_of_screen && element_visibile;

	},


	is_visible = function (v)
	{
		var element;

		if ( v.nodeType && v.nodeType == 1 )
			element = v;

		else if ( this.nodeType && this.nodeType == 1 )
			element = this;

		return $(element).data('visibility');
	},


	no_filter = function ()
	{
		return true;
	},


	source_not_set = function(v)
	{

		var element, src;

		if ( v.nodeType && v.nodeType == 1 )
			element = v;

		else if ( this.nodeType && this.nodeType == 1 )
			element = this;

		src = $(element).attr('src');

		// for browsers which still have the empty request bug we include the latter
		return src == sil_options.placeholder || src == host;

	},


	has_absolute_size = function( img )
	{
		return typeof img.width == "string" && img.width.match(/^\d+$/) && typeof img.height == "string" && img.height.match(/^\d+$/);
	},


	refresh_data = function( $elements )
	{

		$elements = $elements || $wrapped_images || $('body').find('noscript').prev( sil_options.selector );

		$elements.each( function(){

			var $this = $(this);

			$this.data({
				offsetTop:  $this.offset().top,
				offsetLeft: $this.offset().left,
				width:      $this.width(),
				height:     $this.height(),
				visibility: getStyle(this, 'display') != "none" && getStyle(this, 'visibility') != "hidden" && getStyle(this, 'opacity') != "0" && $this.is(":visible")
			});

		});

		doc_height = $(d).height();


	},






	// IMAGE LOADING
	//////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////

	load_image = function( wrapping_image, on_load_callback, override_fading )
	{

		$wrapping_image = $(wrapping_image);

		var
		classId   = $wrapping_image.attr('data-sil'),
		$noscript = $noscripts.filter( '[data-sil="' + classId + '"]'),
		sizes,
		srcSet,
		src;


		if ( typeof on_load_callback == 'function' )
			$wrapping_image.on( 'load', on_load_callback );



		if ( sil_options.fade && !override_fading )
		{
			$wrapping_image.data({ opacity: $wrapping_image.css('opacity') }).css({ opacity: '0' });

			$wrapping_image.on( 'load', function(){

				$(this).fadeTo( 500, $(this).data('opacity') );
			});
		}

		sizes = '(max-width: '+window_width+'px) ' + parseInt($wrapping_image.data('width') / window_width * 100) + 'vw';
		if ( $wrapping_image.attr( 'sizes' ) )
		{
			sizes += (", " + $wrapping_image.attr( 'sizes' ));
		}
		$wrapping_image.attr( 'sizes', sizes );

		srcSet = $noscript.attr('data-srcset');
		if ( srcSet ) {
			$wrapping_image.attr( 'srcset', srcSet );
		}

		src = $noscript.attr('data-src');
		if ( src ) {
			$wrapping_image.attr( 'src', $noscript.attr('data-src') );
		}

		$loading_images = $loading_images.add( $wrapping_image );


		// waiting one frame for the image to affect layout and refresh data. sometimes it's not enough, so we'll do it again on load.
		requestAnimationFrame(function () {

			if ( !has_absolute_size(wrapping_image) )
			{
				refresh_data( $wrapped_images );
				load_visible_images();
			}
		});

		if ( sil_options.cleanup )
		{
			$noscript.parent('span').remove();
		}

	},

	load_images = function ( filter, override_fading ) {

		var $images_to_load = $wrapped_images.filter( filter || no_filter );

		if ( $images_to_load.length > 0 )
		{
			$images_to_load.each( function(i, image){

				// remove load triggered image from object
				$wrapped_images = $wrapped_images.map( function(){

					if ( this !== image ) return this;
				});

				// trigger image loading
				load_image( image, on_image_load, override_fading );
			});
		}
	},

	// load all images regarding their position on the viewport
	load_visible_images = function( filter, override_fading )
	{
		load_images( is_visible_in_viewport, override_fading );
	},

	// load all images, no matter their position on the viewport
	load_all_images = function()
	{
		var filter = sil_options.force_visible ? is_visible : no_filter;

		load_images( filter );
	},

	// EVENT HANDLING
	//////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////


	on_image_load = function( e )
	{

		var $images_to_load, $images_waiting;

		$document.trigger('sil_load', e.target);

		// has the document layout changed after the source has been inserted?
		if ( !has_absolute_size(e.target) )
		{
			// then do new check
			refresh_data( $wrapped_images );
			load_visible_images();
		}

		e.target.removeAttribute("data-sil");

		$images_to_load = $wrapped_images.filter( is_visible_in_viewport );
		$images_waiting = $wrapped_images.not($images_to_load);
		$loading_images = $loading_images.map( function(){

			if ( this !== e.target ) return this;
		});

		if ( $images_to_load.length + $loading_images.length === 0 )
		{
			if ( $images_waiting.length === 0 )
				on_all_load();
			else
				on_all_visible_load();
		}

	},


	on_all_visible_load = function ()
	{

		$document.trigger('sil_load_visible');

		if ( $wrapped_images.length === 0 )
			on_all_load();

		else if ( !lazyload )
			load_all_images();

	},


	on_all_load = function ()
	{

		$document.trigger('sil_load_all');

	},


	on_user_refresh = window.sil_refresh = function()
	{

		if ( initialized === true ){

			refresh_data( $wrapped_images );
			load_visible_images();
		}

	},


	on_document_scroll = function(e)
	{

		scroll_event = e;

	},


	on_window_resize = function(e)
	{

		resize_event = e;

	},


	on_document_ready = function()
	{

		window.requestAnimationFrame( init );

	},


	on_window_load = function()
	{

		doc_height = $document.height();

	},


	register_events = function()
	{

		$(w).on('resize', on_window_resize);
		$(w).on('load',   on_window_load);
		$document.on('scroll', on_document_scroll);

		$document.ready( on_document_ready );
	},


	unregister_events = function()
	{

		$(w).off('resize', on_window_resize);
		$document.off('scroll', on_document_scroll);

	},



	// MAIN
	//////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////

	render = function( frame )
	{

		if ( scrolled() )
		{
			scroll_top  = $document.scrollTop();
			scroll_left = $document.scrollLeft();

			if ( sil_options.refresh_scroll )
				refresh_data( $wrapped_images );

			load_visible_images();

			scroll_event_last = scroll_event;
		}


		if ( resized() )
		{
			window_width = viewport().width;
			window_height = viewport().height;

			refresh_data( $wrapped_images );

			if ( sil_options.refresh_resize )
				refresh_data( $wrapped_images );

			load_visible_images();

			resize_event_last = resize_event;
		}


		if ( !all_loaded )
			w.requestAnimationFrame( render );

		else
			unregister_events();

	},


	init = function()
	{

		$html_body      = $('html, body');
		$noscripts      = $('body').find('noscript[data-sil]');
		$wrapped_images = $(sil_options.selector + '[data-sil]');
		window_width    = viewport().width;
		window_height   = viewport().height;
		host            = d.location.protocol + '//' + d.location.host + '/';
		scroll_top      = $document.scrollTop();
		scroll_left     = $document.scrollLeft();
		doc_height      = $document.height();
		$loading_images = $([]);
		all_loaded      = $wrapped_images.length > 0 ? false : true;

		refresh_data( $wrapped_images );
		load_visible_images( true );

		render();

		initialized = true;

	};

	rf_poly();
	register_events();


})(jQuery);


// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

function rf_poly() {
	var lastTime = 0;
	var vendors = ['webkit', 'moz'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame =
		  window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); },
			  timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}


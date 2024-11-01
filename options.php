
<div class="wrap">
<h2>Smart Image Loader</h2>

<form method="post" action="options.php">
	<?php settings_fields( 'sil-settings-group' ); ?>
	<?php do_settings_sections( 'sil-settings-group' ); ?>
	<table class="form-table ">


		<tr valign="top">
			<th scope="row">Visible threshold</th>
			<td><input type="number" name="sil-meat" id="sil-meat" value="<?php echo get_option('sil-meat', '100'); ?>" /><br/>The images' threshold distance to the viewport to load it (in pixels).</td>
		</tr>

		<tr valign="top">
			<th scope="row">Lazy load below</th>
			<td><input type="number" name="sil-lazy-load-at" id="sil-lazy-load-at" value="<?php echo get_option('sil-lazy-load-at', '1024'); ?>" /><br/>Maximum screen width (in pixels) for lazy loading, assuming small screen devices tend to run on bandwidth critical connections. Set to 0 to disable or very high to force.</td>
		</tr>

		<tr valign="top">
			<th scope="row">Fade effect</th>
			<td><input type="checkbox" name="sil-fade" id="sil-fade" value="true" <?php checked( "true" == get_option('sil-fade') ) ?>/><label for="sil-fade">Fade in lazy loaded images. Fancy.</label></td>
		</tr>

		<tr valign="top">
			<th scope="row">Loading image</th>
			<td><input type="checkbox" name="sil-loader" id="sil-loader" value="true" <?php checked( "true" == get_option('sil-loader') ) ?>/><label for="sil-loader">Display a loading animation image until the image is loaded.</label></td>
		</tr>
	</table>

	<table class="form-table postbox">
		<thead><h3>Advanced</h3></thead>

		<tr valign="top">
			<th style="padding-left: 1em;" scope="row">CSS Selector</th>
			<td style="padding-left: 1em;"><input type="text" name="sil-selector" id="sil-selector" value="<?php echo get_option('sil-selector', 'img'); ?>" /><br/>CSS Selector for images to affect. Use a class if you want to affect only certain images.</td>
		</tr>

		<tr valign="top">
			<th style="padding-left: 1em;" scope="row">CSS Exclude Class</th>
			<td style="padding-left: 1em;"><input type="text" name="sil-exclude" id="sil-exclude" value="<?php echo get_option('sil-exclude', 'not-smart'); ?>" /><br/>Images with this class will be excluded. Overrides the include selector (useful if your include selector is 'img'). Comma separated if multiple.</td>
		</tr>

		<tr valign="top">
			<th style="padding-left: 1em;" scope="row">Source placeholder</th>
			<td style="padding-left: 1em;"><input type="text" name="sil-placeholder" value="<?php echo get_option('sil-placeholder', ''); ?>" /><br/>Value of empty image source attribute (default is a base64 encoded transparent pixel).</td>
		</tr>

		<tr valign="top" style="padding-left: 1em;">
		<th style="padding-left: 1em;"scope="row">Refresh</th>
		<td style="padding-left: 1em;">
			Refresh the images' absolute position data based on certain events. You can also trigger a refresh manually with window.sil_refresh().
			<br style="margin-bottom: .5em"/>
			<input type="checkbox" name="sil-refresh-resize" id="sil-refresh-resize" value="true" <?php checked( "true" == get_option('sil-refresh-resize') ) ?> /><label for="sil-refresh-resize">On window resize. Recommended to account for CSS reflow.</label>
			<br style="margin-bottom: .5em"/>
			<input type="checkbox" name="sil-refresh-scroll" id="sil-refresh-scroll" value="true" <?php checked( "true" == get_option('sil-refresh-scroll') ) ?> /><label for="sil-refresh-scroll">On scroll. Performance heavy but useful if your site's layout changes dynamically.</label>
		</td>

		</tr>

		<tr valign="top" style="padding-left: 1em;">
			<th style="padding-left: 1em;" scope="row">Clean up</th>
			<td style="padding-left: 1em;"><input type="checkbox" name="sil-cleanup" id="sil-cleanup" value="true" <?php checked( "true" == get_option('sil-cleanup') ) ?> /><label for="sil-cleanup">Clean up DOM after the image source has been inserted. This is just cosmetics basically, turn off if performance is critical.</label></td>
		</tr>

	</table>

	<?php submit_button(); ?>

</form>
</div>
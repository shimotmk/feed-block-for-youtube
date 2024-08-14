<?php
/**
 * Registers the `feed-block-for-youtube/video` block.
 *
 * @package feed_block_for_YouTube
 */

/**
 * Video callback
 *
 * @param array  $attributes Block attributes.
 * @param string $content Inner content.
 * @param object $block block.
 * @return string
 */
function simple_feed_block_for_youtube_video_render_callback( $attributes, $content, $block ) {
	if ( ! isset( $block->context['feedBlockForYouTubeUrl'] ) ) {
		return null;
	}
	if ( ! isset( $block->context['youtubeFeedBlockIndex'] ) ) {
		return null;
	}

	$data  = Feed_Block_For_YouTube::get_feed_data( $block->context['feedBlockForYouTubeUrl'] );
	$rss = ! empty( $data['rss'] ) ? $data['rss'] : false;
	$rss = preg_replace("/<([^>]+?):(.+?)>/", "<$1_$2>", $rss);
	$rss = simplexml_load_string($rss,'SimpleXMLElement',LIBXML_NOCDATA);
	$value = $rss->entry[$block->context['youtubeFeedBlockIndex']];
	$video_id = ! empty( $value->yt_videoId ) ? htmlspecialchars($value->yt_videoId, ENT_QUOTES, 'UTF-8') : false;
	$title = ! empty( $value->title ) ? $value->title : false;
	$video_unique_id = wp_unique_id( 'video-' );

	if ( ! $video_id || ! $title ) {
		return null;
	}

	$is_light_box   = isset( $attributes['isLightBox'] ) ? $attributes['isLightBox'] : true;

	$classes = array();
	$classes[] = 'wp-embed-aspect-16-9 wp-has-aspect-ratio';
	if ($is_light_box) {
		$classes[] = 'wp-embed-youtube-video-player-light-box';
	}
	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => implode( ' ', $classes ) ) );

	$aria_label       = __( 'Enlarge image' );

	//  翻訳が効いていないとうまくいかない？？
	// if ( $title ) {
	// 	/* translators: %s: Image alt text. */
	// 	$aria_label = sprintf( __( 'Enlarge image: %s' ), $title );
	// }

	$button =
	'<div
		class="lightbox-trigger"
		aria-haspopup="dialog"
		aria-label="' . esc_attr( $aria_label ) . '"
		data-wp-init="callbacks.initTriggerButton"
		data-wp-on--click="actions.showLightbox"
		aria-controls="' . esc_attr( $video_unique_id ) . '"
	>
		<svg width="68" height="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/></svg>
	</div>';

	add_action( 'wp_footer', 'simple_feed_block_for_youtube_print_lightbox_overlay' );

	return sprintf(
		'<div %1$s data-wp-interactive="feed-block-for-youtube/video" data-wp-context=%2$s id="%4$s">
			<div class="embed-responsive">
				<img width="1600" height="900" src="http://img.youtube.com/vi/%3$s/0.jpg" data-wp-init="callbacks.setButtonStyles" data-wp-on--load="callbacks.setButtonStyles" data-wp-on-window--resize="callbacks.setButtonStyles" data-wp-on--click="actions.showLightbox"/>
			</div>
			%5$s
		</div>',
		$wrapper_attributes,
		wp_json_encode(
			array(
				'videoId'      => $video_id,
				'targetWidth'  => '1600',
				'targetHeight' => '900',
				'ariaLabel'    => $aria_label,
			),
			JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP
		),
		$video_id,
		$video_unique_id,
		$button
	);
}

/**
 */
function simple_feed_block_for_youtube_print_lightbox_overlay() {
  $close_button_label = esc_attr__( 'Close' );

  $background_color   = '#fff';
  $close_button_color = '#000';

  if ( wp_theme_has_theme_json() ) {
    $global_styles_color = wp_get_global_styles( array( 'color' ) );
    if ( ! empty( $global_styles_color['background'] ) ) {
      $background_color = esc_attr( $global_styles_color['background'] );
    }
    if ( ! empty( $global_styles_color['text'] ) ) {
      $close_button_color = esc_attr( $global_styles_color['text'] );
    }
  } else {
    $color = get_background_color();
    if ($color) {
      $background_color = esc_attr( "#$color;" );
    }
  }

  ?>
  <div
    class="wp-lightbox-overlay zoom"
    data-wp-interactive="feed-block-for-youtube/video"
    data-wp-context='{}'
    data-wp-bind--role="state.roleAttribute"
    data-wp-bind--aria-label="state.currentImage.ariaLabel"
    data-wp-bind--aria-modal="state.ariaModal"
    data-wp-class--active="state.overlayEnabled"
    data-wp-class--show-closing-animation="state.showClosingAnimation"
    data-wp-watch="callbacks.setOverlayFocus"
    data-wp-on--keydown="actions.handleKeydown"
    data-wp-on--touchstart="actions.handleTouchStart"
    data-wp-on--touchmove="actions.handleTouchMove"
    data-wp-on--touchend="actions.handleTouchEnd"
    data-wp-on--click="actions.hideLightbox"
    data-wp-on-window--resize="callbacks.setOverlayStyles"
    data-wp-on-window--scroll="actions.handleScroll"
    tabindex="-1"
  >
    <button type="button" aria-label="<?php echo $close_button_label; ?>" style="fill: <?php echo $close_button_color; ?>" class="close-button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M13 11.8l6.1-6.3-1-1-6.1 6.2-6.1-6.2-1 1 6.1 6.3-6.5 6.7 1 1 6.5-6.6 6.5 6.6 1-1z"></path></svg>
    </button>
    <div class="lightbox-image-container">
      <div class="lightbox-image-youtube">
        <div class="embed-responsive">
          <iframe
            class="embed-responsive-item"
            allow="autoplay"
            allowfullscreen
            frameborder=0
            data-wp-bind--src="state.currentVideo"
          ></iframe>
        </div>  
      </div>
    </div>
    <div class="scrim" style="background-color: <?php echo $background_color; ?>"></div>
    <style data-wp-text="state.overlayStyles"></style>
  </div>
  <?php
}

/**
 * Register block
 *
 * @return void
 */
function simple_feed_block_for_youtube_register_block_embed_video_player() {
	register_block_type(
		__DIR__,
		array(
			'render_callback' => 'simple_feed_block_for_youtube_video_render_callback',
		)
	);
}
add_action( 'init', 'simple_feed_block_for_youtube_register_block_embed_video_player' );

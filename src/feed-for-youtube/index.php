<?php
/**
 * Registers the `feed-block-for-youtube/youtube-feed` block.
 *
 * @package feed_block_for_YouTube
 */

/**
 * youtube feed render callback
 *
 * @param array  $attributes Block attributes.
 * @param string $content Inner content.
 * @return string
 */
function Feed_Block_For_YouTube_render_callback( $attributes, $content ) {
	if ( ! isset( $attributes['url'] ) ) {
		return null;
	}

	$data         = Feed_Block_For_YouTube::get_feed_data( $attributes['url'] );
	$cannot_embed = ! empty( $data['cannot_embed'] ) ? $data['cannot_embed'] : false;

	if ( $cannot_embed ) {
		$wrapper_attributes = get_block_wrapper_attributes();
		$content            = $attributes['url'];
		return sprintf( '<div %1$s>%2$s</div>', $wrapper_attributes, $content );
	}

	return $content;
}

/**
 * Registers the `feed-block-for-youtube/youtube-feed` block on the server.
 *
 * @return void
 */
function simple_feed_block_for_youtube_register_block_youtube_feed() {
	register_block_type(
		__DIR__,
		array(
			'render_callback' => 'Feed_Block_For_YouTube_render_callback',
		)
	);
}
add_action( 'init', 'simple_feed_block_for_youtube_register_block_youtube_feed' );

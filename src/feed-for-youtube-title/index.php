<?php
/**
 * Registers the `feed-block-for-youtube/youtube-feed-title` block.
 *
 * @package feed_block_for_YouTube
 */

/**
 * Embed Title callback
 *
 * @param array  $attributes Block attributes.
 * @param string $content Inner content.
 * @param object $block block.
 * @return string
 */
function simple_feed_block_for_youtube_title_render_callback( $attributes, $content, $block ) {
	if ( ! isset( $block->context['feedBlockForYouTubeUrl'] ) ) {
		return null;
	}
	if ( ! isset( $block->context['youtubeFeedBlockIndex'] ) ) {
		return null;
	}

	$data  = Feed_Block_For_YouTube::get_feed_data( $block->context['feedBlockForYouTubeUrl'] );
	$title = ! empty( $data['title'] ) ? $data['title'] : false;
	$data  = Feed_Block_For_YouTube::get_feed_data( $block->context['feedBlockForYouTubeUrl'] );
	$rss = ! empty( $data['rss'] ) ? $data['rss'] : false;
	$rss = preg_replace("/<([^>]+?):(.+?)>/", "<$1_$2>", $rss);
	$rss = simplexml_load_string($rss,'SimpleXMLElement',LIBXML_NOCDATA);
	$value = $rss->entry[$block->context['youtubeFeedBlockIndex']];
	$title = ! empty( $value->title ) ? $value->title : false;

	if ( ! $title ) {
		return null;
	}

	$tag_name = 'h5';
	if ( isset( $attributes['level'] ) ) {
		$tag_name = 'h' . $attributes['level'];
	}

	if ( isset( $attributes['isLink'] ) && $attributes['isLink'] ) {
		$rel   = ! empty( $attributes['rel'] ) ? 'rel="' . esc_attr( $attributes['rel'] ) . '"' : '';
		$title = sprintf(
			'<a href="%1$s" target="%2$s" %3$s>%4$s</a>',
			esc_url( $block->context['feedBlockForYouTubeUrl'] ),
			esc_attr( $attributes['linkTarget'] ),
			$rel,
			$title
		);
	}

	$classes = array();
	if ( isset( $attributes['style']['elements']['link']['color']['text'] ) ) {
		$classes[] = 'has-link-color';
	}
	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => implode( ' ', $classes ) ) );

	return sprintf(
		'<%1$s %2$s>%3$s</%1$s>',
		$tag_name,
		$wrapper_attributes,
		$title
	);
}

/**
 * Register block
 *
 * @return void
 */
function simple_feed_block_for_youtube_register_block_embed_title() {
	register_block_type(
		__DIR__,
		array(
			'render_callback' => 'simple_feed_block_for_youtube_title_render_callback',
		)
	);
}
add_action( 'init', 'simple_feed_block_for_youtube_register_block_embed_title' );

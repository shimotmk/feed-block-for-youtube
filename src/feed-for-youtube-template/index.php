<?php
/**
 * Registers the `feed-block-for-youtube/feed-template` block.
 *
 * @package feed_block_for_YouTube
 */

/**
 * Renders the `feed-block-for-youtube/feed-template` block on the server.
 */
function simple_feed_block_for_youtube_youtube_feed_template_render_callback( $attributes, $content, $block ) {
	$embed_url = isset( $block->context['feedBlockForYouTubeUrl'] ) ? $block->context['feedBlockForYouTubeUrl'] : "";
	$items_to_show = isset( $block->context['feedBlockForYouTubeItemsToShow'] ) ? $block->context['feedBlockForYouTubeItemsToShow'] : "";
	$data  = Feed_Block_For_YouTube::get_feed_data( $embed_url );
	$rss = ! empty( $data['rss'] ) ? $data['rss'] : false;
	$rss = preg_replace("/<([^>]+?):(.+?)>/", "<$1_$2>", $rss);
	$rss = simplexml_load_string($rss,'SimpleXMLElement',LIBXML_NOCDATA);

	if ( empty($rss) ) {
		return '';
	}

	if ( count($rss->entry) === 0 ) {
		return '';
	}

	$classnames = '';
	if ( isset( $block->context['displayLayout'] ) && isset( $block->context['query'] ) ) {
		if ( isset( $block->context['displayLayout']['type'] ) && 'flex' === $block->context['displayLayout']['type'] ) {
			$classnames = "is-flex-container columns-{$block->context['displayLayout']['columns']}";
		}
	}
	if ( isset( $attributes['style']['elements']['link']['color']['text'] ) ) {
		$classnames .= ' has-link-color';
	}

	if ( isset( $attributes['layout']['type'] ) && 'grid' === $attributes['layout']['type'] && ! empty( $attributes['layout']['columnCount'] ) ) {
		$classnames .= ' ' . sanitize_title( 'columns-' . $attributes['layout']['columnCount'] );
	}

	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => trim( $classnames ) ) );

	$content = '';
	$embed_index = 0;
	for ( $i = 0; $i < $items_to_show; $i++ ) {
		$block_instance = $block->parsed_block;

		$block_instance['blockName'] = 'core/null';

		$filter_block_context = static function ( $context ) use (  $embed_url, $embed_index ) {
			$context['feedBlockForYouTubeUrl']   = $embed_url;
			$context['youtubeFeedBlockIndex']   = $embed_index;
			return $context;
		};

		add_filter( 'render_block_context', $filter_block_context, 1 );
		$block_content = ( new WP_Block( $block_instance ) )->render( array( 'dynamic' => false ) );
		remove_filter( 'render_block_context', $filter_block_context, 1 );

		$content .= '<li>' . $block_content . '</li>';
		$embed_index++;
	}

	return sprintf(
		'<ul %1$s>%2$s</ul>',
		$wrapper_attributes,
		$content
	);
}

/**
 * Registers the `feed-block-for-youtube/feed-template` block on the server.
 */
function simple_feed_block_for_youtube_register_block_youtube_template() {
	register_block_type(
		__DIR__,
		array(
			'render_callback'   => 'simple_feed_block_for_youtube_youtube_feed_template_render_callback',
			'skip_inner_blocks' => true,
		)
	);
}
add_action( 'init', 'simple_feed_block_for_youtube_register_block_youtube_template' );

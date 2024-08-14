<?php
/**
 * Registers the `feed-block-for-youtube/date` block.
 *
 * @package feed_block_for_YouTube
 */

/**
 * Embed Site Title render callback
 *
 * @param array  $attributes Block attributes.
 * @param string $content Inner content.
 * @param object $block block.
 * @return string
 */
function simple_feed_block_for_youtube_date_render_callback( $attributes, $content, $block ) {
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
	$displayType   = isset( $attributes['displayType'] ) ? $attributes['displayType'] : false;
	$unformatted_date = '';
	if ('date' === $displayType) {
		$unformatted_date = ! empty( $value->published ) ? $value->published : false;
	} elseif ('modified' === $displayType) {
		$unformatted_date = ! empty( $value->updated ) ? $value->updated : false;
	}

	if ( ! $unformatted_date ) {
		return null;
	}

	$format   = isset( $attributes['format'] ) ? $attributes['format'] : get_option( 'date_format' );

	$timezone_string = wp_timezone_string();
	$timezone = new DateTimeZone($timezone_string);
	$date = new DateTime($unformatted_date, new DateTimeZone('UTC'));
	$date->setTimezone($timezone);
	$time = $date->format($format);

	$wrapper_attributes = get_block_wrapper_attributes();

	return sprintf(
		'<div %1$s><time datetime="%2$s">%3$s</time></div>',
		$wrapper_attributes,
		$unformatted_date,
		$time
	);
}

/**
 * Register block
 *
 * @return void
 */
function simple_feed_block_for_youtube_register_block_date() {
	register_block_type(
		__DIR__,
		array(
			'render_callback' => 'simple_feed_block_for_youtube_date_render_callback',
		)
	);
}
add_action( 'init', 'simple_feed_block_for_youtube_register_block_date' );

<?php
/**
 * Plugin Name: Feed Block for YouTube
 * Description: Get the feed from a YouTube URL.
 * Requires at least: 6.5
 * Requires PHP: 7.4
 * Version: 0.1.0
 * Author: Tomoki Shimomura
 * License: GPL2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: feed-block-for-youtube
 *
 * @package feed_block_for_YouTube
 * @author Tomoki Shimomura
 * @license GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

define( 'FEED_BLOCK_FOR_YOUTUBE_OPTION_PREFIX', 'feed_block_for_youtube' );

require_once __DIR__ . '/classes/class-url-details.php';
require_once __DIR__ . '/classes/class-api.php';
new FeedBlockForYouTubeEntryPoint();
require_once __DIR__ . '/build/feed-for-youtube/index.php';
require_once __DIR__ . '/build/feed-for-youtube-template/index.php';
require_once __DIR__ . '/build/feed-for-youtube-title/index.php';
require_once __DIR__ . '/build/feed-for-youtube-date/index.php';
require_once __DIR__ . '/build/feed-for-youtube-video/index.php';

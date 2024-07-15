<?php
/**
 * Feed_Block_For_YouTube class
 *
 * @package feed_block_for_YouTube
 */

if ( ! defined( 'ABSPATH' ) ) exit; 

if ( class_exists( 'Feed_Block_For_YouTube' ) ) {
	return;
}

/**
 * Feed_Block_For_YouTube
 */
class Feed_Block_For_YouTube {

	/**
	 * Initialize
	 *
	 * @return Feed_Block_For_YouTube
	 */
	public static function init() {
		static $instance                         = null;
		return $instance ? $instance : $instance = new static();
	}


	/**
	 * Get Embed Data
	 *
	 * @param url     $url URL.
	 * @param boolean $clear_cache キャッシュクリアするか否か.
	 * @return array get_feed_data
	 */
	public static function get_feed_data( $url, $clear_cache = false ) {
		// Transient per URL.
		$cache_key = static::build_cache_key_for_url( $url );

		// Attempt to retrieve cached response.
		$cached_response = static::get_cache( $cache_key );

		if ( ! empty( $cached_response ) && ! $clear_cache ) {
			$data = $cached_response;
		} else {
			$data = static::get_feed_data_from_url( $url );
			static::set_cache( $cache_key, $data );
		}

		return $data;
	}

	/**
	 * get_feed_data_from_url
	 *
	 * @param url $url URL.
	 * @return array.
	 */
	public static function get_feed_data_from_url( $url ) {
		/**
		 * リンク先のHTMLを取得
		 */
		$response = wp_remote_get( $url );

		/**
		 * HTTP レスポンスステータスコードで条件分岐
		 */
		$status_code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $status_code && 304 !== $status_code ) {
			$embed_data['url']          = $url;
			$embed_data['cannot_embed'] = true;
			return $embed_data;
		}

		// URLのHTMLを$bodyに入れる
		$body = $response['body'];
		// 取得したHTMLを今のサイトの文字コードにencode
		$body = static::encode( $body );

		$embed_data['cannot_embed']   = false;
		$embed_data['url']            = $url;
		$embed_data['channel_id']     = static::get_channel_id( $body );
		// rssをJS側に渡す
		$embed_data['rss']            = static::get_rss( $body );

		// rssがない場合はcannot_embedをtrueにする
		if ( empty( $embed_data['rss'] ) ) {
			$embed_data['cannot_embed'] = true;
		}

		return $embed_data;
	}

	/**
	 * channel_idを取得
	 *
	 * @param string $body body.
	 * @return string
	 */
	public static function get_channel_id( $body ) {
		if ( preg_match( '/"channelId":"(.+?)"/is', $body, $matches ) ) {
			return $matches[1];
		}
		return '';
	}

	/**
	 * rssを取得
	 *
	 * @param string $body body.
	 * @return string
	 */
	public static function get_rss( $body ) {
		if ( preg_match( '/"channelId":"(.+?)"/is', $body, $matches ) ) {
			$rss_url = "https://www.youtube.com/feeds/videos.xml?channel_id=" .$matches[1];
			$rss     = wp_remote_get( $rss_url )['body'];
			return $rss;
		}
		return '';
	}

	/**
	 * Encode.
	 *
	 * @param string $body body.
	 * @return string
	 */
	public static function encode( $body ) {
		if ( ! function_exists( 'mb_convert_encoding' ) || ! $body ) {
			return $body;
		}

		foreach ( array( 'UTF-8', 'SJIS', 'EUC-JP', 'ASCII', 'JIS' ) as $encode ) {
			$encoded_content = mb_convert_encoding( $body, $encode, $encode );
			if ( strcmp( $body, $encoded_content ) === 0 ) {
				$from_encode = $encode;
				break;
			}
		}

		if ( empty( $from_encode ) ) {
			return $body;
		}

		return mb_convert_encoding( $body, get_bloginfo( 'charset' ), $from_encode );
	}

	/**
	 * Utility function to build cache key for a given URL.
	 *
	 * @param string $url The URL for which to build a cache key.
	 * @return string The cache key.
	 */
	public static function build_cache_key_for_url( $url ) {
		return FEED_BLOCK_FOR_YOUTUBE_OPTION_PREFIX . 'g_url_details_response_' . md5( $url );
	}

	/**
	 * Utility function to retrieve a value from the cache at a given key.
	 *
	 * @param string $key The cache key.
	 * @return mixed The value from the cache.
	 */
	public static function get_cache( $key ) {
		return get_site_transient( $key );
	}

	/**
	 * Utility function to cache a given data set at a given cache key.
	 *
	 * @param string $key  The cache key under which to store the value.
	 * @param string $data The data to be stored at the given cache key.
	 * @return bool True when transient set. False if not set.
	 */
	public static function set_cache( $key, $data = '' ) {
		$ttl = HOUR_IN_SECONDS;

		return set_site_transient( $key, $data, $ttl );
	}
}
Feed_Block_For_YouTube::init();
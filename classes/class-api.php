<?php
/**
 * API Init Actions
 *
 * @package feed_block_for_YouTube
 */

if ( ! defined( 'ABSPATH' ) ) exit; 

if ( class_exists( 'FeedBlockForYouTubeEntryPoint' ) ) {
	return;
}

/**
 * Feed_Block_For_YouTube_FeedBlockForYouTubeEntryPoint
 */
class FeedBlockForYouTubeEntryPoint {
	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'rest_api_init' ) );
	}

	/**
	 * Rest Api Init
	 *
	 * @return void
	 */
	public function rest_api_init() {
		register_rest_route(
			'feed-block-for-youtube/v1',
			'/feed_data',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'get_feed_data' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 *  Rest Update Callback
	 *
	 * @param object $request — .
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_feed_data( $request ) {
		$json_params = $request->get_json_params();
		$data        = Feed_Block_For_YouTube::get_feed_data( $json_params['url'], $json_params['clearCache'] );
		return rest_ensure_response(
			array(
				'data'    => $data,
				'success' => true,
			)
		);
	}
}
new FeedBlockForYouTubeEntryPoint();
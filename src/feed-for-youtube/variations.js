/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { embedContentIcon } from './icons';

const variations = [
	{
		name: 'simple-youtube-feed',
		title: __( 'Youtube Feed', 'feed-block-for-youtube' ),
		icon: embedContentIcon,
		attributes: {},
		innerBlocks: [
			[
				'feed-block-for-youtube/feed-template',
				{
					style: {
						spacing: {
							blockGap: 'var:preset|spacing|30',
						},
					},
				},
				[
					[
						'core/group',
						{
							style: {
								spacing: {
									padding: {
										top: 'var:preset|spacing|30',
										bottom: 'var:preset|spacing|30',
										left: 'var:preset|spacing|30',
										right: 'var:preset|spacing|30',
									},
								},
								color: { background: '#fafafa' },
							},
							layout: { type: 'constrained' },
						},
						[
							[ 'feed-block-for-youtube/title' ],
							[ 'feed-block-for-youtube/date' ],
							[ 'feed-block-for-youtube/video' ],
						],
					],
				],
			],
		],
		scope: [ 'block' ],
	},
];

export default variations;

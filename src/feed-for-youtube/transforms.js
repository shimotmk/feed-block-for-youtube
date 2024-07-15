/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';

const transforms = {
	from: [
		{
			type: 'block',
			isMultiBlock: false,
			blocks: [ 'core/embed' ],
			transform: ( attributes ) => {
				return createBlock(
					'feed-block-for-youtube/youtube-feed',
					attributes
				);
			},
		},
	],
	to: [
		{
			type: 'block',
			blocks: [ 'core/embed' ],
			transform: ( attributes ) => {
				return createBlock( 'core/embed', attributes );
			},
		},
	],
};

export default transforms;

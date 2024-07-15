/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import useRemoteUrlData from '../feed-for-youtube/api/use-rich-url-data';

// youtube 埋め込みAPI https://developers.google.com/youtube/player_parameters?hl=ja

export default function YouTubeFeedVideoPlayerEdit( props ) {
	const { context } = props;
	const { richData } = useRemoteUrlData( context.feedBlockForYouTubeUrl );
	const rss = richData?.data.rss ?? '';
	const parser = new DOMParser();
	const xmlData = parser.parseFromString( rss, 'text/xml' );
	const id = context.youtubeFeedBlockIndex;
	const entryLists = xmlData.getElementsByTagName( 'id' );
	let videoId;
	if ( entryLists[ id + 1 ] !== undefined ) {
		videoId = entryLists[ id + 1 ].innerHTML.slice( 9 );
	}

	const blockProps = useBlockProps( {
		className: 'wp-embed-aspect-16-9 wp-has-aspect-ratio',
	} );

	return (
		<>
			<div { ...blockProps }>
				<div className={ 'wp-block-embed__wrapper' }>
					{ videoId && (
						<iframe
							title={ videoId }
							frameBorder={ 0 }
							width="480"
							height="360"
							allowFullScreen
							src={ 'https://www.youtube.com/embed/' + videoId }
						></iframe>
					) }
				</div>
			</div>
		</>
	);
}

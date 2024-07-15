/**
 * WordPress dependencies
 */
import { ToolbarGroup } from '@wordpress/components';
import {
	BlockControls,
	useBlockProps,
	HeadingLevelDropdown,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import useRemoteUrlData from '../feed-for-youtube/api/use-rich-url-data';

export default function YouTubeFeedTitleEdit( props ) {
	const { attributes, setAttributes, context } = props;
	const { level } = attributes;
	const { richData } = useRemoteUrlData( context.feedBlockForYouTubeUrl );
	const rss = richData?.data.rss ?? '';
	const parser = new DOMParser();
	const xmlData = parser.parseFromString( rss, 'text/xml' );
	const id = context.youtubeFeedBlockIndex;
	const entryLists = xmlData.getElementsByTagName( 'title' );
	let title;
	if ( entryLists[ id + 1 ] !== undefined ) {
		title = entryLists[ id + 1 ].innerHTML;
	}

	const TagName = level === 0 ? 'p' : `h${ level }`;
	const blockProps = useBlockProps();

	return (
		<>
			<BlockControls group="block">
				<ToolbarGroup>
					<HeadingLevelDropdown
						value={ level }
						onChange={ ( newLevel ) =>
							setAttributes( { level: newLevel } )
						}
					/>
				</ToolbarGroup>
			</BlockControls>
			<TagName { ...blockProps }>{ title && title }</TagName>
		</>
	);
}

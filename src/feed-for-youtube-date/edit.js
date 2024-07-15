/**
 * WordPress dependencies
 */
import { useEntityProp } from '@wordpress/core-data';
import { dateI18n, getSettings as getDateSettings } from '@wordpress/date';
import {
	InspectorControls,
	useBlockProps,
	__experimentalDateFormatPicker as DateFormatPicker, // eslint-disable-line
} from '@wordpress/block-editor';
import { ToggleControl, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useRemoteUrlData from '../feed-for-youtube/api/use-rich-url-data';

export default function YouTubeFeedDateEdit( props ) {
	const { attributes, setAttributes, context } = props;
	const { format, displayType } = attributes;
	const { richData } = useRemoteUrlData( context.feedBlockForYouTubeUrl );
	const rss = richData?.data.rss ?? '';

	const parser = new DOMParser();
	const xmlData = parser.parseFromString( rss, 'text/xml' );
	const id = context.youtubeFeedBlockIndex;
	const publishedEntryLists = xmlData.getElementsByTagName( 'published' );
	const updatedEntryLists = xmlData.getElementsByTagName( 'updated' );
	let xmlDate;
	if (
		displayType === 'date' &&
		publishedEntryLists[ id + 1 ] !== undefined
	) {
		xmlDate = publishedEntryLists[ id + 1 ].innerHTML;
	} else if (
		displayType === 'modified' &&
		updatedEntryLists[ id + 1 ] !== undefined
	) {
		xmlDate = updatedEntryLists[ id + 1 ].innerHTML;
	}

	const blockProps = useBlockProps();

	const dateSettings = getDateSettings();
	const [ siteFormat = dateSettings.formats.date ] = useEntityProp(
		'root',
		'site',
		'date_format'
	);

	const postDate = xmlDate ? (
		<time dateTime={ dateI18n( 'c', xmlDate ) }>
			{ dateI18n( format || siteFormat, xmlDate ) }
		</time>
	) : (
		''
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings' ) }>
					<DateFormatPicker
						format={ format }
						defaultFormat={ siteFormat }
						onChange={ ( nextFormat ) =>
							setAttributes( { format: nextFormat } )
						}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Display last modified date' ) }
						onChange={ ( value ) =>
							setAttributes( {
								displayType: value ? 'modified' : 'date',
							} )
						}
						checked={ displayType === 'modified' }
						help={ __(
							'Only shows if the post has been modified'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>{ postDate }</div>
		</>
	);
}

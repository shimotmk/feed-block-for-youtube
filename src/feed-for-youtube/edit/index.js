/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	BaseControl,
	Button,
	ToolbarGroup,
	ToolbarButton,
	Spinner,
	RangeControl,
} from '@wordpress/components';
import {
	InspectorControls,
	useBlockProps,
	store as blockEditorStore,
	BlockControls,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { edit } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import { View } from '@wordpress/primitives';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import EmbedPlaceholder from './embed-placeholder';
import useRemoteUrlData from '../api/use-rich-url-data';
import fetchUrlData from '../api/fetch-url-data';

const DEFAULT_MIN_ITEMS = 1;
const DEFAULT_MAX_ITEMS = 15;

export default function YouTubeFeedEdit( props ) {
	const { attributes, setAttributes, clientId } = props;
	const { url: attributesUrl, itemsToShow } = attributes;
	const [ isEditingURL, setIsEditingURL ] = useState( false );
	const [ url, setURL ] = useState( attributesUrl );
	const [ isLoadingClearCache, setIsLoadingClearCache ] = useState( false );
	const [ isStartingBlank, setIsStartingBlank ] = useState( false );
	const hasInnerBlocks = useSelect(
		( select ) =>
			!! select( blockEditorStore ).getBlocks( clientId ).length,
		[ clientId ]
	);
	const blockProps = useBlockProps();

	const { richData, isFetching } = useRemoteUrlData(
		attributesUrl,
		isLoadingClearCache
	);
	const onClickClearCache = () => {
		setIsLoadingClearCache( true );
		fetchUrlData( url, { clearCache: true } ).then( () => {
			setIsLoadingClearCache( false );
		} );
	};

	const { replaceInnerBlocks } = useDispatch( blockEditorStore );
	const cannotEmbed = richData === null ? false : richData?.data.cannot_embed;
	const preview = richData === null ? false : ! richData?.data.cannot_embed;

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		prioritizedInserterBlocks: [ 'feed-block-for-youtube/feed-template' ],
	} );

	// attributesをundefinedにする
	function setUndefinedExceptSpecifiedProps( obj, propsToKeep ) {
		const newObj = {};
		for ( const key of Object.keys( obj ) ) {
			newObj[ key ] = propsToKeep.includes( key )
				? obj[ key ]
				: undefined;
		}
		return newObj;
	}
	const propertiesToKeep = [ 'url', 'itemsToShow' ];
	const replaceAttributes = setUndefinedExceptSpecifiedProps(
		attributes,
		propertiesToKeep
	);

	return (
		<>
			<BlockControls>
				{ preview && ! cannotEmbed && ! isEditingURL && (
					<ToolbarGroup>
						<ToolbarButton
							className="components-toolbar__control"
							label={ __( 'Edit URL' ) }
							icon={ edit }
							onClick={ () => setIsEditingURL( true ) }
						/>
					</ToolbarGroup>
				) }
				{ hasInnerBlocks && (
					<ToolbarGroup className="wp-block-template-part__block-control-group">
						<ToolbarButton
							onClick={ () => {
								setAttributes( { ...replaceAttributes } );
								// innerBlocksを削除する
								replaceInnerBlocks( clientId, [] );
								setIsStartingBlank( true );
								setIsEditingURL( false );
							} }
						>
							{ __( 'Replace' ) }
						</ToolbarButton>
					</ToolbarGroup>
				) }
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Settings' ) }>
					<BaseControl>
						<RangeControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __( 'Number of items' ) }
							value={ itemsToShow }
							onChange={ ( value ) =>
								setAttributes( { itemsToShow: value } )
							}
							min={ DEFAULT_MIN_ITEMS }
							max={ DEFAULT_MAX_ITEMS }
							required
						/>
						{ richData?.data.rss === undefined && (
							<>
								<Button
									onClick={ onClickClearCache }
									variant="primary"
									isBusy={ isLoadingClearCache }
									disabled={
										!!! attributesUrl ? true : false
									}
								>
									{ __(
										'Clear cache',
										'feed-block-for-youtube'
									) }
								</Button>
								<p style={ { marginTop: '8px' } }>
									{ __(
										'If the data is old, please clear the cache. It is usually updated every hour.',
										'feed-block-for-youtube'
									) }
								</p>
							</>
						) }
					</BaseControl>
				</PanelBody>
			</InspectorControls>
			{ ( () => {
				if ( isFetching || isLoadingClearCache ) {
					return (
						<View { ...blockProps }>
							<div className="wp-block-embed is-loading">
								<Spinner />
							</div>
						</View>
					);
				} else if (
					url &&
					attributesUrl &&
					hasInnerBlocks &&
					! isEditingURL &&
					! richData?.data.cannot_embed
				) {
					return <div { ...innerBlocksProps } />;
				}
				return (
					<EmbedPlaceholder
						isStartingBlank={ isStartingBlank }
						setIsStartingBlank={ setIsStartingBlank }
						isEditingURL={ isEditingURL }
						setIsEditingURL={ setIsEditingURL }
						cannotEmbed={ cannotEmbed }
						url={ url }
						setURL={ setURL }
						onClickClearCache={ onClickClearCache }
						{ ...props }
					/>
				);
			} )() }
		</>
	);
}

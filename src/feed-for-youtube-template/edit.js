/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { memo, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	BlockContextProvider,
	__experimentalUseBlockPreview as useBlockPreview,　// eslint-disable-line
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { Spinner, ToolbarGroup } from '@wordpress/components';
import { list, grid } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import useRemoteUrlData from '../feed-for-youtube/api/use-rich-url-data';

const TEMPLATE = [
	[ 'feed-block-for-youtube/title' ],
	[ 'feed-block-for-youtube/date' ],
	[ 'feed-block-for-youtube/video' ],
];

function PostTemplateInnerBlocks( { classList } ) {
	const innerBlocksProps = useInnerBlocksProps(
		{ className: clsx( 'wp-block-post', classList ) },
		{
			template: TEMPLATE,
			__unstableDisableLayoutClassNames: true,
			prioritizedInserterBlocks: [
				'feed-block-for-youtube/title',
				'feed-block-for-youtube/date',
				'feed-block-for-youtube/video',
			],
		}
	);
	return <li { ...innerBlocksProps } />;
}

function YouTubeFeedTemplateBlockPreview( {
	blocks,
	blockContextId,
	classList,
	isHidden,
	setActiveBlockContextId,
} ) {
	const blockPreviewProps = useBlockPreview( {
		blocks,
		props: {
			className: clsx( 'wp-block-post', classList ),
		},
	} );

	const handleOnClick = () => {
		setActiveBlockContextId( blockContextId );
	};

	const style = {
		display: isHidden ? 'none' : undefined,
	};

	return (
		<li
			{ ...blockPreviewProps }
			tabIndex={ 0 }
			// eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
			role="button"
			onClick={ handleOnClick }
			onKeyPress={ handleOnClick }
			style={ style }
		/>
	);
}

const MemoizedYouTubeFeedTemplateBlockPreview = memo(
	YouTubeFeedTemplateBlockPreview
);

export default function YouTubeFeedTemplateEdit( props ) {
	const {
		setAttributes,
		clientId,
		attributes: { layout },
		__unstableLayoutClassNames,
	} = props;
	const { richData } = useRemoteUrlData( props.context.feedBlockForYouTubeUrl );
	const { type: layoutType, columnCount = 3 } = layout || {};
	const [ activeBlockContextId, setActiveBlockContextId ] = useState();
	const { blocks } = useSelect(
		( select ) => {
			const { getBlocks } = select( blockEditorStore );
			return {
				blocks: getBlocks( clientId ),
			};
		},
		[ clientId ]
	);
	console.log(richData);
	const rss = richData?.data.rss ?? '';
	const parser = new DOMParser();
	const xmlData = parser.parseFromString( rss, 'text/xml' );
	const entryLists = xmlData.getElementsByTagName( 'entry' );

	const blockProps = useBlockProps( {
		className: clsx( __unstableLayoutClassNames, {
			[ `columns-${ columnCount }` ]:
				layoutType === 'grid' && columnCount, // Ensure column count is flagged via classname for backwards compatibility.
		} ),
	} );

	if ( xmlData === null ) {
		return <p { ...blockProps }> { __( 'No results found.' ) }</p>;
	}

	const repeatCount = props.context.feedBlockForYouTubeItemsToShow;

	const blockContexts = [];
	const entries = Object.entries( entryLists );
	const maxLoop = Math.min( repeatCount, entries.length );
	for ( let i = 0; i < maxLoop; i++ ) {
		const [ index, entryList ] = entries[ i ];
		blockContexts.push( {
			entryList,
			youtubeFeedBlockIndex: parseInt( index ),
		} );
	}

	if ( ! entryLists ) {
		return (
			<p { ...blockProps }>
				<Spinner />
			</p>
		);
	}

	if ( ! Object.values( entryLists ).length ) {
		return <p { ...blockProps }> { __( 'No results found.' ) }</p>;
	}

	const setDisplayLayout = ( newDisplayLayout ) =>
		setAttributes( {
			layout: { ...layout, ...newDisplayLayout },
		} );

	const displayLayoutControls = [
		{
			icon: list,
			title: __( 'List view' ),
			onClick: () => setDisplayLayout( { type: 'default' } ),
			isActive: layoutType === 'default' || layoutType === 'constrained',
		},
		{
			icon: grid,
			title: __( 'Grid view' ),
			onClick: () =>
				setDisplayLayout( {
					type: 'grid',
					columnCount,
				} ),
			isActive: layoutType === 'grid',
		},
	];

	return (
		<>
			<BlockControls>
				<ToolbarGroup controls={ displayLayoutControls } />
			</BlockControls>

			<ul { ...blockProps }>
				{ blockContexts &&
					blockContexts.map( ( blockContext, index ) => (
						<BlockContextProvider
							key={ index }
							value={ blockContext }
						>
							{ index ===
							( activeBlockContextId ||
								blockContexts[ 0 ]?.youtubeFeedBlockIndex ) ? (
								<PostTemplateInnerBlocks
									classList={ blockContext.classList }
								/>
							) : null }
							<MemoizedYouTubeFeedTemplateBlockPreview
								blocks={ blocks }
								blockContextId={ index }
								classList={ blockContext.classList }
								setActiveBlockContextId={
									setActiveBlockContextId
								}
								isHidden={
									index ===
									( activeBlockContextId ||
										blockContexts[ 0 ]
											?.youtubeFeedBlockIndex )
								}
							/>
						</BlockContextProvider>
					) ) }
			</ul>
		</>
	);
}

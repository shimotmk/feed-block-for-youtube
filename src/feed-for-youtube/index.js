/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * block type
 */
import json from './block.json';
import { embedContentIcon } from './icons';
import edit from './edit';
import save from './save';
import variations from './variations';
import transforms from './transforms';

const { name, ...settings } = json;

registerBlockType( name, {
	icon: embedContentIcon,
	...settings,
	variations,
	transforms,
	edit,
	save,
} );

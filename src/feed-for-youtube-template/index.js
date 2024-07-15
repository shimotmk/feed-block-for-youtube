/**
 * WordPress dependencies
 */
import { layout } from '@wordpress/icons';
import { registerBlockType } from '@wordpress/blocks';

/**
 * block type
 */
import json from './block.json';
import edit from './edit';
import save from './save';

import './style.scss';

const { name, ...settings } = json;

registerBlockType( name, {
	icon: layout,
	edit,
	save,
	...settings,
} );

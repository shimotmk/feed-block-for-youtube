/**
 * WordPress dependencies.
 */
import { getContext, store, getElement } from '@wordpress/interactivity';

/**
 * Tracks whether user is touching screen; used to differentiate behavior for
 * touch and mouse input.
 *
 * @type {boolean}
 */
let isTouching = false;

/**
 * Tracks the last time the screen was touched; used to differentiate behavior
 * for touch and mouse input.
 *
 * @type {number}
 */
let lastTouchTime = 0;

/**
 * Stores the image reference of the currently opened lightbox.
 *
 * @type {HTMLElement}
 */
let imageRef;

/**
 * Stores the button reference of the currently opened lightbox.
 *
 * @type {HTMLElement}
 */
let buttonRef;

const { state, actions, callbacks } = store(
	'feed-block-for-youtube/video',
	{
		state: {
			currentImage: {},
			get overlayOpened() {
				return state.currentImage.currentSrc;
			},
			get roleAttribute() {
				return state.overlayOpened ? 'dialog' : null;
			},
			get ariaModal() {
				return state.overlayOpened ? 'true' : null;
			},
		},
		actions: {
			showLightbox() {
				const ctx = getContext();
				// Bails out if the image has not loaded yet.
				if ( ! ctx.imageRef?.complete ) {
					return;
				}

				state.scrollTopReset = document.documentElement.scrollTop;
				state.scrollLeftReset = document.documentElement.scrollLeft;

				// Moves the information of the expaned image to the state.
				ctx.currentSrc =
					'http://img.youtube.com/vi/' +
					ctx.videoId +
					'/mqdefault.jpg';
				state.currentVideo =
					'https://www.youtube.com/embed/' +
					ctx.videoId +
					'?autoplay=1';
				// ctx.currentSrc = ctx.imageRef.currentSrc;
				imageRef = ctx.imageRef;
				buttonRef = ctx.buttonRef;
				state.currentImage = ctx;
				state.overlayEnabled = true;

				// Computes the styles of the overlay for the animation.
				callbacks.setOverlayStyles();
			},
			hideLightbox() {
				if ( state.overlayEnabled ) {
					setTimeout( function () {
						buttonRef.focus( {
							preventScroll: true,
						} );

						// Resets the current image to mark the overlay as closed.
						state.currentImage = {};
						imageRef = null;
						buttonRef = null;
					}, 450 );

					// Starts the overlay closing animation. The showClosingAnimation
					// class is used to avoid showing it on page load.
					state.showClosingAnimation = true;
					state.overlayEnabled = false;
					state.currentVideo = '';
				}
			},
			handleKeydown( event ) {
				if ( state.overlayEnabled ) {
					// Closes the lightbox when the user presses the escape key.
					if ( event.key === 'Escape' ) {
						actions.hideLightbox();
					}
				}
			},
			handleTouchMove( event ) {
				if ( state.overlayEnabled ) {
					event.preventDefault();
				}
			},
			handleTouchStart() {
				isTouching = true;
			},
			handleTouchEnd() {
				// Waits a few milliseconds before resetting to ensure that pinch to
				// zoom works consistently on mobile devices when the lightbox is open.
				lastTouchTime = Date.now();
				isTouching = false;
			},
			handleScroll() {
				if ( state.overlayOpened ) {
					// Avoids overriding the scroll behavior on mobile devices because
					// doing so breaks the pinch to zoom functionality, and users should
					// be able to zoom in further on the high-res image.
					if ( ! isTouching && Date.now() - lastTouchTime > 450 ) {
						// It doesn't rely on `event.preventDefault()` to prevent scrolling
						// because the scroll event can't be canceled, so it resets the
						// position instead.
						window.scrollTo(
							state.scrollLeftReset,
							state.scrollTopReset
						);
					}
				}
			},
		},
		callbacks: {
			setOverlayStyles() {
				if ( ! imageRef ) {
					return;
				}

				let {
					naturalWidth,
					naturalHeight,
					offsetWidth: originalWidth,
					offsetHeight: originalHeight,
				} = imageRef;

				// 元画像の比率
				const naturalRatio = naturalWidth / naturalHeight;
				// Original ratio of the image clicked to open the lightbox.
				const originalRatio = 16 / 9;
				// let originalRatio = originalWidth / originalHeight;

				// If it has object-fit: contain, recalculates the original sizes
				// and the screen position without the blank spaces.
				if ( naturalRatio > originalRatio ) {
					const heightWithoutSpace = originalWidth / naturalRatio;
					// Recalculates screen position without the top space.
					originalHeight = heightWithoutSpace;
				} else {
					const widthWithoutSpace = originalHeight * naturalRatio;
					// Recalculates screen position without the left space.
					originalWidth = widthWithoutSpace;
				}
				// originalRatio = originalWidth / originalHeight;
				// originalRatio = 16 / 9;

				// Typically, it uses the image's full-sized dimensions. If those
				// dimensions have not been set (i.e. an external image with only one
				// size), the image's dimensions in the lightbox are the same
				// as those of the image in the content.
				let imgMaxWidth = parseFloat(
					state.currentImage.targetWidth !== 'none'
						? state.currentImage.targetWidth
						: naturalWidth
				);
				let imgMaxHeight = parseFloat(
					state.currentImage.targetHeight !== 'none'
						? state.currentImage.targetHeight
						: naturalHeight
				);

				// Ratio of the biggest image stored in the database.
				// let imgRatio = imgMaxWidth / imgMaxHeight;
				const imgRatio = 16 / 9;
				let containerMaxWidth = imgMaxWidth;
				let containerMaxHeight = imgMaxHeight;
				let containerWidth = imgMaxWidth;
				let containerHeight = imgMaxHeight;
				// Checks if the target image has a different ratio than the original
				// one (thumbnail). Recalculates the width and height.
				if ( naturalRatio.toFixed( 2 ) !== imgRatio.toFixed( 2 ) ) {
					if ( naturalRatio > imgRatio ) {
						// If the width is reached before the height, it keeps the maxWidth
						// and recalculates the height unless the difference between the
						// maxHeight and the reducedHeight is higher than the maxWidth,
						// where it keeps the reducedHeight and recalculate the width.
						const reducedHeight = imgMaxWidth / naturalRatio;
						if ( imgMaxHeight - reducedHeight > imgMaxWidth ) {
							imgMaxHeight = reducedHeight;
							imgMaxWidth = reducedHeight * naturalRatio;
						} else {
							imgMaxHeight = imgMaxWidth / naturalRatio;
						}
					} else {
						// If the height is reached before the width, it keeps the maxHeight
						// and recalculate the width unlesss the difference between the
						// maxWidth and the reducedWidth is higher than the maxHeight, where
						// it keeps the reducedWidth and recalculate the height.
						const reducedWidth = imgMaxHeight * naturalRatio;
						if ( imgMaxWidth - reducedWidth > imgMaxHeight ) {
							imgMaxWidth = reducedWidth;
							imgMaxHeight = reducedWidth / naturalRatio;
						} else {
							imgMaxWidth = imgMaxHeight * naturalRatio;
						}
					}
					containerWidth = imgMaxWidth;
					containerHeight = imgMaxHeight;
					// imgRatio = imgMaxWidth / imgMaxHeight;

					// Calculates the max size of the container.
					if ( originalRatio > imgRatio ) {
						containerMaxWidth = imgMaxWidth;
						containerMaxHeight = containerMaxWidth / originalRatio;
					} else {
						containerMaxHeight = imgMaxHeight;
						containerMaxWidth = containerMaxHeight * originalRatio;
					}
				}

				// If the image has been pixelated on purpose, it keeps that size.
				if (
					originalWidth > containerWidth ||
					originalHeight > containerHeight
				) {
					containerWidth = originalWidth;
					containerHeight = originalHeight;
				}

				// Calculates the final lightbox image size and the scale factor.
				// MaxWidth is either the window container (accounting for padding) or
				// the image resolution.
				let horizontalPadding = 0;
				if ( window.innerWidth > 480 ) {
					horizontalPadding = 80;
				} else if ( window.innerWidth > 1920 ) {
					horizontalPadding = 160;
				}
				const verticalPadding = 80;

				const targetMaxWidth = Math.min(
					window.innerWidth - horizontalPadding,
					containerWidth
				);
				const targetMaxHeight = Math.min(
					window.innerHeight - verticalPadding,
					containerHeight
				);
				const targetContainerRatio = targetMaxWidth / targetMaxHeight;

				if ( originalRatio > targetContainerRatio ) {
					// If targetMaxWidth is reached before targetMaxHeight.
					containerWidth = targetMaxWidth;
					containerHeight = containerWidth / originalRatio;
				} else {
					// If targetMaxHeight is reached before targetMaxWidth.
					containerHeight = targetMaxHeight;
					containerWidth = containerHeight * originalRatio;
				}

				const containerScale = originalWidth / containerWidth;

				// As of this writing, using the calculations above will render the
				// lightbox with a small, erroneous whitespace on the left side of the
				// image in iOS Safari, perhaps due to an inconsistency in how browsers
				// handle absolute positioning and CSS transformation. In any case,
				// adding 1 pixel to the container width and height solves the problem,
				// though this can be removed if the issue is fixed in the future.
				state.overlayStyles = `
				:root {
					--wp--lightbox-container-width: ${ containerWidth + 1 }px;
					--wp--lightbox-container-height: ${ containerHeight + 1 }px;
					--wp--lightbox-scale: ${ containerScale };
				}
			`;
			},
			setButtonStyles() {
				const ctx = getContext();
				const { ref } = getElement();
				ctx.imageRef = ref;

				const {
					naturalWidth,
					naturalHeight,
					offsetWidth,
					offsetHeight,
				} = ref;

				// If the image isn't loaded yet, it can't calculate where the button
				if ( naturalWidth === 0 || naturalHeight === 0 ) {
					return;
				}

				const figureWidth = ref.parentElement.clientWidth;
				const figureHeight = ref.parentElement.clientHeight;
				const buttonOffsetTop = figureHeight - offsetHeight;
				const buttonOffsetRight = figureWidth - offsetWidth;

				ctx.imageButtonTop = buttonOffsetTop + 16;
				ctx.imageButtonRight = buttonOffsetRight + 16;
			},
			setOverlayFocus() {
				if ( state.overlayEnabled ) {
					// Moves the focus to the dialog when it opens.
					const { ref } = getElement();
					ref.focus();
				}
			},
			initTriggerButton() {
				const ctx = getContext();
				const { ref } = getElement();
				ctx.buttonRef = ref;
			},
		},
	},
	{ lock: true }
);

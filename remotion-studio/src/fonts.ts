import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';
import { loadFont as loadPlayfairDisplay } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';

// Preload luxury typography for GOP Apple/Stripe-tier launch demo
export const { fontFamily: FONT_SANS } = loadPlusJakartaSans();
export const { fontFamily: FONT_SERIF } = loadPlayfairDisplay();
export const { fontFamily: FONT_MONO } = loadJetBrainsMono();

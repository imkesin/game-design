/**
 * Physical trim size of a printed card, in millimetres: 63x88 poker trim.
 * Single source for both `panda.config.ts`'s `trimW`/`trimH` tokens (used by
 * Card.tsx) and any plain-JS print-sheet math that needs the raw number
 * (PrintPage.tsx's page grid, BoardPrintPage.tsx's card outlines and Labor
 * Market sleeve width).
 */
export const CARD_TRIM_W_MM = 63
export const CARD_TRIM_H_MM = 88

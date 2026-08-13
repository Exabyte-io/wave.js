/**
 * Where the viewer's chrome sits, as numbers rather than as folklore.
 *
 * These four values describe one contract: which parts of the canvas are already claimed, so an
 * overlay can avoid them. They were previously spread across the components that happened to need
 * them - the inspector's width lived in SelectionInspector, and the mode pill imported it from
 * there, coupling two sibling panels for one string and inviting an import cycle the first time the
 * dependency ran the other way.
 *
 * Keeping them together is not tidiness for its own sake: the bug that produced them was the pill
 * overlapping the inspector and both toolbars in an embedded panel, and that bug is exactly what
 * happens when the numbers describing a shared layout live apart and drift.
 */
/** Selection inspector card width. The pill has to clear this while edit mode is on. */
export const INSPECTOR_WIDTH = "19em";
/**
 * Inset clearing the chrome pinned to each edge. In pixels rather than `em` on purpose: the widths
 * being cleared are themselves pixel constants - the icon strip is 44 px at a 12 px margin, the edit
 * toolbar 52 px at 12 px - and an `em` here resolved against the caption font to 54 px, two pixels
 * under the toolbar it was supposed to clear.
 */
export const SIDE_CHROME_INSET = "72px";
/**
 * Right inset while edit mode is on, clearing the selection inspector as well as the toolbar. An
 * overlay's insets should describe the space that is genuinely free, so a "does it fit" decision can
 * be a measurement of that space rather than a guess about what else is on screen.
 */
export const EDIT_SURFACE_INSET = `calc(${SIDE_CHROME_INSET} + ${INSPECTOR_WIDTH} + 8px)`;
/**
 * Below this much free width, the mode pill keeps only its name and its exit. Set just above the
 * width the full edit binding list occupies (~430 px measured), so the drop happens when the text
 * would start fighting for space rather than after it already has.
 */
export const PILL_COMPACT_WIDTH_PX = 460;

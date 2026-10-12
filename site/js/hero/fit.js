/**
 * The hero scene's pure math — spec scene.ts, verbatim — kept apart from
 * three.js so node can test it and the wrapper can import it cheaply.
 */
export const DEG = Math.PI / 180;
/**
 * The helmet's cursor rotation, one axis at a time: the angle it reaches when
 * the cursor is at the **edge of the window** (`ampDeg`, signed — the sign is
 * the direction), and how it gets there (`curve`).
 *
 * The amplitude is the whole instrument. Until 2026-09-08 each axis was a gain
 * on the pointer, and the pitch had a cap on its *input* on top (`helmetRotX`
 * × `tiltLimit`); the angle a reader actually saw was the product of the two,
 * in radians of input, and the yaw had no ceiling at all. Nobody could say
 * how far the helmet turned without doing the sum, and once the gain sat at
 * its slider's floor there was no way to ask for more. Now the slider *is*
 * the answer: the degrees at the edge of the sweep, per axis.
 *
 * `curve` is the shape between the centre and that edge, and it is
 * **normalised** — `tanh(curve·v) / tanh(curve)` — so it reaches exactly the
 * amplitude at `|v| = 1` whatever its value: 0 is a straight line, higher
 * saturates earlier, which keeps the response steep through the middle of the
 * frame (where a reader's pointer actually lives) and eases it off toward the
 * edges. `tanh` rather than a clamp because a clamp leaves a corner where the
 * turn stops dead, and that corner sits exactly where a cursor crossing the
 * frame is moving fastest — the helmet would visibly freeze mid-sweep and then
 * start again. This has no such point: the response only ever thins.
 *
 * Sizing the pitch needs the crown's **on-screen** travel, which is not the
 * obvious number. Tilting about a horizontal axis moves the crown almost
 * entirely in **z**: `y' = h·cos(theta)` changes only in theta squared, while
 * `z' = h·sin(theta)` is first-order. So `h·sin(theta)` — the tempting figure —
 * is the crown's *depth* swing, and what a reader sees is the much smaller
 * second-order drop plus what perspective makes of the depth. Measured
 * properly (project the crown through the real camera), visible travel across
 * a full cursor sweep at 1440x900 comes to about **2.4px per degree** of
 * amplitude, near enough linear over the range the slider offers: 4.4° is
 * 10.7px, 7.2° is 17.5px, 8.6° is 20.9px. For scale, `subjectParallax` moves
 * the whole composition 8.8px over that same sweep.
 */
export const swing = (v, ampDeg, curve) => {
    const amp = ampDeg * DEG;
    if (curve < 1e-3)
        return amp * v;
    return (amp * Math.tanh(curve * v)) / Math.tanh(curve);
};

/**
 * Camera constants, exported because the subject's on-screen size is a
 * function of them and of the canvas height — anything outside the scene that
 * wants to keep the subject a fixed pixel size while the canvas is resized has
 * to do that arithmetic. See `fitSubjectToBox`.
 */
export const CAMERA_FOV = 35;
export const CAMERA_Y = 0.1;
/**
 * World-space height visible at the subject's depth. The camera's vertical
 * field of view is fixed, so this — not the canvas width — is what a pixel is
 * measured against.
 */
export const visibleWorldHeight = (cameraZ) => 2 * cameraZ * Math.tan((CAMERA_FOV * Math.PI) / 360);
/**
 * Keeps the subject at the size and place a *box* would have given it, while
 * the canvas itself is some other size — which is how the backdrop can be
 * stretched over the whole block without the portrait growing with it.
 *
 * The subject scales about its own origin and the world-to-pixel factor is
 * proportional to canvas height, so the size term is the plain ratio of the
 * two heights. The position term is the box's centre moving relative to the
 * canvas's, converted back into world units.
 *
 * With `box` equal to the canvas both terms collapse to identity, so a
 * full-bleed scene is unaffected.
 */
export const fitSubjectToBox = (params, box, canvasHeight) => {
    if (canvasHeight <= 0 || box.height <= 0) {
        return { subjectScale: params.subjectScale, subjectY: params.subjectY };
    }
    const ratio = box.height / canvasHeight;
    const world = visibleWorldHeight(params.cameraZ);
    const centreShift = canvasHeight / 2 - (box.top + box.height / 2);
    return {
        subjectScale: params.subjectScale * ratio,
        subjectY: CAMERA_Y +
            (params.subjectY - CAMERA_Y) * ratio +
            (centreShift * world) / canvasHeight,
    };
};

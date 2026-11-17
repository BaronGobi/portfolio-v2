/**
 * What the visitor is doing to the hero scene: where the mouse or finger is,
 * how fast it is moving, taps, and (on phones) how the device is tilted.
 *
 * DOM events write into one plain object, which the scene reads once per
 * frame (see `HeroScene.tsx`), together with the flicks and taps gathered
 * since the frame before. Nothing here renders.
 */
export type SceneInput = {
  /** Last pointer or finger position, in CSS pixels from the viewport's top left. */
  x: number;
  y: number;
  /** True while a mouse is over the page, or a finger is on the hero. */
  present: boolean;
  /** True when the last input came from a finger. */
  touch: boolean;
  /**
   * Phone tilt compared with how it is being held, each axis from -1 to 1
   * (x: right edge down, y: top edge toward the visitor). `null` until the
   * device reports its orientation.
   */
  tilt: { x: number; y: number } | null;
};

/** What happened since the scene last asked. */
export type Impulses = {
  /**
   * Fast movement, in CSS pixels. Slow movement counts for little, so only a
   * deliberate flick or swipe spins the scene.
   */
  flickX: number;
  flickY: number;
  /** Taps and clicks on the hero. */
  pulses: number;
};

export type SceneInputHandle = {
  /** Read-only for the scene: the latest position, presence and tilt. */
  state: Readonly<SceneInput>;
  /** Returns the impulses gathered since the last call, and starts over. */
  take: () => Impulses;
  /** Start or stop listening to the motion sensor. */
  listenToTilt: (on: boolean) => void;
  destroy: () => void;
};

/** Element whose taps and touches count as playing with the scene. */
const AREA = "[data-hero-area]";
/** A touch that moves less than this, in CSS pixels, is a tap. */
const TAP_DISTANCE = 12;
/** A touch shorter than this, in ms, is a tap. */
const TAP_TIME = 350;
/** Tilt, in degrees, that counts as fully tilted. */
const FULL_TILT = 22;
/** How quickly the resting position follows the way the phone is held, in seconds. */
const TILT_SETTLE = 2.5;

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

function inArea(target: EventTarget | null) {
  return target instanceof Element && target.closest(AREA) !== null;
}

function clamp(value: number) {
  return Math.min(Math.max(value, -1), 1);
}

/** How far the screen is rotated from portrait: 0, 90, 180 or 270 degrees. */
function screenAngle(): number {
  // iOS before 16.4 only has the older `window.orientation` (0, 90, -90, 180).
  const angle =
    screen.orientation?.angle ?? (window as { orientation?: number }).orientation ?? 0;
  return ((angle % 360) + 360) % 360;
}

export function createSceneInput(): SceneInputHandle {
  const state: SceneInput = {
    x: 0,
    y: 0,
    present: false,
    touch: false,
    tilt: null,
  };
  let impulses: Impulses = { flickX: 0, flickY: 0, pulses: 0 };

  let last: { x: number; y: number; time: number } | null = null;
  let touchStart: { x: number; y: number; time: number } | null = null;
  let touching = false;

  /** Adds movement to the flick counters, weighted by its speed. */
  const flick = (x: number, y: number, time: number, slow: number, fast: number) => {
    if (last && time > last.time) {
      const dx = x - last.x;
      const dy = y - last.y;
      const speed = Math.hypot(dx, dy) / ((time - last.time) / 1000);
      const weight = smoothstep(slow, fast, speed);
      impulses.flickX += dx * weight;
      impulses.flickY += dy * weight;
    }
    last = { x, y, time };
  };

  // Mouse and pen. Touch has its own listeners below: browsers cancel pointer
  // events as soon as a touch starts scrolling, but keep sending touch events.
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    state.x = event.clientX;
    state.y = event.clientY;
    state.present = true;
    state.touch = false;
    flick(event.clientX, event.clientY, event.timeStamp, 300, 1600);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== "touch" && event.button === 0 && inArea(event.target)) {
      impulses.pulses += 1;
    }
  };

  // The mouse left the window.
  const onMouseOut = (event: MouseEvent) => {
    if (!event.relatedTarget) {
      state.present = false;
      last = null;
    }
  };

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch || event.touches.length > 1 || !inArea(event.target)) return;
    touching = true;
    state.x = touch.clientX;
    state.y = touch.clientY;
    state.present = true;
    state.touch = true;
    last = { x: touch.clientX, y: touch.clientY, time: event.timeStamp };
    touchStart = last;
  };

  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touching || !touch) return;
    state.x = touch.clientX;
    state.y = touch.clientY;
    flick(touch.clientX, touch.clientY, event.timeStamp, 80, 700);
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (!touching) return;
    const touch = event.changedTouches[0];
    if (event.type === "touchend" && touch && touchStart) {
      const moved = Math.hypot(
        touch.clientX - touchStart.x,
        touch.clientY - touchStart.y,
      );
      if (moved < TAP_DISTANCE && event.timeStamp - touchStart.time < TAP_TIME) {
        impulses.pulses += 1;
      }
    }
    touching = false;
    touchStart = null;
    last = null;
    state.present = false;
  };

  // Tilt is measured against a resting position that slowly follows the way
  // the phone is held, so any comfortable grip is "level", and holding it at
  // a new angle lets the scene settle back.
  let rest: { x: number; y: number; time: number } | null = null;

  const onOrientation = (event: DeviceOrientationEvent) => {
    const { beta, gamma } = event;
    if (beta === null || gamma === null) return;

    // Turn the device's axes into the screen's, whichever way it is rotated.
    const angle = screenAngle();
    let x = gamma;
    let y = beta;
    if (angle === 90) [x, y] = [beta, -gamma];
    else if (angle === 270) [x, y] = [-beta, gamma];
    else if (angle === 180) [x, y] = [-gamma, -beta];

    const now = event.timeStamp;
    // Start over after a jump (the phone flipped past upright) or a change
    // between portrait and landscape.
    if (!rest || Math.abs(x - rest.x) > 60 || Math.abs(y - rest.y) > 60) {
      rest = { x, y, time: now };
    }
    // Readings only arrive when the angle changes, so the gap since the last
    // one can be long; the resting position catches up by the time passed.
    const follow = 1 - Math.exp(-(now - rest.time) / 1000 / TILT_SETTLE);
    rest = {
      x: rest.x + (x - rest.x) * follow,
      y: rest.y + (y - rest.y) * follow,
      time: now,
    };

    state.tilt = {
      x: clamp((x - rest.x) / FULL_TILT),
      y: clamp((y - rest.y) / FULL_TILT),
    };
  };

  const passive = { passive: true } as const;
  window.addEventListener("pointermove", onPointerMove, passive);
  window.addEventListener("pointerdown", onPointerDown, passive);
  window.addEventListener("mouseout", onMouseOut, passive);
  window.addEventListener("touchstart", onTouchStart, passive);
  window.addEventListener("touchmove", onTouchMove, passive);
  window.addEventListener("touchend", onTouchEnd, passive);
  window.addEventListener("touchcancel", onTouchEnd, passive);

  let tiltOn = false;
  const listenToTilt = (on: boolean) => {
    if (on === tiltOn) return;
    tiltOn = on;
    if (on) {
      window.addEventListener("deviceorientation", onOrientation, passive);
    } else {
      window.removeEventListener("deviceorientation", onOrientation);
      rest = null;
      state.tilt = null;
    }
  };

  return {
    state,
    take: () => {
      const taken = impulses;
      impulses = { flickX: 0, flickY: 0, pulses: 0 };
      return taken;
    },
    listenToTilt,
    destroy: () => {
      listenToTilt(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    },
  };
}

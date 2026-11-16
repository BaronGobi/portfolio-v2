/**
 * A small WebGL "liquid" surface for one image.
 *
 * How it works: a low-resolution texture stores, for every point of the frame,
 * how fast the surface is moving there (the "flow"). Moving the pointer writes
 * its velocity into that texture; every frame the flow carries itself along a
 * little and fades out. A second pass draws the photo, pulling each pixel from
 * where the flow says it came from, so the picture smears behind the pointer
 * and then settles like a liquid.
 *
 * Plain WebGL 1 on purpose: it runs on every phone and adds no library.
 * The loop only runs while the surface is moving.
 */

export type Liquid = {
  /**
   * Push the surface. `x` and `y` are the pointer position inside the frame,
   * from 0 to 1 (top left is 0, 0). `vx` and `vy` are its speed in frame
   * heights per second.
   */
  stir(x: number, y: number, vx: number, vy: number): void;
  /** A single ripple spreading out from a point, e.g. for a tap. */
  drop(x: number, y: number): void;
  /** Call when the canvas changes size. */
  resize(): void;
  destroy(): void;
};

type LiquidOptions = {
  /** Where the photo is anchored in the frame, like CSS `object-position`. */
  focus: readonly [number, number];
  /** Called when the surface starts moving and when it has settled again. */
  onActive: (active: boolean) => void;
};

/** Size of the flow texture. Small, because the flow is smooth. */
const FLOW_SIZE = 128;
/** The most a full-strength push drags the picture, in frame heights. */
const AMOUNT = 0.1;
/** Pointer speed (frame heights per second) that counts as full strength. */
const FULL_SPEED = 1.3;
/** Seconds without input before the surface counts as settled. */
const SETTLE = 2;
/** Seconds the loop keeps running after that, while the canvas fades out. */
const FADE = 0.45;
/** Upper limit on canvas pixels, to keep large retina screens cheap. */
const MAX_PIXELS = 2_400_000;

const VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const HEAD = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;

#ifdef PRECISE
// The flow is stored as real numbers.
vec2 decode(vec4 texel) {
  return texel.xy;
}

vec4 encode(vec2 flow) {
  return vec4(clamp(flow, -1.0, 1.0), 0.0, 1.0);
}
#else
// The flow is stored in an ordinary 8-bit texture, with 128 meaning "still".
vec2 decode(vec4 texel) {
  return (texel.xy * 255.0 - 128.0) / 127.0;
}

vec4 encode(vec2 flow) {
  return vec4(clamp(flow, -1.0, 1.0) * (127.0 / 255.0) + 128.0 / 255.0, 0.0, 1.0);
}
#endif
`;

/** Updates the flow: carry it along, fade it, add the pointer's push. */
const FLOW_FRAGMENT = `${HEAD}
const float TEXEL = ${(1 / FLOW_SIZE).toFixed(8)};

uniform sampler2D uFlow;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform vec2 uForce;
uniform float uStir;
uniform float uDrop;
uniform float uAspect;
uniform float uRadius;
uniform float uDecay;
uniform float uLoss;

void main() {
  vec2 flow = decode(texture2D(uFlow, vUv));
  // The surface drags itself along, which is what makes it read as liquid.
  vec2 carried = vUv - vec2(flow.x / uAspect, flow.y) * 0.01;
  flow = decode(texture2D(uFlow, carried));
  // A little blur every frame keeps it smooth; without it the flow piles up
  // into hard creases that tear the picture.
  vec2 around =
    decode(texture2D(uFlow, carried + vec2(TEXEL, 0.0))) +
    decode(texture2D(uFlow, carried - vec2(TEXEL, 0.0))) +
    decode(texture2D(uFlow, carried + vec2(0.0, TEXEL))) +
    decode(texture2D(uFlow, carried - vec2(0.0, TEXEL)));
  flow = mix(flow, around * 0.25, 0.35);
  flow *= uDecay;
  flow = sign(flow) * max(abs(flow) - uLoss, 0.0);

  // Distance to the pointer's path since the last frame, so fast strokes
  // leave a continuous trail instead of separate blobs.
  vec2 scale = vec2(uAspect, 1.0);
  vec2 point = (vUv - uFrom) * scale;
  vec2 path = (uTo - uFrom) * scale;
  float along = clamp(dot(point, path) / max(dot(path, path), 0.000001), 0.0, 1.0);
  float reach = exp(-dot(point - path * along, point - path * along) / (uRadius * uRadius));
  flow = mix(flow, uForce, reach * uStir);

  // A drop pushes outwards in a ring around the point.
  vec2 away = (vUv - uTo) * scale;
  float ring = exp(-dot(away, away) / (uRadius * uRadius));
  flow += normalize(away + 0.00001) * ring * (1.0 - ring) * 4.0 * uDrop;

  gl_FragColor = encode(flow);
}
`;

/** Draws the photo, displaced by the flow. */
const IMAGE_FRAGMENT = `${HEAD}
uniform sampler2D uImage;
uniform sampler2D uFlow;
uniform vec2 uCover;
uniform vec2 uShift;
uniform float uAspect;
uniform float uAmount;
uniform float uTime;

vec3 photo(vec2 uv) {
  return texture2D(uImage, uShift + clamp(uv, 0.0, 1.0) * uCover).rgb;
}

void main() {
  vec2 flow = decode(texture2D(uFlow, vUv));
  // Fade the effect out towards the frame so its edges never tear.
  vec2 pin = smoothstep(0.0, 0.07, vUv) * smoothstep(0.0, 0.07, 1.0 - vUv);
  // Small waves ride on the surface wherever it is moving.
  vec2 waves = vec2(
    sin(vUv.y * 38.0 + uTime * 4.6 + flow.x * 7.0),
    cos(vUv.x * uAspect * 34.0 - uTime * 4.0 + flow.y * 7.0)
  ) * length(flow) * 0.07;
  vec2 push = vec2((flow.x + waves.x) / uAspect, flow.y + waves.y) * uAmount * pin.x * pin.y;
  // Colors separate slightly where the surface moves fastest.
  vec2 fringe = push * 0.07;

  vec3 color = vec3(
    photo(vUv - push - fringe).r,
    photo(vUv - push).g,
    photo(vUv - push + fringe).b
  );
  color += dot(flow, flow) * 0.045;

  gl_FragColor = vec4(color, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGLRenderingContext, fragmentSource: string, precise: boolean) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(
    gl,
    gl.FRAGMENT_SHADER,
    (precise ? "#define PRECISE\n" : "") + fragmentSource,
  );
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function uniforms<Name extends string>(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  names: readonly Name[],
) {
  const found = {} as Record<Name, WebGLUniformLocation | null>;
  for (const name of names) found[name] = gl.getUniformLocation(program, name);
  return found;
}

function nextPowerOfTwo(value: number) {
  return 2 ** Math.ceil(Math.log2(Math.max(value, 1)));
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Sets up the surface on `canvas`, showing `image`. Returns `null` when WebGL
 * is unavailable, in which case the plain image underneath simply stays.
 */
export function createLiquid(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  { focus, onActive }: LiquidOptions,
): Liquid | null {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl || !image.naturalWidth || !image.naturalHeight) return null;

  // One big triangle that covers the whole canvas.
  const triangle = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const createFlow = (type: number, pixels: Uint8Array | null) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      FLOW_SIZE,
      FLOW_SIZE,
      0,
      gl.RGBA,
      type,
      pixels,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const target = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    );
    const complete =
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { texture, target, complete };
  };

  const discard = (flow: ReturnType<typeof createFlow>) => {
    gl.deleteTexture(flow.texture);
    gl.deleteFramebuffer(flow.target);
  };

  /**
   * Two flow textures: each frame reads one and writes the other. Half-float
   * textures give the smoothest surface; where a device cannot draw into
   * them, plain 8-bit textures do the job with slightly coarser ripples.
   */
  const createFlowPair = () => {
    const halfFloat = gl.getExtension("OES_texture_half_float");
    const filtering = gl.getExtension("OES_texture_half_float_linear");
    gl.getExtension("EXT_color_buffer_half_float");

    if (halfFloat && filtering) {
      const pair = [
        createFlow(halfFloat.HALF_FLOAT_OES, null),
        createFlow(halfFloat.HALF_FLOAT_OES, null),
      ] as const;
      if (pair[0].complete && pair[1].complete) return { pair, precise: true };
      pair.forEach(discard);
    }

    const still = new Uint8Array(FLOW_SIZE * FLOW_SIZE * 4);
    for (let index = 0; index < still.length; index += 4) {
      still[index] = 128;
      still[index + 1] = 128;
      still[index + 3] = 255;
    }
    const pair = [
      createFlow(gl.UNSIGNED_BYTE, still),
      createFlow(gl.UNSIGNED_BYTE, still),
    ] as const;
    if (pair[0].complete && pair[1].complete) return { pair, precise: false };
    pair.forEach(discard);
    return null;
  };

  const flows = createFlowPair();
  if (!flows) return null;
  const { precise } = flows;
  let [read, write] = flows.pair;

  const flowProgram = link(gl, FLOW_FRAGMENT, precise);
  const imageProgram = link(gl, IMAGE_FRAGMENT, precise);
  if (!flowProgram || !imageProgram) return null;

  const flowUniforms = uniforms(gl, flowProgram, [
    "uFlow",
    "uFrom",
    "uTo",
    "uForce",
    "uStir",
    "uDrop",
    "uAspect",
    "uRadius",
    "uDecay",
    "uLoss",
  ]);
  const imageUniforms = uniforms(gl, imageProgram, [
    "uImage",
    "uFlow",
    "uCover",
    "uShift",
    "uAspect",
    "uAmount",
    "uTime",
  ]);

  // Layout, refreshed by `resize()`.
  let aspect = 1;
  let radius = 0.16;
  let amount = AMOUNT;
  let cover: [number, number] = [1, 1];
  let shift: [number, number] = [0, 0];
  let quality = 1;

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    let ratio = Math.min(window.devicePixelRatio || 1, 1.5) * quality;
    const pixels = width * height * ratio * ratio;
    if (pixels > MAX_PIXELS) ratio *= Math.sqrt(MAX_PIXELS / pixels);

    const pixelWidth = Math.max(1, Math.round(width * ratio));
    const pixelHeight = Math.max(1, Math.round(height * ratio));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    aspect = width / height;
    // The brush is sized in pixels so it feels the same on a phone and a desktop.
    radius = clamp(0.17 * Math.sqrt(width * height), 90, 190) / height;
    // A push longer than the brush is wide would fold the picture over itself.
    amount = Math.min(AMOUNT, radius * 0.6);

    // Same framing as CSS `object-fit: cover` with `object-position`.
    const imageAspect = image.naturalWidth / image.naturalHeight;
    if (aspect > imageAspect) {
      const visible = imageAspect / aspect;
      cover = [1, visible];
      shift = [0, (1 - visible) * (1 - focus[1])];
    } else {
      const visible = aspect / imageAspect;
      cover = [visible, 1];
      shift = [(1 - visible) * focus[0], 0];
    }
  };
  resize();

  // The photo goes through a 2D canvas so it can be resized to a power of two,
  // which WebGL 1 needs for mipmaps (smooth downscaling).
  const photo = gl.createTexture();
  try {
    const limit = Math.min(2048, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number);
    // Enough pixels for the part of the photo that the frame actually shows.
    const needed = Math.max(canvas.width / cover[0], canvas.height / cover[1]);
    const size = clamp(nextPowerOfTwo(needed), 256, limit);

    const scratch = document.createElement("canvas");
    scratch.width = size;
    scratch.height = size;
    const context = scratch.getContext("2d");
    if (!context) return null;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, size, size);

    gl.bindTexture(gl.TEXTURE_2D, photo);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scratch);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  } catch {
    // A cross-origin image without CORS headers cannot be read into WebGL.
    return null;
  }

  // Input gathered since the last frame.
  let from: [number, number] | null = null;
  let to: [number, number] = [0.5, 0.5];
  let force: [number, number] = [0, 0];
  let stirred = false;
  let dropped = false;

  let frame = 0;
  let previous = 0;
  let lastInput = 0;
  let active = false;
  let dead = false;
  let slowFrames = 0;
  let countedFrames = 0;

  const draw = (now: number) => {
    frame = requestAnimationFrame(draw);

    const seconds = clamp((now - previous) / 1000, 1 / 240, 1 / 20);
    previous = now;
    // Everything below is written for 60 frames per second and scaled to the
    // real frame time, so 120 Hz screens settle at the same speed.
    const frames = seconds * 60;

    gl.useProgram(flowProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, write.target);
    gl.viewport(0, 0, FLOW_SIZE, FLOW_SIZE);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, read.texture);
    gl.uniform1i(flowUniforms.uFlow, 0);
    gl.uniform2f(flowUniforms.uFrom, (from ?? to)[0], (from ?? to)[1]);
    gl.uniform2f(flowUniforms.uTo, to[0], to[1]);
    gl.uniform2f(flowUniforms.uForce, force[0], force[1]);
    gl.uniform1f(flowUniforms.uStir, stirred ? 1 - 0.45 ** frames : 0);
    gl.uniform1f(flowUniforms.uDrop, dropped ? 0.4 : 0);
    gl.uniform1f(flowUniforms.uAspect, aspect);
    gl.uniform1f(flowUniforms.uRadius, radius);
    gl.uniform1f(flowUniforms.uDecay, 0.966 ** frames);
    gl.uniform1f(flowUniforms.uLoss, 0.005 * frames);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    [read, write] = [write, read];

    from = stirred ? to : null;
    stirred = false;
    dropped = false;

    gl.useProgram(imageProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, photo);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, read.texture);
    gl.uniform1i(imageUniforms.uImage, 0);
    gl.uniform1i(imageUniforms.uFlow, 1);
    gl.uniform2f(imageUniforms.uCover, cover[0], cover[1]);
    gl.uniform2f(imageUniforms.uShift, shift[0], shift[1]);
    gl.uniform1f(imageUniforms.uAspect, aspect);
    gl.uniform1f(imageUniforms.uAmount, amount);
    // Wrapped so the number stays small enough for low-precision phones.
    gl.uniform1f(imageUniforms.uTime, (now / 1000) % 600);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // If the device struggles, halve the resolution once rather than stutter.
    if (quality === 1 && countedFrames < 40) {
      countedFrames += 1;
      if (seconds > 1 / 28) slowFrames += 1;
      if (countedFrames === 40 && slowFrames > 20) {
        quality = 0.5;
        resize();
      }
    }

    const idle = (now - lastInput) / 1000;
    if (!active && idle < SETTLE) {
      active = true;
      onActive(true);
    } else if (active && idle >= SETTLE) {
      active = false;
      onActive(false);
    }
    if (idle >= SETTLE + FADE) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };

  const wake = () => {
    if (dead) return;
    lastInput = performance.now();
    if (!frame) {
      previous = lastInput;
      frame = requestAnimationFrame(draw);
    }
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    dead = true;
    cancelAnimationFrame(frame);
    frame = 0;
    if (active) {
      active = false;
      onActive(false);
    }
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  return {
    stir(x, y, vx, vy) {
      const speed = Math.hypot(vx, vy);
      if (dead || speed < 0.02) return;
      // Cap the speed, keep the direction. GL's y axis points up.
      const strength = Math.min(speed / FULL_SPEED, 1) / speed;
      const push: [number, number] = [vx * strength, -vy * strength];
      force = stirred ? [(force[0] + push[0]) / 2, (force[1] + push[1]) / 2] : push;
      to = [x, 1 - y];
      stirred = true;
      wake();
    },

    drop(x, y) {
      if (dead) return;
      to = [x, 1 - y];
      from = null;
      dropped = true;
      wake();
    },

    resize,

    destroy() {
      dead = true;
      cancelAnimationFrame(frame);
      frame = 0;
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteTexture(photo);
      discard(read);
      discard(write);
      gl.deleteBuffer(triangle);
      gl.deleteProgram(flowProgram);
      gl.deleteProgram(imageProgram);
    },
  };
}

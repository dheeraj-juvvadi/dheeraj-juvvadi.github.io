/* ==========================================================================
   Liquid Glass — WebGL refraction engine
   Samples the starfield canvas as a texture and, inside each tracked glass
   region, applies real lens displacement + chromatic aberration + edge
   specular. This is the ONLY way to get genuine Apple-style refraction on
   the web — CSS backdrop-filter can only blur, not bend light.

   Architecture:
     1. starfield.js draws the night sky into #starfield <canvas>
     2. This engine reads that canvas as a GL texture each frame
     3. For every .liquid element, a fullscreen quad runs the glass shader
        masked to that element's screen rect
     4. Falls back to CSS-only glass if WebGL is unavailable
   ========================================================================== */
(function () {
  "use strict";

  const SRC = document.getElementById("starfield");
  const targets = () => [...document.querySelectorAll(".liquid")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Create the GL canvas that sits above the starfield, below content ----
  const glCanvas = document.createElement("canvas");
  glCanvas.id = "gl-glass";
  glCanvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;";
  const glOpts = { antialias: true, premultipliedAlpha: false };
  let gl = glCanvas.getContext("webgl2", glOpts);
  let isWebGL2 = !!gl;
  if (!gl) gl = glCanvas.getContext("webgl", glOpts);

  if (!gl || !SRC) {
    // No WebGL — add a CSS class so the glass elements keep their CSS material
    document.documentElement.classList.add("no-gl-glass");
    return;
  }

  // Insert right after the starfield so it overlays it, but under content
  SRC.parentElement.insertBefore(glCanvas, SRC.nextSibling);

  // ---- Shaders ----
  const VS = `#version 300 es
  in vec2 a_pos; out vec2 v_uv;
  void main(){ v_uv = a_pos*0.5+0.5; gl_Position = vec4(a_pos,0.0,1.0); }`;

  const FS = `#version 300 es
  precision highp float;
  in vec2 v_uv; out vec4 frag;
  uniform sampler2D u_tex;
  uniform vec2 u_texRes;
  uniform vec4 u_rect;
  uniform vec2 u_res;
  uniform float u_scroll;
  uniform float u_radius;

  float roundedRectMask(vec2 p, vec2 size, float radius){
    vec2 q = abs(p - size * 0.5) - (size * 0.5 - vec2(radius));
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    return 1.0 - smoothstep(-1.0, 1.0, d);
  }

  void main(){
    vec2 px = v_uv * u_res;
    if (px.x < u_rect.x || px.x > u_rect.x+u_rect.z ||
        px.y < u_rect.y || px.y > u_rect.y+u_rect.w){
      discard;
    }

    vec2 local = px - u_rect.xy;
    float mask = roundedRectMask(local, u_rect.zw, u_radius);
    if (mask <= 0.01) discard;

    vec2 g = local / u_rect.zw;
    vec2 c = g - 0.5;

    float rad = length(c);
    float bulge = smoothstep(0.05, 0.74, rad);
    vec2 dir = rad > 0.0001 ? normalize(c) : vec2(0.0);
    float edgePull = smoothstep(0.22, 0.50, rad);
    float lens = (1.0 - smoothstep(0.0, 0.54, rad)) * -0.030;
    float strength = 0.095 + u_scroll * 0.03;
    vec2 warp = dir * (bulge * strength + lens);

    vec2 texPxFactor = u_texRes / u_res;
    vec2 baseUV = (px + warp*u_res) * texPxFactor;
    vec2 off = edgePull * 9.0 * texPxFactor;
    vec3 col;
    vec2 ur = clamp((baseUV + off) / u_texRes, vec2(0.0), vec2(1.0));
    vec2 ug = clamp(baseUV / u_texRes, vec2(0.0), vec2(1.0));
    vec2 ub = clamp((baseUV - off) / u_texRes, vec2(0.0), vec2(1.0));
    col.r = texture(u_tex, ur).r;
    col.g = texture(u_tex, ug).g;
    col.b = texture(u_tex, ub).b;

    float lum = dot(col, vec3(0.299,0.587,0.114));
    col = mix(vec3(lum), col, 1.25);
    col *= 1.20;
    col = mix(col, vec3(0.92,0.96,1.0), 0.08);

    float edge = smoothstep(0.34, 0.51, rad);
    vec3 lightDir = normalize(vec3(-0.5,0.8,0.4));
    float rim = pow(max(0.0, dot(normalize(vec3(-c.x, c.y, 0.6)), lightDir)), 2.0);
    col += vec3(1.0,1.0,1.0) * rim * edge * 0.64;

    float topLight = smoothstep(0.62, 0.0, g.y) * smoothstep(0.36,0.0,rad) * 0.20;
    col += topLight;

    float centerGlow = smoothstep(0.5, 0.0, rad) * 0.05;
    col += centerGlow;

    frag = vec4(col, mask * 0.58);
  }`;

  // WebGL1 fallback shaders
  const VS1 = `
  attribute vec2 a_pos; varying vec2 v_uv;
  void main(){ v_uv = a_pos*0.5+0.5; gl_Position = vec4(a_pos,0.0,1.0); }`;
  const FS1 = `
  precision highp float;
  varying vec2 v_uv;
  uniform sampler2D u_tex; uniform vec2 u_texRes; uniform vec4 u_rect;
  uniform vec2 u_res; uniform float u_scroll; uniform float u_radius;
  float roundedRectMask(vec2 p, vec2 size, float radius){
    vec2 q = abs(p - size * 0.5) - (size * 0.5 - vec2(radius));
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    return 1.0 - smoothstep(-1.0, 1.0, d);
  }
  void main(){
    vec2 px = v_uv * u_res;
    if (px.x < u_rect.x || px.x > u_rect.x+u_rect.z ||
        px.y < u_rect.y || px.y > u_rect.y+u_rect.w){ discard; }
    vec2 local = px - u_rect.xy;
    float mask = roundedRectMask(local, u_rect.zw, u_radius);
    if (mask <= 0.01) discard;
    vec2 g = local / u_rect.zw;
    vec2 c = g - 0.5;
    float rad = length(c);
    float bulge = smoothstep(0.05, 0.74, rad);
    vec2 dir = rad > 0.0001 ? normalize(c) : vec2(0.0);
    float edgePull = smoothstep(0.22, 0.50, rad);
    float lens = (1.0 - smoothstep(0.0, 0.54, rad)) * -0.030;
    float strength = 0.095 + u_scroll*0.03;
    vec2 warp = dir * (bulge * strength + lens);
    vec2 factor = u_texRes / u_res;
    vec2 baseUV = (px + warp*u_res) * factor;
    vec2 off = edgePull * 9.0 * factor;
    vec2 ur = clamp((baseUV+off)/u_texRes, vec2(0.0), vec2(1.0));
    vec2 ug = clamp(baseUV/u_texRes, vec2(0.0), vec2(1.0));
    vec2 ub = clamp((baseUV-off)/u_texRes, vec2(0.0), vec2(1.0));
    vec3 col;
    col.r = texture2D(u_tex, ur).r;
    col.g = texture2D(u_tex, ug).g;
    col.b = texture2D(u_tex, ub).b;
    float lum = dot(col, vec3(0.299,0.587,0.114));
    col = mix(vec3(lum), col, 1.25);
    col *= 1.20;
    col = mix(col, vec3(0.92,0.96,1.0), 0.08);
    float edge = smoothstep(0.34, 0.51, rad);
    float rim = pow(max(0.0, dot(normalize(vec3(-c.x, c.y, 0.6)), normalize(vec3(-0.5,0.8,0.4)))), 2.0);
    col += vec3(1.0,1.0,1.0) * rim * edge * 0.54;
    float topLight = smoothstep(0.62,0.0,g.y) * smoothstep(0.36,0.0,rad) * 0.18;
    col += topLight;
    gl_FragColor = vec4(col, mask * 0.58);
  }`;

  function compile(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("glass shader:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  const vsSrc = isWebGL2 ? VS : VS1;
  const fsSrc = isWebGL2 ? FS : FS1;
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(vsSrc, gl.VERTEX_SHADER));
  gl.attachShader(prog, compile(fsSrc, gl.FRAGMENT_SHADER));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("glass program link:", gl.getProgramInfoLog(prog));
    document.documentElement.classList.add("no-gl-glass");
    return;
  }
  gl.useProgram(prog);

  // fullscreen triangle/quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1, 1,-1, -1,1,  -1,1, 1,-1, 1,1
  ]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // uniforms
  const uTex = gl.getUniformLocation(prog, "u_tex");
  const uTexRes = gl.getUniformLocation(prog, "u_texRes");
  const uRect = gl.getUniformLocation(prog, "u_rect");
  const uRes = gl.getUniformLocation(prog, "u_res");
  const uScroll = gl.getUniformLocation(prog, "u_scroll");
  const uRadius = gl.getUniformLocation(prog, "u_radius");
  gl.uniform1i(uTex, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // texture from starfield canvas
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // mark glass elements so CSS can go transparent
  document.documentElement.classList.add("has-gl-glass");

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    glCanvas.width = W * DPR; glCanvas.height = H * DPR;
    glCanvas.style.width = W + "px"; glCanvas.style.height = H + "px";
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
  }
  resize();
  window.addEventListener("resize", resize);

  function render() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // upload starfield as texture (needs to be drawn already by starfield.js)
    if (SRC.width > 0 && SRC.height > 0) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, SRC);
      } catch (e) { /* not ready yet */ }
    }

    gl.uniform2f(uRes, glCanvas.width, glCanvas.height);
    gl.uniform2f(uTexRes, SRC.width || W, SRC.height || H);
    gl.uniform1f(uScroll, 0);

    // draw a refraction pass for each tracked glass element
    const list = targets();
    for (const node of list) {
      const rect = node.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) continue;
      // convert to GL pixel coords (bottom-left origin)
      const x = rect.left * DPR;
      const y = (H - rect.bottom) * DPR;
      const w = rect.width * DPR;
      const h = rect.height * DPR;
      const radius = parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0;
      gl.uniform4f(uRect, x, y, w, h);
      gl.uniform1f(uRadius, Math.min(radius * DPR, w * 0.5, h * 0.5));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(render);
  }
  if (reduce) { render(); }
  else { requestAnimationFrame(render); }
})();

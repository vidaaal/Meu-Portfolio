import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";

const canvas = document.querySelector("[data-hero-3d]");
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const canUseSection3d =
  !reducedMotion && window.matchMedia("(min-width: 760px)").matches;

if (canvas) {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.8, 8);

  const group = new THREE.Group();
  group.position.set(0.42, -0.05, 0);
  scene.add(group);

  const red = new THREE.Color("#6f00ff");
  const white = new THREE.Color("#ff00dd");
  const smoke = new THREE.Color("#4d0088");

  const coreMaterial = new THREE.MeshStandardMaterial({
    color: "#09090b",
    roughness: 0.52,
    metalness: 0.38,
    emissive: "#050505",
    emissiveIntensity: 0.35,
  });

  const redRingMaterial = new THREE.MeshBasicMaterial({
    color: red,
    transparent: true,
    opacity: 0.78,
    wireframe: true,
  });

  const glassMaterial = new THREE.MeshBasicMaterial({
    color: white,
    transparent: true,
    opacity: 0.1,
    wireframe: true,
  });

  const smokeMaterial = new THREE.MeshBasicMaterial({
    color: smoke,
    transparent: true,
    opacity: 0.24,
    wireframe: true,
  });

  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(1.32, 1.32, 0.22, 48, 1),
    coreMaterial,
  );
  core.rotation.x = Math.PI / 2.5;
  group.add(core);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.38, 0.035, 6, 72),
    redRingMaterial,
  );
  rim.rotation.x = Math.PI / 2.5;
  group.add(rim);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.012, 5, 56),
    glassMaterial,
  );
  innerRing.rotation.x = Math.PI / 2.5;
  group.add(innerRing);

  const orbitA = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.008, 5, 80),
    glassMaterial,
  );
  orbitA.rotation.set(1.05, 0.18, -0.42);
  group.add(orbitA);

  const orbitB = new THREE.Mesh(
    new THREE.TorusGeometry(2.55, 0.006, 5, 84),
    smokeMaterial,
  );
  orbitB.rotation.set(0.28, 1.2, 0.28);
  group.add(orbitB);

  const nodes = new THREE.Group();
  const nodeGeometry = new THREE.SphereGeometry(0.035, 8, 8);

  for (let i = 0; i < 24; i += 1) {
    const angle = (i / 24) * Math.PI * 2;
    const radius = i % 3 === 0 ? 2.55 : 2.05;
    const material = new THREE.MeshBasicMaterial({
      color: i % 4 === 0 ? smoke : white,
      transparent: true,
      opacity: i % 4 === 0 ? 0.48 : 0.38,
    });
    const node = new THREE.Mesh(nodeGeometry, material);
    node.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 1.7) * 0.46,
      Math.sin(angle) * radius * 0.34,
    );
    nodes.add(node);
  }

  group.add(nodes);

  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 150;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 9;
    positions[i3 + 1] = (Math.random() - 0.5) * 5.5;
    positions[i3 + 2] = (Math.random() - 0.5) * 5;

    const color = i % 7 === 0 ? smoke : white;
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    }),
  );
  scene.add(particles);

  const keyLight = new THREE.PointLight("#eeeeee", 12, 8);
  keyLight.position.set(2, 1.8, 3);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight("#eeeeee", 0.6);
  fillLight.position.set(-2, 2, 4);
  scene.add(fillLight);

  const pointer = { x: 0, y: 0 };
  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );

  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  let frame = 0;
  let heroVisible = true;

  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      heroVisible = entry.isIntersecting;
    },
    { rootMargin: "12% 0px 12% 0px" },
  );
  heroObserver.observe(canvas);

  function animate() {
    if (!heroVisible) {
      requestAnimationFrame(animate);
      return;
    }

    frame += 0.01;

    group.rotation.y += (pointer.x * 0.34 - group.rotation.y) * 0.035;
    group.rotation.x += (-pointer.y * 0.16 - group.rotation.x) * 0.035;

    if (!reducedMotion) {
      core.rotation.z += 0.004;
      rim.rotation.z -= 0.006;
      innerRing.rotation.z += 0.008;
      orbitA.rotation.z += 0.003;
      orbitB.rotation.y -= 0.002;
      nodes.rotation.y += 0.004;
      particles.rotation.y += 0.0008;
      group.position.y = Math.sin(frame) * 0.08 - 0.05;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

document.querySelectorAll("[data-section-3d]").forEach((node) => {
  node.innerHTML = `
    <span class="shape shape-a"></span>
    <span class="shape shape-b"></span>
    <span class="shape shape-c"></span>
    <span class="shape shape-d"></span>
  `;
});

const sectionScenes = [];

if (canUseSection3d)
  document.querySelectorAll("[data-section-3d]").forEach((container, index) => {
    const canvas3d = document.createElement("canvas");
    canvas3d.className = "section-webgl";
    canvas3d.setAttribute("aria-hidden", "true");
    container.prepend(canvas3d);

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas3d,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.2, 7.8);

    const group = new THREE.Group();
    const kind = container.dataset.section3d || "section";
    const direction = index % 2 === 0 ? 1 : -1;
    const placements = {
      intro: [-1.85, 1.05, 0],
      stack: [-1.55, 1.25, 0],
      projects: [-1.9, 0.95, 0],
      career: [-1.7, 1.1, 0],
      experience: [-1.45, 1.0, 0],
      highlights: [-1.75, 1.15, 0],
      contact: [-1.35, 0.95, 0],
    };
    const [baseX, baseY, baseZ] = placements[kind] || [-1.65, 1.05, 0];
    group.position.set(baseX, baseY, baseZ);
    group.rotation.set(0.2, 0.4 * direction, -0.12 * direction);
    scene.add(group);

    const violet = new THREE.Color("#6200b3");
    const pink = new THREE.Color("#ff00dd");
    const soft = new THREE.Color("#eeeeee");

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: kind === "projects" || kind === "career" ? violet : pink,
      transparent: true,
      opacity: kind === "contact" ? 0.2 : 0.15,
      wireframe: true,
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: soft,
      transparent: true,
      opacity: 0.1,
      wireframe: true,
    });

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.72, 0.12, 64, 8, 2 + (index % 3), 3),
      wireMaterial,
    );
    knot.position.set(-0.28, 0.06, 0);
    knot.scale.setScalar(kind === "stack" ? 1.18 : 1);
    group.add(knot);

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(1.85, 0.01, 5, 80),
      glowMaterial,
    );
    orbit.rotation.set(1.18, 0.42 * direction, 0.18);
    group.add(orbit);

    const grid = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 1.7, 12, 6),
      glowMaterial,
    );
    grid.position.set(0.85, -0.95, -0.6);
    grid.rotation.set(1.25, 0, -0.22 * direction);
    group.add(grid);

    const pointGeometry = new THREE.BufferGeometry();
    const pointCount = 32;
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);

    for (let i = 0; i < pointCount; i += 1) {
      const i3 = i * 3;
      const angle = (i / pointCount) * Math.PI * 2;
      const radius = 1.1 + Math.random() * 1.8;
      positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.4;
      positions[i3 + 1] =
        Math.sin(angle * 1.7) * 0.62 + (Math.random() - 0.5) * 0.4;
      positions[i3 + 2] = Math.sin(angle) * radius * 0.52;

      const color = i % 5 === 0 ? violet : soft;
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    pointGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    pointGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const points = new THREE.Points(
      pointGeometry,
      new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.36,
      }),
    );
    group.add(points);

    function resize() {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    resize();

    sectionScenes.push({
      baseY,
      camera,
      container,
      direction,
      group,
      grid,
      index,
      knot,
      orbit,
      points,
      renderer,
      resize,
      scene,
      visible: false,
    });
  });

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const item = sectionScenes.find(
        (sectionScene) => sectionScene.container === entry.target,
      );
      if (item) item.visible = entry.isIntersecting;
    });
  },
  { rootMargin: "18% 0px 18% 0px" },
);

sectionScenes.forEach((item) => sectionObserver.observe(item.container));

window.addEventListener(
  "resize",
  () => {
    sectionScenes.forEach((item) => item.resize());
  },
  { passive: true },
);

let sectionFrame = 0;

function animateSectionScenes() {
  sectionFrame += 0.012;

  sectionScenes.forEach((item) => {
    if (!item.visible) return;

    const scrollOffset =
      item.container.getBoundingClientRect().top /
      Math.max(window.innerHeight, 1);
    const drift = Math.sin(sectionFrame + item.index * 0.72);

    if (!reducedMotion) {
      item.group.rotation.y += 0.0024 * item.direction;
      item.group.rotation.x = 0.2 + drift * 0.08 + scrollOffset * 0.08;
      item.group.rotation.z = -0.12 * item.direction + scrollOffset * 0.12;
      item.group.position.y = item.baseY + drift * 0.08;
      item.knot.rotation.x += 0.004;
      item.knot.rotation.y += 0.006 * item.direction;
      item.orbit.rotation.z += 0.3035 * item.direction;
      item.points.rotation.y += 0.003 * item.direction;
      item.grid.rotation.z += 0.0009 * item.direction;
    }

    item.renderer.render(item.scene, item.camera);
  });

  requestAnimationFrame(animateSectionScenes);
}

if (sectionScenes.length) {
  animateSectionScenes();
}

const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', event => {
    if (!nav.classList.contains('open')) {
      return;
    }

    const clickedInsideNav = nav.contains(event.target);
    const clickedToggle = navToggle.contains(event.target);
    if (!clickedInsideNav && !clickedToggle) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });
}

const normalizePath = path => path.replace(/\\/g, '/').replace(/(^\/+|\/+?$)/g, '');
const currentPath = normalizePath(window.location.pathname || '');

document.querySelectorAll('.site-nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (!href) {
    return;
  }

  const absolute = new URL(href, window.location.href);
  const linkPath = normalizePath(absolute.pathname);
  if (currentPath.endsWith(linkPath) || (!currentPath && linkPath.endsWith('index.html'))) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll('.card, .list-card, .kpi-card, .section-head, .page-hero > .container > *, .reveal-on-load').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

const animatedMetrics = document.querySelectorAll('[data-count]');
if (animatedMetrics.length > 0) {
  const animateNumber = element => {
    const target = Number(element.getAttribute('data-count'));
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = 1100;
    const start = performance.now();

    const tick = now => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      element.textContent = `${value}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const metricObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateNumber(entry.target);
          metricObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  animatedMetrics.forEach(item => metricObserver.observe(item));
}

const kpiFills = document.querySelectorAll('.kpi-fill[data-fill]');
if (kpiFills.length > 0) {
  const fillObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const val = Number(entry.target.getAttribute('data-fill')) || 0;
          entry.target.style.width = `${Math.max(0, Math.min(100, val))}%`;
          fillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  kpiFills.forEach(fill => fillObserver.observe(fill));
}

document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const status = document.createElement('p');
    status.className = 'form-status';
    status.textContent = 'Thanks. Your request was captured. We will contact you shortly.';
    const existingStatus = form.querySelector('.form-status');
    if (existingStatus) {
      existingStatus.remove();
    }
    if (button) {
      button.insertAdjacentElement('afterend', status);
    } else {
      form.appendChild(status);
    }
    form.reset();
  });
});

const loadScript = src =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.THREE) {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed: ${src}`)), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(script);
  });

const setHeroFallbackState = message => {
  const visual = document.querySelector('.hero-visual');
  const caption = document.querySelector('.visual-caption');
  if (visual) {
    visual.classList.add('hero-visual-fallback');
  }
  if (caption && message) {
    caption.textContent = message;
  }
};

const initHeroThreeScene = () => {
  const canvas = document.getElementById('hero-three-canvas');
  if (!canvas || !window.THREE) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { THREE } = window;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
  } catch {
    setHeroFallbackState('Adaptive Intelligence Mesh (2D fallback)');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
  camera.position.set(0, 0.2, 5.5);

  const ambient = new THREE.AmbientLight(0x78c7ff, 0.9);
  const pointA = new THREE.PointLight(0x39b4ff, 1.3, 18);
  const pointB = new THREE.PointLight(0x00da9f, 1.2, 18);
  pointA.position.set(3.4, 2.4, 3.8);
  pointB.position.set(-3.1, -2.1, 2.2);
  scene.add(ambient, pointA, pointB);

  const core = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.05, 0.22, 136, 18),
    new THREE.MeshStandardMaterial({
      color: 0x7ddfff,
      emissive: 0x1b4a71,
      roughness: 0.22,
      metalness: 0.7
    })
  );

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.95, 0.03, 16, 130),
    new THREE.MeshBasicMaterial({ color: 0x00da9f, transparent: true, opacity: 0.65 })
  );
  halo.rotation.x = Math.PI / 2.7;

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.15, 2),
    new THREE.MeshBasicMaterial({
      color: 0x39b4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    })
  );

  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 700;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 12;
    positions[i3 + 1] = (Math.random() - 0.5) * 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 10;
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const stars = new THREE.Points(
    starsGeometry,
    new THREE.PointsMaterial({
      color: 0xb7ebff,
      size: 0.03,
      transparent: true,
      opacity: 0.75
    })
  );

  const cluster = new THREE.Group();
  cluster.add(core, halo, wire);
  scene.add(cluster, stars);

  const pointer = { x: 0, y: 0 };
  canvas.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  const resize = () => {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  resize();
  window.addEventListener('resize', resize);

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
  }

  if (prefersReducedMotion) {
    renderer.render(scene, camera);
    return;
  }

  const clock = new THREE.Clock();
  const animate = () => {
    const t = clock.getElapsedTime();
    cluster.rotation.y = t * 0.25 + pointer.x * 0.2;
    cluster.rotation.x = Math.sin(t * 0.35) * 0.1 + pointer.y * 0.12;
    halo.rotation.z += 0.005;
    core.rotation.x += 0.003;
    wire.rotation.z -= 0.0016;
    stars.rotation.y = -t * 0.03;
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
};

const bootHeroMesh = async () => {
  const canvas = document.getElementById('hero-three-canvas');
  if (!canvas) {
    return;
  }

  if (window.THREE) {
    initHeroThreeScene();
    return;
  }

  const mainScript = document.querySelector('script[src*="assets/js/main.js"]');
  const scriptBase = mainScript ? new URL('.', mainScript.src).toString() : `${window.location.origin}/assets/js/`;
  const cdnCandidates = [
    new URL('vendor/three.min.js', scriptBase).toString(),
    'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js',
    'https://unpkg.com/three@0.152.2/build/three.min.js'
  ];

  for (const src of cdnCandidates) {
    try {
      await loadScript(src);
      if (window.THREE) {
        initHeroThreeScene();
        return;
      }
    } catch {
      // Try next source.
    }
  }

  setHeroFallbackState('Adaptive Intelligence Mesh Unavailable');
};

bootHeroMesh();

/* ======================================
   PARTICLES.JS BACKGROUND
====================================== */

particlesJS("particles-js", {

  particles: {

    number: {
      value: 70,
      density: { enable: true, value_area: 900 }
    },

    color: {
      value: ["#22c55e", "#0ea5e9", "#a3e635"]
    },

    shape: { type: "circle" },

    opacity: {
      value: 0.45,
      random: false
    },

    size: {
      value: 3,
      random: true
    },

    line_linked: {
      enable: true,
      distance: 140,
      color: "#a5b4fc",
      opacity: 0.35,
      width: 1
    },

    move: {
      enable: true,
      speed: 1.2,
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out"
    }

  },

  interactivity: {

    detect_on: "canvas",

    events: {
      onhover: { enable: true, mode: "repulse" },
      onclick: { enable: false },
      resize: true
    },

    modes: {
      repulse: { distance: 120 },
      grab: { distance: 150 }
    }

  },

  retina_detect: true

});



/* ======================================
   ANIME.JS ENTRANCE ANIMATIONS
====================================== */

window.addEventListener("load", () => {

  anime({
    targets: ".card",
    translateY: [40, 0],
    opacity: [0, 1],
    delay: anime.stagger(120),
    duration: 700,
    easing: "easeOutExpo"
  });

  anime({
    targets: ".table-card",
    translateY: [30, 0],
    opacity: [0, 1],
    delay: 400,
    duration: 700,
    easing: "easeOutExpo"
  });

});



/* ======================================
   THREE.JS SMART CITY BACKGROUND
====================================== */

(function initThreeCity() {

  const container = document.getElementById("three-bg");

  if (!container || typeof THREE === "undefined") return;


  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xe0f2f1, 0.018);


  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(25, 30, 40);
  camera.lookAt(0, 0, 0);


  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);


  /* LIGHTS */

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(20, 40, 20);
  scene.add(dirLight);


  /* CITY GROUP */

  const city = new THREE.Group();
  scene.add(city);


  /* GROUND */

  const ground = new THREE.Mesh(

    new THREE.PlaneGeometry(120, 120),

    new THREE.MeshPhongMaterial({
      color: 0xe0f7fa,
      flatShading: true
    })

  );

  ground.rotation.x = -Math.PI / 2;

  city.add(ground);



  /* BUILDINGS */

  function createBuilding(x, z, h) {

    const mesh = new THREE.Mesh(

      new THREE.BoxGeometry(5, h, 5),

      new THREE.MeshPhongMaterial({
        color: 0x22c55e,
        flatShading: true
      })

    );

    mesh.position.set(x, h / 2, z);

    city.add(mesh);

  }

  for (let x = -40; x <= 40; x += 10) {

    for (let z = -40; z <= 40; z += 10) {

      if (Math.random() < 0.25) continue;

      createBuilding(x, z, 5 + Math.random() * 15);

    }

  }



  /* MOVING TRUCKS */

  const trucks = [];

  function addTruck(pathZ) {

    const mesh = new THREE.Mesh(

      new THREE.BoxGeometry(2.4, 1.2, 1.5),

      new THREE.MeshPhongMaterial({
        color: 0xff7043,
        flatShading: true
      })

    );

    mesh.position.set(-60, 0.7, pathZ);

    mesh.userData.speed = 0.05 + Math.random() * 0.05;

    city.add(mesh);

    trucks.push(mesh);

  }

  addTruck(-20);
  addTruck(0);
  addTruck(20);



  /* MOUSE PARALLAX */

  const mouse = { x: 0, y: 0 };

  window.addEventListener("mousemove", (e) => {

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;

  });



  /* ANIMATION LOOP */

  function animate() {

    requestAnimationFrame(animate);

    const time = performance.now() * 0.0003;

    city.rotation.y += (mouse.x * 0.3 - city.rotation.y) * 0.02;
    city.rotation.x += (-0.4 + mouse.y * 0.1 - city.rotation.x) * 0.02;

    trucks.forEach(truck => {

      truck.position.x += truck.userData.speed;

      if (truck.position.x > 60) {
        truck.position.x = -60;
      }

    });

    renderer.render(scene, camera);

  }

  animate();



  /* RESIZE */

  window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  });

})();
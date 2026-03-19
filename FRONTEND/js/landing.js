function scrollToAbout() {
  document.getElementById("about").scrollIntoView({ behavior: "smooth" });
}

/* particles.js */
particlesJS("particles-js", {
  particles: {
    number: { value: 50 },
    color: { value: "#22c55e" },
    size: { value: 3 },
    line_linked: { enable: true, opacity: 0.3 },
    move: { speed: 1 }
  }
});

/* three.js subtle floating spheres */
(function initThree() {
  if (typeof THREE === "undefined") return;

  const container = document.getElementById("three-bg");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 60;

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.SphereGeometry(1.5, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.5
  });

  for (let i = 0; i < 15; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 40
    );
    group.add(mesh);
  }

  scene.add(new THREE.AmbientLight(0xffffff, 1));

  function animate() {
    requestAnimationFrame(animate);
    group.rotation.y += 0.001;
    renderer.render(scene, camera);
  }

  animate();
})();
// Smooth scrolling for internal links (like #contact)
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});


let currentRole = "admin";

function openAuth() {
  document.getElementById("authOverlay").classList.add("active");
}

function closeAuth() {
  document.getElementById("authOverlay").classList.remove("active");
}

function switchTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".auth-form").forEach(f => f.classList.remove("active"));

  document.querySelector(`.tab[onclick*='${tab}']`).classList.add("active");
  document.getElementById(tab).classList.add("active");
}

function selectRole(role) {
  currentRole = role;
  document.querySelectorAll(".role").forEach(r => r.classList.remove("active"));
  document.querySelector(`.role[onclick*='${role}']`).classList.add("active");
}

/* Optional: close on ESC */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeAuth();
});

document.addEventListener("DOMContentLoaded", () => {

  const signinForm = document.getElementById("signin");
  const signupForm = document.getElementById("signup");

  if (signinForm) {
    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = e.target.querySelector("input[type='email']").value;
      const password = e.target.querySelector("input[type='password']").value;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.token) {
        // store authentication info
        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.name);
        localStorage.setItem("role", data.role);
        localStorage.setItem("driver", data.name); // store driver name for driver dashboard

        // redirect based on role
        if (data.role === "admin") {
          window.location.href = "/index.html";
        }
        if (data.role === "driver") {
          window.location.href = "/driver.html";
        }
        if (data.role === "citizen") {
          window.location.href = "/complaints.html";
        }
      } else {
        alert(data.message);
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = e.target.querySelector("input[type='text']").value;
      const email = e.target.querySelector("input[type='email']").value;
      const password = e.target.querySelector("input[type='password']").value;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: currentRole
        })
      });

      const data = await res.json();

      if (data.message) {
        alert("Account created successfully!");
        switchTab("signin");
      } else {
        alert(data.error || "Signup failed");
      }
    });
  }

});
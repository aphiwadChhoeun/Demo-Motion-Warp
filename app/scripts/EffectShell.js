import * as THREE from "three";

// EFFECT SHELL
export default class EffectShell {
  constructor(container) {
    this.container = container;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    this.container.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.viewport.aspectRatio,
      1,
      1000
    );
    this.camera.position.z = 5;

    window.addEventListener("resize", this.onResize.bind(this));
    document.addEventListener("mousemove", (e) => {
      this.onMouseMove(e);
    });

    this.loadTextures();
  }

  loadTextures() {
    let planeGeometry = new THREE.PlaneGeometry(2, 2, 12, 12);
    let planeMaterial = new THREE.MeshBasicMaterial({ color: 0xa8e6cf });
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);

    this.scene.add(this.plane);

    this.animate();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    this.plane.rotation.x += 0.1 * 0.08;
    this.plane.rotation.y += 0.1 * 0.08;

    this.render();

    requestAnimationFrame(this.animate.bind(this));
  }

  onResize() {
    this.camera.aspect = this.viewport.aspectRatio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.viewport.width, this.viewport.height);
  }

  onMouseMove(e) {
    console.log(`x: ${e.clientX}, ${e.clientY}`);
  }

  get viewport() {
    let width = this.container.clientWidth;
    let height = this.container.clientHeight;
    let aspectRatio = width / height;
    return {
      width,
      height,
      aspectRatio,
    };
  }

  get viewSize() {
    // https://gist.github.com/ayamflow/96a1f554c3f88eef2f9d0024fc42940f

    let distance = this.camera.position.z;
    let vFov = (this.camera.fov * Math.PI) / 180;
    let height = 2 * Math.tan(vFov / 2) * distance;
    let width = height * this.viewport.aspectRatio;
    return { width, height, vFov };
  }
}

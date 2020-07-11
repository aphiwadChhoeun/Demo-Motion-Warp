import * as THREE from "three";
import { gsap } from "gsap";

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

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

    this.mouse = new THREE.Vector2();
    this.trailPosition = new THREE.Vector2();

    window.addEventListener("resize", this.onResize.bind(this));
    document.addEventListener("mousemove", (e) => {
      this.onMouseMove(e);
    });

    this.loadTexture();
  }

  loadTexture() {
    let imgDom = document.querySelector(".item img");
    let computedStyle = window.getComputedStyle(imgDom);
    let textureLoader = new THREE.TextureLoader();
    this.texture = textureLoader.load(imgDom.getAttribute("src"));
    imgDom.style.opacity = 0.0;
    let width = parseFloat(computedStyle.getPropertyValue("width"));
    let height = parseFloat(computedStyle.getPropertyValue("height"));

    console.log(`${width}:${height}`);

    let planeGeometry = new THREE.PlaneGeometry(
      width * (this.viewSize.width / this.viewport.width),
      height * (this.viewSize.height / this.viewport.height),
      12,
      12
    );
    this.uniforms = {
      uTexture: {
        value: this.texture,
      },
      uOffset: {
        value: new THREE.Vector2(0.0, 0.0),
      },
    };
    let planeMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        uniform vec2 uOffset;

        #define PI 3.1415926535897932384626433832795

        vec3 deformPosition(vec3 position, vec2 uv, vec2 offset) {
          position.x = position.x + (sin(uv.y * PI) * offset.x);
          position.y = position.y + (sin(uv.x * PI) * offset.y);
          return position;
        }

        void main() {
          vUv = uv;
          vec3 newPosition = position;
          newPosition = deformPosition(position, uv, uOffset);
          gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;

        varying vec2 vUv;

        void main() {
          gl_FragColor = texture2D(uTexture, vUv);
        }
      `,
    });
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);

    this.scene.add(this.plane);

    this.animate();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    let x = this.mouse.x.map(
      -1,
      1,
      -this.viewSize.width / 2,
      this.viewSize.width / 2
    );
    let y = this.mouse.y.map(
      -1,
      1,
      -this.viewSize.height / 2,
      this.viewSize.height / 2
    );

    this.trailPosition.set(x, y);
    gsap.to(this.plane.position, {
      x: x,
      y: y,
      ease: "power3.out",
    });

    let offset = this.plane.position.clone().sub(this.trailPosition);
    offset = offset.multiplyScalar(-0.8);

    this.uniforms.uOffset.value = offset;

    this.render();

    requestAnimationFrame(this.animate.bind(this));
  }

  onResize() {
    this.camera.aspect = this.viewport.aspectRatio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.viewport.width, this.viewport.height);
  }

  onMouseMove(e) {
    this.mouse.x = (e.clientX / this.viewport.width) * 2 - 1;
    this.mouse.y = -(e.clientY / this.viewport.height) * 2 + 1;

    // console.log(this.mouse);
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

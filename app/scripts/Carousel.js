import { gsap } from "gsap";

// const IMAGE_WIDTH = 540;

export default class Carousel {
  constructor(container) {
    this.container = container;
    this.wrapper = this.container.querySelector(".carousel__wrapper");
    this.controls = this.container.querySelector(".carousel__controls");
    this.cursor = 0;

    this.genericWidth =
      parseFloat(
        window
          .getComputedStyle(this.wrapper.querySelector(".carousel__item"))
          .getPropertyValue("width")
      ) + 60;

    this.init();
  }

  init() {
    this.items = this.wrapper.querySelectorAll(".carousel__item");

    this.addEventListeners();
  }

  addEventListeners() {
    const controlNext = this.controls.querySelector(".next");
    const controlBack = this.controls.querySelector(".back");

    controlNext.addEventListener("click", (e) => {
      if (this.tail > this.viewport.width - this.genericWidth) {
        gsap.to(this.wrapper, {
          duration: 0.3,
          x: "-=" + this.genericWidth,
          ease: "power3.out",
        });
      }
    });

    controlBack.addEventListener("click", (e) => {
      if (this.head < 50) {
        gsap.to(this.wrapper, {
          duration: 0.3,
          x: "+=" + this.genericWidth,
          ease: "power3.out",
        });
      }
    });
  }

  get head() {
    return this.items[0].getBoundingClientRect().left;
  }

  get tail() {
    return this.items[this.items.length - 1].getBoundingClientRect().left;
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
}

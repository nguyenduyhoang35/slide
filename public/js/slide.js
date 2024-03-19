class Slides {
  windowSize = { width: 0, height: 0, loading: true };
  element = null;
  index = 0;
  maxIndex = 0;
  btnNext = null;
  btnPre = null;
  mousePoint = { xStart: -1, xEnd: -1 };

  /**
   * @param {string} elementId - Id of element DOM
   */
  constructor(elementId) {
    this.elementId = elementId;
    this.idDom = revisedRandId();
    const element = document.getElementById(elementId);
    if (!element) {
      throw "Element DOM not existed";
    }
    this.element = element;
    this.windowSize = element.getBoundingClientRect();
    this.maxIndex =
      this.element.getElementsByClassName("slide__item").length - 1;
    this.listener();
    this.implementDom();
    this.mouseControl();
  }

  resize() {
    const element = document.getElementById(this.idDom);
    if (element) this.windowSize = element.getBoundingClientRect();
    this.appendSize();
  }

  listener() {
    window.addEventListener("resize", () => {
      this.resize();
    });
  }

  implementDom() {
    if (!this.element) return;
    const div = document.createElement("div");
    div.style.position = "relative";
    div.id = this.idDom;

    const parent = this.element.parentNode;

    this.btnPre = this.element.querySelector(".slide__btn-prev");

    if (this.btnPre)
      this.btnPre.addEventListener("click", () => {
        this.prev();
      });

    this.btnNext = this.element.querySelector(".slide__btn-next");
    if (this.btnNext)
      this.btnNext.addEventListener("click", () => {
        this.next();
      });

    this.element.removeChild(this.btnPre);
    this.element.removeChild(this.btnNext);
    this.element.parentNode.removeChild(this.element);

    div.appendChild(this.element);
    div.appendChild(this.btnNext);
    div.appendChild(this.btnPre);

    parent.append(div);
    this.disabledPre(true);
    this.disabledNext(this.maxIndex <= this.index);
    this.appendSize();
  }

  appendSize() {
    const items = this.element.getElementsByClassName("slide__item");
    for (let i = 0; i < items.length; i++) {
      items[i].style.width = `${this.windowSize.width}px`;
    }
    this.disabledAnimation();
    this.appendTranslateX(-this.index * this.windowSize.width);
  }

  mouseDown(event) {
    this.mousePoint.xStart = event.pageX;
  }

  mouseUp() {
    if (this.mousePoint.xStart === -1 || this.mousePoint.xEnd === -1) {
      this.mousePoint = { xStart: -1, xEnd: -1 };
      this.enableAnimation();
      return this.appendTranslateX(-this.index * this.windowSize.width);
    }
    const size = this.mousePoint.xEnd - this.mousePoint.xStart;
    const percent = Math.abs(size) / this.windowSize.width;
    if (percent >= 0.5) {
      if (percent > 1) {
        if (size < 0 && this.index < this.maxIndex) {
          this.index += Math.round(percent) - 1;
          if (this.index > this.maxIndex) this.index = this.maxIndex - 1;
        } else if (size > 0 && this.index > 0) {
          this.index -= Math.round(percent) - 1;
          if (this.index < 0) this.index = 1;
        }
      }
      if (size < 0) {
        this.next();
      } else this.prev();
    } else {
      this.enableAnimation();
      this.appendTranslateX(-this.index * this.windowSize.width);
    }
    this.mousePoint = { xStart: -1, xEnd: -1 };
  }

  mouseMove(event) {
    if (this.mousePoint.xStart === -1) return;
    this.mousePoint.xEnd = event.pageX;
    this.disabledAnimation();
    let translateAdd = this.mousePoint.xEnd - this.mousePoint.xStart;
    if (
      (this.index <= 0 && translateAdd > 0) ||
      (this.index >= this.maxIndex && translateAdd < 0)
    ) {
      translateAdd *= 0.3;
    }
    this.appendTranslateX(
      -this.index * this.windowSize.width + translateAdd
    );
  }

  mouseControl() {
    const element = document.getElementById(this.idDom);
    element.addEventListener("mousedown", (e) => {
      this.mouseDown(e);
    });
    element.addEventListener("mouseup", (e) => {
      this.mouseUp(e);
    });
    element.addEventListener("mousemove", (e) => {
      this.mouseMove(e);
    });
    element.addEventListener("touchstart", (e) => {
      this.mouseDown({ pageX: e.touches[0]?.pageX });
    });
    element.addEventListener("touchend", (e) => {
      this.mouseUp({ pageX: e.changedTouches[0]?.pageX });
    });
    element.addEventListener("touchmove", (e) => {
      this.mouseMove({ pageX: e.touches[0]?.pageX });
    });
    element.addEventListener("mouseleave", (e) => {
      this.mouseUp(e);
    });
  }

  next() {
    this.enableAnimation();
    if (this.index >= this.maxIndex) {
      return this.appendTranslateX(-this.index * this.windowSize.width);
    }
    this.index += 1;
    this.appendTranslateX(-this.index * this.windowSize.width);
    this.disabledPre(false);
    this.disabledNext(this.index >= this.maxIndex);
  }

  prev() {
    this.enableAnimation();
    if (this.index === 0) {
      return this.appendTranslateX(-this.index * this.windowSize.width);
    }
    this.index -= 1;
    this.appendTranslateX(-this.index * this.windowSize.width);
    this.disabledPre(this.index <= 0);
    this.disabledNext(false);
  }

  disabledPre(disabled) {
    if (this.btnPre) this.btnPre.style.opacity = disabled ? 0.5 : 1;
  }

  disabledNext(disabled) {
    if (this.btnNext) this.btnNext.style.opacity = disabled ? 0.5 : 1;
  }

  disabledAnimation() {
    this.element.style["transition-duration"] = "0s";
  }

  enableAnimation() {
    this.element.style["transition-duration"] = "0.3s";
  }

  appendTranslateX(number) {
    this.element.style.transform = `translateX(${number}px)`;
  }
}

function revisedRandId() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(2, 10);
}

window.Slide = Slides;

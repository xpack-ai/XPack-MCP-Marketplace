// Pixel class for animation
export class Pixel {
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeAvailable: number;
  maxSize: number;
  sizeDirection: number;
  delay: number;
  delayHide: number;
  counter: number;
  counterHide: number;
  counterStep: number;
  isHidden: boolean;
  isFlicking: boolean;

  constructor(
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number,
    delayHide: number,
    step: number,
    boundSize: number
  ) {
    this.x = x;
    this.y = y;

    this.color = color;
    this.speed = rand(0.1, 0.9) * speed;

    this.size = 0;
    this.sizeStep = rand(0, 0.5);
    this.minSize = 0.5;
    this.maxSizeAvailable = boundSize || 2;
    this.maxSize = rand(this.minSize, this.maxSizeAvailable);
    this.sizeDirection = 1;

    this.delay = delay;
    this.delayHide = delayHide;
    this.counter = 0;
    this.counterHide = 0;
    this.counterStep = step;

    this.isHidden = false;
    this.isFlicking = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const centerOffset = this.maxSizeAvailable * 0.5 - this.size * 0.5;

    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size
    );
  }

  show() {
    this.isHidden = false;
    this.counterHide = 0;

    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }

    if (this.size >= this.maxSize) {
      this.isFlicking = true;
    }

    if (this.isFlicking) {
      this.flicking();
    } else {
      this.size += this.sizeStep;
    }
  }

  hide() {
    this.counter = 0;

    if (this.counterHide <= this.delayHide) {
      this.counterHide += this.counterStep;
      if (this.isFlicking) {
        this.flicking();
      }
      return;
    }

    this.isFlicking = false;

    if (this.size <= 0) {
      this.size = 0;
      this.isHidden = true;
      return;
    } else {
      this.size -= 0.05;
    }
  }

  flicking() {
    if (this.size >= this.maxSize) {
      this.sizeDirection = -1;
    } else if (this.size <= this.minSize) {
      this.sizeDirection = 1;
    }

    this.size += this.sizeDirection * this.speed;
  }
}

// Utility functions
export const rand = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const getDelay = (
  x: number,
  y: number,
  width: number,
  height: number,
  direction?: boolean
) => {
  let dx = x - width * 0.5;
  let dy = y - height;

  if (direction) {
    dy = y;
  }

  return Math.sqrt(dx ** 2 + dy ** 2);
};

interface PixelAnimationOptions {
  hueRange?: [number, number]; // Min and max hue values
  gap?: number; // Gap between pixels
  speed?: [number, number]; // Min and max speed values
  colorsLen?: number; // Number of colors to generate
}

export const initPixelsAnimation = (
  canvas: HTMLCanvasElement,
  container: HTMLDivElement,
  options?: PixelAnimationOptions
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const opts = {
    hueRange: options?.hueRange || [200, 280], // Blue-ish hue range by default
    gap: options?.gap || 6,
    speed: options?.speed || [0.008, 0.25],
    colorsLen: options?.colorsLen || 5,
  };

  const interval = 1000 / 60;
  let width = 0;
  let height = 0;
  let pixels: Pixel[] = [];
  let lastTime = 0;
  let ticker = 0;
  let maxTicker = 360;
  let animationDirection = 1;
  let animationRef: number = 0;

  const initPixels = () => {
    const h = Math.floor(rand(opts.hueRange[0], opts.hueRange[1]));
    const colorsLen = opts.colorsLen;
    const colors = Array.from(
      { length: colorsLen },
      (_, index) =>
        `hsl(${Math.floor(rand(h, h + (index + 1) * 10))} 100% ${rand(50, 100)}%)`
    );

    const gap = opts.gap;
    const step = (width + height) * 0.005;
    const speed = rand(opts.speed[0], opts.speed[1]);
    const maxSize = Math.floor(gap * 0.5);

    pixels = [];

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        if (x + maxSize > width || y + maxSize > height) {
          continue;
        }

        const color = colors[Math.floor(Math.random() * colorsLen)];
        const delay = getDelay(x, y, width, height);
        const delayHide = getDelay(x, y, width, height);

        pixels.push(
          new Pixel(x, y, color, speed, delay, delayHide, step, maxSize)
        );
      }
    }
  };

  const animate = () => {
    const now = performance.now();
    const diff = now - (lastTime || 0);

    if (diff < interval) {
      animationRef = requestAnimationFrame(animate);
      return;
    }

    lastTime = now - (diff % interval);

    ctx.clearRect(0, 0, width, height);

    if (ticker >= maxTicker) {
      animationDirection = -1;
    } else if (ticker <= 0) {
      animationDirection = 1;
    }

    let allHidden = true;

    pixels.forEach((pixel) => {
      if (animationDirection > 0) {
        pixel.show();
      } else {
        pixel.hide();
        allHidden = allHidden && pixel.isHidden;
      }

      pixel.draw(ctx);
    });

    ticker += animationDirection;

    if (animationDirection < 0 && allHidden) {
      ticker = 0;
    }

    animationRef = requestAnimationFrame(animate);
  };

  const resize = () => {
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();

    width = Math.floor(rect.width);
    height = Math.floor(rect.height);

    canvas.width = width;
    canvas.height = height;

    initPixels();

    ticker = 0;
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  resize();
  animate();

  // Return cleanup function
  return () => {
    cancelAnimationFrame(animationRef);
    resizeObserver.disconnect();
  };
};

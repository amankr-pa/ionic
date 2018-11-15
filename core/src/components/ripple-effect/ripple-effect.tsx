import { Component, ComponentInterface, Element, Method, Prop, QueueApi } from '@stencil/core';

import { Config } from '../../interface';

@Component({
  tag: 'ion-ripple-effect',
  styleUrl: 'ripple-effect.scss',
  shadow: true
})
export class RippleEffect implements ComponentInterface {

  @Element() el!: HTMLElement;

  @Prop({ context: 'queue' }) queue!: QueueApi;
  @Prop({ context: 'window' }) win!: Window;
  @Prop({ context: 'config' }) config!: Config;

  /**
   * Adds the ripple effect to the parent element
   */
  @Method()
  async addRipple(pageX: number, pageY: number) {
    if (this.config.getBoolean('animated', true)) {
      return this.prepareRipple(pageX, pageY);
    }
    return () => {return;};
  }

  private prepareRipple(pageX: number, pageY: number) {
    let x: number;
    let y: number;
    let moveX: number;
    let moveY: number;
    let initialSize: number;
    let finalScale: number;

    return new Promise<() => void>(resolve => {
      this.queue.read(() => {
        const rect = this.el.getBoundingClientRect();
        const radius = getBoundedRadius(rect);
        const maxDim = Math.max(rect.height, rect.width);
        initialSize = Math.floor(maxDim * INITIAL_ORIGIN_SCALE);
        finalScale = radius / initialSize;

        const posX = pageX - rect.left;
        const posY = pageY - rect.top;
        x = posX - initialSize * 0.5;
        y = posY - initialSize * 0.5;
        moveX = (rect.width * 0.5) - posX;
        moveY = (rect.height * 0.5) - posY;
      });
      this.queue.write(() => {
        const div = this.win.document.createElement('div');
        div.classList.add('ripple-effect');
        const style = div.style;
        style.top = y + 'px';
        style.left = x + 'px';
        style.width = style.height = initialSize + 'px';
        style.setProperty('--final-scale', `${finalScale}`);
        style.setProperty('--translate-end', `${moveX}px, ${moveY}px`);

        const container = this.el.shadowRoot || this.el;
        container.appendChild(div);
        setTimeout(() => {
          resolve(() => {
            removeRipple(div);
          });
        }, 225 + 100);
      });
    });
  }
}

function removeRipple(ripple: HTMLElement) {
  ripple.classList.add('fade-out');
  setTimeout(() => {
    ripple.remove();
  }, 200);
}

// const RIPPLE_FACTOR = 35;
// const MIN_RIPPLE_DURATION = 260;
// const MAX_RIPPLE_DIAMETER = 550;

function getBoundedRadius(rect: ClientRect | DOMRect): number {
  const width = rect.width;
  const height = rect.height;
  const hypotenuse = Math.sqrt(width * width + height * height);
  return hypotenuse + PADDING;
}

const PADDING = 10;
const INITIAL_ORIGIN_SCALE = 0.5;
// const DEACTIVATION_TIMEOUT_MS = 225;
// const FG_DEACTIVATION_MS = 150;
// const TAP_DELAY_MS = 300;

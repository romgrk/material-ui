'use client';
import * as React from 'react';
import useLazyRef from '@mui/utils/useLazyRef';
import { TouchRippleActions } from '../ButtonBase/TouchRipple';

type ControlledPromise<T = unknown> = Promise<T> & {
  resolve: Function;
  reject: Function;
};

/**
 * Lazy initialization container for the Ripple instance. This improves
 * performance by delaying mounting the ripple until it's needed.
 */
export class LazyRipple {
  /** React ref to the ripple instance */
  ref: React.MutableRefObject<TouchRippleActions | null>;

  /** If the ripple component should be mounted */
  shouldMount: boolean;

  /** Promise that resolves when the ripple component is mounted */
  private mounted: ControlledPromise | null;

  /** React state hook setter */
  private setShouldMount: React.Dispatch<boolean> | null;

  static create() {
    return new LazyRipple();
  }

  constructor() {
    this.ref = { current: null };
    this.shouldMount = false;
    this.mounted = null;
    this.setShouldMount = null;
  }

  mount() {
    if (!this.mounted) {
      this.mounted = createControlledPromise();
      this.shouldMount = true;
      this.setShouldMount!(this.shouldMount);
    }
    return this.mounted;
  }

  mountEffect = () => {
    if (this.shouldMount) {
      Promise.resolve().then(() => {
        if (this.ref.current !== null) {
          this.mounted!.resolve();
        }
      });
    }
  };

  render() {
    /* eslint-disable */
    const [shouldMount, setShouldMount] = React.useState(false);

    this.shouldMount = shouldMount;
    this.setShouldMount = setShouldMount;

    React.useEffect(this.mountEffect, [shouldMount]);
    /* eslint-enable */
  }

  /* Ripple API */

  start(...args: Parameters<TouchRippleActions['start']>) {
    this.mount().then(() => this.ref.current!.start(...args));
  }

  stop(...args: Parameters<TouchRippleActions['stop']>) {
    this.mount().then(() => this.ref.current!.stop(...args));
  }

  pulsate(...args: Parameters<TouchRippleActions['pulsate']>) {
    this.mount().then(() => this.ref.current!.pulsate(...args));
  }
}

export default function useLazyRipple() {
  const ripple = useLazyRef(LazyRipple.create).current;
  ripple.render();
  return ripple;
}

function createControlledPromise(): ControlledPromise {
  let resolve: Function;
  let reject: Function;

  const p = new Promise((resolveFn, rejectFn) => {
    resolve = resolveFn;
    reject = rejectFn;
  }) as ControlledPromise;
  p.resolve = resolve!;
  p.reject = reject!;

  return p;
}

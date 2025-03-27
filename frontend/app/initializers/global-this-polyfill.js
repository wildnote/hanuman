export default {
  name: 'global-this-polyfill',
  initialize() {
    if (typeof globalThis === 'undefined') {
      Object.defineProperty(window, 'globalThis', {
        enumerable: true,
        configurable: true,
        value: window
      });
    }
  }
}; 
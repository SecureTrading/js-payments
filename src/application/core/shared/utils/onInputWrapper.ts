/**
 * This wrapper disables the "input" event being fired when placeholder changes on IE
 * @link https://stackoverflow.com/a/57607005
 */
export function onInputWraper(cb: (event: InputEvent) => void) {
  if (!window.navigator.userAgent.match(/MSIE|Trident/)) return cb;

  return (e: InputEvent) => {
    const t = e.target as (HTMLInputElement | HTMLTextAreaElement) & { composition_started: boolean };
    const active = t === document.activeElement;
    if (!active || (t.placeholder && t.composition_started !== true)) {
      t.composition_started = active;
      if ((!active && t.tagName === 'TEXTAREA') || t.tagName === 'INPUT') {
        e.stopPropagation();
        e.preventDefault();

        return false;
      }
    }
    cb(e);
  };
}

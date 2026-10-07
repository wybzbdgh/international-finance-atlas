import { html, svg, nothing, render } from "lit-html";
import { AsyncDirective, directive } from "lit-html/async-directive.js";
import { ref } from "lit-html/directives/ref.js";
import { styleMap } from "lit-html/directives/style-map.js";
import { ifDefined } from "lit-html/directives/if-defined.js";
import { live } from "lit-html/directives/live.js";
import { keyed as litKeyed } from "lit-html/directives/keyed.js";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";

export { html, svg, nothing, render, ifDefined, live, unsafeHTML };
// A new key disposes the child view as well as its DOM and observers.
export const keyed = (key, value) => litKeyed(key, html`${value}`);

// Interactive figures keep their own small state. lit-html updates existing
// elements, so moving a slider preserves its focus, selection and pointer drag.
let current;
let nextId = 0;
const same = (a, b) =>
  a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
export const content = (value) =>
  value == null || typeof value === "boolean"
    ? nothing
    : Array.isArray(value)
      ? value.map(content)
      : value;

export function view(draw) {
  class View extends AsyncDirective {
    constructor(info) {
      super(info);
      this.values = [];
      this.cursor = 0;
      this.effects = [];
      this.pending = false;
      this.active = true;
    }
    render(props = {}) {
      this.props = props;
      const previous = current;
      current = this;
      this.cursor = 0;
      let result;
      try {
        result = content(draw(props));
      } finally {
        current = previous;
      }
      if (!this.effectTask) {
        this.effectTask = true;
        queueMicrotask(() => {
          this.effectTask = false;
          if (!this.active) return;
          const effects = this.effects.splice(0);
          for (const run of effects) run();
        });
      }
      return result;
    }
    refresh() {
      if (this.pending || !this.active) return;
      this.pending = true;
      queueMicrotask(() => {
        this.pending = false;
        if (this.active && this.isConnected)
          this.setValue(this.render(this.props));
      });
    }
    disconnected() {
      this.active = false;
      this.effects.length = 0;
      for (const item of this.values)
        if (item?.effect) {
          item.cleanup?.();
          item.cleanup = undefined;
          item.dependencies = undefined;
          item.queued = false;
        }
    }
    reconnected() {
      this.active = true;
      this.refresh();
    }
  }
  return directive(View);
}

function slot(make) {
  if (!current)
    throw new Error("A view state must belong to an interactive view.");
  const owner = current,
    index = owner.cursor++;
  if (!(index in owner.values)) owner.values[index] = make(owner);
  return owner.values[index];
}
export function viewState(initial) {
  const item = slot((owner) => {
    const result = {
      value: typeof initial === "function" ? initial() : initial,
    };
    result.set = (value) => {
      const next = typeof value === "function" ? value(result.value) : value;
      if (!Object.is(next, result.value)) {
        result.value = next;
        owner.refresh();
      }
    };
    return result;
  });
  return [item.value, item.set];
}
export function keepRef(value) {
  return slot(() => ({ current: value }));
}
export function uniqueId() {
  return slot(() => "figure-" + ++nextId);
}
export function compute(calculate, dependencies) {
  const item = slot(() => ({}));
  if (!same(item.dependencies, dependencies)) {
    item.value = calculate();
    item.dependencies = dependencies;
  }
  return item.value;
}
export function afterRender(run, dependencies) {
  const owner = current,
    item = slot(() => ({ effect: true }));
  if (same(item.dependencies, dependencies)) return;
  item.dependencies = dependencies;
  item.run = run;
  if (!item.queued) {
    item.queued = true;
    owner.effects.push(() => {
      item.queued = false;
      item.cleanup?.();
      item.cleanup = item.run();
    });
  }
}
export function elementRef(target) {
  if (!target.bind)
    target.bind = (element) => {
      target.current = element || null;
    };
  return ref(target.bind);
}
export function selectValue(value) {
  return ref((element) => {
    if (element)
      queueMicrotask(() => {
        element.value = value ?? "";
      });
  });
}
const unitless = new Set([
  "opacity",
  "zIndex",
  "fontWeight",
  "lineHeight",
  "flex",
  "flexGrow",
  "flexShrink",
  "order",
  "gridColumn",
  "gridRow",
  "strokeWidth",
]);
export function styles(values) {
  return styleMap(
    Object.fromEntries(
      Object.entries(values || {}).map(([key, value]) => [
        key,
        typeof value === "number" && !key.startsWith("--") && !unitless.has(key)
          ? value + "px"
          : value,
      ]),
    ),
  );
}

// Mounts produce no layout wrapper, which keeps the original CSS geometry.
export function mountAt(marker, template) {
  const parent = marker.parentNode;
  const part = render(template, parent, { renderBefore: marker });
  return () => {
    part.setConnected(false);
    render(nothing, parent, { renderBefore: marker });
  };
}

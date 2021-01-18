"use strict";

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (!target[key]) {
      target[key] = source[key];
    } else if (
      typeof target[key] === "object" &&
      typeof source[key] === "object"
    ) {
      deepMerge(target[key], source[key]);
    }
  }
  return target;
}

module.exports = deepMerge;

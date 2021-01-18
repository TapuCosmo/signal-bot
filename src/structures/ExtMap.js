"use strict";

/**
 * An extension of the native Map class with convenience features.
 */
class ExtMap extends Map {
  /**
   * Finds the first value where the callback returns a truthy value.
   * Arguments equivalent to Array.find.
   */
  find(...args) {
    return this.array().find(...args);
  }

  /**
   * Finds all values where the callback returns a truthy value.
   * Arguments equivalent to Array.filter.
   */
  filter(...args) {
    return this.array().filter(...args);
  }

  /**
   * Returns an Array of all values.
   */
  array() {
    return [...this.values()];
  }
}

module.exports = ExtMap;

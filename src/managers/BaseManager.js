"use strict";

const ExtMap = require("../structures/ExtMap.js");

/**
 * BaseManager class.
 * @param {Client} - client
 * @hideconstructor
 */
class BaseManager {
  constructor(client) {
    this._client = client;
    this._cache = new ExtMap();
  }

  /**
   * The client belonging to the manager.
   * @type {Client}
   * @readonly
   */
  get client() {
    return this._client;
  }

  /**
   * The cache belonging to the manager.
   * @type {ExtMap}
   * @readonly
   */
  get cache() {
    return this._cache;
  }
}

module.exports = BaseManager;

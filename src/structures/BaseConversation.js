"use strict";

/**
 * BaseConversation structure.
 */
class BaseConversation {
  /**
   * Constructs an instance of BaseConversation. For internal use only.
   * @param {Object} data
   * @param {Object} data.client
   * @param {string} data.id
   * @hideconstructor
   */
  constructor(data = {}) {
    this._client = data.client;
    this._id = data.id;
  }

  /**
   * The Client that this instance belongs to.
   * @type {Client}
   * @readonly
   */
  get client() {
    return this._client;
  }

  /**
   * The ID of the conversation.
   * @type {string}
   * @readonly
   */
  get id() {
    return this._id;
  }
}

module.exports = BaseConversation;

"use strict";

const BaseConversation = require("./BaseConversation.js");

/**
 * UserConversation structure.
 * @extends BaseConversation
 * @hideconstructor
 */
class UserConversation extends BaseConversation {
  /**
   * The type of the conversation.
   * Returns `user`.
   * @type {string}
   * @readonly
   */
  // eslint-disable-next-line class-methods-use-this
  get type() {
    return "user";
  }

  /**
   * Send a message to the conversation.
   * @param {string} content - The text content to send.
   * @param {Array<string>} [attachments] - An array of file paths of attachments to send.
   * @return {Promise<number>} timestamp - The timestamp of the sent message.
   */
  async sendMessage(content, attachments = []) {
    const conversation = [this.id];
    const timestamp = await this.client._busInterface.sendMessage(content, attachments, conversation);
    return Number(timestamp);
  }

  /**
   * Reset the session keys for the conversation.
   * This method should rarely need to be used.
   * @return {Promise<undefined>}
   */
  async resetSession() {
    const conversation = [this.id];
    await this.client._busInterface.sendEndSessionMessage(conversation);
  }
}

module.exports = UserConversation;

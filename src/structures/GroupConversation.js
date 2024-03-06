"use strict";

const BaseConversation = require("./BaseConversation.js");

/**
 * GroupConversation structure.
 * @extends BaseConversation
 * @hideconstructor
 */
class GroupConversation extends BaseConversation {
  /**
   * The type of the conversation.
   * Returns `group`.
   * @type {string}
   * @readonly
   */
  // eslint-disable-next-line class-methods-use-this
  get type() {
    return "group";
  }

  /**
   * The conversation ID in buffer form.
   * @type {string}
   * @readonly
   * @private
   */
  get _idBuffer() {
    return Buffer.from(this.id, "base64");
  }

  /**
   * Accept an invitation to the group conversation.
   *
   * Note that this will fail if you have not created a user profile yet.
   * You will need to stop the signal-cli service and run the following command:
   * `sudo signal-cli -u <phone number> --config /var/lib/signal-cli updateProfile --name "<name>" --remove-avatar`.
   * See the [signal-cli docs](https://github.com/AsamK/signal-cli/blob/master/man/signal-cli.1.adoc#updateprofile) for more information.
   * @return {Promise<undefined>}
   */
  async acceptInvitation() {
    await this.client._busInterface.updateGroup(this._idBuffer, "", [], "");
  }

  /**
   * Send a message to the conversation.
   * @param {string} content - The text content to send.
   * @param {Array<string>} [attachments] - An array of file paths of attachments to send.
   * @return {Promise<number>} timestamp - The timestamp of the sent message.
   */
  async sendMessage(content, attachments = []) {
    const conversation = this._idBuffer;
    const timestamp = await this.client._busInterface.sendGroupMessage(content, attachments, conversation);
    return Number(timestamp);
  }
}

module.exports = GroupConversation;

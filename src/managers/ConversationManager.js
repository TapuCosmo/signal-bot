"use strict";

const BaseManager = require("./BaseManager.js");
const GroupConversation = require("../structures/GroupConversation.js");
const UserConversation = require("../structures/UserConversation.js");

/**
 * ConversationManager class.
 * @extends BaseManager
 */
class ConversationManager extends BaseManager {
  /**
   * The cache belonging to this ConversationManager.
   * Keys are conversation IDs.
   * @type {ExtMap<string, (UserConversation|GroupConversation)>}
   * @name ConversationManager#cache
   */

  /**
   * Adds a conversation to the cache.
   * @param {(UserConversation|GroupConversation)} conversation
   * @private
   */
  _addToCache(conversation) {
    this.cache.set(conversation.id, conversation);
  }

  /**
   * Converts a conversation ID to a Conversation.
   * No checks are done to see if the ID is actually valid or available.
   * @param {string} id - The conversation ID.
   * @return {(UserConversation|GroupConversation)}
   */
  from(id) {
    if (ConversationManager._idToConversationType(id) === "group") {
      return new GroupConversation({
        client: this.client,
        id: id
      });
    }
    return new UserConversation({
      client: this.client,
      id: id
    });
  }

  /**
   * Fetches a conversation.
   * Currently cannot fetch uncached UserConversation.
   * @param {string} id - The conversation ID.
   * @retrun {Promise<(UserConversation|GroupConversation|null)>}
   */
  async fetchConversation(id) {
    const cached = this.cache.get(id);
    if (cached) return cached;
    if (ConversationManager._idToConversationType(id) === "user") return null;
    await this.fetchGroupConversations();
    return this.cache.get(id) || null;
  }

  /**
   * Fetches group conversations.
   * Unfortunately signal-cli currently does not have a similar method
   * for user conversations.
   * @return {Promise<ExtMap<string, GroupConversation>>}
   */
  async fetchGroupConversations() {
    const groupIDs = await this.client._busInterface.getGroupIds();
    groupIDs.forEach(gid => {
      // Convert from Buffer to base64
      const base64ID = gid.toString("base64");
      this.cache.set(
        base64ID,
        new GroupConversation({
          client: this.client,
          id: base64ID
        })
      );
    });
    return this.cache;
  }

  static _idToConversationType(id) {
    // Encoded group IDs should be over 40 characters.
    // Hopefully usernames will have a max limit of no more than 32.
    return id.length > 32 ? "group" : "user";
  }
}

module.exports = ConversationManager;

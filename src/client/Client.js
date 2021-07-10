"use strict";

const EventEmitter = require("events");

const dbus = require("dbus-next");

const {defaultClientSettings} = require("../constants");
const {debugLog, deepMerge} = require("../util");
const ClientUser = require("./ClientUser.js");
const ConversationManager = require("../managers/ConversationManager.js");
const Message = require("../structures/Message.js");

/**
 * Signal bot client class.
 * @extends EventEmitter
 */
class Client extends EventEmitter {
  /**
   * Construct a Client.
   * @param {Object} [settings] - The settings for the Client.
   * @param {Object} [settings.dbus] - D-Bus settings.
   * @param {number} [settings.dbus.connectionCheckInterval=5000] - How frequently the connection should be checked, in milliseconds.
   * @param {string} [settings.dbus.destination=org.asamk.Signal] - D-Bus destination for signal-cli daemon.
   * @param {string} [settings.dbus.type=system] - D-Bus type. Can be `system` or `session`.
   */
  constructor(settings = {}) {
    super();
    this.settings = deepMerge(settings, defaultClientSettings);
    if (typeof this.settings.dbus?.connectionCheckInterval !== "number") {
      throw new TypeError(`Bad Client settings.dbus.connectionCheckInterval: ${this.settings.dbus?.connectionCheckInterval}`);
    }
    if (typeof this.settings.dbus?.destination !== "string") {
      throw new TypeError(`Bad Client settings.dbus.destination: ${this.settings.dbus?.destination}`);
    }
    if (!["system", "session"].includes(this.settings.dbus?.type)) {
      throw new TypeError(`Bad Client settings.dbus.destination: ${this.settings.dbus?.destination}`);
    }
    if(this.settings.phoneNumber == null){
      throw new TypeError(`Bad client-phone-number: ${this.settings.phoneNumber}, required for signal-cli 0.8.4+`);
    }
    if(typeof this.settings.phoneNumber !== "number"){
      throw new TypeError(`Bad client-phone-number: needs to be only the number (without + at the beginning)`);
    }
    this._user = new ClientUser({
      client: this
    });
    this._conversations = new ConversationManager(this);
  }

  /**
   * The ClientUser belonging to this Client.
   * @type {ClientUser}
   * @readonly
   */
   get user() {
     return this._user;
   }

  /**
   * The ConversationManager belonging to this Client.
   * @type {ConversationManager}
   * @readonly
   */
  get conversations() {
    return this._conversations;
  }

  /**
   * Connect to the signal-cli daemon over D-Bus.
   * @return {Promise<undefined>}
   */
  async connect() {
    if (this.settings.dbus.type === "session") {
      this._bus = dbus.sessionBus();
    } else {
      this._bus = dbus.systemBus();
    }
    const interfaces = await this._bus.getProxyObject(
      this.settings.dbus.destination,
      `/org/asamk/Signal_${this.settings.phoneNumber}`
    );
    this._busInterface = interfaces.getInterface("org.asamk.Signal");

    /**
     * Disconnect event.
     * Fires when the D-Bus connection is disconnected.
     * The `connect` method must be called again afterwards in order to reconnect.
     * @event Client#disconnect
     */
    // Hacky way of testing connection since dbus-next does not emit an event on disconnect.
    this._connectionCheckInterval = setInterval(async () => {
      try {
        await this.user.getRegistrationStatus();
      } catch (e) {
        if (this.settings.debug) {
          debugLog("Disconnect");
        }
        clearInterval(this._connectionCheckInterval);
        this._bus.disconnect();
        this._busInterface.removeAllListeners();
        this.emit("disconnect");
      }
    }, this.settings.dbus.connectionCheckInterval);

    /**
     * Error event.
     * Fires when an error occurs.
     * @event Client#error
     * @type {Error}
     */
    this._busInterface.on("error", e => {
      if (this.settings.debug) {
        debugLog(`Error: ${e}`);
      }
      this.emit("error", e);
    });

    /**
     * Message event.
     * Fires when a message is received.
     * @event Client#message
     * @type {Message}
     */
    this._busInterface.on("MessageReceived", (timestamp, authorID, groupID, content, attachments) => {
      if (this.settings.debug) {
        debugLog(`MessageReceived: ${timestamp}, ${authorID}, ${groupID?.toString?.("base64")}, ${content}, ${JSON.stringify(attachments)}`);
      }
      const conversationID = groupID.length ? groupID.toString("base64") : authorID;
      let conversation = this.conversations.cache.get(conversationID);
      if (!conversation) {
        conversation = this.conversations.from(conversationID);
        this.conversations._addToCache(conversation);
      }
      const message = new Message({
        client: this,
        // D-Bus lib returns BigInt, which is unnecessary and not compatible with Date()
        timestamp: Number(timestamp),
        authorID,
        conversation,
        attachments,
        content
      });

      this.emit("message", message);
    });

    // Hacky workaround for dbus-next not handling multiple input signatures well.
    this._busInterface.$methods
      .filter(method => method.name === "sendMessage")
      .forEach(method => (method.inSignature = "sasas"));
  }
}

module.exports = Client;

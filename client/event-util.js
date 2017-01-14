'use strict';

/**
 * \brief
 *   Allow automatically unsubscribing a bunch of events.
 *
 * Oftentimes one might want to not have to keep track of actual
 * handlers but still be able to unsubscribe a bunch at one
 * point. Instead of having to call removeListener a bunch of times,
 * it is easier to just get a context that does that for you.
 *
 * This wraps an EventEmitter. Merely create an instance and subscribe
 * through it and then when done call destroy().
 */
const EventSubscriptionContext = module.exports.EventSubscriptionContext = function (eventEmitter) {
  this._eventEmitter = eventEmitter;
  this._subscriptions = Object.create(null);
};

EventSubscriptionContext.prototype.destroy = function () {
  for (const eventName in this._subscriptions) {
    for (const handler of this._subscriptions[eventName]) {
      this._eventEmitter.removeListener(eventName, handler);
    }
  }
  this._subscriptions = Object.create(null);
};

EventSubscriptionContext.prototype.on = function (eventName, handler) {
  (this._subscriptions[eventName] = this._subscriptions[eventName] || []).push(handler);
  this._eventEmitter.on(eventName, handler);
  return this;
};

EventSubscriptionContext.prototype.removeListener = function (eventName, handler) {
  const handlers = (this._subscriptions[eventName] || []);
  const handlerIndex = handlers.indexOf(handler);
  const actualHandler = handlers[handlerIndex];
  this._eventEmitter.removeListener(eventName, actualHandler);
  if (handlerIndex != -1) {
    handlers.splice(handlerIndex, 1);
  }
  return this;
};

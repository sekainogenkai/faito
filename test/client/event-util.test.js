'use strict';

const assert = require('assert');
const EventEmitter = require('events');
const EventSubscriptionContext = require('../../client/event-util.js').EventSubscriptionContext;

describe('event-util', function () {
  it('should let you subscribe to events', function () {
    const emitter = new EventEmitter();
    const context = new EventSubscriptionContext(emitter);
    let count = 0;
    context.on('event', () => count++);
    emitter.emit('event');
    emitter.emit('event');
    assert.equal(2, count);
  });

  it('should let you unsubscribe using removeListener()', function () {
    const emitter = new EventEmitter();
    const context = new EventSubscriptionContext(emitter);
    let count = 0;
    let handler = () => count++;
    context.on('event', handler);
    emitter.emit('event');
    context.removeListener('event', handler);
    emitter.emit('event');
    assert.equal(1, count);
  });

  it('should unsubscribe on destroy', function () {
    const emitter = new EventEmitter();
    const context = new EventSubscriptionContext(emitter);
    let count = 0;
    context.on('event', () => count++);
    emitter.emit('event');
    context.destroy();
    emitter.emit('event');
    assert.equal(1, count);
  });
});

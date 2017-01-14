import EventEmitter from 'events';
import {EventSubscriptionContext} from './event-util';

/**
 * A local player.
 *
 * Events:
 *
 * 'end': The player no longer exists and should be removed from the
 * game. You should listen for this.
 */
export class LocalPlayer extends EventEmitter {
  constructor(name, input) {
    super();
    this.name = name;
    this.input = input;
    this._inputEventContext = new EventSubscriptionContext(input)
      .on('end', () => this.emit('end'))
    ;
    this._hero = null;
  }

  destroy() {
    this._inputEventContext.destroy();
  }
}

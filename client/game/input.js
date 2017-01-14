import {requireAll} from '../require-util';
import EventEmitter from 'events';

export const Buttons = {
  Menu: 'm',
  A: 'a',
  B: 'b',
  X: 'x',
  Y: 'y',
};

export class Manager extends EventEmitter {
  constructor(game) {
    super();
    // Load inputs.
    requireAll(require.context('./inputs', false, /^\.\/.*\.js$/)).forEach(input => {
      new input(game);
    });
  }
}

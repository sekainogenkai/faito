import {requireAll} from '../require-util';
import EventEmitter from 'events';

export const Buttons = {
  Menu: 'm',
  A: 'a',
  B: 'b',
  X: 'x',
  Y: 'y',
  RB: 'rb',
    LB: 'lb',
    // These are virtual buttons that the joystick will automatically
    // press and release as if simulating a D-pad.
    JoyDown: 'joyDown',
    JoyUp: 'joyUp',
    JoyLeft: 'joyLeft',
    JoyRight: 'joyRight',
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

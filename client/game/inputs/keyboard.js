import BABYLON from 'babylonjs';
import EventEmitter from 'events';
import {Buttons} from '../input.js';

const keyButtonMap = {
  'Escape': Buttons.Menu,
  'u': Buttons.A,
  'i': Buttons.B,
  'o': Buttons.X,
  'p': Buttons.Y,
  'Shift': Buttons.RB,
};

const keyJoyMap = {
  'a': new BABYLON.Vector2(-1, 0), // left
  'd': new BABYLON.Vector2(1, 0), // right
  'w': new BABYLON.Vector2(0, 1), // up
  's': new BABYLON.Vector2(0, -1), // down
};
const joyKeys = Object.keys(keyJoyMap);

const maxMutualJoy = Math.sqrt(Math.pow(1, 2)/2);

export default class KeyboardInput extends EventEmitter {
  constructor(game) {
    super();

    const keyState = Object.keys(keyButtonMap).concat(joyKeys).reduce((acc, name) => {
      acc[name] = false;
      return acc;
    }, Object.create(null));

    const joyVector = new BABYLON.Vector2(0, 0);

    const updateJoy = () => {
      joyVector.x = 0;
      joyVector.y = 0;
      for (const joyKey of joyKeys) {
        if (keyState[joyKey]) {
          joyVector.addInPlace(keyJoyMap[joyKey]);
        }
      }
      // Enforce joystick being circular.
      if (joyVector.x && joyVector.y) {
        joyVector.x *= maxMutualJoy;
        joyVector.y *= maxMutualJoy;
      }
      this.emit('joychanged', joyVector);
    };

    window.addEventListener('keydown', e => {
      const key = e.key;
      const alreadyPressed = keyState[key];
      // Either we have already handled it or it is a key we don’t
      // care about.
      if (alreadyPressed || alreadyPressed === undefined) {
        return;
      }

      // Mark as pressed.
      keyState[key] = true;

      // Is it a joy key?
      if (keyJoyMap[key]) {
        updateJoy();
        return;
      }

      // Is it a button?
      var button = keyButtonMap[key];
      if (button) {
        this.emit('buttondown', button);
        return;
      }
    });

    window.addEventListener('keyup', e => {
      const key = e.key;

      // Do we care about this key?
      if (keyState[key] === undefined) {
        return;
      }

      keyState[key] = false;

      // Is it a joy key?
      if (keyJoyMap[key]) {
        updateJoy();
        return;
      }

      // Is it a button?
      var button = keyButtonMap[key];
      if (button) {
        this.emit('buttonup', button);
        return;
      }
    });

    game.addInput(this);
  }

  get name() {
    return 'keyboard';
  }
}

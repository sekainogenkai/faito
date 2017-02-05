import BABYLON from 'babylonjs';
import EventEmitter from 'events';
import {Buttons} from '../input.js';

const keyButtonMap = {
  Escape: Buttons.Menu,
  KeyU: Buttons.A,
  KeyI: Buttons.B,
  KeyO: Buttons.X,
  KeyP: Buttons.Y,
  ShiftLeft: Buttons.LB,
  Space: Buttons.RB,
};

const keyJoyMap = {
    KeyA: {
        direction: new BABYLON.Vector2(-1, 0), // left
        button: Buttons.JoyLeft,
    },
    KeyD: {
        direction: new BABYLON.Vector2(1, 0), // right
        button: Buttons.JoyRight,
    },
    KeyW: {
        direction: new BABYLON.Vector2(0, 1), // up
        button: Buttons.JoyUp,
    },
    KeyS: {
        direction: new BABYLON.Vector2(0, -1), // down
        button: Buttons.JoyDown,
    },
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
          joyVector.addInPlace(keyJoyMap[joyKey].direction);
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
      // Code represents the actual key itself rather than the
      // character that would be printed as a result of pressing the
      // key. For example, if you’re holding shift, key would give
      // uppercase characters for alphabetic keys.
      const code = e.code;
      const alreadyPressed = keyState[code];
      // Either we have already handled it or it is a key we don’t
      // care about.
      if (alreadyPressed || alreadyPressed === undefined) {
        return;
      }

      // Mark as pressed.
      keyState[code] = true;

        // Is it a joy key?
        const joy = keyJoyMap[code];
        if (joy) {
            updateJoy();
            this.emit('buttondown', joy.button);
            return;
        }

      // Is it a button?
      var button = keyButtonMap[code];
      if (button) {
        this.emit('buttondown', button);
        return;
      }
    });

    window.addEventListener('keyup', e => {
      const code = e.code;

      // Do we care about this key?
      if (keyState[code] === undefined) {
        return;
      }

      keyState[code] = false;

        // Is it a joy key?
        const joy = keyJoyMap[code];
        if (joy) {
            updateJoy();
            this.emit('buttonup', joy.button);
            return;
        }

      // Is it a button?
      var button = keyButtonMap[code];
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

import BABYLON from 'babylonjs';
import EventEmitter from 'events';
import {Buttons} from '../input.js';

// TODO: Make this configurable. Perhaps have a “learn mode” API:
// beginButtonLearn(), exportLearnedState(), loadLearnedState() so
// that mappings can be set in the menu and saved to persisted storage
// somehow. Biggest problem is matching saved state to a particular
// controller when there are multiple controllers plugged in because
// controller names/ids might not be unique/reliable.
const buttonMap = [
  Buttons.A,
  Buttons.B,
  Buttons.X,
  Buttons.Y,
  Buttons.Menu, // Start on XBox controller
  undefined,
  Buttons.LB,
  Buttons.RB,
];

class GamepadInput extends EventEmitter {
  constructor(gamepad) {
    super();
  }

  setGamepad(gamepad) {
    if (this.gamepad) {
      // Clear existing.
      this.gamepad.onbuttondown(null);
      this.gamepad.onbuttonup(null);
      this.gamepad.onleftstickchanged(null);
      this.gamepad.onrightstickchanged(null);
        this.gamepad.onleftstickchanged(null);
        if (this.gamepad.onlefttriggerchanged) {
            this.gamepad.onlefttriggerchanged(null);
        }
        if (this.gamepad.onrighttriggerchanged) {
            this.gamepad.onrighttriggerchanged(null);
        }
    }
    this.gamepad = gamepad;
    this.name = `${gamepad.id} ${gamepad.index}`;
    const buildButtonHandler = eventName => {
      return buttonIndex => {
        const button = buttonMap[buttonIndex];
        if (button) {
          this.emit(eventName, button);
        } else {
          console.warn(`Ignoring button ${buttonIndex}`);
        }
      };
    };
    gamepad.onbuttondown(buildButtonHandler('buttondown'));
    gamepad.onbuttonup(buildButtonHandler('buttonup'));
    let xIsZeroed = false;
      let yIsZeroed = false;
      const virtualButtonStates = [
          {
              button: Buttons.JoyLeft,
              getFactor: joy => -joy.x,
          },
          {
              button: Buttons.JoyRight,
              getFactor: joy => joy.x,
          },
          {
              button: Buttons.JoyUp,
              getFactor: joy => -joy.y,
          },
          {
              button: Buttons.JoyDown,
              getFactor: joy => joy.y,
          },
      ];
      virtualButtonStates.forEach(s => s.down = false);
    const joyVector = new BABYLON.Vector2(0, 0);
    gamepad.onleftstickchanged(values => {
      // Treat stuff close to 0 as 0 so that when the player intends
      // their character to be at rest the character is actually at
      // rest.
    const zeroSensitivity = 0.15;
    if (/* per-axis, kpgbrink dislikes */false) {
      const willXBeZeroed = values.x > -zeroSensitivity && values.x < zeroSensitivity;
      const willYBeZeroed = values.y > -zeroSensitivity && values.y < zeroSensitivity;
      if (!willXBeZeroed || !willYBeZeroed || willXBeZeroed != xIsZeroed || willYBeZeroed != yIsZeroed) {
        xIsZeroed = willXBeZeroed;
        yIsZeroed = willYBeZeroed;
        joyVector.x = willXBeZeroed ? 0 : values.x;
        joyVector.y = willYBeZeroed ? 0 : -values.y; // For some reason stick uses inverted y (airplane?)
        this.emit('joychanged', joyVector);
      }
    } else {
      const willBeZeroed = values.x > -zeroSensitivity && values.x < zeroSensitivity
        && values.y > -zeroSensitivity && values.y < zeroSensitivity;
      if (!willBeZeroed || willBeZeroed != xIsZeroed) {
        xIsZeroed = willBeZeroed;
        joyVector.x = willBeZeroed ? 0 : values.x;
        joyVector.y = willBeZeroed ? 0 :-values.y;
        this.emit('joychanged', joyVector);
      }
    }

        // Virtual D-pad like control but from the joystick.

        // The distance from 0 that must be passed to press the
        // virtual button.
        const virtualDirectionalDownThreshold = 0.75;
        // The closness to 0 that must be passed to release the
        // virtual button.
        const virtualDirectionalUpThreshold = 0.5;
        for (const virtualButtonState of virtualButtonStates) {
            const factor = virtualButtonState.getFactor(values);
            if (virtualButtonState.pressed) {
                if (factor < virtualDirectionalUpThreshold) {
                    virtualButtonState.pressed = false;
                    this.emit('buttonup', virtualButtonState.button);
                }
            } else {
                if (factor > virtualDirectionalDownThreshold) {
                    virtualButtonState.pressed = true;
                    this.emit('buttondown', virtualButtonState.button);
                }
            }
        }
    });
      const buildTriggerChangedHandler = button => {
          const zeroSensitivity = 0.15;
          let down = false;
          return value => {
              if (value < zeroSensitivity) {
                  if (down) {
                      this.emit('buttonup', button);
                      down = false;
                  }
              } else {
                  if (!down) {
                      this.emit('buttondown', button);
                      down = true;
                  }
              }
          };
      };
      if (this.gamepad.onlefttriggerchanged) {
          this.gamepad.onlefttriggerchanged(buildTriggerChangedHandler(Buttons.LB));
      }
      if (this.gamepad.onrighttriggerchanged) {
          this.gamepad.onrighttriggerchanged(buildTriggerChangedHandler(Buttons.RB));
      }
  }
};

export default class GamepadInputManager {
  constructor(game) {
    // Keep track of known identifiers because apparently they can
    // reconnect without warning.
    const knownGamepads = [];

    new BABYLON.Gamepads(gamepad => {
      const existing = knownGamepads[gamepad.index];
      if (existing) {
        existing.setGamepad(gamepad);
      } else {
        const added = knownGamepads[gamepad.index] = new GamepadInput();
        added.setGamepad(gamepad);
        game.addInput(added);
      }
    });
  }
};

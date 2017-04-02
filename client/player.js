import {Buttons} from './game/input';
import MiniSignal from 'mini-signals';
import EventEmitter from 'events';
import {EventSubscriptionContext} from './event-util';

/**
 * Hooks into {@link Game} to handle added inputs and manage the
 * players.
 */
export class PlayerManager {
    constructor(game) {
        this._currentInputTargetFinder = null;
        this.players = [];
        this.changedSignal = new MiniSignal();
        this.menuSignal = new MiniSignal();
        game.inputAddedSignal.add(input => this.addInput(input));
    }

    addInput(input) {
        const i = this.players.concat(undefined).indexOf(undefined);
        const player = this.players[i] = new LocalPlayer(`player ${i}`, input);
        console.log(`Added player ${player.name} (${input.name})`);
        player.endSignal.add(() => {
            this.players[i] = undefined;
            player.destroy();
            this.changedSignal.dispatch();
        });
        player.menuSignal.add(() => {
            this.menuSignal.dispatch();
        });
        this.changedSignal.dispatch();
        player.setInputTarget(this._inputTargetFinder(i, player));
    }

    /**
     * The current target finder can, given a player index, tell it
     * the object that its target should be set to. This is used to
     * switch between menu and gameplay. The finder takes a player
     * index and returns the value that should be used as the
     * target. Setting this resets the targets of everything
     * automatically.
     *
     * @param {PlayerManager~inputTargetFinder} inputTargetFinder
     */
    setInputTargetFinder(inputTargetFinder) {
        console.log('setInputTargetFinder');
        this._inputTargetFinder = inputTargetFinder;
        this.players.forEach((player, i) => {
            if (player) {
                player.setInputTarget(inputTargetFinder(i, player));
            }
        });
    }

    /**
     * @callback PlayerManager~inputTargetFinder
     * @param {number} i Index of the player
     * @param {LocalPlayer} player The player.
     */
}

export class DummyInputTarget {
    constructor() {
    }

    joyChanged() {
    }

    buttonDown() {
    }

    buttonUp() {
    }
}
const dummyInputTarget = new DummyInputTarget();

/**
 * An input target which points to another, replacable target.
 */
export class ProxyInputTarget {
  constructor(initialTarget) {
    this.setTarget(initialTarget);
  }

  setTarget(target) {
    this._target = target;
  }

  joyChanged(joy) {
    this._target.joyChanged(joy);
  }

  buttonDown(button) {
    this._target.buttonDown(button);
  }

  buttonUp(button) {
    this._target.buttonUp(button);
  }
}

/**
 * A local player.
 */
export class LocalPlayer {
    constructor(name, input) {
        this._inputTarget = dummyInputTarget;
        this.endSignal = new MiniSignal();
        this.menuSignal = new MiniSignal();
        this.name = name;
        this.input = input;
        this._inputEventContext = new EventSubscriptionContext(input)
            .on('end', () => this.endSignal.dispatch())
            .on('joychanged', joy => this._inputTarget.joyChanged(joy))
            .on('buttondown', button => {
                if (button === Buttons.Menu) {
                    this.menuSignal.dispatch();
                } else {
                    this._inputTarget.buttonDown(button);
                }
            })
            .on('buttonup', button => {
                if (button !== Buttons.Menu) {
                    this._inputTarget.buttonUp(button);
                }
            })
        ;
        this.isLocal = true;
    }

    destroy() {
        this._inputEventContext.destroy();
    }

    setInputTarget(inputTarget) {
        this._inputTarget = inputTarget;
    }
}

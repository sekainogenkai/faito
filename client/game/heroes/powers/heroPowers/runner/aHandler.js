import BABYLON from 'babylonjs';

import BasePowerHandler from '../../basePowerHandler';

import BallThrow from './ballThrow';
import RunRiser from './runRiser'

export default class PowerHandler extends BasePowerHandler {
  constructor(game, hero) {
    super(game, hero, BallThrow, RunRiser, BallThrow, BallThrow);
  }
}

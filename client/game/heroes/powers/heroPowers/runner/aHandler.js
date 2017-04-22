import BABYLON from 'babylonjs';

import BasePowerHandler from '../../basePowerHandler';

import BallThrow from './ballThrow';
import PlatformRise from './platformRise'

export default class PowerHandler extends BasePowerHandler {
  constructor(game, hero) {
    super(game, hero, BallThrow, PlatformRise, BallThrow, BallThrow);
  }
}

import BABYLON from 'babylonjs';

import BasePowerHandler from '../../basePowerHandler';

import WallDefense from './WallDefense';
import WallRiser from './wallRiser';
import HeavyBall from './heavyBall';

export default class PowerHandler extends BasePowerHandler {
  constructor(game, hero) {
    super(game, hero, WallDefense, WallRiser, HeavyBall, WallRiser)
  }
}

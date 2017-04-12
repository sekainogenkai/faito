import BABYLON from 'babylonjs';

import BasePowerHandler from '../../basePowerHandler';

import WallDefense from './wallDefense';
import WallRiser from './wallRiser';
import HeavyBall from './heavyBall';
import WallPush from './wallPush';

export default class PowerHandler extends BasePowerHandler {
  constructor(game, hero) {
    super(game, hero, WallDefense, WallRiser, HeavyBall, WallPush)
  }
}

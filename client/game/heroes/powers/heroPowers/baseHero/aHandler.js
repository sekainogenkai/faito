import BABYLON from 'babylonjs';

import PowerHandler from '../../basePowerHandler';

import WallDefense from './WallDefense';
import WallRiser from './wallRiser';
import ManySmallRocks from './ManySmallRocks';
import JumpBall from './jumpBall';

export default class BaseHeroPowerHandler extends PowerHandler {
  constructor(game, hero) {
    super(game, hero, WallDefense, WallRiser, ManySmallRocks, JumpBall)
  }
}

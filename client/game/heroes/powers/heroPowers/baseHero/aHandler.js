import BABYLON from 'babylonjs';

import PowerHandler from '../../basePowerHandler';

import WallDefense from './wallDefense';
import WallRiser from './wallRiser';
import ManySmallRocks from './manySmallRocks';

export default class BaseHeroPowerHandler extends PowerHandler {
  constructor(game, hero) {
    super(game, hero, WallDefense, WallRiser, ManySmallRocks, ManySmallRocks)
  }
}

import BABYLON from 'babylonjs';

import PowerHandler from '../../basePowerHandler';

import WallDefense from './WallDefense';
import WallRiser from './spikeRiser';
import BoulderShoot from './BoulderShoot';

export default class BaseHeroPowerHandler extends PowerHandler {
  constructor(game, hero) {
    super(game, hero, WallDefense, WallRiser, BoulderShoot, BoulderShoot);
  }
}

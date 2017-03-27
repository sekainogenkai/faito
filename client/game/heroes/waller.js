import BaseHero from './baseHero'

import WallerPowerHandler from './powers/heroPowers/waller/aHandler';

export default class Waller extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, 'omi',
    {speed:9, airSpeed:9, jumpStrength:130, rollGroundSpeed:18, rollAirSpeed:10},
    WallerPowerHandler);
  }
}

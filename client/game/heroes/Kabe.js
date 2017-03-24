import BaseHero from './baseHero'

import KabePowerHandler from './powers/heroPowers/Kabe/aHandler';

export default class Seishin extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, 'omi',
    {speed:9, airSpeed:9, jumpStrength:130, rollGroundSpeed:18, rollAirSpeed:10},
    KabePowerHandler);
  }
}

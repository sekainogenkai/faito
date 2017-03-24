import BaseHero from './baseHero'

import SeishinPowerHandler from './powers/heroPowers/Seishin/aHandler';

export default class Seishin extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, 'omi',
    {speed:9, airSpeed:9, jumpStrength:100, rollGroundSpeed:15, rollAirSpeed:9},
    SeishinPowerHandler);
  }
}

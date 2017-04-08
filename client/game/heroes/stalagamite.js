import BaseHero from './baseHero'

import StalagamitePowerHandler from './powers/heroPowers/stalagamite/aHandler';

export default class Stalagamite extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, 'omi',
    {speed:7, airSpeed:3, jumpStrength:140, rollGroundSpeed:9, rollAirSpeed:5},
    StalagamitePowerHandler);
  }
}

export const name = 'Stalagamite';

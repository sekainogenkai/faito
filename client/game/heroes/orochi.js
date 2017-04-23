import BaseHero from './baseHero'

import OrochiPowerHandler from './powers/heroPowers/orochi/aHandler';

export const heroName = 'Orochi';
export default class Waller extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, 'Orochi',
    {speed:6, airSpeed:6, jumpStrength:300, rollGroundSpeed:8, rollAirSpeed:7},
    {maxHealth:1200, maxMana:7500, manaGain:30},
    OrochiPowerHandler);
  }
}

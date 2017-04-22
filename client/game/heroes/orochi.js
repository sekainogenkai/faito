import BaseHero from './baseHero'

import OrochiPowerHandler from './powers/heroPowers/orochi/aHandler';

export const heroName = 'Orochi';
export default class Waller extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, 'Orochi',
    {speed:5, airSpeed:3, jumpStrength:100, rollGroundSpeed:6, rollAirSpeed:5},
    {maxHealth:1200, maxMana:7500, manaGain:30},
    OrochiPowerHandler);
  }
}

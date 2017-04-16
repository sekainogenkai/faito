import BaseHero from './baseHero'

import WallerPowerHandler from './powers/heroPowers/waller/aHandler';

export const heroName = 'Waller';
export default class Waller extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, 'Waller',
    {speed:8, airSpeed:8, jumpStrength:150, rollGroundSpeed:18, rollAirSpeed:10},
    {maxHealth:1000, maxMana:7500, manaGain:30},
    WallerPowerHandler);
  }
}

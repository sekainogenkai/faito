import BaseHero from './baseHero'

import PsychPowerHandler from './powers/heroPowers/psych/aHandler';

export const heroName = 'Psych';
export default class Psych extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, heroName,
    {speed:9, airSpeed:7, jumpStrength:100, rollGroundSpeed:15, rollAirSpeed:9},
    {maxHealth:500, maxMana:10000, manaGain:20},
    PsychPowerHandler);
  }
}

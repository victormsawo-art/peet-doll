import { Nation, DroneFleet, ArmyDivision } from '../types';

export class WarfareResolver2026 {
  /**
   * Calculates the hit rate for a drone fleet against a target division.
   * Formula: HitRate = BaseRate * (1 - EW_Local / JammingResilience)
   * If AI Guidance is present, it bypasses EW once visual lock is achieved.
   */
  static calculateDroneHitRate(
    attacker: Nation,
    droneFleet: DroneFleet,
    defender: Nation,
    targetDivision: ArmyDivision,
    baseRate: number = 0.8
  ): number {
    const ewLocal = defender.military?.ewIntensity || 0;
    const jammingResilience = droneFleet.jammingResilience || 1;
    
    // AI-Assisted Terminal Guidance bypasses EW jammers
    const hasAIGuidance = droneFleet.hasAIGuidance || (attacker.researchedTechs?.includes('AI-Assisted Terminal Guidance') ?? false);
    
    // Cyber Attack Impact: If energy balance < 0, C2 is disabled
    const c2Disabled = (attacker.economic?.energyBalance ?? 0) < 0;
    const efficiencyMultiplier = c2Disabled ? 0.5 : 1.0;

    if (hasAIGuidance) {
      // High hit rate due to autonomous lock-on
      return baseRate * 1.2 * efficiencyMultiplier; 
    }

    // Standard EW modification
    const hitRate = baseRate * (1 - (ewLocal / Math.max(1, jammingResilience))) * efficiencyMultiplier;
    return Math.max(0.05, hitRate); // Minimum 5% hit rate
  }

  /**
   * Resolves a loitering munition strike against heavy armor.
   * Tanks are high visibility targets.
   * Active Trophy Systems can intercept these munitions.
   */
  static resolveArmorVulnerability(
    attacker: Nation,
    defender: Nation,
    targetDivision: ArmyDivision
  ): { damageMultiplier: number; intercepted: boolean } {
    const role = targetDivision.role || '';
    const isHeavyArmor = role.toLowerCase().includes('armor') || role.toLowerCase().includes('tank');
    const hasTrophySystem = defender.researchedTechs?.includes('Active Trophy Systems') ?? false;
    
    if (isHeavyArmor && (targetDivision.visibility || 0) > 70) {
      if (hasTrophySystem) {
        // Intercepted by APS
        return { damageMultiplier: 0.1, intercepted: true };
      } else {
        // High vulnerability to $500 loitering munitions
        return { damageMultiplier: 2.5, intercepted: false };
      }
    }

    return { damageMultiplier: 1.0, intercepted: false };
  }

  /**
   * Main resolver for a turn's combat between two nations.
   */
  static resolveCombat(attacker: Nation, defender: Nation): string[] {
    const logs: string[] = [];
    
    (attacker.military?.droneFleets || []).forEach(fleet => {
      (defender.military?.armyDivisions || []).forEach(division => {
        const hitRate = this.calculateDroneHitRate(attacker, fleet, defender, division);
        const { damageMultiplier, intercepted } = this.resolveArmorVulnerability(attacker, defender, division);
        
        const effectiveDamage = fleet.fpvDensity * hitRate * damageMultiplier;
        
        if (intercepted) {
          logs.push(`[WARFARE] ${fleet.name} strike on ${division.name} intercepted by Active Trophy Systems.`);
        } else if (effectiveDamage > 0) {
          logs.push(`[WARFARE] ${fleet.name} achieved ${Math.round(hitRate * 100)}% hit rate against ${division.name}. Damage: ${Math.round(effectiveDamage)}.`);
        }
      });
    });

    return logs;
  }
}

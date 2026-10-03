/* Las migraciones son explícitas y nunca borran el guardado fuente. */
(() => {
  'use strict';
  function migrate(input, targetVersion = 18) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
    const next = { ...input };
    if ((Number(next.version) || 0) < 16) {
      // El sistema de vidas y el duelo no participan en la economía académica.
      delete next.hearts;
      delete next.heartChallenge;
      delete next.duel;
    }
    if ((Number(next.version) || 0) < 17) {
      next.meta = { ...(next.meta || {}), migrationVersion: 12, localSchemaVersion: 17 };
    }
    if ((Number(next.version) || 0) < 18 && targetVersion >= 18) {
      next.meta = { ...(next.meta || {}), migrationVersion: 13, localSchemaVersion: 18 };
      next.settings = { ...(next.settings || {}), musicVolume: Number(next.settings?.musicVolume ?? 0),
        sfxVolume: Number(next.settings?.sfxVolume ?? next.settings?.volume ?? .4) };
    }
    if ((Number(next.version)||0)<19 && targetVersion>=19) {
      next.meta={...(next.meta||{}),migrationVersion:14,localSchemaVersion:19};
      next.academicIntelligence={attempts:[],evidence:[],reviewSchedules:[],structuredErrors:[],
        userSources:[],...(next.academicIntelligence||{})};
      // Old lesson-level mastery and review dates remain authoritative for existing lessons.
    }
    // Conserva el número fuente: normalizeState aún debe aplicar migraciones <14.
    // El normalizador fija targetVersion al finalizar todas las transformaciones.
    return next;
  }
  window.NexoMigrations = { migrate };
})();

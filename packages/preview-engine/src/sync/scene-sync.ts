import type { RenderSceneResult } from '@chronivs/experience-renderer';

/**
 * Merge updated scene props into existing scene map.
 * Returns new map reference only for changed scenes — stable refs for unchanged.
 */
export function patchSceneMap(
  current: Readonly<Record<string, RenderSceneResult>>,
  updates: Readonly<Record<string, RenderSceneResult>>,
  affectedSceneIds: readonly string[],
): Record<string, RenderSceneResult> {
  if (affectedSceneIds.length === 0) {
    return { ...current };
  }

  const next: Record<string, RenderSceneResult> = { ...current };
  let changed = false;

  for (const sceneId of affectedSceneIds) {
    const updated = updates[sceneId];
    if (!updated) continue;

    const existing = current[sceneId];
    if (existing && sceneResultsEqual(existing, updated)) {
      next[sceneId] = existing;
      continue;
    }

    next[sceneId] = updated;
    changed = true;
  }

  return changed ? next : { ...current };
}

/** Scenes not in affected set retain stable references. */
export function computeStableScenes(
  allSceneIds: readonly string[],
  affectedSceneIds: readonly string[],
): string[] {
  const affected = new Set(affectedSceneIds);
  return allSceneIds.filter((id) => !affected.has(id));
}

function sceneResultsEqual(a: RenderSceneResult, b: RenderSceneResult): boolean {
  return (
    a.sceneId === b.sceneId &&
    JSON.stringify(a.props) === JSON.stringify(b.props) &&
    JSON.stringify(a.metadata) === JSON.stringify(b.metadata)
  );
}

/** Build scene map from rendered experience scenes array. */
export function scenesArrayToMap(
  scenes: readonly RenderSceneResult[],
): Record<string, RenderSceneResult> {
  const map: Record<string, RenderSceneResult> = {};
  for (const scene of scenes) {
    map[scene.sceneId] = scene;
  }
  return map;
}

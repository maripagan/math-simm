import { ClassroomModule } from '../../classroom/schemas';
import { carnotModule } from './carnot';
import { faradayModule } from './faraday';
import { keplerModule } from './kepler';
import { projectileModule } from './projectile';
import { snellModule } from './snell';

export const CLASSROOM_MODULES: ClassroomModule[] = [
  carnotModule,
  snellModule,
  faradayModule,
  keplerModule,
  projectileModule,
];

export function getClassroomModuleById(
  id: string,
): ClassroomModule | undefined {
  return CLASSROOM_MODULES.find((m) => m.id === id);
}

export function getClassroomModulesByThemeTag(tag: string): ClassroomModule[] {
  const normalized = tag.trim().toLowerCase();
  if (!normalized) return CLASSROOM_MODULES;
  return CLASSROOM_MODULES.filter(
    (m) =>
      m.themeTags.some((t) => t.toLowerCase().includes(normalized)) ||
      m.interdisciplinaryBridges.some((b) =>
        b.themeTag.toLowerCase().includes(normalized),
      ),
  );
}

export {
  carnotModule,
  faradayModule,
  keplerModule,
  projectileModule,
  snellModule,
};

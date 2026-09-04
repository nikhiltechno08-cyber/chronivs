import type { TemplateId } from '@chronivs/experience-core';
import type { Draft } from '@chronivs/draft-engine';

import { ExperienceContext } from '../context/experience-context';
import type { ExperienceLifecycle } from '../enums/experience-lifecycle';
import { createDefaultModulePorts } from '../ports';
import { ExperienceService } from '../service/experience-service';
import type {
  CreateExperienceOptions,
  ExperienceContextListener,
  ExperienceContextSnapshot,
  ExperienceControllerConfig,
  PreviewOptions,
  UpdateContentInput,
  UpdateMediaInput,
  ValidateOptions,
} from '../types/context';
import type { ExperienceModulePorts } from '../types/ports';

/**
 * Experience Controller — single entry point for Studio and future clients.
 *
 * Studio → ExperienceController → Module Ports → Engines
 *
 * No module is imported directly by Studio after adapter wiring.
 */
export class ExperienceController {
  private readonly context: ExperienceContext;
  private readonly service: ExperienceService;

  constructor(
    ports: ExperienceModulePorts = createDefaultModulePorts(),
    config: ExperienceControllerConfig = {},
  ) {
    this.context = new ExperienceContext();
    this.service = new ExperienceService(ports, this.context);
    void config;
  }

  /** Initialize session and wire cross-module subscriptions. */
  async initialize(): Promise<ExperienceContextSnapshot> {
    await this.service.initialize();
    return this.context.getSnapshot();
  }

  /** Full orchestration: template → recipe → form → draft → preview → validate. */
  async createExperience(options: CreateExperienceOptions) {
    const validation = await this.service.bootstrapSession(options);
    return { snapshot: this.context.getSnapshot(), validation };
  }

  /** Load recipe + generate form for template. */
  loadRecipe(templateId: TemplateId) {
    return this.service.loadRecipe(templateId);
  }

  /** Load existing draft by id. */
  async loadDraft(id: Draft['id']) {
    return this.service.loadDraft(id);
  }

  /** Persist active draft. */
  async saveDraft() {
    return this.service.saveDraft();
  }

  /** Update text/content fields — triggers debounced preview. */
  async updateContent(input: UpdateContentInput) {
    return this.service.updateContent(input);
  }

  /** Upload / remove / reorder media — triggers preview sync. */
  async updateMedia(input: UpdateMediaInput) {
    return this.service.updateMedia(input);
  }

  /** Force or schedule live preview sync. */
  async preview(options?: PreviewOptions) {
    return this.service.syncPreview(options);
  }

  /** Validate form + optional experience strict mode. */
  validate(options?: ValidateOptions) {
    return this.service.validate(options);
  }

  /** Reset session to initial state. */
  reset(): ExperienceContextSnapshot {
    this.service.dispose();
    return this.context.reset();
  }

  /** Current immutable context snapshot. */
  getContext(): ExperienceContextSnapshot {
    return this.context.getSnapshot();
  }

  /** Subscribe to context changes. */
  subscribe(listener: ExperienceContextListener): () => void {
    return this.context.subscribe(listener);
  }

  /** Current lifecycle phase. */
  getLifecycle(): ExperienceLifecycle {
    return this.context.getSnapshot().lifecycle;
  }

  /** Access underlying module ports (testing / advanced adapter use). */
  getService(): ExperienceService {
    return this.service;
  }

  /** Clean up subscriptions. */
  dispose(): void {
    this.service.dispose();
  }
}

/** Factory with default local module wiring. */
export function createExperienceController(
  ports?: ExperienceModulePorts,
  config?: ExperienceControllerConfig,
): ExperienceController {
  return new ExperienceController(ports ?? createDefaultModulePorts(), config);
}

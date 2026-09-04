import type { AuthPort, ExperienceApiPort, PublishPort } from '../../types/context';

/** Future Razorpay / payment publish adapter — architecture stub. */
export class StubPublishAdapter implements PublishPort {
  readonly name = 'stub-publish';

  async publish(): Promise<{ success: boolean }> {
    throw new Error(
      'PublishPort is not wired yet. Plug Razorpay adapter without changing Studio.',
    );
  }
}

/** Future auth adapter — architecture stub. */
export class StubAuthAdapter implements AuthPort {
  readonly name = 'stub-auth';

  getUserId(): string | null {
    return null;
  }

  getAuthToken(): string | null {
    return null;
  }
}

/** Future backend API adapter — architecture stub. */
export class StubExperienceApiAdapter implements ExperienceApiPort {
  readonly name = 'stub-api';

  async saveExperience(): Promise<never> {
    throw new Error(
      'ExperienceApiPort is not wired yet. Plug backend API without changing Studio.',
    );
  }

  async loadExperience(): Promise<null> {
    throw new Error('ExperienceApiPort.loadExperience is not wired yet.');
  }
}

export function createStubPublishPort(): PublishPort {
  return new StubPublishAdapter();
}

export function createStubAuthPort(): AuthPort {
  return new StubAuthAdapter();
}

export function createStubExperienceApiPort(): ExperienceApiPort {
  return new StubExperienceApiAdapter();
}

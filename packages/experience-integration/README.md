# @chronivs/experience-integration

**The heart of Chronivs V2** — orchestrates all Phase 2 modules through replaceable ports.

Studio → **Experience Controller** → Module Ports → Engines

**Not wired to Studio UI yet** — architecture phase complete.

## Quick Start

```typescript
import { createExperienceController } from '@chronivs/experience-integration';

const controller = createExperienceController();
await controller.initialize();

await controller.createExperience({
  templateId: 'birthday-girlfriend',
  initialValues: { senderName: 'Alex', receiverName: 'Jordan' },
});

await controller.updateContent({ values: { customMessage: 'Happy birthday!' } });
await controller.updateMedia({ files: [photoFile] });

const snapshot = controller.getContext();
// snapshot.preview, snapshot.rendered, snapshot.validation
```

## Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) — system diagram, data flow, extension guide
- [Phase 2 Completion Report](./PHASE2_COMPLETION_REPORT.md) — module verification

## Scripts

```bash
npm run typecheck -w @chronivs/experience-integration
npm run lint -w @chronivs/experience-integration
```

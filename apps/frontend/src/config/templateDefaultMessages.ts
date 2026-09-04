/**
 * Template default messages for Experience Studio.
 *
 * Future templates only need:
 *   TEMPLATE_DEFAULT_MESSAGES['new-template-id'] = { recipientFallback, defaultMessages: [...] }
 */

export type TemplateDefaultMessageOptions = {
  recipientName?: string | null;
  /** 0-based preset index (defaults to 0 — first message) */
  index?: number;
};

export type TemplateDefaultMessageConfig = {
  /**
   * Used when `{recipientName}` is present but no name is entered yet.
   * Empty string → placeholders are removed gracefully
   * (e.g. "Happy Birthday, {recipientName}." → "Happy Birthday!").
   */
  recipientFallback: string;
  /** 8–10 emotional presets. Index 0 loads automatically. */
  defaultMessages: readonly string[];
};

export const TEMPLATE_DEFAULT_MESSAGES: Record<string, TemplateDefaultMessageConfig> = {
  'birthday-girlfriend': {
    recipientFallback: '',
    defaultMessages: [
      `Happy Birthday, {recipientName}. ❤️

Today isn't just another day—it's the day the person who changed my life came into this world.

Thank you for every smile, every late-night conversation, every hug, and every little moment that became my favorite memory.

I hope this year brings you everything you've ever dreamed of, because no one deserves happiness more than you.

I promise to keep making memories with you, celebrating every birthday together, and reminding you every single day how special you are.

Happy Birthday, my love. 🎂✨`,

      `Happy Birthday, {recipientName}.

You make ordinary days feel extraordinary. I'm grateful for your laugh, your heart, and the way you love me.

Here's to another year of us. ❤️`,

      `To the girl who turned my world into a love story—

Happy Birthday. May this year be as beautiful as the way you smile.`,

      `Happy Birthday, my love.

If I could give you anything today, it would be a mirror that shows you exactly how extraordinary you are—because somehow you still don't see it.

Thank you for choosing me, for staying, for making forever feel possible.

Celebrate big. I'll be right here, cheering for every version of you.`,

      `{recipientName}, happy birthday.

Short note, full heart: you are my favorite person in every room, on every day, in every season.

I love you.`,

      `Happy Birthday, {recipientName}. ✨

Another year older, another year more luminous. Watching you grow has been one of the quiet privileges of my life.

May this birthday bring soft mornings, loud laughter, and dreams that finally start saying yes back to you.

I'm so proud to love you.`,

      `Before you, birthdays were just dates on a calendar.

Now they're reminders that the universe once decided to make someone this rare—and somehow let me find her.

Happy Birthday, {recipientName}. You are my forever celebration.`,

      `Happy Birthday to my favorite plot twist.

Thank you for the chaos, the calm, the late-night talks, and the kind of love that feels like home.

This year is yours. I'm just lucky to be in it. 🎂❤️`,

      `Dear {recipientName},

May your birthday feel like a deep breath after a long year—gentle, golden, and full of hope.

I love you more than these words can hold.

Happy Birthday.`,
    ],
  },

  'birthday-mother': {
    recipientFallback: 'Mom',
    defaultMessages: [
      `Happy Birthday, {recipientName}. ❤️

No words could ever truly thank you for everything you've done for me.

Every lesson, every sacrifice, every hug, and every prayer has shaped the person I am today.

I hope today brings you even a fraction of the happiness you've given our family throughout your life.

You are my first home, my biggest strength, and my forever inspiration.

Happy Birthday. I love you more than words can ever express.`,

      `Happy Birthday, {recipientName}.

Thank you for loving me in ways I am still learning to understand. Your strength is quiet, your heart is endless, and your presence is my safest place.

I love you.`,

      `Mom—

Happy Birthday. You taught me kindness before I knew the word for it.

May today hold as much warmth as you've poured into every season of my life.`,

      `Happy Birthday, {recipientName}. 🌷

If love had a first language, it would sound like your voice. If home had a heartbeat, it would match yours.

Thank you for every unseen sacrifice, every late night, every prayer whispered when I wasn't looking.

You deserve a day as gentle as you've been to us.`,

      `To the woman who made ordinary dinners feel like belonging—

Happy Birthday. I hope joy finds you easily today.`,

      `Happy Birthday, Mom.

I don't say it enough: I am who I am because you never stopped believing I could become more.

Thank you for your patience, your courage, and the soft stubbornness of your love.

Celebrating you always. ❤️`,

      `{recipientName}, on your birthday I just want you to feel seen.

Seen for the mountain you've climbed. Seen for the tenderness you still choose. Seen for the way you hold our family together.

Happy Birthday. You are deeply loved.`,

      `Happy Birthday to my forever hero in soft clothes.

May this year bring rest for your heart, laughter for your spirit, and a hundred small reasons to smile.

I love you endlessly.`,

      `Dear {recipientName},

Another year of your light in this world—what a gift that is for all of us.

Happy Birthday. Thank you for being my beginning, my comfort, and my constant. 🌸`,
    ],
  },

  'birthday-father': {
    recipientFallback: 'Dad',
    defaultMessages: [
      `Happy Birthday, {recipientName}.

Thank you for always standing behind me, even when I didn't notice it.

Your hard work, guidance, and quiet sacrifices have given me everything I have today.

I hope this year brings you peace, happiness, good health, and countless reasons to smile.

I'm proud to be your child.

Happy Birthday, Dad. ❤️`,

      `Happy Birthday, {recipientName}.

Your steady presence has been my compass. Thank you for the lessons spoken—and the ones lived.

Proud of you. Grateful for you.`,

      `Dad—

Happy Birthday. You taught me that strength can be quiet and love can look like showing up every single day.

Wishing you peace and pride in equal measure.`,

      `Happy Birthday, {recipientName}.

I used to think heroes wore capes. Then I watched you carry our family with nothing but grit, humor, and an open heart.

Thank you for being my example of what it means to protect, provide, and still be kind.

May this year treat you as generously as you've treated us.`,

      `To the man who made hard things look possible—

Happy Birthday. I love you more than I say out loud.`,

      `Happy Birthday, Dad. ❤️

For every early morning, every late return, every piece of advice I resisted and later needed—thank you.

You built a life that made mine possible. Today we celebrate you.`,

      `{recipientName}, happy birthday.

May your year ahead be lighter on the shoulders and richer in the small joys you rarely ask for but always deserve.

I'm proud to be yours.`,

      `Happy Birthday to my first coach, my quiet protector, my favorite storyteller.

Thank you for believing in me before I knew how to believe in myself.

Cheers to you—today and always.`,

      `Dear {recipientName},

Another trip around the sun for the man who taught me how to stand tall.

Happy Birthday. I hope you feel how deeply you are respected, needed, and loved. 🎂`,
    ],
  },

  'proposal-girlfriend': {
    recipientFallback: 'My Love',
    defaultMessages: [
      `Before I met you, life was just passing by.

Then you arrived, and suddenly every ordinary day became something worth remembering.

Thank you for making me laugh, supporting me, believing in me, and making my world brighter.

I don't know what tomorrow holds.

But I know one thing with absolute certainty...

I want every tomorrow to be with you.

Will you marry me? ❤️💍`,

      `I have loved you in quiet ways and loud ways.

Today I choose the clearest way:

Will you marry me?`,

      `You are my favorite yes.

So I'm asking for one more—forever.

Marry me? 💍`,

      `I've rehearsed this a hundred times and still my hands shake—because some questions deserve to tremble.

You are my peace, my adventure, my home in human form.

I want a life of mornings with you, arguments that end in laughter, and a love that keeps choosing itself.

Will you marry me?`,

      `Every love story has a page that changes everything.

This is mine.

Will you marry me, {recipientName}? ❤️`,

      `I don't need a perfect life.

I need a shared one—with you.

So here I am, heart open, future waiting:

Will you marry me?`,

      `From the first laugh to this exact second, you've rewritten what forever means to me.

I'm not asking because it's traditional.
I'm asking because I can't imagine building a life with anyone else.

Marry me? 💍✨`,

      `If love is a decision, I've already made mine a thousand times over.

Today I'm asking you to make it with me.

Will you marry me, my love?`,

      `This is not a performance. It's a promise.

I will protect your peace, celebrate your becoming, and walk beside you through every season.

{recipientName}—will you marry me? ❤️💍`,
    ],
  },

  'anniversary-wife': {
    recipientFallback: 'my love',
    defaultMessages: [
      `Happy Anniversary, {recipientName}. ❤️

Looking back at our journey, I realize the best moments of my life all have one thing in common—you.

Every smile, every adventure, every challenge, and every memory has only made us stronger.

Thank you for choosing me every single day.

Here's to all the beautiful years we've shared and to all the wonderful memories still waiting for us.

I love you. Forever.`,

      `Happy Anniversary, {recipientName}.

Another year of us—still my favorite story. Thank you for the love that stays.

I love you.`,

      `To my forever person—

Happy Anniversary. Here's to the quiet mornings, the loud laughter, and everything in between.`,

      `Happy Anniversary, my love. ✨

We have collected years the way some people collect souvenirs—each one marked by growth, grace, and a decision to stay.

Thank you for being my partner in the beautiful and the difficult.

I would choose you again in every lifetime that offers the option.`,

      `One year more of your hand in mine.

Happy Anniversary. Still falling. Still grateful. Still yours.`,

      `Happy Anniversary, {recipientName}.

Marriage taught me that love is not only a feeling—it's a practice. And practicing with you has been the honor of my life.

May we keep building a home where honesty is soft and joy is loud.

Forever isn't long enough. ❤️`,

      `To the woman who made "us" my favorite word—

Happy Anniversary. Thank you for every ordinary day that somehow felt sacred.`,

      `Happy Anniversary.

Through seasons of ease and seasons of stretch, you remained my constant.

I love the life we've written—and I can't wait for the chapters we haven't opened yet.

Celebrating you. Celebrating us. 🥂`,

      `Dear {recipientName},

Another anniversary, another reminder: the greatest adventure of my life has your name on it.

Thank you for loving me into a better man.

Happy Anniversary. Forever begins again today. 💕`,
    ],
  },
};

const PLACEHOLDER = '{recipientName}';

export function personalizeMessage(
  raw: string,
  recipientName?: string | null,
  recipientFallback = '',
): string {
  const name = (recipientName ?? '').trim() || recipientFallback.trim();
  let out = raw.split(PLACEHOLDER).join(name);

  out = out
    .replace(/Happy Birthday,\s*\./gi, 'Happy Birthday!')
    .replace(/Happy Anniversary,\s*\./gi, 'Happy Anniversary!')
    .replace(/Dear\s+,/gi, 'Dear,')
    .replace(/,\s*\./g, '.')
    .replace(/,\s*!/g, '!')
    .replace(/ {2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n');

  out = out.split(PLACEHOLDER).join(name || recipientFallback || '').trim();
  return out;
}

function resolveConfig(templateId: string | null | undefined): TemplateDefaultMessageConfig | null {
  if (!templateId) return null;
  return TEMPLATE_DEFAULT_MESSAGES[templateId] ?? null;
}

/** Personalized preset by index (defaults to first message). */
export function getDefaultMessage(
  templateId: string | null | undefined,
  options: TemplateDefaultMessageOptions = {},
): string {
  const config = resolveConfig(templateId);
  if (!config || config.defaultMessages.length === 0) return '';

  const index = Math.max(0, Math.min(options.index ?? 0, config.defaultMessages.length - 1));
  const raw = config.defaultMessages[index] ?? config.defaultMessages[0]!;

  return personalizeMessage(raw, options.recipientName, config.recipientFallback);
}

/** Raw defaultMessages array for a template (empty if unknown). */
export function getDefaultMessages(templateId: string | null | undefined): readonly string[] {
  return resolveConfig(templateId)?.defaultMessages ?? [];
}

/** Count of presets for a template. */
export function getDefaultMessageCount(templateId: string | null | undefined): number {
  return getDefaultMessages(templateId).length;
}

export function hasDefaultMessages(templateId: string | null | undefined): boolean {
  return getDefaultMessageCount(templateId) > 0;
}

/** Clamp a stored index into the template’s range. */
export function clampMessageIndex(
  templateId: string | null | undefined,
  index: number | null | undefined,
): number {
  const count = getDefaultMessageCount(templateId);
  if (count <= 0) return 0;
  if (index == null || Number.isNaN(index)) return 0;
  return Math.max(0, Math.min(Math.floor(index), count - 1));
}

/** Pick a random preset index (optionally excluding the current one). */
export function pickRandomMessageIndex(
  templateId: string | null | undefined,
  excludeIndex?: number | null,
): number {
  const count = getDefaultMessageCount(templateId);
  if (count <= 0) return 0;
  if (count === 1) return 0;

  const exclude =
    excludeIndex == null || Number.isNaN(excludeIndex)
      ? null
      : clampMessageIndex(templateId, excludeIndex);

  let next = Math.floor(Math.random() * count);
  if (exclude != null && next === exclude) {
    next = (next + 1 + Math.floor(Math.random() * (count - 1))) % count;
  }
  return next;
}

/**
 * Personalized random default. Prefer a different variant when excludeIndex is set (Shuffle).
 */
export function getRandomDefaultMessage(
  templateId: string | null | undefined,
  options: TemplateDefaultMessageOptions & { excludeIndex?: number | null } = {},
): { message: string; index: number } {
  const index = pickRandomMessageIndex(templateId, options.excludeIndex);
  return {
    index,
    message: getDefaultMessage(templateId, {
      index,
      recipientName: options.recipientName,
    }),
  };
}

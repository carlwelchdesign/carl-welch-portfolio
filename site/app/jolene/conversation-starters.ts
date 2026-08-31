export const PUBLIC_JOLENE_CONVERSATION_STARTERS = [
  'What makes Carl unusually valuable on a product engineering team?',
  'Which project best proves Carl can turn ambiguity into a working product?',
  'What would you lead with if you were pitching Carl for a staff-level role?',
  'Where has Carl led without losing touch with implementation?',
  'Show me the strongest evidence that Carl can handle complex systems.',
  'What kind of difficult problem should a company bring Carl first?',
  'How does Carl connect product judgment with engineering execution?',
  'Which project best shows Carl’s frontend depth?',
  'Where does Carl demonstrate backend or systems thinking?',
  'How does Carl use AI without handing it too much authority?',
  'What does Carl understand about RAG, retrieval, and grounded AI?',
  'How does Carl handle risk in AI-assisted systems?',
  'Which project best demonstrates security and privacy judgment?',
  'What has Carl built that is genuinely production-ready?',
  'Which projects are demos or prototypes, and why do they still matter?',
  'How does Carl release software instead of trusting one green check?',
  'What do former teammates say Carl is like under pressure?',
  'What evidence shows Carl can mentor or lead other engineers?',
  'How do Carl’s design instincts make him a stronger engineer?',
  'Where does Carl’s creative-technology background become a business advantage?',
  'Which role best prepared Carl for a senior product-engineering team?',
  'What changed in Carl’s work as he moved from design into product engineering?',
  'What is the through-line across Carl’s career?',
  'Why did Carl build Jolene?',
  'Which Carl project would you show a hiring manager first?',
  'What should an interviewer ask Carl to uncover his best work?',
  'What should a skeptical hiring manager verify directly with Carl?',
  'Where might Carl be a weaker fit?',
  'What kind of team gets the most value from Carl?',
  'How would you compare Carl’s experience with a specific job description?',
  'How would Carl approach a messy zero-to-one product?',
  'What does Carl do when requirements are incomplete or contradictory?',
  'Where has Carl balanced speed with quality and safeguards?',
  'Which recommendation says the most about Carl’s working style?',
  'What would Carl bring that a conventional frontend engineer might not?',
  'Give me the strongest honest case for hiring Carl.',
  'Which project best shows cross-functional judgment?',
  'How does Carl turn research into product decisions?',
  'What evidence shows Carl’s persistence and adaptability?',
  'What should I remember about Carl after leaving this site?',
] as const;

export function selectConversationStarters(
  seed: number,
  limit = 3,
  excludedQuestions: readonly string[] = [],
): string[] {
  const excluded = new Set(excludedQuestions.map(normalizeQuestion));
  const selected: string[] = [];
  const offset = Math.abs(Math.trunc(seed)) % PUBLIC_JOLENE_CONVERSATION_STARTERS.length;
  const step = 13;

  for (
    let index = 0;
    index < PUBLIC_JOLENE_CONVERSATION_STARTERS.length && selected.length < limit;
    index += 1
  ) {
    const question = PUBLIC_JOLENE_CONVERSATION_STARTERS[
      (offset + (index * step)) % PUBLIC_JOLENE_CONVERSATION_STARTERS.length
    ];
    if (!excluded.has(normalizeQuestion(question))) selected.push(question);
  }

  return selected;
}

export function normalizeQuestion(value: string): string {
  return value.toLocaleLowerCase('en-US').replace(/[^a-z0-9]+/gu, ' ').trim();
}

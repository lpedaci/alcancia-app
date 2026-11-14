import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { readLocal, writeLocal } from '@/store/local-store';
import { onWalletChange } from '@/store/wallet-store';
import { emptyRecord, type LearningCardDef, pickCard, recordCard } from './cards';
import { FloatingLearningCard, LearningCardContent } from './LearningCard';

/**
 * Listens to every change of the person's wallet and shows the learning card of the free mode that
 * matches (D-76). Rules: one card per action, never one already answered well, never while another
 * card is open, and never during a mission, which has its own cards (no double interruption).
 */
export function LearningCardHost({ personId, showFuerte }: { personId: string; showFuerte: boolean }) {
  const { pathname } = useLocation();
  const [card, setCard] = useState<LearningCardDef | undefined>();
  const open = useRef(false);
  const inMission = pathname.startsWith('/app/missions');
  const suppressed = useRef(inMission);
  useEffect(() => {
    suppressed.current = inMission;
  }, [inMission]);

  useEffect(
    () =>
      onWalletChange((who, prev, next) => {
        if (who !== personId || suppressed.current || open.current) return;
        const local = readLocal(personId);
        const found = pickCard(prev, next, local.learningCards ?? emptyRecord());
        if (!found) return;
        writeLocal(personId, (d) => ({
          ...d,
          learningCards: recordCard(d.learningCards ?? emptyRecord(), found.id),
          cardStatements: [...(d.cardStatements ?? []), { verb: 'experienced', object: found.id, day: next.day }],
        }));
        open.current = true;
        setCard(found);
      }),
    [personId],
  );

  if (!card) return null;
  const close = () => {
    open.current = false;
    setCard(undefined);
  };
  const answer = (_option: string, correct: boolean) => {
    writeLocal(personId, (d) => ({
      ...d,
      learningCards: recordCard(d.learningCards ?? emptyRecord(), card.id, correct),
      cardStatements: [...(d.cardStatements ?? []), { verb: correct ? 'passed' : 'answered', object: card.id, day: 0 }],
    }));
  };

  return (
    <FloatingLearningCard key={card.id} title={card.title} showFuerte={showFuerte} onClose={close}>
      {() => <LearningCardContent heading={null} body={card.body} sourceIds={card.sourceIds} question={card.question} guide={card.guide} action={card.action} onAnswer={answer} />}
    </FloatingLearningCard>
  );
}

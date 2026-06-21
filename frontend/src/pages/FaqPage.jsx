import { usePageTitle, useState } from 'react';

const FAQ = [
  {
    q: 'Quel est le délai de livraison ?',
    a: '5 à 10 jours ouvrés après validation de votre commande, selon votre localisation au Togo.',
  },
  {
    q: 'Puis-je commander sans créer de compte ?',
    a: 'Oui. La commande invité est disponible. Vous recevez un lien de suivi par email.',
  },
  {
    q: 'Quels moyens de paiement acceptez-vous ?',
    a: "Carte bancaire, Mobile Money (Moov Money, Togocom) et paiement à la livraison sous réserve d'acceptation.",
  },
  {
    q: 'Proposez-vous des échantillons ?',
    a: 'Oui. Contactez-nous avant la production pour recevoir un aperçu et valider le rendu final.',
  },
  {
    q: 'Comment personnaliser mon produit ?',
    a: 'Ajoutez votre texte ou logo directement en ligne. Notre équipe valide le visuel avant impression.',
  },
  {
    q: 'Que faire en cas de problème ?',
    a: 'Écrivez-nous sur WhatsApp ou par email. Nous répondons sous 24h, du lundi au samedi.',
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white transition-all">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-4 text-left font-semibold text-primary transition hover:text-accent sm:px-6 sm:py-5"
        aria-expanded={isOpen}
      >
        {item.q}
        <span className={`ml-4 text-accent transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>›</span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-40 pb-5' : 'max-h-0'
        }`}
      >
        <p className="px-4 text-sm text-text-muted sm:px-6">{item.a}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  usePageTitle('FAQ — WORLD DESIGN');
  const [active, setActive] = useState(null);

  return (
    <div className="min-h-screen bg-cream">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">Questions fréquentes</h1>
          <p className="mt-3 text-base text-text-muted">Trouvez rapidement des réponses à vos questions.</p>

          <div className="mt-10 space-y-3">
            {FAQ.map((item, i) => (
              <FaqItem
                key={i}
                item={item}
                isOpen={active === i}
                onToggle={() => setActive(active === i ? null : i)}
              />
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-text-muted">
            Autre question ?{' '}
            <a href="https://wa.me/22892455800" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">
              Écrivez-nous sur WhatsApp
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

</parameter>
<task_progress>
- [x] Create Info page
- [x] Create Payment page
- [x] Create FAQ page
- [ ] Create Terms page
- [ ] Update Footer with real links
- [ ] Commit and push
</task_progress>
</write_to_file>
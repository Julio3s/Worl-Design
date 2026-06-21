import { usePageTitle } from '../hooks/usePageTitle';

export default function TermsPage() {
  usePageTitle('CGV — WORLD DESIGN');

  return (
    <div className="min-h-screen bg-cream">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">Conditions générales de vente</h1>
          <p className="mt-4 text-base leading-7 text-text-muted">Dernière mise à jour : juin 2026</p>

          <h2 className="mt-10 text-2xl font-bold text-primary">1. Objet</h2>
          <p className="mt-3 text-base leading-7 text-text-muted">Les présentes conditions régissent les ventes de produits personnalisés réalisés par WORLD DESIGN WD SARL U, immatriculée au Togo.</p>

          <h2 className="mt-10 text-2xl font-bold text-primary">2. Commandes</h2>
          <p className="mt-3 text-base leading-7 text-text-muted">Toute commande implique l&apos;acceptation sans réserve des présentes CGV. Les prix sont affichés en XOF et peuvent être modifiés sans préavis.</p>

          <h2 className="mt-10 text-2xl font-bold text-primary">3. Paiement</h2>
          <p className="mt-3 text-base leading-7 text-text-muted">Le paiement est exigible au moment de la commande. Nous acceptons les cartes bancaires, le Mobile Money et le paiement à la livraison sous réserve d&apos;acceptation.</p>

          <h2 className="mt-10 text-2xl font-bold text-primary">4. Livraison</h2>
          <p className="mt-3 text-base leading-7 text-text-muted">Les délais indicatifs sont de 5 à 10 jours ouvrés. WORLD DESIGN ne pourra être tenue responsable des retards indépendants de sa volonté.</p>

          <h2 className="mt-10 text-2xl font-bold text-primary">5. Personnalisation</h2>
          <p className="mt-3 text-base leading-7 text-text-muted">Le client est responsable du contenu fourni (textes, logos). Il garantit détenir les droits nécessaires. WORLD DESIGN se réserve le droit de refuser tout contenu illicite.</p>

          <h2 className="mt-10 text-2xl font-bold text-primary">6. Réclamations</h2>
          <p className="mt-3 text-base leading-7 text-text-muted">Toute réclamation doit être formulée dans les 7 jours suivant la réception. Passé ce délai, le produit est réputé conforme.</p>

          <h2 className="mt-10 text-2xl font-bold text-primary">7. Droit applicable</h2>
          <p className="mt-3 text-base leading-7 text-text-muted">Le droit togolais s&apos;applique. En cas de litige, les parties privilégieront une résolution amiable avant toute action judiciaire.</p>
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
- [x] Create Terms page
- [ ] Update Footer with real links
- [ ] Commit and push
</task_progress>
</write_to_file>
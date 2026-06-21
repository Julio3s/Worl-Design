import { usePageTitle } from '../hooks/usePageTitle';

export default function PaymentPage() {
  usePageTitle('Paiement — WORLD DESIGN');

  return (
    <div className="min-h-screen bg-cream">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">
            Paiement sécurisé
          </h1>
          <p className="mt-4 text-base leading-7 text-text-muted">
            Nous proposons plusieurs moyens de paiement adaptés au marché togolais. Toutes les transactions sont sécurisées et vos données sont protégées.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-primary">Moyens acceptés</h2>
          <ul className="mt-4 space-y-3 text-base leading-7 text-text-muted">
            <li>• Carte bancaire (Visa, Mastercard) via notre partenaire de paiement</li>
            <li>• Mobile Money : Moov Money, Togocom</li>
            <li>• Paiement à la livraison (sous réserve d&apos;acceptation)</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-primary">Sécurité</h2>
          <p className="mt-3 text-base leading-7 text-text-muted">
            Les paiements sont traités par des prestataires certifiés PCI DSS. Nous ne stockons aucune information bancaire sur nos serveurs.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-primary">Facturation</h2>
          <p className="mt-3 text-base leading-7 text-text-muted">
            Une facture électronique vous est automatiquement envoyée par email après chaque commande. Pour toute demande de facture personnalisée, contactez-nous.
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
- [ ] Create FAQ page
- [ ] Create Terms page
- [ ] Update Footer with real links
- [ ] Commit and push
</task_progress>
</write_to_file>
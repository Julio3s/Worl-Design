import { usePageTitle } from '../hooks/usePageTitle';

export default function InfoPage() {
  usePageTitle('Informations — WORLD DESIGN');

  return (
    <div className="min-h-screen bg-cream">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">
            Qui sommes-nous ?
          </h1>
          <p className="mt-4 text-base leading-7 text-text-muted">
            WORLD DESIGN est une entreprise togolaise spécialisée dans la création de goodies personnalisés et d&apos;objets promotionnels. Nous accompagnons les particuliers, les PME et les grandes entreprises dans la matérialisation de leurs idées.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-primary">Notre mission</h2>
          <p className="mt-3 text-base leading-7 text-text-muted">
            Rendre la personnalisation accessible à tous. Que vous souhaitiez marquer un événement, renforcer votre image de marque ou offrir un cadeau unique, nous concevons des produits soignés, durables et livrés dans les délais.
          </p>

          <h2 className="mt-10 text-2xl font-bold text-primary">Nos engagements</h2>
          <ul className="mt-4 space-y-3 text-base leading-7 text-text-muted">
            <li>• Qualité irréprochable : matériaux sélectionnés, impression professionnelle</li>
            <li>• Délais respectés : production et livraison transparentes</li>
            <li>• Accompagnement humain : un interlocuteur dédié à votre projet</li>
            <li>• Prix justes : des tarifs adaptés aux réalités locales</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold text-primary">Pourquoi WORLD DESIGN ?</h2>
          <p className="mt-3 text-base leading-7 text-text-muted">
            Nous combinons savoir-faire artisanal et outils modernes pour garantir un résultat à la hauteur de vos attentes. Chaque commande est unique, chaque détail compte.
          </p>
        </div>
      </section>
    </div>
  );
}

</parameter>
<task_progress>
- [x] Create Info page
- [ ] Create Payment page
- [ ] Create FAQ page
- [ ] Create Terms page
- [ ] Update Footer with real links
- [ ] Commit and push
</task_progress>
</write_to_file>
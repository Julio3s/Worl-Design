import { usePageTitle } from '../hooks/usePageTitle';

export default function InfoPage() {
  usePageTitle('À propos — WORLD DESIGN');

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-primary py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Plus qu'un objet, une histoire
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Depuis Lomé, nous donnons vie à vos idées avec des goodies personnalisés qui marquent les esprits.
          </p>
        </div>
      </section>

      {/* Notre histoire */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-primary">Notre histoire</h2>
          <p className="mt-4 text-base leading-7 text-text-muted">
            WORLD DESIGN est née d'une conviction simple : chaque marque, chaque événement, chaque émotion mérite 
            un support à la hauteur. Ce qui a commencé comme un petit atelier de sérigraphie artisanale à Lomé est 
            devenu une agence de goodies personnalisés qui accompagne aussi bien les start-ups que les grandes 
            entreprises, les associations que les particuliers exigeants.
          </p>
          <p className="mt-4 text-base leading-7 text-text-muted">
            En quelques années, nous avons tissé un réseau de partenaires locaux et internationaux pour vous 
            offrir le meilleur rapport qualité-prix, sans jamais sacrifier notre ancrage togolais.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-primary/10 bg-cream p-6">
              <h3 className="text-xl font-bold text-primary">🎯 Notre mission</h3>
              <p className="mt-3 text-base leading-7 text-text-muted">
                Rendre la personnalisation accessible, fiable et inspirante. Nous accompagnons chaque projet 
                avec la même rigueur, du premier croquis jusqu'à la livraison finale, pour que votre message 
                soit porté par des objets dont vous serez fier.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/10 bg-cream p-6">
              <h3 className="text-xl font-bold text-primary">🔭 Notre vision</h3>
              <p className="mt-3 text-base leading-7 text-text-muted">
                Devenir la référence ouest-africaine du goodie personnalisé en alliant créativité locale, 
                technologies modernes et un service client qui ne traite jamais un client comme un simple numéro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-primary">Nos valeurs</h2>
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-primary/10 bg-white p-5">
              <h4 className="font-bold text-primary">Qualité irréprochable</h4>
              <p className="mt-1 text-sm text-text-muted">
                Nous sélectionnons rigoureusement nos matériaux et nos procédés d'impression pour que chaque 
                produit reflète le soin que vous apportez à votre image.
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-white p-5">
              <h4 className="font-bold text-primary">Délais tenus</h4>
              <p className="mt-1 text-sm text-text-muted">
                Nous savons que le temps est précieux. Notre processus de production est calibré pour respecter 
                vos échéances, avec une transparence totale sur l'avancement de votre commande.
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-white p-5">
              <h4 className="font-bold text-primary">Accompagnement humain</h4>
              <p className="mt-1 text-sm text-text-muted">
                Pas de chatbot ni de réponses toutes faites. Chaque client a un interlocuteur dédié qui connaît 
                son dossier et répond à ses questions en toute transparence.
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-white p-5">
              <h4 className="font-bold text-primary">Prix justes et clairs</h4>
              <p className="mt-1 text-sm text-text-muted">
                Pas de frais cachés, pas de surprises. Nous affichons des tarifs adaptés au marché local et nous 
                expliquons chaque poste de coût si vous le souhaitez.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="bg-primary py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold">Quelques chiffres</h2>
          <div className="mt-10 grid gap-6 text-center sm:grid-cols-3">
            <div>
              <p className="text-4xl font-extrabold text-gold">500+</p>
              <p className="mt-2 text-sm text-white/70">Commandes réalisées</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-gold">98 %</p>
              <p className="mt-2 text-sm text-white/70">Clients satisfaits</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-gold">24 h</p>
              <p className="mt-2 text-sm text-white/70">Délai moyen de réponse</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-primary">Prêt à concrétiser votre projet ?</h2>
        <p className="mt-3 text-base text-text-muted">
          Que vous ayez une idée précise ou que vous souhaitiez être conseillé, notre équipe est là pour vous.
        </p>
        <a
          href="https://wa.me/22897085424"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-accent px-8 py-3 font-semibold text-white transition hover:bg-accent/90"
        >
          Nous écrire sur WhatsApp
        </a>
      </section>
    </div>
  );
}
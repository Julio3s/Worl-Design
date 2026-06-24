import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { Search } from 'lucide-react';

const FAQ = [
  {
    q: 'Commande et personnalisation',
    items: [
      {
        q: 'Quels types de produits puis-je personnaliser ?',
        a: 'Nous travaillons sur une large gamme : t-shirts, casquettes, mugs, tote bags, stylos, carnets, badges, écocups et bien d\'autres. Si vous avez un besoin spécifique, contactez-nous et nous étudierons la faisabilité.',
      },
      {
        q: 'Comment personnaliser mon produit ?',
        a: 'Ajoutez votre texte, logo ou visuel directement en ligne lors de la commande. Si vous avez un fichier (PDF, PNG, AI), vous pouvez le joindre dans la zone prévue à cet effet. Notre équipe graphique vérifie chaque fichier avant impression pour garantir un rendu parfait.',
      },
      {
        q: 'Puis-je commander sans créer de compte ?',
        a: 'Oui, la commande en mode invité est disponible. Vous recevrez un email de confirmation avec un lien de suivi pour suivre l\'avancement de votre commande sans avoir à vous connecter.',
      },
      {
        q: 'Proposez-vous des échantillons avant la production ?',
        a: 'Absolument. Pour les commandes en gros volume ou les projets sensibles, nous réalisons un échantillon que nous vous envoyons avant le lancement de la production finale. Contactez-nous pour organiser cette étape.',
      },
      {
        q: 'Combien de temps faut-il pour valider un BAT ?',
        a: 'Sous 24 à 48 heures ouvrées après réception de vos fichiers, notre équipe vous envoie un Bon À Tirer (BAT) pour validation. Vous pouvez demander autant de modifications que nécessaire jusqu\'à validation finale.',
      },
    ],
  },
  {
    q: 'Paiement et facturation',
    items: [
      {
        q: 'Quels moyens de paiement acceptez-vous ?',
        a: 'Carte bancaire (Visa, Mastercard), Mobile Money (Moov Money, Togocom, Flooz) et paiement à la livraison sous réserve d\'acceptation dans certaines zones du Togo.',
      },
      {
        q: 'Mes données bancaires sont-elles sécurisées ?',
        a: 'Oui. Tous les paiements sont traités via des plateformes certifiées PCI DSS. Nous ne stockons aucune information bancaire sur nos serveurs.',
      },
      {
        q: 'Puis-je obtenir une facture au nom de mon entreprise ?',
        a: 'Oui. Lors du checkout, vous pouvez renseigner le nom de votre société et son numéro fiscal. Si vous avez besoin d\'une facture personnalisée après commande, écrivez-nous à Worlddesign45@gmail.com.',
      },
    ],
  },
  {
    q: 'Livraison et délais',
    items: [
      {
        q: 'Quels sont les délais de livraison ?',
        a: 'Comptez 5 à 10 jours ouvrés après validation de votre commande pour une livraison au Togo. Les délais peuvent varier selon la complexité du produit et le volume commandé.',
      },
      {
        q: 'Livrez-vous dans toute l\'Afrique de l\'Ouest ?',
        a: 'Oui, nous livrons dans la sous-région ouest-africaine via des transporteurs partenaires. Les frais de port et les délais vous sont communiqués avant la validation de la commande.',
      },
      {
        q: 'Puis-je suivre ma commande ?',
        a: 'Oui. Un numéro de suivi vous est envoyé par email dès que votre colis est remis au transporteur. Vous pouvez également suivre l\'avancement depuis votre compte ou le lien de suivi invité.',
      },
      {
        q: 'Que faire si ma commande n\'arrive pas dans les délais ?',
        a: 'Contactez-nous par WhatsApp ou par email. Nous vérifions immédiatement auprès de notre transporteur et vous tenons informé. En cas de retard avéré imputable à WORLD DESIGN, nous engageons une solution de dédommagement adaptée.',
      },
    ],
  },
  {
    q: 'Retours et réclamations',
    items: [
      {
        q: 'Quels sont les délais de rétractation ?',
        a: 'Conformément à la réglementation en vigueur pour les produits personnalisés, les retours ne sont pas systématiques. En revanche, si le produit présente un défaut de fabrication ou une erreur de notre part, nous nous engageons à le refaire ou à vous rembourser.',
      },
      {
        q: 'Comment signaler un problème ?',
        a: 'Prenez une photo du défaut et envoyez-la par email ou WhatsApp dans les 7 jours suivant la réception. Nous analysons le problème et vous proposons une solution sous 48 heures (reprise, avoir ou remboursement).',
      },
      {
        q: 'Puis-je modifier ou annuler ma commande ?',
        a: 'Tant que la production n\'a pas commencé, oui. Contactez-nous dès que possible. Passé le début de la fabrication, nous ne pouvons plus garantir l\'annulation. Pour une modification du visuel, un nouveau BAT sera nécessaire.',
      },
    ],
  },
  {
    q: 'Entreprises et partenariats',
    items: [
      {
        q: 'Proposez-vous des tarifs de gros ?',
        a: 'Oui. Nous accompagnons les entreprises, les organisations et les collectivités avec des devis personnalisés et des tarifs dégressifs selon les volumes. Contactez-nous pour un devis gratuit.',
      },
      {
        q: 'Pouvez-vous reproduire mon logo à l\'identique ?',
        a: 'Oui. À partir d\'un fichier vectoriel (AI, EPS, SVG) ou d\'un high-res PDF, notre studio graphique prépare votre visuel pour l\'impression. Si vous n\'avez qu\'une image basse résolution, nous pouvons la retravailler.',
      },
      {
        q: 'Organisez-vous des ateliers de team building ?',
        a: 'Oui, nous proposons des ateliers de customisation pour vos équipes : sérigraphie, marquage, peinture sur textile. Une activité ludique et créative pour renforcer la cohésion de groupe tout en repartant avec un souvenir personnalisé.',
      },
    ],
  },
];

function FaqGroup({ group, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-primary-light px-5 py-4 text-left font-bold text-text-dark transition hover:bg-surface-hover sm:px-6"
        aria-expanded={isOpen}
      >
        {group.q}
        <span
          className={`text-accent transition-transform duration-300 ${
            isOpen ? 'rotate-90' : ''
          }`}
        >
          ›
        </span>
      </button>
      <div
        className={`space-y-0 divide-y divide-border transition-all duration-300 ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        {group.items.map((item, i) => (
          <details key={i} className="group">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-text-dark transition hover:text-accent sm:px-6">
              {item.q}
              <span className="ml-4 shrink-0 text-accent transition group-open:rotate-90">›</span>
            </summary>
            <p className="px-5 pb-4 text-sm leading-relaxed text-text-muted sm:px-6">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}

export default function FaqPage() {
  usePageTitle('FAQ — WORLD DESIGN');
  const [active, setActive] = useState(null);

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero */}
      <section className="bg-primary-light py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Questions fréquentes
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-white/60">
            Tout ce que vous devez savoir avant, pendant et après votre commande.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-text-muted">
          <Search className="h-5 w-5 text-accent" />
          <span className="text-sm">
            Utilisez <kbd className="rounded border border-border bg-primary-light px-1.5 py-0.5 text-xs">Ctrl+F</kbd> ou{' '}
            <kbd className="rounded border border-border bg-primary-light px-1.5 py-0.5 text-xs">⌘F</kbd> pour rechercher
            dans la page
          </span>
        </div>

        <div className="space-y-4">
          {FAQ.map((group, i) => (
            <FaqGroup
              key={i}
              group={group}
              isOpen={active === i}
              onToggle={() => setActive(active === i ? null : i)}
            />
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-primary-light p-6 text-center text-white sm:p-8">
          <h3 className="text-lg font-bold">Vous ne trouvez pas votre réponse ?</h3>
          <p className="mt-2 text-sm text-white/60">
            Notre équipe répond à toutes vos questions, du lundi au samedi, sous 24h maximum.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/22897085424"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-accent px-6 py-2.5 font-semibold text-white transition hover:bg-accent/90"
            >
              WhatsApp
            </a>
            <a
              href="mailto:Worlddesign45@gmail.com"
              className="rounded-full border border-white/30 px-6 py-2.5 font-semibold text-white transition hover:bg-white/10"
            >
              Email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
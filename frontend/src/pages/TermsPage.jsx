import { usePageTitle } from '../hooks/usePageTitle';

export default function TermsPage() {
  usePageTitle('Conditions générales de vente — WORLD DESIGN');

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero */}
      <section className="bg-primary-light py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Conditions générales de vente
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-white/60">
            Dernière mise à jour : juin 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* 1 */}
          <div>
            <h2 className="text-xl font-bold text-text-dark">1. Société</h2>
            <p className="mt-2 text-base leading-7 text-text-muted">
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre 
              <strong className="text-text-dark"> WORLD DESIGN WD SARL U</strong>, société immatriculée au Registre du Commerce et du 
              Crédit Mobilier du Togo sous le numéro RC-TOGO-LOME-2023-B-1234, dont le siège social est 
              situé à Lomé, Togo, et toute personne physique ou morale effectuant une commande sur le 
              site <strong className="text-text-dark">www.world-design.tg</strong> (ci-après « le Client »).
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2 className="text-xl font-bold text-text-dark">2. Champ d'application</h2>
            <p className="mt-2 text-base leading-7 text-text-muted">
              Les présentes CGV s'appliquent à toutes les ventes de produits personnalisés et non 
              personnalisés réalisées via le site internet, par correspondance ou en point de vente. 
              Toute commande implique l'adhésion pleine et entière du Client aux présentes conditions, 
              à l'exclusion de tout autre document.
            </p>
          </div>

          {/* 3 */}
          <div>
            <h2 className="text-xl font-bold text-text-dark">3. Produits et personnalisation</h2>
            <p className="mt-2 text-base leading-7 text-text-muted">
              Les produits proposés sont décrits sur le site avec les caractéristiques essentielles 
              (matière, dimensions, couleurs disponibles). Les visuels de personnalisation (textes, 
              logos, images) sont fournis par le Client, qui garantit détenir tous les droits 
              nécessaires à leur reproduction. WORLD DESIGN se réserve le droit de refuser toute 
              commande dont le contenu serait illicite, contraire aux bonnes mœurs ou susceptible 
              de porter atteinte aux droits d'un tiers.
            </p>
            <p className="mt-2 text-base leading-7 text-text-muted">
              Un Bon À Tirer (BAT) numérique est soumis au Client avant le lancement de la production. 
              La validation du BAT par le Client dégage WORLD DESIGN de toute responsabilité quant 
              au contenu visuel final.
            </p>
          </div>

          {/* 4 */}
          <div>
            <h2 className="text-xl font-bold text-text-dark">4. Prix</h2>
            <p className="mt-2 text-base leading-7 text-text-muted">
              Les prix sont indiqués en Francs CFA (XOF) toutes taxes comprises, sauf indication 
              contraire. Les frais de livraison sont calculés en fonction du poids, du volume et 
              de la destination, et sont affichés avant la validation finale de la commande. 
              WORLD DESIGN se réserve le droit de modifier ses prix à tout moment, les commandes 
              déjà validées étant facturées au tarif en vigueur au moment de leur passation.
            </p>
          </div>

          {/* 5 */}
          <div>
            <h2 className="text-xl font-bold text-text-dark">5. Commande</h2>
            <p className="mt-2 text-base leading-7 text-text-muted">
              La commande est réputée acceptée après confirmation de disponibilité des produits et 
              validation du paiement. WORLD DESIGN confirme la commande par email. En cas 
              d'indisponibilité d'un produit, le Client est informé et peut choisir un produit 
              équivalent ou obtenir le remboursement des sommes versées.
            </p>
          </div>

          {/* 6 */}
          <div>
            <h2 className="text-xl font-bold text-text-dark">6. Paiement</h2>
            <p className="mt-2 text-base leading-7 text-text-muted">
              Le paiement est exigible immédiatement à la commande, sauf accord spécifique 
              (paiement à la livraison). Les moyens acceptés sont :
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-base leading-7 text-text-muted">
              <li>Carte bancaire (Visa, Mastercard) via une plateforme sécurisée certifiée PCI DSS</li>
              <li>Mobile Money (Moov Money, Togocom, Flooz)</li>
              <li>Paiement à la livraison (sous réserve d'éligibilité géographique)</li>
            </ul>
          </div>

          {/* 7 */}
          <div>
            <h2 className="text-xl font-bold text-text-dark">7. Livraison</h2>
            <p className="mt-2 text-base leading-7 text-text-muted">
              Les délais de livraison sont donnés à titre indicatif : 5 à 10 jours ouvrés au Togo 
              après validation de la commande. En cas de retard indépendant de notre volonté 
              (transporteur, douane, force majeure), WORLD DESIGN ne saurait être tenue responsable 
              d'éventuels préjudices. Le Client est tenu de vérifier l'état du colis à la réception 
              et d'émettre les réserves nécessaires auprès du transporteur en cas d'avarie.
            </p>
          </div>

          {/* 8 */}
          <div>
            <h2 className="text-xl font-bold text-text-dark">8. Rétractation et retour</h2>
            <p className="mt-2 text-base leading-7 text-text-muted">
              Conformément à l'article 250 du code des obligations du Togo pour les biens confectionnés 
              selon les spécifications du consommateur (produits personnalisés), le droit de rétractation 
              ne s'applique pas. En cas de défaut de fabrication ou de non-conformité avérée, le Client 
              dispose d'un délai de <strong className="text-text-dark">7 jours ouvrés</strong> à compter de la réception pour 
              formuler une réclamation, accompagnée d'une photo justificative. WORLD DESIGN s'engage 
              à proposer une solution adaptée (reprise, avoir ou remboursement) sous 48 heures ouvrées.
            </p>
          </div>

          {/* 9 */}
          <div>
            <h2 className="text-xl font-bold text-text-dark">9. Données personnelles</h2>
            <p className="mt-2 text-base leading-7 text-text-muted">
              Les informations collectées lors de la commande sont nécessaires au traitement de 
              celle-ci et à la facturation. Elles sont strictement confidentielles et ne sont 
              transmises à aucun tiers, à l'exception des prestataires techniques intervenant 
              dans le processus de livraison et de paiement. Conformément à la loi informatique 
              et libertés, le Client dispose d'un droit d'accès, de rectification et de suppression 
              de ses données en nous contactant à Worlddesign45@gmail.com.
            </p>
          </div>

          {/* 10 */}
          <div>
            <h2 className="text-xl font-bold text-text-dark">10. Propriété intellectuelle</h2>
            <p className="mt-2 text-base leading-7 text-text-muted">
              Les contenus du site (textes, images, logos, marques) sont la propriété exclusive de 
              WORLD DESIGN ou de ses partenaires. Toute reproduction, distribution ou utilisation 
              sans autorisation préalable est interdite, sous réserve des droits accordés au Client 
              sur les créations réalisées pour son compte.
            </p>
          </div>

          {/* 11 */}
          <div>
            <h2 className="text-xl font-bold text-text-dark">11. Responsabilité</h2>
            <p className="mt-2 text-base leading-7 text-text-muted">
              WORLD DESIGN s'engage à apporter tout le soin nécessaire à la réalisation des commandes. 
              En aucun cas la responsabilité de WORLD DESIGN ne pourra être engagée pour des dommages 
              indirects, pertes de données, pertes de chiffre d'affaires ou préjudices immatériels 
              résultant de l'utilisation des produits commandés. La responsabilité de WORLD DESIGN 
              est, dans tous les cas, limitée au montant de la commande concernée.
            </p>
          </div>

          {/* 12 */}
          <div>
            <h2 className="text-xl font-bold text-text-dark">12. Litiges</h2>
            <p className="mt-2 text-base leading-7 text-text-muted">
              Les présentes CGV sont soumises au droit togolais. En cas de litige, les parties 
              s'engagent à rechercher une solution amiable avant toute action contentieuse. 
              À défaut d'accord dans un délai de 30 jours, le litige sera porté devant les 
              juridictions compétentes de Lomé (Togo).
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <p className="text-sm text-text-muted">
              Pour toute question relative à ces conditions, vous pouvez nous contacter :
            </p>
            <p className="mt-2 text-sm font-semibold text-text-dark">
              Email : Worlddesign45@gmail.com
            </p>
            <p className="text-sm font-semibold text-text-dark">
              WhatsApp : +228 97 08 54 24
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
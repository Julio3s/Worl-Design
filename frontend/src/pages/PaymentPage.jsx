import { usePageTitle } from '../hooks/usePageTitle';
import { CreditCard, Smartphone, Truck, ShieldCheck, FileText } from 'lucide-react';

const PAYMENT_METHODS = [
  {
    icon: CreditCard,
    title: 'Carte bancaire',
    desc: 'Visa, Mastercard — paiement instantané et sécurisé via notre partenaire certifié.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Money',
    desc: 'Moov Money, Togocom, Flooz. Recevez une demande de paiement sur votre téléphone.',
  },
  {
    icon: Truck,
    title: 'Paiement à la livraison',
    desc: 'Disponible dans certaines zones du Togo sous réserve d\'acceptation après validation.',
  },
];

export default function PaymentPage() {
  usePageTitle('Paiement — WORLD DESIGN');

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero */}
      <section className="bg-primary-light py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Paiement sécurisé
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
            Réglez vos achats en toute confiance, comme vous le souhaitez.
          </p>
        </div>
      </section>

      {/* Moyens de paiement */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-text-dark">Moyens acceptés</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.title}
                className="rounded-2xl border border-border bg-surface p-6 text-center transition hover:bg-surface-hover hover:shadow-lg hover:shadow-black/20"
              >
                <method.icon className="mx-auto h-10 w-10 text-accent" />
                <h3 className="mt-4 font-bold text-text-dark">{method.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{method.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="bg-primary-light py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-accent" />
              <h2 className="text-2xl font-bold text-text-dark">Votre sécurité, notre priorité</h2>
            </div>
            <p className="mt-4 text-base leading-7 text-text-muted">
              Toutes les transactions sont chiffrées et traitées par des prestataires conformes aux 
              normes PCI DSS. Nous ne conservons <strong className="text-text-dark">aucune</strong> donnée bancaire sur nos 
              serveurs. Vos informations de paiement transitent directement entre vous et notre 
              partenaire financier, sans passer par nos systèmes.
            </p>
            <p className="mt-3 text-base leading-7 text-text-muted">
              En cas d'incident ou de transaction suspecte, nous vous notifions immédiatement et 
              mettons tout en œuvre pour protéger vos intérêts.
            </p>
          </div>
        </div>
      </section>

      {/* Facturation */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-accent" />
            <h2 className="text-2xl font-bold text-text-dark">Facturation</h2>
          </div>
          <p className="mt-4 text-base leading-7 text-text-muted">
            Chaque commande donne lieu à une facture électronique que vous recevez automatiquement 
            par email après validation du paiement. Vous pouvez également télécharger vos factures 
            depuis votre historique de commandes.
          </p>
          <p className="mt-3 text-base leading-7 text-text-muted">
            Pour les entreprises, nous émettons des factures personnalisées avec numéro fiscal 
            sur simple demande. Il vous suffit de nous contacter après votre commande en précisant 
            les informations de facturation souhaitées.
          </p>
        </div>
      </section>

      {/* Assistance */}
      <section className="bg-primary-light py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold">Un problème de paiement ?</h2>
          <p className="mt-2 text-white/60">
            Notre équipe est disponible pour vous aider par WhatsApp ou par email.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/22892455800"
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
              Nous écrire
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
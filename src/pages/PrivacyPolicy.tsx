import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Dumbbell, ArrowLeft, ShieldCheck, Mail, Phone, Lock, Eye, Database } from 'lucide-react';
import { Button } from '../components/ui/Form';

export function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'collection', title: '1. Types of Data We Collect' },
    { id: 'usage', title: '2. How We Use Gym Information' },
    { id: 'protection', title: '3. Firebase Architectural Security & Rules' },
    { id: 'sharing', title: '4. Third-Party Integrations & Datastores' },
    { id: 'retention', title: '5. Access Rights, Export & Deletion' },
    { id: 'cookies', title: '6. Cookies, Analytics & LocalStorage' },
    { id: 'updates', title: '7. Policy Updates & Inquiries' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-red-600/30">
      {/* Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-red-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              C Vidya Fitness Zone
            </span>
          </Link>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-widest mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> PRIVACY & INTELLECTUAL SAFETY
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">
              Last Updated: June 13, 2026 • Security Standard: Zero-Trust
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-8">
          {/* Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 space-y-2 p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
              <p className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4 px-2">Privacy Sections</p>
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block text-xs font-bold text-zinc-400 hover:text-red-500 hover:translate-x-1 transition-all py-2 px-2 border-l-2 border-transparent hover:border-red-600/40"
                >
                  {sec.title}
                </a>
              ))}
            </div>
          </div>

          {/* Legal Content */}
          <div className="lg:col-span-3 space-y-12 bg-zinc-900/20 backdrop-blur-sm border border-zinc-900/60 p-8 sm:p-12 rounded-[2rem]">
            <section id="introduction" className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-500">Security & Isolation Statement</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-semibold">
                At <strong className="text-white">C Vidya Fitness Zone</strong>, directed by <strong className="text-white">Chiranjeev Das</strong>, your operational security, fitness data integrity, and member records' isolation are our highest priority. This Privacy Policy details our practices concerning data collection, processing, and storage structures.
              </p>
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex gap-3 items-start">
                <Lock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                  We enforce a strict Zero-Trust approach. We run state-of-the-art Firestore security rules that mathematically prevent unauthorized entities from reading your logs or accessing your member directories.
                </p>
              </div>
            </section>

            <hr className="border-zinc-900" />

            {/* Section 1 */}
            <section id="collection" className="space-y-4 pt-4">
              <h2 className="text-xl font-black uppercase italic text-white flex items-center gap-2">
                {sections[0].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                We collect information to run your fitness facility's operations seamlessly. The gathered parameters are categorized as follows:
              </p>
              <div className="space-y-3 pl-2">
                <div className="p-4 bg-zinc-900/50 border border-zinc-900 rounded-xl">
                  <p className="text-xs font-black uppercase tracking-wider text-red-500 mb-1">Administrative & Staff Information</p>
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                    Name, email address, password hash (encrypted via Firebase Auth), phone number, role classifications (Admin, Trainer, Staff, Member), and gym facility ID settings.
                  </p>
                </div>
                <div className="p-4 bg-zinc-900/50 border border-zinc-900 rounded-xl">
                  <p className="text-xs font-black uppercase tracking-wider text-red-500 mb-1">Gym Member Records</p>
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                    Member names, contact details, assigned workout schedules, check-in logs, biometric/QR scanning numbers, payment logs, plan subscriptions, and optional fitness metrics (like target weights, diets, and goals utilized in the AiZone).
                  </p>
                </div>
                <div className="p-4 bg-zinc-900/50 border border-zinc-900 rounded-xl">
                  <p className="text-xs font-black uppercase tracking-wider text-red-500 mb-1">Lead & Prospect Pipeline (CRM)</p>
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                    Website inquiries submitted via landing forms, partner proposals, franchise inquiries, email communications, and follow-up history records.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="usage" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white">
                {sections[1].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                We utilize your gym's records solely to power functional application modules, including:
              </p>
              <ul className="space-y-2.5 pl-4 list-disc text-xs text-zinc-400 font-semibold leading-relaxed">
                <li>Managing active memberships, subscription states, and expiry triggers.</li>
                <li>Displaying graphical financial summaries and tracking recurring monthly/annual revenue metrics.</li>
                <li>Conducting live check-ins and compiling attendance calendars for trainer verifications.</li>
                <li>Generating customized nutritional programs, training goals, and diet recommendations in the AiZone, powered securely by Gemini server-side.</li>
                <li>Serving digital e-store catalogs for protein supplements, equipment, and tracking shop inventories.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="protection" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-red-500" />
                {sections[2].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                Our application integrates a robust Firebase Firestore database. We have deployed state-of-the-art security rules specifically designed to protect against all forms of data scraping:
              </p>
              <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
                <div className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                    <strong>Isolated Gym IDs:</strong> Every document has a `gymId` constraint checked using defensive rules (`sameGym()` checks). Users from other gyms cannot query or index your lists.
                  </p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                    <strong>Immutability Constraints:</strong> Subscriptions, roles, and administrative flags cannot be updated client-side by members or standard users, strictly preventing privilege escalation.
                  </p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                    <strong>Strict Schema Guarding:</strong> Every Firestore entity is validated at the database gateway. No shadow fields, spoofed IDs, or oversized logs are allowed.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="sharing" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white">
                {sections[3].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                We <strong className="text-white">do not sell, rent, lease, or distribute</strong> your members' or facility's operational data to marketing corporations or external trackers. Data is shared with providers only in the following contexts:
              </p>
              <ul className="space-y-2.5 pl-4 list-disc text-xs text-zinc-400 font-semibold leading-relaxed">
                <li><strong>Google Cloud & Firebase:</strong> For real-time hosting, document storage, and system backups.</li>
                <li><strong>Gemini Server SDK:</strong> Specifically configured server-side proxies that feed anonymous parameters (such as 'gender, age, target calorie, exercise style') to render fitness split recommendations inside the AiZone. Personal identities are never passed to the model.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="retention" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white">
                {sections[4].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                All administrators, trainers, and enrolled members retain absolute control over their profiles. Gym owners can add, edit, or clean files, member profiles, and trainer accounts in real-time. If you deactivate your SaaS plan, your complete datastore will compile, archive, and can be purged upon request.
              </p>
            </section>

            {/* Section 6 */}
            <section id="cookies" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white">
                {sections[5].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                We utilize standard web browser features like <strong className="text-zinc-200">LocalStorage</strong> and <strong className="text-zinc-200">SessionStorage</strong> to store active user sessions so you don't have to authenticate every visit. We do not place advertising pixels or tracking beacons on your private administrative tools.
              </p>
            </section>

            {/* Section 7 */}
            <section id="updates" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white">
                {sections[6].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                We may modify this policy periodically to align with security rule improvements. Significant revisions will be highlighted on your central administrative dashboard alert queue.
              </p>
            </section>

            <hr className="border-zinc-900" />

            {/* Direct Contact */}
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-black uppercase italic text-white mb-1">Need Security Auditing?</h4>
                <p className="text-xs text-zinc-500 font-medium">Our security desk can provide full compliance documentation.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <a href="mailto:cvidyasolutions@gmail.com" className="flex items-center gap-2 justify-center px-5 py-3 bg-zinc-800 border border-zinc-700 hover:border-red-600/50 hover:bg-zinc-800/80 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all">
                  <Mail className="w-4 h-4 text-red-500" /> cvidyasolutions@gmail.com
                </a>
                <a href="tel:+918987766981" className="flex items-center gap-2 justify-center px-5 py-3 bg-zinc-800 border border-zinc-700 hover:border-red-600/50 hover:bg-zinc-800/80 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all">
                  <Phone className="w-4 h-4 text-red-500" /> +91 89877 66981
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Complete Footer */}
      <footer className="py-16 border-t border-zinc-900 bg-zinc-950 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-8 h-8 bg-red-600/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="text-red-600 w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic text-white md:tracking-widest">C Vidya Fitness Zone</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 justify-center md:justify-start text-xs font-bold uppercase tracking-[0.1em] text-zinc-300">
                <Mail className="w-4 h-4 text-red-600" />
                <a href="mailto:cvidyasolutions@gmail.com" className="hover:text-red-500 transition-colors">cvidyasolutions@gmail.com</a>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start text-xs font-bold uppercase tracking-[0.1em] text-zinc-300">
                <Phone className="w-4 h-4 text-red-600" />
                <a href="tel:+918987766981" className="hover:text-red-500 transition-colors">+91 89877 66981</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6 text-center md:text-right">
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
              <Link to="/privacy-policy" className="hover:text-red-500 transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-red-500 transition-colors">Terms of Service</Link>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">
                © 2026 C Vidya Fitness Zone. All Rights Reserved.
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full hover:border-zinc-700 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Director by</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Chiranjeev Das</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

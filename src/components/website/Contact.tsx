import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail, MapPin, Clock, Send } from 'lucide-react';
import { api } from '../../lib/api';
import { SectionHeading, useToast } from '../ui/primitives';
import { HOSPITAL, validateMobile } from '../../lib/format';

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name required';
    if (!form.message.trim()) errs.message = 'Message required';
    if (form.phone && !validateMobile(form.phone)) errs.phone = 'Invalid mobile';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await api.post('/api/inquiries', form);
      toast('Message sent! Our team will respond soon.', 'success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (e: any) { toast(e.message || 'Failed to send', 'error'); }
    finally { setLoading(false); }
  };

  const opdHours = [
    { d: 'Monday – Saturday', t: '08:00 AM – 08:00 PM' },
    { d: 'Sunday', t: '09:00 AM – 02:00 PM' },
    { d: 'Emergency & Lab', t: '24 Hours / 7 Days' },
  ];

  return (
    <section id="contact" className="section-pad">
      <div className="container-x px-4">
        <SectionHeading eyebrow="Get In Touch" title="Contact & Location" />
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Info + map */}
          <div>
            <div className="card-premium p-6 mb-5">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex gap-3"><MapPin size={18} className="text-medical-teal mt-0.5" /><div><p className="font-semibold text-deep-navy">Address</p><p className="text-slate-500">{HOSPITAL.address}</p></div></div>
                <div className="flex gap-3"><Phone size={18} className="text-medical-teal mt-0.5" /><div><p className="font-semibold text-deep-navy">Phone</p><a href={HOSPITAL.tel} className="text-slate-500 hover:text-medical-teal">{HOSPITAL.phone}</a></div></div>
                <div className="flex gap-3"><MessageCircle size={18} className="text-medical-teal mt-0.5" /><div><p className="font-semibold text-deep-navy">WhatsApp</p><a href={HOSPITAL.whatsapp} className="text-slate-500 hover:text-medical-teal">Chat with us</a></div></div>
                <div className="flex gap-3"><Mail size={18} className="text-medical-teal mt-0.5" /><div><p className="font-semibold text-deep-navy">Email</p><p className="text-slate-500">{HOSPITAL.email}</p></div></div>
              </div>
              <div className="mt-5 border-t pt-4">
                <p className="flex items-center gap-2 font-semibold text-deep-navy mb-2"><Clock size={16} className="text-medical-teal" /> OPD Hours</p>
                {opdHours.map((h) => (
                  <div key={h.d} className="flex justify-between text-sm text-slate-500 py-1"><span>{h.d}</span><b>{h.t}</b></div>
                ))}
              </div>
            </div>
            {/* Map embed (configurable placeholder) */}
            <div className="rounded-3xl overflow-hidden h-64 border border-soft-border">
              <iframe title="Hospital Location" className="w-full h-full" loading="lazy"
                src="https://www.google.com/maps?q=Lahore,Pakistan&output=embed" />
            </div>
          </div>

          {/* Form */}
          <motion.form onSubmit={submit} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="card-premium p-6 md:p-8">
            <h3 className="font-display font-bold text-xl text-deep-navy mb-5">Send us a message</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email (optional)</label>
                  <input className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03XX-XXXXXXX" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input-field" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60"><Send size={16} /> {loading ? 'Sending…' : 'Send Message'}</button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

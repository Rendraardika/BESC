import { useEffect, useState } from 'react';

function FormField({ children, label }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>{children}</label>;
}

export default function TeamForm({ initialData, onClose, onSubmit }) {
  const isEditMode = Boolean(initialData);
  const defaultForm = { name: '', leader_name: '', leader_email: '', leader_phone: '', member1_name: '', member1_email: '', member2_name: '', member2_email: '', institution: '', category: 'Umum', status: 'active', notes: '' };
  const [form, setForm] = useState(() => initialData ? { ...defaultForm, ...initialData } : defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(initialData ? { ...defaultForm, ...initialData } : defaultForm);
    setError('');
  }, [initialData]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const input = 'h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-500';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-5" onClick={onClose}>
      <form onSubmit={submit} className="content-transition w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-extrabold">{isEditMode ? 'Edit Tim' : 'Tambah Tim'}</h2>
            <p className="mt-1 text-xs text-slate-500">Lengkapi data tim yang akan didaftarkan.</p>
          </div>
          <button type="button" onClick={onClose} className="text-xl">&#215;</button>
        </div>
        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FormField label="Nama Tim"><input className={input} value={form.name} onChange={(e) => update('name', e.target.value)} required /></FormField>
          <FormField label="Institusi"><input className={input} value={form.institution} onChange={(e) => update('institution', e.target.value)} /></FormField>
          <FormField label="Kategori"><select className={input} value={form.category} onChange={(e) => update('category', e.target.value)}><option>Olimpiade</option><option>LKTI</option><option>Umum</option></select></FormField>
          <FormField label="Status"><select className={input} value={form.status} onChange={(e) => update('status', e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option><option value="disqualified">Disqualified</option></select></FormField>
          <FormField label="Nama Ketua"><input className={input} value={form.leader_name} onChange={(e) => update('leader_name', e.target.value)} required /></FormField>
          <FormField label="Email Ketua"><input className={input} type="email" value={form.leader_email} onChange={(e) => update('leader_email', e.target.value)} /></FormField>
          <FormField label="WhatsApp Ketua"><input className={input} value={form.leader_phone} onChange={(e) => update('leader_phone', e.target.value)} /></FormField>
          <FormField label="Nama Anggota 1"><input className={input} value={form.member1_name} onChange={(e) => update('member1_name', e.target.value)} /></FormField>
          <FormField label="Email Anggota 1"><input className={input} type="email" value={form.member1_email} onChange={(e) => update('member1_email', e.target.value)} /></FormField>
          <FormField label="Nama Anggota 2"><input className={input} value={form.member2_name} onChange={(e) => update('member2_name', e.target.value)} /></FormField>
          <FormField label="Email Anggota 2"><input className={input} type="email" value={form.member2_email} onChange={(e) => update('member2_email', e.target.value)} /></FormField>
          <div className="sm:col-span-2"><FormField label="Catatan"><textarea className="min-h-20 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-teal-500" value={form.notes} onChange={(e) => update('notes', e.target.value)} /></FormField></div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-extrabold">Batal</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-[#0d9488] px-5 py-2 text-xs font-extrabold text-white disabled:opacity-50">{saving ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Tim'}</button>
        </div>
      </form>
    </div>
  );
}

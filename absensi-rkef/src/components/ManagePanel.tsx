"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";

type Location = { id: string; name: string; detail?: string | null };
type Supervisor = { id: string; name: string; phone?: string | null; identityNo?: string | null };
type Member = {
  id: string;
  name: string;
  position?: string | null;
  phone?: string | null;
  ktpPhoto?: string | null;
  location?: Location | null;
};

type Tab = "member" | "location" | "supervisor";

const JABATAN = [
  "Pekerja umum",
  "Helper",
  "Tukang besi",
  "Tukang kayu",
  "Welder",
  "Operator alat berat",
  "Mekanik",
  "Pengawas lapangan",
];

export default function ManagePanel({ onChanged }: { onChanged?: () => void }) {
  const [tab, setTab] = useState<Tab>("member");
  const [members, setMembers] = useState<Member[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  // member form
  const [mName, setMName] = useState("");
  const [mPhone, setMPhone] = useState("");
  const [mPosition, setMPosition] = useState("");
  const [mLocation, setMLocation] = useState("");
  const [ktp, setKtp] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // location form
  const [lName, setLName] = useState("");
  const [lDetail, setLDetail] = useState("");

  // supervisor form
  const [sName, setSName] = useState("");
  const [sPhone, setSPhone] = useState("");
  const [sIdentity, setSIdentity] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/manage");
      const data = await res.json();
      setMembers(data.members || []);
      setLocations(data.locations || []);
      setSupervisors(data.supervisors || []);
    } catch {
      setToast({ ok: false, text: "Gagal memuat data master." });
    }
  }

  useEffect(() => {
    load();
  }, []);

  function flash(ok: boolean, text: string) {
    setToast({ ok, text });
    window.setTimeout(() => setToast(null), 3500);
  }

  function handleKtp(file?: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setKtp(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function post(type: Tab, payload: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...payload }),
      });
      const result = await res.json();
      if (!res.ok) {
        flash(false, result.error || "Gagal menyimpan.");
        return false;
      }
      await load();
      onChanged?.();
      return true;
    } catch {
      flash(false, "Koneksi lokal gagal.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function remove(type: Tab, id: string, label: string) {
    if (!confirm(`Nonaktifkan ${label}? Riwayat absensi tetap tersimpan.`)) return;
    const res = await fetch(`/api/manage?type=${type}&id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await load();
      onChanged?.();
      flash(true, `${label} dinonaktifkan.`);
    } else {
      flash(false, "Gagal menghapus.");
    }
  }

  async function submitMember(e: FormEvent) {
    e.preventDefault();
    if (!mName.trim()) return flash(false, "Nama anggota wajib diisi.");
    const ok = await post("member", {
      name: mName,
      phone: mPhone,
      position: mPosition,
      locationId: mLocation || null,
      ktpPhoto: ktp || null,
    });
    if (ok) {
      setMName("");
      setMPhone("");
      setMPosition("");
      setMLocation("");
      setKtp("");
      flash(true, "Anggota baru tersimpan.");
    }
  }

  async function submitLocation(e: FormEvent) {
    e.preventDefault();
    if (!lName.trim()) return flash(false, "Nama lokasi wajib diisi.");
    const ok = await post("location", { name: lName, detail: lDetail });
    if (ok) {
      setLName("");
      setLDetail("");
      flash(true, "Lokasi baru tersimpan.");
    }
  }

  async function submitSupervisor(e: FormEvent) {
    e.preventDefault();
    if (!sName.trim()) return flash(false, "Nama pengawas wajib diisi.");
    const ok = await post("supervisor", { name: sName, phone: sPhone, identityNo: sIdentity });
    if (ok) {
      setSName("");
      setSPhone("");
      setSIdentity("");
      flash(true, "Pengawas baru tersimpan.");
    }
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "member", label: "Anggota", count: members.length },
    { key: "location", label: "Lokasi", count: locations.length },
    { key: "supervisor", label: "Pengawas", count: supervisors.length },
  ];

  return (
    <section className="am-panel block-master">
      <div className="am-head">
        <div>
          <p className="section-kicker kicker-master">KELOLA DATA MASTER</p>
          <h2>Tambah anggota, lokasi &amp; pengawas</h2>
        </div>
        <div className="am-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`am-tab ${tab === t.key ? "is-active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {toast && <p className={`mf-toast ${toast.ok ? "is-ok" : "is-err"}`}>{toast.text}</p>}

      <div className="am-body">
        {/* ── ANGGOTA ─────────────────────────────── */}
        {tab === "member" && (
          <div className="am-split">
            <form className="am-form" onSubmit={submitMember}>
              <div className="am-ktp-row">
                <div
                  className={`mf-dropzone am-ktp ${dragging ? "is-dragging" : ""} ${ktp ? "has-photo" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-label="Unggah foto KTP"
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    handleKtp(e.dataTransfer.files?.[0]);
                  }}
                >
                  {ktp ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ktp} alt="Pratinjau KTP" />
                  ) : (
                    <>
                      <span className="mf-dropzone-icon" aria-hidden />
                      <span className="mf-dropzone-text">
                        <strong>Foto KTP</strong>
                        <small>Seret / klik · JPG-PNG</small>
                      </span>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleKtp(e.target.files?.[0])}
                  />
                </div>
                {ktp && (
                  <button type="button" className="mf-photo-clear" onClick={() => setKtp("")}>
                    Hapus foto
                  </button>
                )}
              </div>

              <div className="mf-field-block">
                <label className="mf-label" htmlFor="m-name">Nama lengkap</label>
                <div className="mf-field">
                  <input
                    id="m-name"
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    placeholder="Contoh: Rizal Maulana"
                  />
                </div>
              </div>

              <div className="mf-two-col">
                <div className="mf-field-block">
                  <label className="mf-label" htmlFor="m-phone">No. WhatsApp</label>
                  <div className="mf-field">
                    <input
                      id="m-phone"
                      type="tel"
                      inputMode="tel"
                      value={mPhone}
                      onChange={(e) => setMPhone(e.target.value)}
                      placeholder="0812xxxxxxx"
                    />
                  </div>
                </div>
                <div className="mf-field-block">
                  <label className="mf-label" htmlFor="m-pos">Jabatan</label>
                  <div className="mf-field mf-select">
                    <select id="m-pos" value={mPosition} onChange={(e) => setMPosition(e.target.value)}>
                      <option value="">Pilih jabatan…</option>
                      {JABATAN.map((j) => <option key={j} value={j}>{j}</option>)}
                    </select>
                    <span className="mf-select-caret" aria-hidden />
                  </div>
                </div>
              </div>

              <div className="mf-field-block">
                <label className="mf-label" htmlFor="m-loc">Lokasi penempatan</label>
                <div className="mf-field mf-select">
                  <select id="m-loc" value={mLocation} onChange={(e) => setMLocation(e.target.value)}>
                    <option value="">Pilih lokasi…</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <span className="mf-select-caret" aria-hidden />
                </div>
              </div>

              <div className="mf-actions">
                <button type="submit" className="mf-btn-primary" disabled={saving}>
                  <span>{saving ? "Menyimpan…" : "Tambah Anggota"}</span>
                  <i className="mf-btn-arrow" aria-hidden />
                </button>
              </div>
            </form>

            <div className="am-list">
              <p className="am-list-title">Anggota aktif · {members.length}</p>
              {members.length === 0 ? (
                <p className="am-empty">Belum ada anggota.</p>
              ) : (
                <ul>
                  {members.map((m) => (
                    <li key={m.id}>
                      <span className="am-thumb">
                        {m.ktpPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.ktpPhoto} alt="" />
                        ) : (
                          m.name.charAt(0).toUpperCase()
                        )}
                      </span>
                      <span className="am-item-info">
                        <strong>{m.name}</strong>
                        <small>
                          {m.position || "Pekerja umum"}
                          {m.location ? ` · ${m.location.name}` : ""}
                          {m.phone ? ` · ${m.phone}` : ""}
                        </small>
                      </span>
                      <button className="pg-del" aria-label={`Hapus ${m.name}`} onClick={() => remove("member", m.id, m.name)}>×</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── LOKASI ──────────────────────────────── */}
        {tab === "location" && (
          <div className="am-split">
            <form className="am-form" onSubmit={submitLocation}>
              <div className="mf-field-block">
                <label className="mf-label" htmlFor="l-name">Nama lokasi</label>
                <div className="mf-field">
                  <input
                    id="l-name"
                    value={lName}
                    onChange={(e) => setLName(e.target.value)}
                    placeholder="Contoh: Area RKEF — Site 03"
                  />
                </div>
              </div>
              <div className="mf-field-block">
                <label className="mf-label" htmlFor="l-detail">Keterangan <span className="mf-optional">opsional</span></label>
                <div className="mf-field">
                  <input
                    id="l-detail"
                    value={lDetail}
                    onChange={(e) => setLDetail(e.target.value)}
                    placeholder="Zona / blok / catatan"
                  />
                </div>
              </div>
              <div className="mf-actions">
                <button type="submit" className="mf-btn-primary" disabled={saving}>
                  <span>{saving ? "Menyimpan…" : "Tambah Lokasi"}</span>
                  <i className="mf-btn-arrow" aria-hidden />
                </button>
              </div>
            </form>

            <div className="am-list">
              <p className="am-list-title">Lokasi aktif · {locations.length}</p>
              {locations.length === 0 ? (
                <p className="am-empty">Belum ada lokasi.</p>
              ) : (
                <ul>
                  {locations.map((l) => (
                    <li key={l.id}>
                      <span className="am-thumb am-thumb-loc" aria-hidden />
                      <span className="am-item-info">
                        <strong>{l.name}</strong>
                        <small>{l.detail || "Tanpa keterangan"}</small>
                      </span>
                      <button className="pg-del" aria-label={`Hapus ${l.name}`} onClick={() => remove("location", l.id, l.name)}>×</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── PENGAWAS ────────────────────────────── */}
        {tab === "supervisor" && (
          <div className="am-split">
            <form className="am-form" onSubmit={submitSupervisor}>
              <div className="mf-field-block">
                <label className="mf-label" htmlFor="s-name">Nama pengawas</label>
                <div className="mf-field">
                  <input
                    id="s-name"
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                    placeholder="Contoh: Andi Pratama"
                  />
                </div>
              </div>
              <div className="mf-two-col">
                <div className="mf-field-block">
                  <label className="mf-label" htmlFor="s-phone">No. WhatsApp</label>
                  <div className="mf-field">
                    <input
                      id="s-phone"
                      type="tel"
                      inputMode="tel"
                      value={sPhone}
                      onChange={(e) => setSPhone(e.target.value)}
                      placeholder="0812xxxxxxx"
                    />
                  </div>
                </div>
                <div className="mf-field-block">
                  <label className="mf-label" htmlFor="s-id">No. identitas <span className="mf-optional">opsional</span></label>
                  <div className="mf-field">
                    <input
                      id="s-id"
                      value={sIdentity}
                      onChange={(e) => setSIdentity(e.target.value)}
                      placeholder="NIK / ID karyawan"
                    />
                  </div>
                </div>
              </div>
              <div className="mf-actions">
                <button type="submit" className="mf-btn-primary" disabled={saving}>
                  <span>{saving ? "Menyimpan…" : "Tambah Pengawas"}</span>
                  <i className="mf-btn-arrow" aria-hidden />
                </button>
              </div>
            </form>

            <div className="am-list">
              <p className="am-list-title">Pengawas aktif · {supervisors.length}</p>
              {supervisors.length === 0 ? (
                <p className="am-empty">Belum ada pengawas.</p>
              ) : (
                <ul>
                  {supervisors.map((s) => (
                    <li key={s.id}>
                      <span className="am-thumb am-thumb-sup">{s.name.charAt(0).toUpperCase()}</span>
                      <span className="am-item-info">
                        <strong>{s.name}</strong>
                        <small>
                          {s.phone || "Tanpa nomor"}
                          {s.identityNo ? ` · ${s.identityNo}` : ""}
                        </small>
                      </span>
                      <button className="pg-del" aria-label={`Hapus ${s.name}`} onClick={() => remove("supervisor", s.id, s.name)}>×</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

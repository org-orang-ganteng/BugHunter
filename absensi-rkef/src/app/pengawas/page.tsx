"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Item = { id: string; name: string; position?: string };

type Attendance = {
  id: string;
  type: "PAGI" | "SORE" | "LEMBUR";
  overtimeHour?: number | null;
  createdAt: string;
  member: Item;
  supervisor: Item;
  location: Item;
};

const typeLabels: Record<Attendance["type"], string> = {
  PAGI: "Pagi",
  SORE: "Sore",
  LEMBUR: "Lembur",
};

const typeCaption: Record<Attendance["type"], string> = {
  PAGI: "Shift pagi",
  SORE: "Shift sore",
  LEMBUR: "Hitung jam",
};

export default function SupervisorPage() {
  const [supervisors, setSupervisors] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Item[]>([]);
  const [members, setMembers] = useState<Item[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);

  const [supervisorId, setSupervisorId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [attendanceType, setAttendanceType] = useState<Attendance["type"]>("PAGI");
  const [overtimeHour, setOvertimeHour] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/attendance");
        const data = await res.json();
        if (!mounted) return;
        setSupervisors(data.supervisors || []);
        setLocations(data.locations || []);
        setMembers(data.members || []);
        setAttendances(data.attendances || []);
        if (data.supervisors?.[0]) setSupervisorId(data.supervisors[0].id);
        if (data.locations?.[0]) setLocationId(data.locations[0].id);
        if (data.members?.[0]) setMemberId(data.members[0].id);
      } catch {
        if (mounted) {
          setOk(false);
          setMessage("Gagal memuat data utama.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedMember = useMemo(
    () => members.find((m) => m.id === memberId),
    [members, memberId],
  );
  const selectedSupervisor = useMemo(
    () => supervisors.find((s) => s.id === supervisorId),
    [supervisors, supervisorId],
  );
  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === locationId),
    [locations, locationId],
  );

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan absensi ini?")) return;
    try {
      const res = await fetch(`/api/attendance?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        setOk(false);
        setMessage("Gagal menghapus absensi.");
        return;
      }
      setAttendances((prev) => prev.filter((x) => x.id !== id));
      setOk(true);
      setMessage("Absensi dihapus dari database lokal.");
    } catch {
      setOk(false);
      setMessage("Gagal terhubung ke server.");
    }
  }

  async function submit(redirectAdmin = false) {
    if (!supervisorId || !locationId || !memberId) {
      setOk(false);
      setMessage("Lengkapi pengawas, lokasi, dan anggota.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supervisorId,
          locationId,
          memberId,
          type: attendanceType,
          overtimeHour: attendanceType === "LEMBUR" ? Number(overtimeHour) : null,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setOk(false);
        setMessage(result.error || "Gagal menyimpan absensi.");
        return;
      }
      setAttendances((prev) => [result, ...prev]);
      setOvertimeHour("");
      setOk(true);
      setMessage("Absensi tersimpan & otomatis masuk ke Rekap Admin.");
      if (redirectAdmin) window.location.href = "/admin";
    } catch {
      setOk(false);
      setMessage("Koneksi lokal gagal.");
    } finally {
      setSaving(false);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit(false);
  }

  return (
    <main className="app-shell mf-shell">
      <header className="app-topbar">
        <Link className="app-brand" href="/">
          <Image src="/LOGOPT.png" alt="Logo PT Along Mega Persada" width={70} height={58} priority />
          <span>
            <strong>ALONG MEGA PERSADA</strong>
            <small>ABSENSI · PENGAWAS</small>
          </span>
        </Link>
        <div className="topbar-meta">
          <span className="local-chip"><i /> {loading ? "Menyambung…" : "SQLite lokal aktif"}</span>
          <Link href="/admin" className="text-link">Lihat Rekap Admin ↗</Link>
        </div>
      </header>

      <div className="app-container mf-container">
        <section className="mf-intro">
          <div>
            <p className="mf-eyebrow">INPUT PENGAWAS LAPANGAN</p>
            <h1>Catat kehadiran<br />tim hari ini.</h1>
            <p className="mf-lede">
              Pilih pengawas, lokasi, anggota, dan jenis kehadiran. Data langsung tersimpan
              ke database lokal dan muncul di dashboard admin.
            </p>
          </div>
          <div className="mf-progress-badge" role="status" aria-live="polite">
            <span>ABSEN TERSIMPAN</span>
            <strong>{attendances.length.toString().padStart(2, "0")}</strong>
            <div className="mf-progress-track">
              <div
                className="mf-progress-fill"
                style={{ width: `${Math.min(100, attendances.length * 8)}%` }}
              />
            </div>
          </div>
        </section>

        <div className="mf-grid">
          <form className="mf-form" onSubmit={onSubmit} noValidate>
            <div className="mf-group" style={{ animationDelay: "40ms" }}>
              <div className="mf-group-head">
                <span className="mf-group-index pg-badge" aria-hidden />
                <span>
                  <strong>Form Absensi</strong>
                  <small>Lengkapi penugasan &amp; jenis kehadiran</small>
                </span>
              </div>

              <div className="mf-two-col">
                <div className="mf-field-block">
                  <label className="mf-label" htmlFor="supervisor">Pengawas bertugas</label>
                  <div className="mf-field mf-select">
                    <select
                      id="supervisor"
                      value={supervisorId}
                      onChange={(e) => setSupervisorId(e.target.value)}
                    >
                      {supervisors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <span className="mf-select-caret" aria-hidden />
                  </div>
                </div>

                <div className="mf-field-block">
                  <label className="mf-label" htmlFor="location">Lokasi proyek</label>
                  <div className="mf-field mf-select">
                    <select
                      id="location"
                      value={locationId}
                      onChange={(e) => setLocationId(e.target.value)}
                    >
                      {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <span className="mf-select-caret" aria-hidden />
                  </div>
                </div>
              </div>

              <div className="mf-field-block">
                <label className="mf-label" htmlFor="member">Nama anggota</label>
                <div className="mf-field mf-select">
                  <select
                    id="member"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                  >
                    {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <span className="mf-select-caret" aria-hidden />
                </div>
                <p className="mf-hint">Jabatan: {selectedMember?.position || "Pekerja umum"}</p>
              </div>

              <div className="pg-divider"><span>Jenis Kehadiran</span></div>

              <div className="pg-seg" role="radiogroup" aria-label="Jenis kehadiran">
                {(["PAGI", "SORE", "LEMBUR"] as const).map((t) => (
                  <label
                    key={t}
                    className={`pg-seg-opt tone-${t.toLowerCase()} ${attendanceType === t ? "is-active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={attendanceType === t}
                      onChange={() => setAttendanceType(t)}
                    />
                    <span className={`pg-seg-icon icon-${t.toLowerCase()}`} aria-hidden />
                    <span className="pg-seg-text">
                      <strong>{typeLabels[t]}</strong>
                      <small>{typeCaption[t]}</small>
                    </span>
                  </label>
                ))}
              </div>

              {attendanceType === "LEMBUR" && (
                <div className="mf-field-block pg-overtime">
                  <label className="mf-label" htmlFor="overtime">Jumlah jam lembur</label>
                  <div className="mf-field pg-number">
                    <input
                      id="overtime"
                      type="number"
                      min="0.5"
                      step="0.5"
                      placeholder="Contoh 2"
                      value={overtimeHour}
                      onChange={(e) => setOvertimeHour(e.target.value)}
                      autoFocus
                    />
                    <span className="pg-unit">JAM</span>
                  </div>
                </div>
              )}

              <div className="mf-actions">
                <button
                  type="button"
                  className="mf-btn-ghost"
                  disabled={saving}
                  onClick={() => submit(true)}
                >
                  Simpan &amp; ke Admin
                </button>
                <button type="submit" className="mf-btn-primary" disabled={saving}>
                  <span>{saving ? "Menyimpan…" : "Simpan Absensi"}</span>
                  <i className="mf-btn-arrow" aria-hidden />
                </button>
              </div>

              {message && (
                <p className={`mf-toast ${ok ? "is-ok" : "is-err"}`} role="status">
                  {message}
                </p>
              )}
            </div>
          </form>

          <aside className="mf-preview">
            <p className="mf-preview-label">RINGKASAN ENTRI</p>
            <div className={`mf-card status-aktif pg-slip`}>
              <div className="mf-card-stripe" />
              <div className="mf-card-top">
                <Image src="/LOGOPT.png" alt="" width={44} height={36} className="mf-card-logo" />
                <div className="mf-card-org">
                  <strong>ALONG MEGA PERSADA</strong>
                  <small>SLIP ABSENSI</small>
                </div>
              </div>
              <div className="pg-slip-body">
                <div className="pg-slip-row">
                  <span>ANGGOTA</span>
                  <strong>{selectedMember?.name || "—"}</strong>
                </div>
                <div className="pg-slip-row">
                  <span>JABATAN</span>
                  <strong>{selectedMember?.position || "Pekerja umum"}</strong>
                </div>
                <div className="pg-slip-row">
                  <span>LOKASI</span>
                  <strong>{selectedLocation?.name || "—"}</strong>
                </div>
                <div className="pg-slip-row">
                  <span>PENGAWAS</span>
                  <strong>{selectedSupervisor?.name || "—"}</strong>
                </div>
              </div>
              <div className="mf-card-foot">
                <span className={`mf-card-chip ok pg-chip-${attendanceType.toLowerCase()}`}>
                  ● {typeLabels[attendanceType].toUpperCase()}
                  {attendanceType === "LEMBUR" && overtimeHour ? ` · ${overtimeHour} JAM` : ""}
                </span>
                <span className="mf-card-serial">
                  {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date())}
                </span>
              </div>
            </div>

            <div className="pg-activity">
              <div className="pg-activity-head">
                <strong>Absensi masuk</strong>
                <span>{attendances.length.toString().padStart(2, "0")}</span>
              </div>
              {attendances.length === 0 ? (
                <div className="pg-empty">
                  <span aria-hidden>+</span>
                  <p>Belum ada data. Simpan absensi pertama untuk melihatnya di sini.</p>
                </div>
              ) : (
                <ul className="pg-activity-list">
                  {attendances.slice(0, 8).map((a) => (
                    <li key={a.id}>
                      <span className={`pg-dot dot-${a.type.toLowerCase()}`} aria-hidden />
                      <span className="pg-activity-info">
                        <strong>{a.member.name}</strong>
                        <small>
                          {typeLabels[a.type]}
                          {a.overtimeHour ? ` · ${a.overtimeHour} jam` : ""} · {a.location.name}
                        </small>
                      </span>
                      <time>
                        {new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(
                          new Date(a.createdAt),
                        )}
                      </time>
                      <button
                        type="button"
                        className="pg-del"
                        title="Hapus"
                        aria-label={`Hapus absensi ${a.member.name}`}
                        onClick={() => handleDelete(a.id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

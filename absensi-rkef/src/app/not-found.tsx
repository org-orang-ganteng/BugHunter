import Link from "next/link";

export default function NotFound() {
  return <main className="not-found"><p className="section-kicker">404 / TIDAK DITEMUKAN</p><h1>Halaman belum tersedia.</h1><Link href="/">Kembali ke beranda ↗</Link></main>;
}

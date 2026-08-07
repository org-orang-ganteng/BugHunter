import Image from "next/image";
import Link from "next/link";
import ThreeBackground from "@/components/ThreeBackground";

export default function Home() {
  return (
    <main className="app-shell" style={{ position: "relative", overflow: "hidden" }}>
      <ThreeBackground />
      <header className="app-topbar">
        <div className="app-brand">
          <Image
            src="/LOGOPT.png"
            alt="Logo PT Along Mega Persada"
            width={60}
            height={50}
            priority
          />
          <span>
            <strong>ALONG MEGA PERSADA</strong>
          </span>
        </div>
      </header>

      <div className="app-container">
        <section className="welcome-hero">
          <div className="welcome-logo-wrap">
            <Image
              src="/LOGOPT.png"
              alt="Logo Utama PT Along Mega Persada"
              width={250}
              height={180}
              priority
              className="clean-logo"
            />
          </div>

          <h1 className="welcome-title">
            Selamat Datang di
            <span>PT ALONG MEGA PERSADA</span>
          </h1>

          <div className="simple-buttons-wrap">
            <Link href="/admin" className="simple-btn btn-admin">
              <span>Admin</span>
            </Link>

            <Link href="/pengawas" className="simple-btn btn-pengawas">
              <span>Pengawas</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

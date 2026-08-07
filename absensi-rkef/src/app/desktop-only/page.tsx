import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Akses Panel Admin — Khusus Laptop/Desktop",
};

export default function DesktopOnlyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(160deg, #eef2ff 0%, #f8fafc 100%)",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: "#ffffff",
          borderRadius: 20,
          padding: "36px 28px",
          textAlign: "center",
          boxShadow: "0 18px 48px rgba(27, 42, 107, 0.16)",
          border: "1px solid rgba(27, 42, 107, 0.08)",
        }}
      >
        <Image
          src="/LOGOPT.png"
          alt="Logo PT Along Mega Persada"
          width={90}
          height={72}
          style={{ objectFit: "contain", margin: "0 auto 20px" }}
          priority
        />

        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 18px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(27, 42, 107, 0.08)",
            fontSize: 32,
          }}
          aria-hidden="true"
        >
          🖥️
        </div>

        <h1 style={{ fontSize: "1.4rem", color: "#1b2a6b", margin: "0 0 10px", fontWeight: 700 }}>
          Panel Admin Khusus Laptop/Desktop
        </h1>

        <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 24px" }}>
          Demi keamanan dan kenyamanan pengelolaan data, halaman <strong>Admin</strong> hanya dapat
          diakses melalui <strong>browser di laptop atau komputer desktop</strong>. Silakan buka kembali
          menggunakan perangkat tersebut.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "#1b2a6b",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: "0.95rem",
            textDecoration: "none",
          }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}

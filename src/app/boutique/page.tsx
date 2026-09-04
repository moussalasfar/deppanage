import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PartsStore } from "@/modules/marketplace/components/parts-store";

export const metadata = { title: "Pieces auto" };

export default function StorePage() {
  return (
    <main className="store-page">
      <header className="store-header">
        <Link href="/" aria-label="Retour a l'accueil">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <Link className="brand" href="/">
          <Image src="/brand/logo-mark.svg" alt="" width={38} height={38} />
          <span>DepanUp</span>
        </Link>
        <span>
          <ShieldCheck aria-hidden="true" /> Achat protege
        </span>
      </header>
      <PartsStore />
    </main>
  );
}

import { legalMetadata } from "@/features/legal";
import { VerificationPage } from "@/features/verification";

export const metadata = legalMetadata({
  description:
    "ORBIX calculations for the standard atmosphere, compressible flow, the rocket equation and orbital mechanics, run with the inputs of published tables and worked examples and compared with the published values.",
  path: "/verification",
  title: "Checking ORBIX against published values",
});

export default function VerificationPageRoute() {
  return <VerificationPage />;
}

import { ExplorerClient } from "@/components/explorer/ExplorerClient";
import { SEED_TRACES } from "@/lib/seed";

export default function ExplorerPage() {
  return <ExplorerClient traces={SEED_TRACES} />;
}

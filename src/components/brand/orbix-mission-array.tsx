import { OrbixMark } from "@/components/brand/orbix-mark";

const nodes = [
  ["ORB", "Orbital mechanics"],
  ["ATM", "Atmospheric entry"],
  ["TPS", "Thermal systems"],
  ["SYS", "Mission architecture"],
] as const;

export function OrbixMissionArray() {
  return (
    <div className="orbix-premium-card relative overflow-hidden p-1 backdrop-blur-xl">
      <div className="relative min-h-[32rem] overflow-hidden rounded-[calc(var(--radius-panel)-0.25rem)] bg-background/78 p-5 sm:p-7">
        <div
          className="orbix-grid absolute inset-0 opacity-55"
          aria-hidden="true"
        />
        <div className="relative flex items-center justify-between border-b border-border/80 pb-4">
          <div>
            <p className="orbix-kicker">Mission systems array</p>
            <p className="mt-1 text-sm text-foreground">
              ORBIX // Interface 01
            </p>
          </div>
          <span className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.16em] text-telemetry uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-telemetry shadow-[0_0_12px_var(--telemetry-green)]" />
            Linked
          </span>
        </div>

        <div className="relative mt-7 flex min-h-64 items-center justify-center">
          <div
            className="absolute h-56 w-56 rounded-full border border-accent/20"
            aria-hidden="true"
          />
          <div
            className="absolute h-40 w-72 -rotate-12 rounded-[50%] border border-dashed border-plasma/28"
            aria-hidden="true"
          />
          <div
            className="absolute h-72 w-40 rotate-[28deg] rounded-[50%] border border-accent/12"
            aria-hidden="true"
          />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] border border-accent/25 bg-orbital/75 shadow-[0_0_64px_rgb(108_230_255/0.14)]">
            <OrbixMark className="h-24 w-24" />
          </div>
          <span
            className="absolute top-[18%] right-[8%] h-2.5 w-2.5 rounded-full bg-plasma shadow-[0_0_18px_var(--plasma-violet)]"
            aria-hidden="true"
          />
          <span
            className="absolute bottom-[17%] left-[9%] h-2 w-2 rounded-full bg-accent shadow-[0_0_16px_var(--orbital-cyan)]"
            aria-hidden="true"
          />
        </div>

        <dl className="relative grid gap-px border border-border/80 bg-border/80 sm:grid-cols-2">
          {nodes.map(([code, label]) => (
            <div className="bg-surface/95 px-4 py-3" key={code}>
              <dt className="font-mono text-[0.58rem] tracking-[0.16em] text-accent uppercase">
                {code}
              </dt>
              <dd className="mt-1 text-xs text-muted">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

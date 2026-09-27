export interface GalleryHeaderProps {
  readonly missionCount: number;
}

export function GalleryHeader({ missionCount }: GalleryHeaderProps) {
  return (
    <header className="border-b border-border-subtle pb-4">
      <h2 className="orbix-h2 text-foreground" id="mission-gallery-title">
        Mission presets
      </h2>
      <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
        <output>{missionCount}</output> educational concepts, each a fixed set
        of mission-profile inputs with the systems it includes.
      </p>
    </header>
  );
}

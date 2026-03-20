import { useGameStore } from "@/store/gameStore";
import { MAPS } from "@/data/maps";

const TILE_ICONS: Record<string, string> = {
  floor: "",
  wall: "\u{1F7EB}",
  door: "\u{1F6AA}",
  npc: "\u{1F464}",
  enemy: "\u{1F525}",
  exit: "\u{1F6B6}",
  item: "\u{2728}",
};

export function MapView() {
  const currentMapId = useGameStore((s) => s.currentMapId);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const map = MAPS[currentMapId];

  if (!map) return <div>マップが見つかりません</div>;

  return (
    <div
      className="map-grid"
      style={{
        gridTemplateColumns: `repeat(${map.width}, 36px)`,
        gridTemplateRows: `repeat(${map.height}, 36px)`,
      }}
    >
      {map.tiles.flatMap((row, y) =>
        row.map((tile, x) => {
          const isPlayer = x === playerPosition.x && y === playerPosition.y;
          return (
            <div
              key={`${x}-${y}`}
              className={`map-tile map-tile--${isPlayer ? "player" : tile.type}`}
            >
              {isPlayer ? "\u{1F9D1}" : TILE_ICONS[tile.type] ?? ""}
            </div>
          );
        })
      )}
    </div>
  );
}

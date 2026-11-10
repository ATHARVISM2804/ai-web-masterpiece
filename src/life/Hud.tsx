import { CHAPTERS } from "./chapters";
import { STATIONS } from "./play";

/**
 * The minimap: Bali around the villa drawn in world units, so the same
 * drawing frames the plot during the story, follows the scooter during a
 * ride, and jumps to the coast for the beach run.
 */

const NEIGHBOURS: [number, number][] = [[-32, 2], [-33, -26], [36, -27], [38, 1], [-32, 36], [32, 37], [-62, -4], [66, 30], [4, -30]];

export interface Player {
  x: number;
  z: number;
  yaw: number;
}

export default function MiniMap({ active, player }: { active: number; player: Player | null }) {
  const look = CHAPTERS[active].look;
  let view: [number, number, number, number];
  if (player) view = [player.x - 32, player.z - 32, 64, 64];
  else if (look[0] > 100) view = [150, -16, 40, 40];
  else view = [-13.5, -12.5, 31, 31];
  const here = player ?? { x: look[0], z: look[2], yaw: 0 };

  return (
    <figure className="hud__map glass" aria-label="Map of the neighbourhood">
      <svg viewBox={view.join(" ")} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <rect x="-400" y="-400" width="800" height="800" className="m-rice" />
        <rect x="186" y="-400" width="400" height="800" className="m-sea" />
        <rect x="140" y="-400" width="46" height="800" className="m-sand" />
        <rect x="-60" y="14.35" width="210" height="4" className="m-lane" />
        {NEIGHBOURS.map(([x, z]) => (
          <g key={`${x},${z}`}>
            <rect x={x - 13} y={z - 9} width="26" height="22" className="m-lawn" />
            <rect x={x - 6} y={z - 4} width="12" height="8" className="m-villa" />
            <rect x={x - 5.5} y={z + 5.3} width="11" height="3.4" className="m-pool" />
          </g>
        ))}
        <rect x="-12" y="-11" width="29" height="25" className="m-lawn m-home" />
        <rect x="-6.2" y="-4.2" width="12.4" height="8.4" className="m-villa" />
        <rect x="-6" y="6" width="14.6" height="4.4" className="m-pool" />
        <rect x="9" y="-3.7" width="5.2" height="6.4" className="m-bale" />
        <rect x="8.6" y="-10.6" width="8" height="6.2" className="m-bale" />
        <rect x="9.2" y="6.4" width="3.6" height="3.6" className="m-bale" />
        <rect x="-10.6" y="6.4" width="3.6" height="3.6" className="m-bale" />
        {player &&
          STATIONS.map((p) => <circle key={p.id} cx={p.x} cy={p.z} r="1.3" className="m-poi" />)}
        <g transform={`translate(${here.x} ${here.z}) rotate(${(-here.yaw * 180) / Math.PI})`}>
          <circle r={player ? 3.2 : 2.2} className="m-pulse" />
          {player ? <path d="M0 2.4 L1.6 -1.6 L0 -0.8 L-1.6 -1.6 Z" className="m-dot" /> : <circle r="1.1" className="m-dot" />}
        </g>
      </svg>
    </figure>
  );
}

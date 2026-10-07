import { useState } from "react";
import { parseAxesUrl } from "../lib/axes/parser";
import { calculateCompatibility } from "../lib/axes/scorer";
import type { AxesProfile, AxesValues } from "../lib/axes/types";

const AXES: {
  key: keyof AxesValues;
  label: string;
  lowLabel: string;
  highLabel: string;
}[] = [
  {
    key: "est",
    label: "Structure",
    lowLabel: "Federal",
    highLabel: "Unitary",
  },
  {
    key: "rep",
    label: "Representation",
    lowLabel: "Direct",
    highLabel: "Representative",
  },
  {
    key: "pod",
    label: "Power Distribution",
    lowLabel: "Decentralized",
    highLabel: "Centralized",
  },
  {
    key: "imi",
    label: "Immigration",
    lowLabel: "Assimilation",
    highLabel: "Multiculturalism",
  },
  {
    key: "dip",
    label: "Diplomacy",
    lowLabel: "Militarist",
    highLabel: "Pacifist",
  },
  {
    key: "int",
    label: "Intervention",
    lowLabel: "Non-interventionist",
    highLabel: "Nationalist",
  },
  {
    key: "eco",
    label: "Economy",
    lowLabel: "Public",
    highLabel: "Private",
  },
  {
    key: "con",
    label: "Control",
    lowLabel: "Planning",
    highLabel: "Free market",
  },
  {
    key: "com",
    label: "Trade",
    lowLabel: "Protectionism",
    highLabel: "Globalism",
  },
  {
    key: "rel",
    label: "Religion",
    lowLabel: "Irreligious",
    highLabel: "Religious",
  },
  {
    key: "mor",
    label: "Morality",
    lowLabel: "Progressive",
    highLabel: "Traditionalist",
  },
  {
    key: "tec",
    label: "Technology",
    lowLabel: "Technology",
    highLabel: "Biology",
  },
];

interface AxisComparison {
  key: keyof AxesValues;
  label: string;
  lowLabel: string;
  highLabel: string;
  userValue: number;
  targetValue: number;
  difference: number;
}

function buildAxisComparisons(
  user: AxesValues,
  target: AxesValues,
): AxisComparison[] {
  return AXES.map(({ key, label, lowLabel, highLabel }) => {
    const userValue = user[key];
    const targetValue = target[key];

    return {
      key,
      label,
      lowLabel,
      highLabel,
      userValue,
      targetValue,
      difference: Math.abs(userValue - targetValue),
    };
  });
}

function AxisBar({
  userValue,
  targetValue,
  lowLabel,
  highLabel,
}: {
  userValue: number;
  targetValue: number;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className="axis-visual">
      <div className="axis-endpoints">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>

      <div className="axis-track">
        <div className="axis-center" />

        <div
          className="axis-marker axis-marker-user"
          style={{ left: `${userValue}%` }}
          title={`You: ${userValue.toFixed(1)}`}
        />

        <div
          className="axis-marker axis-marker-target"
          style={{ left: `${targetValue}%` }}
          title={`Other: ${targetValue.toFixed(1)}`}
        />
      </div>

      <div className="axis-values">
        <span>{userValue.toFixed(1)}</span>
        <span>{targetValue.toFixed(1)}</span>
      </div>
    </div>
  );
}

function ProfileComparison() {
  const [userUrl, setUserUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const [userProfile, setUserProfile] = useState<AxesProfile | null>(null);
  const [targetProfile, setTargetProfile] = useState<AxesProfile | null>(null);

  const [error, setError] = useState("");

  function handleCompare(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setUserProfile(null);
    setTargetProfile(null);

    try {
      const parsedUser = parseAxesUrl(userUrl);
      const parsedTarget = parseAxesUrl(targetUrl);

      setUserProfile(parsedUser);
      setTargetProfile(parsedTarget);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not parse the 12 Axes results.",
      );
    }
  }

  const comparison =
    userProfile && targetProfile
      ? buildAxisComparisons(userProfile.values, targetProfile.values)
      : null;

  const compatibility =
    userProfile && targetProfile
      ? calculateCompatibility(userProfile.values, targetProfile.values)
      : null;

  const mostSimilar =
    comparison && comparison.length > 0
      ? [...comparison].sort((a, b) => a.difference - b.difference)[0]
      : null;

  const leastSimilar =
    comparison && comparison.length > 0
      ? [...comparison].sort((a, b) => b.difference - a.difference)[0]
      : null;

  return (
    <main>
      <h1>12Matches</h1>

      <form onSubmit={handleCompare}>
        <section>
          <h2>Your 12 Axes result</h2>

          <label htmlFor="user-axes-url">12 Axes result URL</label>

          <input
            id="user-axes-url"
            type="url"
            value={userUrl}
            onChange={(event) => setUserUrl(event.target.value)}
            placeholder="Paste your 12 Axes result URL"
            required
          />
        </section>

        <section>
          <h2>Other person's result</h2>

          <label htmlFor="target-axes-url">12 Axes result URL</label>

          <input
            id="target-axes-url"
            type="url"
            value={targetUrl}
            onChange={(event) => setTargetUrl(event.target.value)}
            placeholder="Paste their 12 Axes result URL"
            required
          />
        </section>

        <button type="submit">Compare</button>
      </form>

      {error && <p role="alert">{error}</p>}

      {comparison && compatibility !== null && (
        <section className="comparison-results">
          <div className="compatibility">
            <h2>Compatibility</h2>
            <div className="compatibility-score">
              {compatibility.toFixed(1)}%
            </div>
          </div>

          <div className="axis-comparison">
            <div className="comparison-header">
              <h2>Axis comparison</h2>

              <div className="legend">
                <span>
                  <span className="legend-marker legend-user" />
                  You
                </span>

                <span>
                  <span className="legend-marker legend-target" />
                  Other
                </span>
              </div>
            </div>

            {comparison.map((axis) => (
              <div className="axis-row" key={axis.key}>
                <div className="axis-title">
                  <strong>{axis.label}</strong>
                </div>

                <AxisBar
                  userValue={axis.userValue}
                  targetValue={axis.targetValue}
                  lowLabel={axis.lowLabel}
                  highLabel={axis.highLabel}
                />

                <div className="axis-difference">
                  Δ {axis.difference.toFixed(1)}
                </div>
              </div>
            ))}
          </div>

          {mostSimilar && leastSimilar && (
            <section className="similarity-highlights">
              <h2>Similarity highlights</h2>

              <p>
                Most similar: <strong>{mostSimilar.label}</strong> (
                {mostSimilar.difference.toFixed(1)} point difference)
              </p>

              <p>
                Least similar: <strong>{leastSimilar.label}</strong> (
                {leastSimilar.difference.toFixed(1)} point difference)
              </p>
            </section>
          )}
        </section>
      )}
    </main>
  );
}

export default ProfileComparison;

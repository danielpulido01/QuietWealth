import { Surface } from "../atoms/Surface";

type MetricCardProps = {
  title: string;
  value: string;
  note: string;
  accent: "primary" | "success" | "info" | "warning";
};

export function MetricCard({ title, value, note, accent }: MetricCardProps) {
  return (
    <Surface className={`metric-card metric-card--${accent}`}>
      <p className="metric-card__title">{title}</p>
      <strong className="metric-card__value">{value}</strong>
      <p className="metric-card__note">{note}</p>
    </Surface>
  );
}

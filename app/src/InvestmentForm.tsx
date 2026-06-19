import { useEffect, useState } from "react";
import axios from "axios";
type S = { id: string; name: string; sector: string; averageRoi: number };
const api = axios.create({ baseURL: "http://localhost:5147" });
export function InvestmentForm({ id }: { id: string }) {
  const [x, setX] = useState<S>();
  const [a, setA] = useState("");
  const [i, setI] = useState("");
  const [p, setP] = useState("");
  const [l, setL] = useState(false);
  const [r, setR] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    api.get("/api/marketplace/" + id).then((q) => setX(q.data));
  }, [id]);
  if (!x) return <main>Cargando…</main>;
  if (done)
    return (
      <main className="investment-page">
        <section className="investment-success">
          <small>SOLICITUD REGISTRADA</small>
          <h1>Inversión simulada registrada</h1>
          <p>
            Tu solicitud para {x.name} fue registrada. No se realizó ningún pago ni transferencia.
          </p>
          <button onClick={() => (location.hash = "/marketplace")}>Volver al marketplace</button>
        </section>
      </main>
    );
  const valid = Number(a) >= 500 && i && p && l && r;
  return (
    <main className="investment-page">
      <button onClick={() => (location.hash = "/marketplace/" + id)}>
        ← Volver a la ficha de empresa
      </button>
      <h1>Realizar inversión</h1>
      <p>Define el monto, instrumento y método para completar tu solicitud.</p>
      <section className="company-summary">
        <div>
          <small>EMPRESA</small>
          <h2>{x.name}</h2>
          <p>{x.sector} · Perfil certificado</p>
        </div>
        <span>ROI esperado {x.averageRoi}% anual</span>
      </section>
      <section className="investment-card">
        <label>
          Monto a invertir * <small>(mínimo $500)</small>
        </label>
        <div className="amount-input">
          $<input type="number" placeholder="0" value={a} onChange={(e) => setA(e.target.value)} />
        </div>
        <div className="amount-pills">
          {[5000, 10000, 25000, 50000, 100000].map((n) => (
            <button key={n} onClick={() => setA(String(n))}>
              ${n.toLocaleString()}
            </button>
          ))}
        </div>
      </section>
      <Choice
        title="Instrumento de inversión"
        value={i}
        set={setI}
        options={[
          "Participación accionaria|Acciones con derechos de voto.",
          "Nota convertible|Deuda convertible en la siguiente ronda.",
          "Participación en ingresos|Retorno proporcional a ingresos mensuales.",
        ]}
      />
      <Choice
        title="Método de pago"
        value={p}
        set={setP}
        options={[
          "Transferencia bancaria|1–2 días hábiles",
          "SWIFT internacional|3–5 días hábiles",
          "USDC / stablecoin|Inmediato en red",
        ]}
      />
      <section className="investment-card legal">
        <h3>Confirmaciones legales</h3>
        <label>
          <input type="checkbox" checked={l} onChange={(e) => setL(e.target.checked)} /> Acepto los
          términos y condiciones de inversión.
        </label>
        <label>
          <input type="checkbox" checked={r} onChange={(e) => setR(e.target.checked)} /> Entiendo el
          riesgo de pérdida parcial o total.
        </label>
      </section>
      <button className="confirm-investment" disabled={!valid} onClick={() => setDone(true)}>
        Confirmar inversión
      </button>
      <p className="investment-note">Operación simulada para MVP local. No se procesan pagos.</p>
    </main>
  );
}
function Choice({
  title,
  value,
  set,
  options,
}: {
  title: string;
  value: string;
  set: (x: string) => void;
  options: string[];
}) {
  return (
    <section className="investment-card choice">
      <h3>{title} *</h3>
      {options.map((o) => {
        const [n, d] = o.split("|");
        return (
          <button className={value === n ? "chosen" : ""} key={n} onClick={() => set(n)}>
            <span>
              <strong>{n}</strong>
              <small>{d}</small>
            </span>
            <i />
          </button>
        );
      })}
    </section>
  );
}

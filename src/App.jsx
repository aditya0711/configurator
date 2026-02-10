import React, { useMemo, useState } from "react";

const PRODUCTS = [
  { id: "bag", label: "Paper Bag" },
  { id: "box", label: "Box" },
];

const SIZE_OPTIONS = [
  {
    id: "compact",
    label: "Compact",
    dims: "18 x 12 x 8",
    fits: ["2 candles", "4 cosmetics", "6 cookies"],
  },
  {
    id: "medium",
    label: "Medium",
    dims: "26 x 18 x 12",
    fits: ["1 hoodie", "12 chocolates", "2 jars"],
  },
  {
    id: "large",
    label: "Large",
    dims: "34 x 24 x 16",
    fits: ["2 shoe boxes", "wine set", "gift bundle"],
  },
];

const PRINT_OPTIONS = [
  { id: "outside", label: "Outside only" },
  { id: "inside", label: "Inside only" },
  { id: "both", label: "Inside + outside" },
];

const FINISH_OPTIONS = {
  bag: [
    { id: "kraft", label: "Kraft + matte" },
    { id: "laminated", label: "Laminated" },
    { id: "textured", label: "Textured paper" },
  ],
  box: [
    { id: "corrugated", label: "Corrugated" },
    { id: "monocarton", label: "Monocarton" },
    { id: "rigid", label: "Rigid" },
  ],
};

export default function App() {
  const [productId, setProductId] = useState("box");
  const [sizeSelections, setSizeSelections] = useState(["medium"]);
  const [printId, setPrintId] = useState("outside");
  const [finishId, setFinishId] = useState("corrugated");

  const finishOptions = FINISH_OPTIONS[productId];

  const toggleSize = (sizeId) => {
    setSizeSelections((prev) =>
      prev.includes(sizeId)
        ? prev.filter((item) => item !== sizeId)
        : [...prev, sizeId]
    );
  };

  const activeSizes = useMemo(
    () => SIZE_OPTIONS.filter((size) => sizeSelections.includes(size.id)),
    [sizeSelections]
  );

  const previewLayers = useMemo(() => {
    if (productId === "bag") {
      return ["Handle", "Front panel", "Side gusset", "Base fold"];
    }
    return ["Lid", "Side wall", "Base tray", "Insert"];
  }, [productId]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">PackDit Visual Configurator (POC)</p>
          <h1>Pack confidence without 3D</h1>
          <p className="subtext">
            A stepwise 2D configurator that shows what fits, prints, and finishes.
          </p>
        </div>
        <div className="step-indicator">
          <span className="step active">1</span>
          <span className="step">2</span>
          <span className="step">3</span>
          <span className="step">4</span>
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <div className="section">
            <h2>1. Select your product</h2>
            <div className="options">
              {PRODUCTS.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={`option ${productId === product.id ? "active" : ""}`}
                  onClick={() => {
                    setProductId(product.id);
                    setFinishId(FINISH_OPTIONS[product.id][0].id);
                  }}
                >
                  <div className="option-title">{product.label}</div>
                  <div className="option-subtext">
                    {product.id === "bag"
                      ? "Retail, cafes, boutiques"
                      : "E-comm, gifting, premium"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>2. Select sizes that fit</h2>
            <p className="hint">Medium is pre-selected. Multi-select to compare.</p>
            <div className="options">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  className={`option ${
                    sizeSelections.includes(size.id) ? "active" : ""
                  }`}
                  onClick={() => toggleSize(size.id)}
                >
                  <div className="option-title">{size.label}</div>
                  <div className="option-subtext">{size.dims} cm</div>
                </button>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>3. Printing coverage</h2>
            <div className="options">
              {PRINT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`option ${printId === option.id ? "active" : ""}`}
                  onClick={() => setPrintId(option.id)}
                >
                  <div className="option-title">{option.label}</div>
                  <div className="option-subtext">
                    {option.id === "both"
                      ? "Full brand immersion"
                      : "Cost-efficient"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>4. Quality & finish</h2>
            <div className="options">
              {finishOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`option ${finishId === option.id ? "active" : ""}`}
                  onClick={() => setFinishId(option.id)}
                >
                  <div className="option-title">{option.label}</div>
                  <div className="option-subtext">
                    {productId === "bag"
                      ? "Paper weight + coating"
                      : "Board construction"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="preview">
          <div className="preview-card">
            <div className="preview-header">
              <div>
                <p className="preview-kicker">Live 2D preview</p>
                <h3>{productId === "bag" ? "Paper Bag" : "Box"}</h3>
                <p className="preview-subtext">
                  {printId === "both"
                    ? "Inside + outside print visible"
                    : "Single-surface print"}
                </p>
              </div>
              <div className="badge">{finishId}</div>
            </div>

            <div className={`mockup ${productId}`}>
              <div className="mockup-inner">
                {previewLayers.map((layer) => (
                  <span key={layer} className="layer">
                    {layer}
                  </span>
                ))}
              </div>
              <div className="mockup-shadow" />
            </div>

            <div className="size-grid">
              {activeSizes.map((size) => (
                <div key={size.id} className="size-card">
                  <div className="size-title">{size.label}</div>
                  <div className="size-dims">{size.dims} cm</div>
                  <ul>
                    {size.fits.map((fit) => (
                      <li key={fit}>{fit}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="summary">
              <div>
                <div className="summary-label">Summary</div>
                <p>
                  {productId === "bag"
                    ? "Paper bag with reinforced handle and layered gussets."
                    : "Premium box with structured walls and inserts."}
                </p>
              </div>
              <div className="summary-actions">
                <button type="button" className="primary">
                  Get Quote
                </button>
                <button type="button" className="ghost">
                  Download Concept PDF
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

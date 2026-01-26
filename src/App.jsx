import React, { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Edges,
  Html,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const BOX_TYPES = [
  {
    id: "product",
    label: "Product Box",
    description: "cosmetics, electronics, FMCG",
  },
  {
    id: "gift",
    label: "Gift/Luxury Box",
    description: "sweets, festive gifting",
  },
  {
    id: "ship",
    label: "E-commerce/Shipping Box",
    description: "courier-safe",
  },
];

const PRODUCTS = [
  { id: "chocolates", label: "Chocolates (6/12/18 pcs)" },
  { id: "bottle", label: "Cosmetic Bottle" },
  { id: "phone", label: "Mobile Phone" },
  { id: "candle", label: "Candle" },
];

const PRESETS = [
  { label: "Compact", size: [2.4, 1.4, 2.1] },
  { label: "Standard", size: [2.9, 1.7, 2.6] },
  { label: "Premium", size: [3.4, 2.1, 3.1] },
  { label: "Showstopper", size: [3.9, 2.5, 3.6] },
];

const BOX_CUES = {
  product: "Smart retail shelf presence",
  gift: "Insert + premium finish works well",
  ship: "Courier-safe build recommended",
};

const PRODUCT_CUES = {
  chocolates: "Divider tray recommended",
  bottle: "Neck support / snug insert",
  phone: "Top/bottom cushioning + sleeve",
  candle: "Side protection + anti-rattle",
};

const INSERT_HEIGHTS = {
  product: 0.12,
  gift: 0.2,
  ship: 0.28,
};

const MATERIAL_COLORS = {
  product: "#caa37c",
  gift: "#d7b38c",
  ship: "#b98b61",
};

function Chocolates({ innerWidth, innerDepth, baseHeight }) {
  const gap = 0.06;
  const blockSize = 0.32;
  const cols = Math.max(2, Math.floor(innerWidth / (blockSize + gap)));
  const rows = Math.max(2, Math.floor(innerDepth / (blockSize + gap)));
  const gridWidth = cols * blockSize + (cols - 1) * gap;
  const gridDepth = rows * blockSize + (rows - 1) * gap;
  const startX = -gridWidth / 2 + blockSize / 2;
  const startZ = -gridDepth / 2 + blockSize / 2;

  return (
    <group position={[0, baseHeight, 0]}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[innerWidth * 0.9, 0.04, innerDepth * 0.9]} />
        <meshStandardMaterial color="#2f2f3a" />
      </mesh>
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((__, col) => (
          <mesh
            key={`choco-${row}-${col}`}
            position={[
              startX + col * (blockSize + gap),
              0.2,
              startZ + row * (blockSize + gap),
            ]}
          >
            <boxGeometry args={[blockSize, 0.18, blockSize]} />
            <meshStandardMaterial color="#6b3f2a" />
          </mesh>
        ))
      )}
    </group>
  );
}

function Bottle({ baseHeight }) {
  return (
    <group position={[0, baseHeight, 0]}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 1.1, 32]} />
        <meshStandardMaterial color="#4b8bff" />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.25, 24]} />
        <meshStandardMaterial color="#1a1f2e" />
      </mesh>
    </group>
  );
}

function Phone({ baseHeight }) {
  return (
    <group position={[0, baseHeight, 0]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.2, 0.1, 2.2]} />
        <meshStandardMaterial color="#1c1f2b" />
      </mesh>
      <mesh position={[0.6, 0.22, 0.6]}>
        <boxGeometry args={[0.35, 0.08, 0.4]} />
        <meshStandardMaterial color="#5e6475" />
      </mesh>
    </group>
  );
}

function Candle({ baseHeight }) {
  return (
    <group position={[0, baseHeight, 0]}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.7, 32]} />
        <meshStandardMaterial color="#f1d6b8" />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
        <meshStandardMaterial color="#b48d6c" />
      </mesh>
    </group>
  );
}

function InnerContents({ productId, innerWidth, innerDepth, baseHeight }) {
  if (productId === "chocolates") {
    return (
      <Chocolates
        innerWidth={innerWidth}
        innerDepth={innerDepth}
        baseHeight={baseHeight}
      />
    );
  }

  if (productId === "bottle") {
    return <Bottle baseHeight={baseHeight} />;
  }

  if (productId === "phone") {
    return <Phone baseHeight={baseHeight} />;
  }

  return <Candle baseHeight={baseHeight} />;
}

function BoxScene({ boxTypeId, productId, preset, showCutaway }) {
  const [width, height, depth] = preset.size;
  const innerWidth = width * 0.78;
  const innerDepth = depth * 0.78;
  const insertHeight = INSERT_HEIGHTS[boxTypeId];
  const baseHeight = -height / 2 + insertHeight + 0.1;
  const wallThickness = 0.14;

  const sideClipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(-1, 0, 0), width * 0.15),
    [width]
  );
  const topClipPlane = useMemo(
    () =>
      new THREE.Plane(
        new THREE.Vector3(0, 1, 0),
        -(height / 2 - wallThickness)
      ),
    [height, wallThickness]
  );
  const clipPlanes = showCutaway
    ? [topClipPlane, sideClipPlane]
    : [topClipPlane];

  return (
    <group position={[0, 0.1, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2 - 0.05, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#131520" />
      </mesh>

      <RoundedBox args={[width, height, depth]} radius={0.18} smoothness={6}>
        <meshStandardMaterial
          color={MATERIAL_COLORS[boxTypeId]}
          roughness={0.75}
          metalness={0.05}
          clippingPlanes={clipPlanes}
        />
        <Edges color="#7c5c3b" />
      </RoundedBox>

      <RoundedBox
        args={[
          width - wallThickness * 1.6,
          height - wallThickness * 1.6,
          depth - wallThickness * 1.6,
        ]}
        radius={0.14}
        smoothness={6}
      >
        <meshStandardMaterial
          color="#8f6d4b"
          roughness={0.85}
          metalness={0.02}
          side={THREE.BackSide}
          clippingPlanes={clipPlanes}
        />
      </RoundedBox>

      <mesh position={[0, -height / 2 + insertHeight / 2, 0]}>
        <boxGeometry args={[width * 0.92, insertHeight, depth * 0.92]} />
        <meshStandardMaterial color="#2a2f3d" />
      </mesh>

      <InnerContents
        productId={productId}
        innerWidth={innerWidth}
        innerDepth={innerDepth}
        baseHeight={baseHeight}
      />

      <Html position={[0, height / 2 + 0.45, 0]} center>
        <div className="floating-badge">
          {preset.label} · {boxTypeId.toUpperCase()}
        </div>
      </Html>
    </group>
  );
}

export default function App() {
  const [boxTypeId, setBoxTypeId] = useState(BOX_TYPES[0].id);
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [presetIndex, setPresetIndex] = useState(1);
  const [showCutaway, setShowCutaway] = useState(false);

  const preset = PRESETS[presetIndex];

  const handleWheel = (event) => {
    const direction = event.deltaY > 0 ? 1 : -1;
    setPresetIndex((prev) => clamp(prev + direction, 0, PRESETS.length - 1));
  };

  return (
    <div className="app">
      <aside className="panel">
        <div className="panel-header">
          <p className="eyebrow">PackDit Visual Configurator (POC)</p>
          <h1>Dial in the box buyers can trust</h1>
          <p className="subtext">
            Not CAD—just confidence. Adjust size and see what fits in real time.
          </p>
        </div>

        <section className="section">
          <div className="section-title">Box Type</div>
          <div className="tiles">
            {BOX_TYPES.map((item) => (
              <button
                key={item.id}
                className={`tile ${boxTypeId === item.id ? "active" : ""}`}
                onClick={() => setBoxTypeId(item.id)}
                type="button"
              >
                <div className="tile-title">{item.label}</div>
                <div className="tile-desc">{item.description}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-title">What are you packing?</div>
          <div className="tiles">
            {PRODUCTS.map((item) => (
              <button
                key={item.id}
                className={`tile ${productId === item.id ? "active" : ""}`}
                onClick={() => setProductId(item.id)}
                type="button"
              >
                <div className="tile-title">{item.label}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-title">Size Preset</div>
          <input
            className="range"
            type="range"
            min={0}
            max={PRESETS.length - 1}
            value={presetIndex}
            onChange={(event) => setPresetIndex(Number(event.target.value))}
          />
          <div className="pills">
            {PRESETS.map((item, index) => (
              <button
                key={item.label}
                type="button"
                className={`pill ${presetIndex === index ? "active" : ""}`}
                onClick={() => setPresetIndex(index)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="hint">Swipe / scroll over 3D preview too</div>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={showCutaway}
              onChange={(event) => setShowCutaway(event.target.checked)}
            />
            Show cutaway
          </label>
        </section>

        <section className="summary">
          <div className="summary-title">What this size can store (preview)</div>
          <div className="summary-line">
            <span>Box Type</span>
            <strong>{BOX_TYPES.find((item) => item.id === boxTypeId)?.label}</strong>
          </div>
          <div className="summary-line">
            <span>Product</span>
            <strong>{PRODUCTS.find((item) => item.id === productId)?.label}</strong>
          </div>
          <div className="summary-line">
            <span>Preset</span>
            <strong>{preset.label}</strong>
          </div>
          <ul>
            <li>{BOX_CUES[boxTypeId]}</li>
            <li>{PRODUCT_CUES[productId]}</li>
          </ul>
          <div className="summary-actions">
            <button type="button" className="primary">
              Get Quote
            </button>
            <button type="button" className="ghost">
              Download Concept PDF
            </button>
          </div>
          <div className="fineprint">
            *POC uses representative objects for scale. Real mm mapping comes next.
          </div>
        </section>
      </aside>

      <main className="preview" onWheel={handleWheel}>
        <Canvas
          camera={{ position: [4.2, 2.8, 4.2], fov: 45 }}
          gl={{ localClippingEnabled: true }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 6, 4]} intensity={1.1} />
          <BoxScene
            boxTypeId={boxTypeId}
            productId={productId}
            preset={preset}
            showCutaway={showCutaway}
          />
          <OrbitControls enablePan={false} />
          <Environment preset="city" />
        </Canvas>
        <div className="preview-label">3D Preview</div>
      </main>
    </div>
  );
}

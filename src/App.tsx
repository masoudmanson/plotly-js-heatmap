import React, { useState } from "react";
import Plot from "react-plotly.js";
import { createNoise2D } from "simplex-noise";
import { DefaultDropdownMenuOption, Dropdown } from "czifui";
import afterFrame from "afterframe";

import "./App.css";

const SIZES = [
  { name: "100", count: "10" },
  { name: "1,000", count: "33" },
  { name: "10,000", count: "100" },
  { name: "100,000", count: "333" },
  { name: "1,000,000", count: "1000" },
  { name: "4,000,000", count: "2000" },
  { name: "9,000,000", count: "3000" },
  { name: "16,000,000", count: "4000" },
  { name: "25,000,000", count: "5000" },
  { name: "36,000,000", count: "6000" },
];

const TYPES = [
  {
    name: "Sequential",
  },
  {
    name: "Random",
  },
  {
    name: "Perlin noise",
  },
];

const COLORS = [
  { name: "YlOrRd" },
  { name: "YlGnBu" },
  { name: "RdBu" },
  { name: "Portland" },
  { name: "Picnic" },
  { name: "Jet" },
  { name: "Hot" },
  { name: "Greys" },
  { name: "Greens" },
  { name: "Electric" },
  { name: "Earth" },
  { name: "Bluered" },
  { name: "Blackbod" },
];

interface DOWNSAMPLE {
  name: string;
  details: string;
  value: boolean;
}

const DOWNSAMPLING = [
  {
    name: "On",
    details: "Renders on a fixed size heatmap",
  },
  {
    name: "Off",
    details: "At least a 10px wide box for each datapoint.",
  },
];

function measureInteraction() {
  const startTimestamp = performance.now();

  return {
    end() {
      const endTimestamp = performance.now();
      document.getElementById("time")!.innerText = (
        (endTimestamp - startTimestamp) /
        1000
      ).toFixed(3);
    },
  };
}

const App = () => {
  const interaction = measureInteraction();

  afterFrame(() => {
    interaction.end();
  });

  const [size, setSize] = useState(+SIZES[0].count);
  const [type, setType] = useState(TYPES[1].name);
  const [color, setColor] = useState(COLORS[1].name);
  const [downsampling, setDownsampling] = useState(true);

  let xValues = [...Array(size).keys()];
  let yValues = [...Array(size).keys()];
  let zValues: number[][] = [];

  switch (type) {
    case "Sequential":
      for (let i = 0; i < size; i++) {
        zValues[i] = [];
        for (let j = 0; j < size; j++) {
          zValues[i].push(i + j);
        }
      }
      break;
    case "Random":
      for (let i = 0; i < size; i++) {
        zValues[i] = [];
        for (let j = 0; j < size; j++) {
          zValues[i].push(Math.random() * j + Math.random() * i);
        }
      }
      break;

    case "Perlin noise":
    default:
      const noise2D = createNoise2D();
      const noiseSeed = Math.floor(size / 5);

      for (let y = 0; y < size; y++) {
        zValues[y] = [];
        for (let x = 0; x < size; x++) {
          let v = (noise2D(x / noiseSeed, y / noiseSeed) + 1) * 50;
          zValues[y].push(v);
        }
      }
      break;
  }

  const changePlotSize = (s: DefaultDropdownMenuOption | null) => {
    s && setSize(+s.count!);
  };

  const changePlotDataType = (t: DefaultDropdownMenuOption | null) => {
    t && setType(t.name);
  };

  const changePlotColor = (c: DefaultDropdownMenuOption | null) => {
    c && setColor(c.name);
  };

  const changePlotDownsampling = (d: DefaultDropdownMenuOption | null) => {
    d && setDownsampling(d.name === "On" ? true : false);
  };

  return (
    <>
      <div className="controls">
        <Dropdown
          label="Size"
          InputDropdownProps={{
            details: SIZES.find((s) => +s.count === size)!.name,
            sdsStyle: "rounded",
            sdsType: "singleSelect",
          }}
          options={SIZES}
          onChange={changePlotSize}
        />
        <Dropdown
          label="Data"
          InputDropdownProps={{
            details: type,
            sdsStyle: "rounded",
            sdsType: "singleSelect",
          }}
          options={TYPES}
          onChange={changePlotDataType}
        />
        <Dropdown
          label="Downsampling"
          InputDropdownProps={{
            details: downsampling ? "On" : "Off",
            sdsStyle: "rounded",
            sdsType: "singleSelect",
          }}
          options={DOWNSAMPLING}
          onChange={changePlotDownsampling}
        />
        <Dropdown
          label="Color"
          InputDropdownProps={{
            details: color,
            sdsStyle: "rounded",
            sdsType: "singleSelect",
          }}
          options={COLORS}
          onChange={changePlotColor}
        />
      </div>
      <p>
        This component rendered{" "}
        <span className="stats">
          {SIZES.find((s) => +s.count === size)!.name}
        </span>{" "}
        data points in{" "}
        <span className="stats" id="time">
          x
        </span>{" "}
        seconds!
      </p>
      <Plot
        data={[
          {
            type: "heatmap",
            x: xValues,
            y: yValues,
            z: zValues,
            xgap: !downsampling || size < 50 ? 1 : 0,
            ygap: !downsampling || size < 50 ? 1 : 0,
            showscale: true,
            colorscale: color,
          },
        ]}
        layout={{
          annotations: [],
          font: {
            family: "Open sans",
            size: 12,
            color: "#222",
          },
          autosize: false,
          width: !downsampling && size > 90 ? size * 10 : 600,
          height: !downsampling && size > 90 ? size * 10 : 570,
          margin: {
            l: 30,
            r: 50,
            b: 50,
            t: 30,
          },
          xaxis: {
            ticks: "outside",
            showgrid: false,
            zeroline: false,
            dtick: !downsampling ? 5 : "",
            scaleanchor: "y",
          },
          yaxis: {
            ticks: "outside",
            showgrid: false,
            zeroline: false,
            dtick: !downsampling ? 5 : "",
          },
        }}
        config={{
          displayModeBar: false,
        }}
        onClick={(data) => {
          console.debug(data);
        }}
      />
    </>
  );
};

export default App;

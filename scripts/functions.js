var topicOptions = {
  LaserScan: {
    name: "LaserScan",
    function: laserScannerPlot,
    sample: LaserScan_sample,
  },
  PointCloud2: {
    name: "PointCloud2",
    function: pointCloud2Plot,
    sample: PointCloud2_sample,
  },
};

function plotUpdate() {
  console.log("Start");
  var data = window.editor.getValue();
  const regex = /---/;
  // console.log(data[data.length - 1]); //character check https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  // console.log("as" + data.charCodeAt([data.length - 1]));
  if (data.endsWith("\n") | data.endsWith("\r") | data.endsWith("\r\n") | data.endsWith("\n\r")) {
    data = data.slice(0, -2);
  }
  if (data.endsWith(regex.source)) {
    data = data.replace(regex, "");
  }
  try {
    var dataParsed = "";
    dataParsed = jsyaml.load(data);
    toggle_plotcontainer(false);
  } catch (e) {
    Plotly.purge(plotContainer);
    toggle_plotcontainer(true);
    console.error(e);
  }
  if (Object.entries(dataParsed).length > 0) {
    topicOptions[document.getElementById("rosTopicSelector").value].function(dataParsed);
    console.log("End");
  }
}

async function laserScannerPlot(dataParsed) {
  const startAngle = dataParsed.angle_min;
  const incrementAngle = dataParsed.angle_increment;
  const xAxis = dataParsed.ranges.map((element, index) => {
    if (isFinite(element))
      return parseFloat(element) * Math.cos(startAngle + (index + 1) * incrementAngle);
  });

  const yAxis = dataParsed.ranges.map((element, index) => {
    if (isFinite(element))
      return parseFloat(element) * Math.sin(startAngle + (index + 1) * incrementAngle);
  });

  var trace1 = {
    x: xAxis,
    y: yAxis,
    mode: "markers",
    type: "scatter",
  };

  var data = [trace1];

  var layout = {
    yaxis: { scaleanchor: "x", scaleratio: 1 },
    title: {
      text: "Scanner Data",
    },
  };
  var config = { responsive: true };

  Plotly.newPlot("plotContainer", data, layout, config);
}

async function pointCloud2Plot(dataParsed) {
  const uint8Data = new Uint8Array(dataParsed.data);
  const dataView = new DataView(uint8Data.buffer);
  const numPoints = uint8Data.length / dataParsed.point_step;
  const points = [];
  const isLittleEndian = !dataParsed.is_bigendian;
  const DATATYPE_MAPPINGS = {
    1: "int8", // INT8
    2: "uint8", // UINT8
    3: "int16", // INT16
    4: "uint16", // UINT16
    5: "int32", // INT32
    6: "uint32", // UINT32
    7: "float32", // FLOAT32
    8: "float64", // FLOAT64
  };

  const DATATYPE_BYTE_SIZE = {
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 4,
    6: 4,
    7: 4,
    8: 8,
  };

  for (let i = 0; i < numPoints; i++) {
    const pointOffset = i * dataParsed.point_step;
    const point = {};

    for (const field of dataParsed.fields) {
      const fieldOffset = pointOffset + field.offset;
      const dataType = DATATYPE_MAPPINGS[field.datatype];

      let value;
      try {
        switch (dataType) {
          case "float32":
            value = dataView.getFloat32(fieldOffset, isLittleEndian);
            break;
          case "float64":
            value = dataView.getFloat64(fieldOffset, isLittleEndian);
            break;
          case "int8":
            value = dataView.getInt8(fieldOffset);
            break;
          case "uint8":
            value = dataView.getUint8(fieldOffset);
            break;
          case "int16":
            value = dataView.getInt16(fieldOffset, isLittleEndian);
            break;
          case "uint16":
            value = dataView.getUint16(fieldOffset, isLittleEndian);
            break;
          case "int32":
            value = dataView.getInt32(fieldOffset, isLittleEndian);
            break;
          case "uint32":
            value = dataView.getUint32(fieldOffset, isLittleEndian);
            break;
          default:
            console.warn(`Unsupported data type: ${dataType}`);
            value = undefined;
        }
      } catch (e) {
        console.error(
          `Error reading field ${field.name} at offset ${fieldOffset} for point ${i}: ${e.message}`
        );

        value = NaN;
      }
      point[field.name] = value;
    }
    points.push(point);
  }

  const xAxis = [];
  const yAxis = [];
  const zAxis = [];
  const colors = [];
  const intensities = [];

  points.forEach((p) => {
    if (isNaN(p.x) || isNaN(p.y) || isNaN(p.z)) {
      return;
    }

    xAxis.push(p.x);
    yAxis.push(p.y);
    zAxis.push(p.z);
    intensities.push(p.intensity);
    const hue = (p.intensity / 255) * 240; // Map intensity 0-255 to hue 0-240 (blue to red)
    colors.push(`hsl(${hue}, 100%, 50%)`);
  });

  var trace1 = {
    x: xAxis,
    y: yAxis,
    z: zAxis,
    mode: "markers",
    marker: {
      size: 3,
      color: intensities,
      colorscale: "Jet", // or 'Jet', 'Portland', etc.
      cmin: 0,
      cmax: 255,
      showscale: true, // Show the color bar if using colorscale
    },
    type: "scatter3d",
  };

  var data = [trace1];

  var layout = {
    autosize: true,
    title: {
      text: "Pointcloud Data",
    },
    scene: {
      xaxis: { title: "X (Forward)", range: [-20, 20] },
      yaxis: { title: "Y (Left)", range: [-20, 20] },
      zaxis: { title: "Z (Up)", range: [-10, 10] },
      aspectmode: "cube",
    },
    hovermode: "closest",
  };
  var config = { responsive: true };

  Plotly.newPlot("plotContainer", data, layout, config);
}

var editor;

window.addEventListener("load", function () {
  editor = monaco.editor.create(document.getElementById("monacoEditor"), {
    value: Object.values(topicOptions)[0].sample,
    language: "yaml",
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    automaticLayout: true,
    glyphMargin: true,
    theme: "vs-dark",
  });

  var topicSelector = document.getElementById("rosTopicSelector");
  for (var i = 0; i < Object.keys(topicOptions).length; i++) {
    var opt = Object.keys(topicOptions)[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    topicSelector.appendChild(el);
  }

  document.getElementById("rosTopicSelector").value = Object.keys(topicOptions)[0];
  plotUpdate();

  editor.onDidChangeModelContent((e) => {
    plotUpdate();
  });
  document.getElementById("rosTopicSelector").addEventListener("change", function () {
    window.editor.setValue(topicOptions[document.getElementById("rosTopicSelector").value].sample);
  });
});

// UI Functions Start

function fullscreenSidePanel(element) {
  e = document.getElementById("options").classList;
  e.toggle("large");
  e.toggle("max");
  if (element.innerHTML.includes("<i>fullscreen</i>")) {
    element.innerHTML = "<i>fullscreen_exit</i>";
  } else {
    element.innerHTML = "<i>fullscreen</i>";
  }
}

function toggle_plotcontainer(hidePlot = true) {
  var plotContainer_div = document.getElementById("plotContainer");
  var plotContainer_replacement = document.getElementById("plotContainer_replacement");
  if (hidePlot === true) {
    plotContainer_div.style.display = "none";
    plotContainer_replacement.style.display = "block";
  } else {
    plotContainer_div.style.display = "block";
    plotContainer_replacement.style.display = "none";
  }
}

function hidePanel(element) {
  id = element.id.split("_")[0];
  document.getElementById(id).classList.toggle("active");
}

function darkLightThemeUpdate(element) {
  e = document.getElementById("body").classList;
  e.toggle("dark");
  if (element.innerHTML.includes("<i>dark_mode</i>")) {
    monaco.editor.setTheme("vs-light");
    element.innerHTML = "<i>light_mode</i>";
  } else {
    monaco.editor.setTheme("vs-dark");
    element.innerHTML = "<i>dark_mode</i>";
  }
}
// UI Functions End

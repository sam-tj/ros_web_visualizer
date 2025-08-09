var topicOptions = {
  LaserScan: {
    name: "LaserScan",
    function: laserScannerPlot,
    sample_path: "./res/data/laserScan_sample.yaml",
  },
  PointCloud2: {
    name: "PointCloud2",
    function: pointCloud2Plot,
    sample_path: "./res/data/s3dScanner_sample.yaml",
  },
};

async function getYamlData(e) {
  var res = await fetch(e, { mode: "no-cors" });
  data = await res.text();
  return { status: res.ok, data: data };
}

function plotUpdate() {
  console.log("Start");
  var data = window.editor.getValue();
  const regexEndLine = /---/;
  const regexNewLine = /[\n\r]/g;
  data = data.replace(regexNewLine, "\n");
  // console.log(data[data.length - 1]); //character check https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  // console.log("as" + data.charCodeAt([data.length - 1]));
  if (data.endsWith("\n")) {
    data = data.slice(0, -1);
  }
  if (data.endsWith(regexEndLine.source)) {
    data = data.replace(regexEndLine, "");
  }

  try {
    var dataParsed = "";
    dataParsed = jsyaml.load(data);
    toggle_plotcontainer({ hidePlot: false, showHome: false });
  } catch (e) {
    Plotly.purge(plotContainer);
    toggle_plotcontainer({ hidePlot: true, showHome: false });
    console.error(e);
  }
  try {
    if (Object.entries(dataParsed).length > 0) {
      Plotly.purge(plotContainer);
      topicOptions[document.getElementById("rosTopicSelector").value].function(dataParsed);
      blinkButton("sidePanelCLoseButton", 5);
      console.log("End");
    }
  } catch (e) {
    // console.error(e);
    console.log("End Fail");
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
    margin: { l: 0, r: 0, b: 0, t: 30 },
    scene: {
      xaxis: { title: "X (Forward)" },
      yaxis: { title: "Y (Left)" },
      zaxis: { title: "Z (Up)" },
      aspectmode: "auto",
    },
    // hovermode: "closest",
  };
  var config = { responsive: true };

  Plotly.newPlot("plotContainer", data, layout, config);
}

var editor;

window.addEventListener("load", function () {
  editor = monaco.editor.create(document.getElementById("monacoEditor"), {
    value: "",
    language: "yaml",
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    automaticLayout: true,
    glyphMargin: true,
    theme: "vs-dark",
    renderLineHighlight: "none",
  });

  var topicSelector = document.getElementById("rosTopicSelector");
  for (var i = 0; i < Object.keys(topicOptions).length; i++) {
    var opt = Object.keys(topicOptions)[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    topicSelector.appendChild(el);
  }

  editor.onDidChangeModelContent((e) => {
    plotUpdate();
  });
  document.getElementById("rosTopicSelector").addEventListener("change", function () {
    var selectorValue = document.getElementById("rosTopicSelector").value;
    if (selectorValue === "default") {
      window.editor.setValue("");
      toggle_plotcontainer({ hidePlot: true, showHome: true });
    } else {
      (async () => {
        updatedData = await getYamlData(topicOptions[selectorValue].sample_path);
        if (updatedData.status === true) {
          window.editor.setValue(updatedData.data);
        }
      })();
    }
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

function toggle_plotcontainer({ hidePlot = true, showHome = true }) {
  var plotContainer_div = document.getElementById("plotContainer");
  var plotContainer_replacement = document.getElementById("plotContainer_replacement");
  var plotContainer_replacement_H = document.getElementById("plotContainer_replacement_heading");
  var plotContainer_replacement_P = document.getElementById("plotContainer_replacement_text");
  if (hidePlot === true) {
    plotContainer_div.style.display = "none";
    plotContainer_replacement.style.display = "block";
  } else {
    plotContainer_div.style.display = "block";
    plotContainer_replacement.style.display = "none";
  }
  if (showHome === true) {
    plotContainer_replacement_H.innerHTML = "Welcome :)";
    plotContainer_replacement_P.innerHTML =
      "Please select a topic to begin.<br />Use <i>left_panel_open</i> to start.<br /><br />To learn more about the project, tap <i>help</i>.";
  } else {
    plotContainer_replacement_H.innerHTML = "Problem with data :(";
    plotContainer_replacement_P.innerHTML = "Please check the data entered / uploaded.";
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

function blinkButton(element, counter) {
  var blinkCounter = 0;
  var blinkInterval = setInterval(() => {
    blinkCounter += 1;
    this.document.getElementById(element).classList.toggle("tertiary");
    if (blinkCounter > counter) {
      clearInterval(blinkInterval);
    }
  }, 500);
}
// UI Functions End

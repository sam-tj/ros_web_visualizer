var topicOptions = {
  LaserScan: {
    name: "LaserScan",
    function: laserScannerPlot,
    sample_path: "./res/data/laserScan_sample.yaml",
    docs: rosMessageDefinitions["sensor_msgs/LaserScan"],
  },
  PointCloud2: {
    name: "PointCloud2",
    function: pointCloud2Plot,
    sample_path: "./res/data/s3dScanner_sample.yaml",
    docs: rosMessageDefinitions["sensor_msgs/PointCloud2"],
  },
  Image: {
    name: "Image",
    function: imagePlot,
    sample_path: "./res/data/monoImage_sample.yaml",
    docs: rosMessageDefinitions["sensor_msgs/Image"],
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
  // console.log("ASCII: " + data.charCodeAt([data.length - 1]));
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
    clearContainer();
    toggle_plotcontainer({ hidePlot: true, showHome: false });
    console.error(e);
  }
  try {
    if (Object.entries(dataParsed).length > 0) {
      clearContainer();
      topicOptions[document.getElementById("rosTopicSelector").value]
        .function(dataParsed)
        .then((value) => {
          if (value === true) {
            blinkButton("sidePanelCLoseButton", 5);
            console.log("End");
          } else {
            throw new Error("Plot failed");
          }
        });
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
  return true;
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
  const intensities = [];

  points.forEach((p) => {
    if (isNaN(p.x) || isNaN(p.y) || isNaN(p.z)) {
      return;
    }

    xAxis.push(p.x);
    yAxis.push(p.y);
    zAxis.push(p.z);
    intensities.push(p.intensity);
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

      showscale: true,
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
  };
  var config = { responsive: true };

  Plotly.newPlot("plotContainer", data, layout, config);
  return true;
}
async function imagePlot(dataParsed) {
  let ret = false;
  const containerDiv = document.getElementById("plotContainer");
  const newCanvas = document.createElement("canvas");
  newCanvas.id = "plotContainerCanvas";
  newCanvas.classList.add("absolute", "center", "middle");
  containerDiv.appendChild(newCanvas);

  let inputMat, outputMat;

  try {
    switch (dataParsed.encoding) {
      case "mono8":
      case "rgb8":
      case "bgr8":
        cvType = dataParsed.encoding === "mono8" ? cv.CV_8UC1 : cv.CV_8UC3;
        typedArray = new Uint8Array(dataParsed.data);
        break;
      case "rgba8":
      case "bgra8":
        cvType = cv.CV_8UC4;
        typedArray = new Uint8Array(dataParsed.data);
        break;
      case "16UC1":
        cvType = cv.CV_16UC1;
        const uint16Mat = new Uint16Array(dataParsed.data);
        inputMat = new cv.Mat(dataParsed.height, dataParsed.width, cv.CV_16UC1);
        inputMat.data.set(uint16Mat);
        break;
      case "32FC1":
        cvType = cv.CV_32FC1;
        const float32Mat = new Float32Array(dataParsed.data);
        inputMat = new cv.Mat(dataParsed.height, dataParsed.width, cv.CV_32FC1);
        inputMat.data.set(float32Mat);
        break;
      default:
        console.warn(`Unsupported ROS image encoding: ${dataParsed.encoding}`);
    }
    if (!(dataParsed.encoding === "16UC1" || dataParsed.encoding === "32FC1")) {
      inputMat = cv.matFromArray(dataParsed.height, dataParsed.width, cvType, typedArray);
    }
    outputMat = new cv.Mat();

    // Handle specific conversions based on encoding
    if (dataParsed.encoding === "16UC1" || dataParsed.encoding === "32FC1") {
      let convertedMat = new cv.Mat();
      cv.normalize(inputMat, convertedMat, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);
      cv.cvtColor(convertedMat, outputMat, cv.COLOR_GRAY2RGBA);
      convertedMat.delete();
    } else if (dataParsed.encoding === "mono8") {
      cv.cvtColor(inputMat, outputMat, cv.COLOR_GRAY2RGBA);
    } else if (dataParsed.encoding === "rgb8") {
      cv.cvtColor(inputMat, outputMat, cv.COLOR_RGB2RGBA);
    } else if (dataParsed.encoding === "bgr8") {
      cv.cvtColor(inputMat, outputMat, cv.COLOR_BGR2RGBA);
    } else {
      // Already RGBA or BGRA
      outputMat = inputMat;
    }

    cv.imshow(newCanvas, outputMat);
    ret = true;
  } catch (e) {
    console.error("Error processing image with OpenCV.js:", e);
    ret = false;
  } finally {
    // Clean up the allocated memory
    if (inputMat) inputMat.delete();
    if (outputMat && outputMat !== inputMat) outputMat.delete();
  }
  return ret;
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
      document.getElementById("fileUpload_input").disabled = true;
      toggle_plotcontainer({ hidePlot: true, showHome: true });
      document.getElementById("msgInfoPanel_div").innerHTML = "";
    } else {
      (async () => {
        updatedData = await getYamlData(topicOptions[selectorValue].sample_path);
        updateMsgInfoPanel(topicOptions[selectorValue].docs);
        if (updatedData.status === true) {
          window.editor.setValue(updatedData.data);
          document.getElementById("fileUpload_input").disabled = false;
        }
      })();
    }
  });
  document.getElementById("fileUpload_input").addEventListener("change", readUploadedFile);
});

function readUploadedFile(e) {
  const fileUpload = document.getElementById("fileUpload_input");
  const file = fileUpload.files[0];
  const reader = new FileReader();
  reader.addEventListener(
    "load",
    () => {
      window.editor.setValue(reader.result);
    },
    false
  );

  if (file) {
    reader.readAsText(file);
  }
}

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

function clearContainer() {
  Plotly.purge(plotContainer);
  const canvasToRemove = document.getElementById("plotContainerCanvas");
  if (canvasToRemove) {
    canvasToRemove.parentNode.removeChild(canvasToRemove);
  }
}

function updateMsgInfoPanel(messageDetails) {
  const infoDisplay = document.getElementById("msgInfoPanel_div");
  let htmlContent = `
  <article>
    <div><h6 class="wordWrap">${messageDetails.messageType}</h6></div>
    <p class="wordWrap medium-text">${messageDetails.description}</p>
    <p class="bold">Fields:</p>
    <hr />
    <div class="responsive">
      <ul class="list border">
  `;

  messageDetails.fields.forEach((field) => {
    htmlContent += `
    <li>
      <button class="circle">${field.type.charAt(0)}</button>
      <div class="max">
        <p class="large-text">${field.name}</p>
        <p class="italic no-margin">${field.type}</p>
        <p class="wordWrap small-text">${field.description}</p>
      </div>
    </li>
  `;
  });

  htmlContent += `
      </ul>
    </div>
  </article>
  `;
  infoDisplay.innerHTML = htmlContent;
}
// UI Functions End

var Module = {
  // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
  onRuntimeInitialized() {
    console.log("Ready.");
  },
};

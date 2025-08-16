const rosMessageUiPanels = {
  initialPoseSetting: `
  <h6>Initial Pose Setting - Coming Soon!</h6>
  <p>Use this to define the robot's starting position.</p><br />
  <button>Set Pose</button>
  `,
  plotUIControl3D: `
  <h6>Plot UI Control</h6>
  <div>
    <p class="wordWrap medium-text bold">Plot View</p>
    <div class="field middle-align">
      <nav>
        <div class="max">
          <p class="wordWrap medium-text">Show Grid</p>
        </div>
        <label class="switch">
          <input type="checkbox" id="toggleGrid" onchange="toggleGrid(this.checked)" checked />
          <span></span>
        </label>
      </nav>
    </div>
    <div class="field middle-align">
      <nav>
        <div class="max">
          <p class="wordWrap medium-text">Show Axe</p>
        </div>
        <label class="switch">
          <input type="checkbox" id="toggleAxes" onchange="toggleAxes(this.checked)" checked />
          <span></span>
        </label>
      </nav>
    </div>
  </div>
  <hr />
  <div>
    <p class="wordWrap medium-text bold">Point Controls</p>
    <div class="field middle-align">
      <nav>
        <div class="max">
          <p class="wordWrap medium-text">Point Size</p>
        </div>
        <div class="max"></div>
        <label class="slider">
          <input id="pointSize3D_input" type="range" min="1" max="15" onchange="setPointSize(this.value)" />
          <span></span>
          <div class="tooltip"></div>
        </label>
      </nav>
    </div>
  </div>
  <hr />
  <div>
    <p class="wordWrap medium-text bold">Color Controls</p>
    <div class="field middle-align">
      <nav>
        <div class="max">
          <p class="wordWrap medium-text">Color Scheme</p>
        </div>
        <div class="max"></div>
        <div class="field suffix round small border">
          <select onchange="setColorByAttribute(this.value)">
            <option value="Jet">Jet</option>
            <option value="Hot">Hot</option>
            <option value="Rainbow">Rainbow</option>
            <option value="Blues">Blues</option>
            <option value="Portland">Portland</option>
          </select>
          <i>arrow_drop_down</i><br />
        </div>
      </nav>
    </div>
    <div class="field middle-align">
      <nav>
        <div class="max">
          <p class="wordWrap medium-text">Show Scale</p>
        </div>
        <label class="switch">
          <input
            type="checkbox"
            id="toggleColorScale"
            onchange="toggleColorScale(this.checked)"
            checked
          />
          <span></span>
        </label>
      </nav>
    </div>
  </div>
  `,
  scanFilter3D: `
  <h6>Scan Filter</h6>
  <div>
    <p class="wordWrap medium-text bold">Range Selection</p>
    <div class="field middle-align">
      <nav>
        <div class="max">
          <p class="wordWrap medium-text">Max Range (m)</p>
        </div>
        <div class="max"></div>
        <label class="slider">
          <input id="scanFilterMaxRange3D_input" type="range" value="10" min="0" step="0.1" onchange="applyPointCloudFilter({ maxRange: parseFloat(this.value) })" />
          <span></span>
          <div class="tooltip"></div>
        </label>
      </nav>
    </div>
    <div class="field middle-align">
      <nav>
        <div class="max">
          <p class="wordWrap medium-text">Min Intensity</p>
        </div>
        <div class="max"></div>
        <label class="slider">
          <input id="scanFilterMinIntensity3D_input" type="range" value="0" min="0" max="255" step="1" onchange="applyPointCloudFilter({ minIntensity: parseFloat(this.value) })" />
          <span></span>
          <div class="tooltip"></div>
        </label>
      </nav>
    </div>
  </div>
  `,
  scanFilter2D: `
  <h6>Scan Filter</h6>
  <div>
    <p class="wordWrap medium-text bold">Range Selection</p>
    <div class="field middle-align">
      <nav>
        <div class="max">
          <p class="wordWrap medium-text">Max Range</p>
        </div>
        <div class="max"></div>
        <label class="slider">
          <input id="scanFilterMaxRange2D_input" type="range" value="10" min="0" step="0.1" onchange="applyScanFilter()" />
          <span></span>
          <div class="tooltip"></div>
        </label>
      </nav>
    </div>
    <div class="field middle-align">
      <nav>
        <div class="max">
          <p class="wordWrap medium-text">Min Angle</p>
        </div>
        <div class="max"></div>
        <label class="slider">
          <input id="scanFilterMinAngle2D_input" type="range" value="-3.14" min="-3.14" max="3.14" step="0.01" onchange="applyScanFilter()" />
          <span></span>
          <div class="tooltip"></div>
        </label>
      </nav>
    </div>
  </div>
  `,
  plotUIControl2D: `
  <h6>Plot UI Control</h6>
  <div>
    <p class="wordWrap medium-text bold">Point Controls</p>
    <div class="field middle-align">
      <nav>
        <div class="max">
          <p class="wordWrap medium-text">Point Size</p>
        </div>
        <div class="max"></div>
        <label class="slider">
          <input id="pointSize2D_input" type="range" min="1" max="15" onchange="setPointSize(this.value)" />
          <span></span>
          <div class="tooltip"></div>
        </label>
      </nav>
    </div>
  </div>
  `,
};
function setPointSize(newSize) {
  const update = { "marker.size": newSize };
  Plotly.restyle("plotContainer", update);
}

function toggleColorScale(show) {
  const update = {
    "marker.showscale": show,
  };
  Plotly.restyle("plotContainer", update);
}

function setColorByAttribute(colorScheme) {
  console.log(colorScheme);
  const update = {
    // "marker.color": colorArray,
    "marker.showscale": true,
    "marker.colorscale": colorScheme,
  };
  Plotly.restyle("plotContainer", update);
}
function toggleGrid(show) {
  const update = {
    "scene.xaxis.showgrid": show,
    "scene.yaxis.showgrid": show,
    "scene.zaxis.showgrid": show,
  };
  Plotly.relayout("plotContainer", update);
}

function toggleAxes(show) {
  const update = {
    "scene.xaxis.visible": show,
    "scene.yaxis.visible": show,
    "scene.zaxis.visible": show,
  };
  Plotly.relayout("plotContainer", update);
}

function getMaxRangeFromData(data) {
  if (!data) {
    return 0;
  }

  // Case 1: LaserScan
  if (data.ranges && Array.isArray(data.ranges)) {
    // Filter out non-finite values and find the max
    const finiteRanges = data.ranges.filter((value) => isFinite(value));
    if (finiteRanges.length === 0) {
      return 0;
    }
    return Math.ceil(Math.max(...finiteRanges));
  }

  // Case 2: PointCloud2
  else if (data.x && data.y && data.z && Array.isArray(data.x)) {
    // Map x,y,z coordinates to their Euclidean distance, then find the max
    const distances = data.x.map((x, i) => {
      const y = data.y[i];
      const z = data.z[i];
      return Math.sqrt(x * x + y * y + z * z);
    });
    if (distances.length === 0) {
      return 0;
    }
    return Math.ceil(Math.max(...distances));
  }

  return 0;
}

function applyScanFilter() {
  if (!currentScanData) {
    console.error("No laser scan data available to filter.");
    return;
  }

  const minAngle = parseFloat(document.getElementById("scanFilterMinAngle2D_input").value);
  const maxRange = parseFloat(document.getElementById("scanFilterMaxRange2D_input").value);

  const filteredX = [];
  const filteredY = [];

  for (let i = 0; i < currentScanData.x.length; i++) {
    const x = currentScanData.x[i];
    const y = currentScanData.y[i];

    if (x !== null && y !== null) {
      const range = Math.sqrt(x * x + y * y);
      const angle = Math.atan2(y, x);

      if (range <= maxRange && angle >= minAngle) {
        filteredX.push(x);
        filteredY.push(y);
      } else {
        filteredX.push(null);
        filteredY.push(null);
      }
    } else {
      filteredX.push(null);
      filteredY.push(null);
    }
  }

  const update = {
    x: [filteredX],
    y: [filteredY],
  };

  Plotly.restyle("plotContainer", update);
}

function applyPointCloudFilter(options = {}) {
  if (!currentScanData || !currentScanData.x) {
    console.error("No point cloud data available to filter.");
    return;
  }

  const { x, y, z, intensities } = currentScanData;

  const filteredX = [];
  const filteredY = [];
  const filteredZ = [];

  for (let i = 0; i < x.length; i++) {
    const pointX = x[i];
    const pointY = y[i];
    const pointZ = z[i];
    const pointIntensity = intensities ? intensities[i] : null;

    // Start with the assumption that the point is valid
    let isValid = true;

    // Apply maxRange filter if the option is provided
    if (options.maxRange !== undefined) {
      const range = Math.sqrt(pointX ** 2 + pointY ** 2 + pointZ ** 2);
      if (range > options.maxRange) {
        isValid = false;
      }
    }

    // Apply minIntensity filter if the option is provided
    //
    // The function effectively cleans your point cloud by removing data from surfaces
    // that are not very reflective, such as dark materials or objects where the laser
    // signal was weak.
    //
    if (options.minIntensity !== undefined && pointIntensity !== null) {
      if (pointIntensity < options.minIntensity) {
        isValid = false;
      }
    }

    if (isValid) {
      filteredX.push(pointX);
      filteredY.push(pointY);
      filteredZ.push(pointZ);
    } else {
      filteredX.push(null);
      filteredY.push(null);
      filteredZ.push(null);
    }
  }

  Plotly.restyle("plotContainer", {
    x: [filteredX],
    y: [filteredY],
    z: [filteredZ],
  });
}

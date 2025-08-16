const rosMessageUiPanels = {
  initialPoseSetting: `
  <h6>Initial Pose Setting - Coming Soon!</h6>
  <p>Use this to define the robot's starting position.</p><br />
  <button>Set Pose</button>
  `,
  plotUIControl: `
  <h6>Plot UI Control - Coming Soon!</h6>
  <label><input type="checkbox"> Show Grid</label><br />
  <label><input type="checkbox"> Show Axes</label>
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

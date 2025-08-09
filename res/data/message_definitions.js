const rosMessageDefinitions = {
  "sensor_msgs/Image": {
    messageType: "sensor_msgs/Image",
    description: "This message contains an uncompressed image.",
    fields: [
      {
        type: "std_msgs/Header",
        name: "header",
        description:
          "Header timestamp should be acquisition time of image, Header frame_id should be optical frame of camera.",
      },
      {
        type: "uint32",
        name: "height",
        description: "Image height, that is, number of rows.",
      },
      {
        // <-- This is the corrected object
        type: "uint32",
        name: "width",
        description: "Image width, that is, number of columns.",
      },
      {
        type: "string",
        name: "encoding",
        description: "Encoding of pixels -- channel meaning, ordering, size.",
      },
      {
        type: "uint8",
        name: "is_bigendian",
        description: "Is this data bigendian?",
      },
      {
        type: "uint32",
        name: "step",
        description: "Full row length in bytes.",
      },
      {
        type: "uint8[]",
        name: "data",
        description: "Actual matrix data, size is (step * rows).",
      },
    ],
  },
  "sensor_msgs/LaserScan": {
    messageType: "sensor_msgs/LaserScan",
    description: "Represents a single scan from a 2D laser scanner.",
    fields: [
      {
        type: "std_msgs/Header",
        name: "header",
        description: "Header timestamp should be scan acquisition time.",
      },
      {
        type: "float32",
        name: "angle_min",
        description: "Start angle of the scan in radians.",
      },
      {
        type: "float32",
        name: "angle_max",
        description: "End angle of the scan in radians.",
      },
      {
        type: "float32",
        name: "range_min",
        description: "Minimum valid range value.",
      },
      {
        type: "float32[]",
        name: "ranges",
        description: "Array of laser range measurements.",
      },
      {
        type: "float32[]",
        name: "intensities",
        description: "Optional array of intensity values.",
      },
    ],
  },
  "sensor_msgs/PointCloud2": {
    messageType: "sensor_msgs/PointCloud2",
    description: "A collection of N-dimensional points, stored as a binary blob.",
    fields: [
      {
        type: "std_msgs/Header",
        name: "header",
        description: "Header timestamp is the acquisition time.",
      },
      {
        type: "uint32",
        name: "height",
        description: "2D structure of the point cloud (height=1 for an unordered cloud).",
      },
      {
        type: "uint32",
        name: "width",
        description: "2D structure of the point cloud (width=length for an unordered cloud).",
      },
      {
        type: "sensor_msgs/PointField[]",
        name: "fields",
        description: "Describes the channels and their layout in the binary data blob.",
      },
      {
        type: "bool",
        name: "is_bigendian",
        description: "Is the data big-endian?",
      },
      {
        type: "uint32",
        name: "point_step",
        description: "Length of a point in bytes.",
      },
      {
        type: "uint32",
        name: "row_step",
        description: "Length of a row in bytes (row_step = point_step * width).",
      },
      {
        type: "uint8[]",
        name: "data",
        description: "The actual point data.",
      },
      {
        type: "bool",
        name: "is_dense",
        description: "True if there are no invalid points.",
      },
    ],
  },
};

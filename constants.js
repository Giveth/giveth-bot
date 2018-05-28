// Allowed users that can dish out points
// module.exports.userList = [
// ]

// Allowed point types
module.exports.point_types = [
  "GOV",
  "DAPP",
  "SC",
  "COMM",
  "UNICORN",
];

module.exports.domains = [
  "matrix.org",
  "status.im",
  "giveth.io",
  "gitter.im",
];

module.exports.max_points = 10000;

module.exports.sheet_id = process.env.NODE_ENV == "production" ? "12cblUYuYq4NwZX7JdRo0-NWnrOxlDy-XCbvF3ugzb2c" : "10sU4UNlCq8fZ3f4zouoq945zTScw27uUV1LU0siA1YA/edit#gid=0";
module.exports.sheet_tab_name = "PointsBot (DONT RENAME!)!A1:F1";

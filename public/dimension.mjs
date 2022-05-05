const width = 640
const height = 480
const border = 10
const title = 40


const dimension = {
  width: width,
  height: height,
  playableAreaX: width - 2 * border,
  playableAreaY : height - 2 * border - title,
  minX: border,
  minY: border + title,
  maxX: width - border,
  maxY: height - border
}

export {
  dimension
}
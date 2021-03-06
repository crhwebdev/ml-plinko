const outputs = [];
const predictionPoint = 300;

function onScoreUpdate(dropPosition, bounciness, size, bucketLabel) {
  outputs.push([dropPosition, bounciness, size, bucketLabel]);
}

function runAnalysis() {
  const testSetSize = 100;
  const k = 10;

  _.range(0, 3).forEach(feature => {
    const data = _.map(outputs, row => [row[feature], _.last(row)]);

    const [testSet, trainingSet] = splitDataset(minMax(data, 1), testSetSize);
    const accuracy = _.chain(testSet)
      .filter(
        testObservation =>
          // call _.initial on testObservation to return everything except last element (i.e. label)
          knn(trainingSet, _.initial(testObservation), k) ===
          _.last(testObservation)
      )
      .size()
      .divide(testSetSize)
      .value();

    console.log(`For feature of ${feature} is ${accuracy}`);
  });
}

function knn(data, point, k) {
  return _.chain(data)
    .map(row => {
      //Note: _.initial returns a new array with all elements except the last
      return [distance(_.initial(row), point), _.last(row)];
    })
    .sortBy(row => row[0])
    .slice(0, k)
    .countBy(row => row[1])
    .toPairs()
    .sortBy(row => row[1])
    .last()
    .first()
    .parseInt()
    .value();
}

// for finding distance for a single feature and prediction point
// function distanceSingle(pointA, pointB) {
//   return Math.abs(pointA - pointB);
// }

// For finding distance beteween more than one feature and prediction point
// use pythagorean theorem to determine distance
// h = (aDiff ** 2 + bDiff ** 2 + cDiff ** 2) ** 0.5  (i.e. square root)
function distance(featuresA, featuresB) {
  return (
    _.chain(featuresA)
      .zip(featuresB)
      .map(([a, b]) => (a - b) ** 2)
      .sum()
      .value() ** 0.5
  );
}

function splitDataset(data, testCount) {
  const shuffled = _.shuffle(data);

  const testSet = _.slice(shuffled, 0, testCount);
  const trainingSet = _.slice(shuffled, testCount);

  return [testSet, trainingSet];
}

function minMax(data, featureCount) {
  const clonedData = _.cloneDeep(data);

  for (let i = 0; i < featureCount; i++) {
    const column = clonedData.map(row => row[i]);
    const min = _.min(column);
    const max = _.max(column);

    for (let j = 0; j < clonedData.length; j++) {
      clonedData[j][i] = (clonedData[j][i] - min) / (max - min);
    }
  }

  return clonedData;
}

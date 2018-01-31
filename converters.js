// Find closest index for a given value
import { Dimensions } from "react-native";

export const DEFAULT_SLIDER_LENGTH = Dimensions.get("window").width - 80;

const closest = (array, n) => {
  return array.findIndex(elem => {
    const itemValue = n.value || n;
    const currentValue = elem.value || elem;
    return itemValue <= currentValue;
  });
};

export function valueToPosition(value, valuesArray, sliderLength) {
  const index = closest(valuesArray, value);

  const arrLength = valuesArray.length - 1;
  const validIndex = index === -1 ? arrLength : index;

  return sliderLength * validIndex / arrLength;
}

export function positionToValue(position, valuesArray, sliderLength) {
  var arrLength;
  var index;

  if (position < 0 || sliderLength < position) {
    return null;
  } else {
    arrLength = valuesArray.length - 1;
    index = arrLength * position / sliderLength;
    return valuesArray[Math.round(index)];
  }
}

export function createArray(start, end, step) {
  var i;
  var length;
  var direction = start - end > 0 ? -1 : 1;
  var result = [];
  if (!step) {
    //console.log('invalid step: ', step);
    return result;
  } else {
    length = Math.abs((start - end) / step) + 1;
    for (i = 0; i < length; i++) {
      result.push(start + i * Math.abs(step) * direction);
    }
    return result;
  }
}

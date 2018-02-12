import React from "react";
import PropTypes from "prop-types";

import {
  View,
  StyleSheet,
  Platform,
  TouchableHighlight,
  Text
} from "react-native";

const getLabelofCurrentValue = (item, val) => {
  const values = item.filter(a => a.value === val)[0];
  return values ? values.label : "";
};

export default class DefaultMarker extends React.Component {
  static propTypes = {
    pressed: PropTypes.bool,
    pressedMarkerStyle: PropTypes.any,
    markerStyle: PropTypes.any,
    enabled: PropTypes.bool,
    valuePrefix: PropTypes.string,
    valueSuffix: PropTypes.string
  };

  render() {
    const { pressed, currentValue, optionsArray } = this.props;
    const currentValueLabel =
      getLabelofCurrentValue(optionsArray, currentValue.value) ||
      currentValue.label;

    const markerLabel = currentValueLabel || currentValue.label;

    return (
      <TouchableHighlight>
        <View
          style={
            this.props.enabled
              ? [
                  styles.markerStyle,
                  this.props.markerStyle,
                  pressed && styles.pressedMarkerStyle,
                  pressed && this.props.pressedMarkerStyle
                ]
              : [styles.markerStyle, styles.disabled]
          }
        >
          <Text numberOfLines={1} style={styles.markerLabel}>
            {markerLabel}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const THUMB_SIZE = 36;

const styles = StyleSheet.create({
  markerStyle: {
    height: THUMB_SIZE,
    // minWidth: THUMB_SIZE,
    // maxWidth: 50,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#0DB7AA",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    justifyContent: "center",
    alignItems: "center",
    shadowRadius: 1,
    shadowOpacity: 0.2,
    paddingHorizontal: 15
  },
  // trackLabels: {
  //   position: 'absolute',
  //   justifyContent: 'space-between',
  //   flexDirection: 'row',
  //   width:
  // },
  markerLabel: {
    fontSize: 14,
    color: "white"
  },
  pressedMarkerStyle: {},
  disabled: {
    backgroundColor: "#d3d3d3"
  }
});

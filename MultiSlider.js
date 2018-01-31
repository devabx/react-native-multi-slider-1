import React from "react";
import PropTypes from "prop-types";

import {
  StyleSheet,
  PanResponder,
  View,
  TouchableHighlight,
  Platform,
  Text
} from "react-native";

import DefaultMarker from "./DefaultMarker";
import {
  DEFAULT_SLIDER_LENGTH,
  createArray,
  valueToPosition,
  positionToValue
} from "./converters";

export default class MultiSlider extends React.Component {
  static defaultProps = {
    values: [0],
    onValuesChangeStart: () => {},
    onValuesChange: values => {},
    onValuesChangeFinish: values => {},
    step: 1,
    min: 0,
    max: 10,
    touchDimensions: {
      height: 50,
      width: 50,
      borderRadius: 15,
      slipDisplacement: 200
    },
    customMarker: DefaultMarker,
    markerOffsetX: 0,
    markerOffsetY: 0,
    sliderLength: DEFAULT_SLIDER_LENGTH,
    onToggleOne: undefined,
    onToggleTwo: undefined,
    enabledOne: true,
    enabledTwo: true,
    allowOverlap: false,
    snapped: false
  };

  constructor(props) {
    super(props);

    this.optionsArray =
      this.props.optionsArray ||
      createArray(this.props.min, this.props.max, this.props.step);
    this.stepLength = this.props.sliderLength / this.optionsArray.length;

    let initialValues = this.props.values.map(value =>
      valueToPosition(value, this.optionsArray, this.props.sliderLength)
    );

    this.state = {
      pressedOne: true,
      valueOne: this.props.values[0],
      valueTwo: this.props.values[1],
      pastOne: initialValues[0],
      pastTwo: initialValues[1],
      positionOne: initialValues[0],
      positionTwo: initialValues[1]
    };
  }

  componentWillMount() {
    let customPanResponder = (start, move, end) => {
      return PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
        onPanResponderGrant: (evt, gestureState) => start(),
        onPanResponderMove: (evt, gestureState) => move(gestureState),
        onPanResponderTerminationRequest: (evt, gestureState) => false,
        onPanResponderRelease: (evt, gestureState) => end(gestureState),
        onPanResponderTerminate: (evt, gestureState) => end(gestureState),
        onShouldBlockNativeResponder: (evt, gestureState) => true
      });
    };

    this._panResponderOne = customPanResponder(
      this.startOne,
      this.moveOne,
      this.endOne
    );
    this._panResponderTwo = customPanResponder(
      this.startTwo,
      this.moveTwo,
      this.endTwo
    );
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.onePressed || this.state.twoPressed) {
      return;
    }

    let nextState = {};
    if (
      nextProps.min !== this.props.min ||
      nextProps.max !== this.props.max ||
      nextProps.values[0] !== this.state.valueOne ||
      nextProps.sliderLength !== this.props.sliderLength ||
      nextProps.values[1] !== this.state.valueTwo ||
      (nextProps.sliderLength !== this.props.sliderLength &&
        nextProps.values[1])
    ) {
      this.optionsArray =
        this.props.optionsArray ||
        createArray(nextProps.min, nextProps.max, nextProps.step);

      this.stepLength = this.props.sliderLength / this.optionsArray.length;

      positionOne = valueToPosition(
        nextProps.values[0],
        this.optionsArray,
        nextProps.sliderLength
      );
      nextState.valueOne = nextProps.values[0];
      nextState.pastOne = positionOne;
      nextState.positionOne = positionOne;

      positionTwo = valueToPosition(
        nextProps.values[1],
        this.optionsArray,
        nextProps.sliderLength
      );
      nextState.valueTwo = nextProps.values[1];
      nextState.pastTwo = positionTwo;
      nextState.positionTwo = positionTwo;
    }

    if (nextState != {}) {
      this.setState(nextState);
    }
  }

  startOne = () => {
    if (this.props.enabledOne) {
      this.props.onValuesChangeStart();
      this.setState({
        onePressed: !this.state.onePressed
      });
    }
  };

  startTwo = () => {
    if (this.props.enabledTwo) {
      this.props.onValuesChangeStart();
      this.setState({
        twoPressed: !this.state.twoPressed
      });
    }
  };

  moveOne = gestureState => {
    if (!this.props.enabledOne) {
      return;
    }

    let unconfined = gestureState.dx + this.state.pastOne;
    let bottom = 0;
    let trueTop =
      this.state.positionTwo - (this.props.allowOverlap ? 0 : this.stepLength);
    let top = trueTop === 0 ? 0 : trueTop || this.props.sliderLength;
    let confined =
      unconfined < bottom ? bottom : unconfined > top ? top : unconfined;
    let slipDisplacement = this.props.touchDimensions.slipDisplacement;

    if (Math.abs(gestureState.dy) < slipDisplacement || !slipDisplacement) {
      let value = positionToValue(
        confined,
        this.optionsArray,
        this.props.sliderLength
      );
      let snapped = valueToPosition(
        value,
        this.optionsArray,
        this.props.sliderLength
      );
      this.setState({
        positionOne: this.props.snapped ? snapped : confined
      });

      if (value !== this.state.valueOne) {
        this.setState(
          {
            valueOne: value
          },
          () => {
            let change = [this.state.valueOne];
            if (this.state.valueTwo) {
              change.push(this.state.valueTwo);
            }
            this.props.onValuesChange(change);
          }
        );
      }
    }
  };

  moveTwo = (gestureState: any) => {
    if (!this.props.enabledTwo) {
      return;
    }

    let unconfined = gestureState.dx + this.state.pastTwo;
    let bottom =
      this.state.positionOne + (this.props.allowOverlap ? 0 : this.stepLength);
    let top = this.props.sliderLength;
    let confined =
      unconfined < bottom ? bottom : unconfined > top ? top : unconfined;
    let slipDisplacement = this.props.touchDimensions.slipDisplacement;

    if (Math.abs(gestureState.dy) < slipDisplacement || !slipDisplacement) {
      let value = positionToValue(
        confined,
        this.optionsArray,
        this.props.sliderLength
      );
      let snapped = valueToPosition(
        value,
        this.optionsArray,
        this.props.sliderLength
      );

      this.setState({
        positionTwo: this.props.snapped ? snapped : confined
      });

      if (value !== this.state.valueTwo) {
        this.setState(
          {
            valueTwo: value
          },
          () => {
            this.props.onValuesChange([
              this.state.valueOne,
              this.state.valueTwo
            ]);
          }
        );
      }
    }
  };

  endOne = gestureState => {
    if (gestureState.moveX === 0 && this.props.onToggleOne) {
      this.props.onToggleOne();
      return;
    }

    this.setState(
      {
        pastOne: this.state.positionOne,
        onePressed: !this.state.onePressed
      },
      () => {
        let change = [this.state.valueOne];
        if (this.state.valueTwo) {
          change.push(this.state.valueTwo);
        }
        this.props.onValuesChangeFinish(change);
      }
    );
  };

  endTwo = gestureState => {
    if (gestureState.moveX === 0 && this.props.onToggleTwo) {
      this.props.onToggleTwo();
      return;
    }

    this.setState(
      {
        twoPressed: !this.state.twoPressed,
        pastTwo: this.state.positionTwo
      },
      () => {
        this.props.onValuesChangeFinish([
          this.state.valueOne,
          this.state.valueTwo
        ]);
      }
    );
  };

  render() {
    const { positionOne, positionTwo } = this.state;
    const {
      selectedStyle,
      unselectedStyle,
      sliderLength,
      markerOffsetX,
      markerOffsetY
    } = this.props;
    const twoMarkers = this.props.values.length == 2; // when allowOverlap, positionTwo could be 0, identified as string '0' and throwing 'RawText 0 needs to be wrapped in <Text>' error

    const trackOneLength = positionOne;
    const trackOneStyle = twoMarkers
      ? unselectedStyle
      : selectedStyle || styles.selectedTrack;
    const trackThreeLength = twoMarkers ? sliderLength - positionTwo : 0;
    const trackThreeStyle = unselectedStyle;
    const trackTwoLength = sliderLength - trackOneLength - trackThreeLength;
    const trackTwoStyle = twoMarkers
      ? selectedStyle || styles.selectedTrack
      : unselectedStyle;
    const Marker = this.props.customMarker;
    const {
      slipDisplacement,
      height,
      width,
      borderRadius
    } = this.props.touchDimensions;
    const touchStyle = {
      borderRadius: borderRadius || 0
    };

    const optionArrayLength = this.props.optionsArray.length - 1;

    const marketOffset = DEFAULT_SLIDER_LENGTH / optionArrayLength;

    const marketOnePosition = trackOneLength + markerOffsetX - 20;

    const markerContainerOne = {
      top: markerOffsetY - 24,
      left: marketOnePosition
      // opacity: 0.5 // for debugging styles.
    };

    const marketTwoPosition = trackThreeLength + markerOffsetX - 20;

    const oppositePosition = marketTwoPosition - marketOnePosition;

    const markerContainerTwo = {
      top: markerOffsetY - 24,
      right: marketTwoPosition, //marketTwoPosition,
      opacity: oppositePosition == DEFAULT_SLIDER_LENGTH ? 0 : 1
    };

    // if (this.props.name) {
    //   console.log(this.props.name + ' 1:', markerContainerOne)
    //   console.log(this.props.name + ' 2:', markerContainerTwo)
    // }

    return (
      <View style={[styles.container, this.props.containerStyle]}>
        <View style={[styles.fullTrack, { width: sliderLength }]}>
          <View
            style={[
              {
                position: "absolute",
                flexDirection: "row",
                width: DEFAULT_SLIDER_LENGTH,
                bottom: 10
              }
            ]}
            renderToHardwareTextureAndroid={true}
          >
            {this.props.optionsArray &&
              this.props.optionsArray.map((item: PickerItem) => {
                return (
                  <View
                    key={item.label}
                    style={{
                      width: DEFAULT_SLIDER_LENGTH / optionArrayLength,
                      textAlign: "left",
                      alignItems: "flex-start"
                    }}
                  >
                    <Text
                      style={{
                        marginLeft: -5
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                );
              })}
          </View>
          <View
            style={[
              styles.track,
              this.props.trackStyle,
              trackOneStyle,
              { width: trackOneLength }
            ]}
          />
          <View
            style={[
              styles.track,
              this.props.trackStyle,
              trackTwoStyle,
              { width: trackTwoLength }
            ]}
          />
          {twoMarkers && (
            <View
              style={[
                styles.track,
                this.props.trackStyle,
                trackThreeStyle,
                { width: trackThreeLength }
              ]}
            />
          )}
          <View
            style={[
              styles.markerContainer,
              markerContainerOne,
              this.props.markerContainerStyle,
              positionOne > sliderLength / 2 && styles.topMarkerContainer
            ]}
          >
            <View
              style={[styles.touch, touchStyle]}
              ref={component => (this._markerOne = component)}
              {...this._panResponderOne.panHandlers}
            >
              <Marker
                enabled={this.props.enabledOne}
                pressed={this.state.onePressed}
                markerStyle={[styles.marker, this.props.markerStyle]}
                pressedMarkerStyle={this.props.pressedMarkerStyle}
                currentValue={this.state.valueOne}
                valuePrefix={this.props.valuePrefix}
                valueSuffix={this.props.valueSuffix}
              />
            </View>
          </View>
          {twoMarkers &&
            positionOne !== this.props.sliderLength && (
              <View
                style={[
                  styles.markerContainer,
                  markerContainerTwo,
                  this.props.markerContainerStyle
                ]}
              >
                <View
                  style={[styles.touch, touchStyle]}
                  ref={component => (this._markerTwo = component)}
                  {...this._panResponderTwo.panHandlers}
                >
                  <Marker
                    pressed={this.state.twoPressed}
                    markerStyle={[this.props.markerStyle]}
                    pressedMarkerStyle={this.props.pressedMarkerStyle}
                    currentValue={this.state.valueTwo}
                    enabled={this.props.enabledTwo}
                    valuePrefix={this.props.valuePrefix}
                    valueSuffix={this.props.valueSuffix}
                  />
                </View>
              </View>
            )}
        </View>
      </View>
    );
  }
}

const THUMB_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  fullTrack: {
    flexDirection: "row"
  },
  track: {
    height: 20,
    borderRadius: 2,
    // backgroundColor: '#A7A7A7',
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    opacity: 0.5,
    bottom: 10
  },
  selectedTrack: {
    backgroundColor: "#0DB7AA"
  },
  markerContainer: {
    position: "absolute",
    // width: 48,
    height: 48,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center"
  },
  topMarkerContainer: {
    zIndex: 1
  },
  touch: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch"
  }
});

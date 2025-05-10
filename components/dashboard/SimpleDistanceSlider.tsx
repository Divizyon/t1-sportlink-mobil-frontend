import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Slider from '@react-native-community/slider';

interface SimpleDistanceSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const SimpleDistanceSlider: React.FC<SimpleDistanceSliderProps> = ({
  value,
  onChange,
  min = 1,
  max = 50,
  step = 1,
}) => {
  // State to track the current value
  const [currentValue, setCurrentValue] = useState(value);
  // Reference to prevent unnecessary updates
  const initialRender = useRef(true);
  // Animation value for feedback
  const animatedValue = useRef(new Animated.Value(1)).current;
  
  // Common distance presets that users might want
  const presets = [1, 5, 10, 20, 50];
  
  // Update internal state if the external value changes
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    setCurrentValue(value);
  }, [value]);
  
  // Animate the value display for feedback
  const animateValue = () => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Handle slider change
  const handleSliderChange = (newValue: number) => {
    // Update the UI immediately
    setCurrentValue(newValue);
  };
  
  // Handle slider completion
  const handleSliderComplete = (newValue: number) => {
    // Notify parent component
    onChange(newValue);
    animateValue();
  };
  
  // Handle preset selection
  const handlePresetPress = (preset: number) => {
    setCurrentValue(preset);
    onChange(preset);
    animateValue();
  };
  
  // Format distance for display
  const formatDistance = (distance: number) => {
    return `${distance} km`;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mesafe</Text>
        <Animated.View style={[
          styles.valueContainer,
          { transform: [{ scale: animatedValue }] }
        ]}>
          <Text style={styles.valueText}>{formatDistance(currentValue)}</Text>
        </Animated.View>
      </View>
      
      {/* Presets for quick selection */}
      <View style={styles.presetsContainer}>
        {presets.map(preset => (
          <TouchableOpacity
            key={preset}
            style={[
              styles.presetButton,
              currentValue === preset && styles.activePresetButton
            ]}
            onPress={() => handlePresetPress(preset)}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.presetText,
                currentValue === preset && styles.activePresetText
              ]}
            >
              {formatDistance(preset)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Simple slider with clear visual feedback */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={currentValue}
          onValueChange={handleSliderChange}
          onSlidingComplete={handleSliderComplete}
          minimumTrackTintColor="#22C55E"
          maximumTrackTintColor="#E2E8F0"
          thumbTintColor="#22C55E"
        />
        
        {/* Visual indicators for min and max */}
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabel}>{formatDistance(min)}</Text>
          <Text style={styles.rangeLabel}>{formatDistance(max)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  valueContainer: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginBottom: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  activePresetButton: {
    backgroundColor: '#22C55E',
  },
  presetText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  activePresetText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sliderContainer: {
    marginTop: 4,
  },
  slider: {
    height: 40,
    marginHorizontal: -8, // Compensate for the thumb radius
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
    paddingHorizontal: 8,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
});

export default SimpleDistanceSlider; 
import React, { useRef, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, FlatList, Dimensions, Platform } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Calendar } from "lucide-react-native";

// Theme colors
const theme = {
  primary: "#22C55E", // Original green color
  primaryLight: "#D1FAE5", // Light green 
  primaryPale: "#ECFDF5", // Pale green 
  background: "#FFFFFF", // Background
  text: "#0F172A", // Main text
  textSecondary: "#64748B", // Secondary text
};

interface DayItem {
  dayName: string;
  dayNumber: number;
  date: Date;
  isToday: boolean;
  isSelected: boolean;
}

interface DateSelectorProps {
  currentDay: number;
  currentMonth: string;
  days: DayItem[];
  onDateSelect: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  currentMonth,
  days,
  onDateSelect,
}) => {
  const flatListRef = useRef<FlatList<DayItem>>(null);
  const [manualScrolling, setManualScrolling] = useState(false);
  const didInitialScrollRef = useRef(false);
  
  // Calculate item width based on screen width
  const screenWidth = Dimensions.get('window').width;
  const dayItemWidth = screenWidth * 0.16; // 16% of screen width for each day item
  
  // Only do initial scroll to today on first render
  useEffect(() => {
    if (flatListRef.current && days.length > 0 && !didInitialScrollRef.current && !manualScrolling) {
      const selectedIndex = days.findIndex(day => day.isSelected);
      
      if (selectedIndex >= 0) {
        didInitialScrollRef.current = true;
        
        // Initial scroll with a slight delay to ensure rendering
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
              index: selectedIndex,
              animated: false,
              viewPosition: 0.5
            });
          }
        }, 100);
      }
    }
  }, [days]);

  // Get current month from selected date
  const getSelectedMonth = () => {
    const selectedDay = days.find(day => day.isSelected);
    if (selectedDay) {
      return selectedDay.date.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
    }
    return currentMonth;
  };

  // Handle date selection without auto-scroll
  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
  };

  // Render a day item
  const renderDayItem = ({ item }: { item: DayItem }) => (
    <TouchableOpacity
      style={[
        styles.dayItem,
        { width: dayItemWidth - 8 }, // Width minus padding
        item.isSelected && styles.selectedDayItem,
      ]}
      onPress={() => handleDateSelect(item.date)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.dayName,
          item.isSelected && styles.selectedDayText,
          item.isToday && styles.todayText,
        ]}
      >
        {item.dayName}
      </Text>
      <View
        style={[
          styles.dayNumberContainer,
          item.isSelected && styles.selectedDayNumberContainer,
          item.isToday && styles.todayContainer,
        ]}
      >
        <Text
          style={[
            styles.dayNumber,
            item.isSelected && styles.selectedDayText,
            item.isToday && styles.todayText,
          ]}
        >
          {item.dayNumber}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Extract key for FlatList
  const keyExtractor = (item: DayItem) => item.date.toISOString();

  return (
    <Box style={styles.container}>
      {/* Header with month name and calendar icon */}
      <View style={styles.header}>
        <HStack style={styles.monthContainer}>
          <Calendar size={18} color={theme.primary} style={styles.calendarIcon} />
          <Text style={styles.monthText}>
            {getSelectedMonth()}
          </Text>
        </HStack>
      </View>

      {/* Horizontal scrollable days using FlatList */}
      <FlatList
        ref={flatListRef}
        data={days}
        renderItem={renderDayItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
        onScrollBeginDrag={() => setManualScrolling(true)}
        directionalLockEnabled={true}
        snapToAlignment="center"
        decelerationRate="fast"
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={15}
        removeClippedSubviews={false}
        onScrollToIndexFailed={() => {}}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 0
        }}
      />

      {/* Scroll indicator */}
      <View style={styles.sliderIndicator}>
        <View style={styles.sliderTrack}>
          <View style={styles.sliderFill} />
        </View>
        <Text style={styles.sliderHint}>Kaydır</Text>
      </View>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  monthContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarIcon: {
    marginRight: 6,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },
  daysContainer: {
    paddingHorizontal: 12,
    paddingBottom: 6,
    alignItems: 'center',
    paddingVertical: 5,
  },
  dayItem: {
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  selectedDayItem: {
    backgroundColor: "#ECFDF5",
  },
  dayName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 6,
  },
  dayNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  selectedDayNumberContainer: {
    backgroundColor: "#22C55E",
  },
  todayContainer: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "700",
  },
  todayText: {
    color: "#22C55E",
    fontWeight: "700",
  },
  sliderIndicator: {
    alignItems: 'center',
    paddingTop: 6,
  },
  sliderTrack: {
    width: 48,
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 2,
  },
  sliderFill: {
    width: 16,
    height: 3,
    backgroundColor: '#22C55E',
    borderRadius: 2,
  },
  sliderHint: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
});

export default DateSelector;

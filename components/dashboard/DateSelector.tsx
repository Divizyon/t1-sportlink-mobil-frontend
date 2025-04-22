import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

// Tema renkleri - daha koyu yeşil
const theme = {
  primary: "#10B981", // Ana yeşil renk - daha koyu (eski: #34D399)
  primaryLight: "#A7F3D0", // Çok açık yeşil (eski: #D1FAE5)
  primaryPale: "#D1FAE5", // En açık yeşil tonu (eski: #ECFDF5)
  background: "#FFFFFF", // Arka plan
  text: "#0F172A", // Ana metin
  textSecondary: "#64748B", // İkincil metin
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
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDateSelect: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  currentDay,
  currentMonth,
  days,
  onPrevWeek,
  onNextWeek,
  onDateSelect,
}) => {
  return (
    <Box style={styles.calendarSection}>
      <HStack style={styles.monthHeader}>
        <Text style={styles.monthTitle}>
          {currentDay} {currentMonth}
        </Text>
        <HStack>
          <TouchableOpacity onPress={onPrevWeek} style={styles.navButton}>
            <ChevronLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNextWeek} style={styles.navButton}>
            <ChevronRight size={20} color={theme.text} />
          </TouchableOpacity>
        </HStack>
      </HStack>

      <HStack style={styles.daysContainer}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dayItem, day.isSelected && styles.selectedDay]}
            onPress={() => onDateSelect(day.date)}
          >
            <Text style={styles.dayName}>{day.dayName}</Text>
            <Text
              style={[
                styles.dayNumber,
                day.isSelected && styles.selectedDayText,
              ]}
            >
              {day.dayNumber}
            </Text>
            {day.isSelected && <View style={styles.selectedDot} />}
          </TouchableOpacity>
        ))}
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  calendarSection: {
    padding: 16,
    backgroundColor: theme.background,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  navButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: theme.primaryLight,
    marginLeft: 8,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayItem: {
    alignItems: "center",
    width: 40,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: theme.primary,
  },
  dayName: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  selectedDayText: {
    color: "white",
  },
  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "white",
    marginTop: 4,
  },
});

export default DateSelector;

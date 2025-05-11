import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { FormControl, FormControlLabel, FormControlError } from '@/components/ui/form-control';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DateTimePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  mode: 'date' | 'time';
  error?: string;
  minimumDate?: Date;
}

export default function CustomDateTimePicker({
  label,
  value,
  onChange,
  mode,
  error,
  minimumDate,
}: DateTimePickerProps) {
  const [show, setShow] = useState(false);

  const handleChange = (_: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    if (mode === 'date') {
      return format(date, 'dd MMMM yyyy', { locale: tr });
    }
    return format(date, 'HH:mm');
  };

  return (
    <FormControl isInvalid={!!error}>
      <FormControlLabel>{label}</FormControlLabel>
      <TouchableOpacity
        style={[styles.input, error ? styles.inputError : null]}
        onPress={() => setShow(true)}
      >
        <Text style={styles.inputText}>
          {value ? formatDate(value) : mode === 'date' ? 'Tarih seçin' : 'Saat seçin'}
        </Text>
      </TouchableOpacity>
      {error && <FormControlError>{error}</FormControlError>}

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
        />
      )}
    </FormControl>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    height: 48,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputText: {
    fontSize: 14,
    color: '#0F172A',
  },
}); 
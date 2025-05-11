import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { FormControl, FormControlLabel, FormControlError } from '@/components/ui/form-control';
import LocationSelector from '@/components/dashboard/LocationSelector';
import LocationSelectorModal from '@/components/dashboard/LocationSelectorModal';
import CustomDateTimePicker from '@/components/dashboard/DateTimePicker';
import SportSelector from '@/components/dashboard/SportSelector';
import { showToast } from '@/src/utils/toastHelper';
import apiClient from '@/services/api';

interface CreateEventForm {
  title: string;
  description: string;
  sport_id: number;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_lat: number;
  location_long: number;
  max_participants: number;
}

export default function CreateEventScreen() {
  const [form, setForm] = useState<CreateEventForm>({
    title: '',
    description: '',
    sport_id: 0,
    event_date: '',
    start_time: '',
    end_time: '',
    location_name: '',
    location_lat: 0,
    location_long: 0,
    max_participants: 0
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateEventForm, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  
  // Date states
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CreateEventForm, string>> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Etkinlik başlığı gereklidir';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Etkinlik açıklaması gereklidir';
    }
    if (!form.sport_id) {
      newErrors.sport_id = 'Spor türü seçilmelidir';
    }
    if (!eventDate) {
      newErrors.event_date = 'Etkinlik tarihi gereklidir';
    }
    if (!startTime) {
      newErrors.start_time = 'Başlangıç saati gereklidir';
    }
    if (!endTime) {
      newErrors.end_time = 'Bitiş saati gereklidir';
    }
    if (!form.location_name) {
      newErrors.location_name = 'Konum seçilmelidir';
    }
    if (form.max_participants <= 0) {
      newErrors.max_participants = 'Geçerli bir katılımcı sayısı girilmelidir';
    }

    // Başlangıç ve bitiş saati kontrolü
    if (startTime && endTime && startTime >= endTime) {
      newErrors.end_time = 'Bitiş saati başlangıç saatinden sonra olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Lütfen tüm gerekli alanları doldurun', 'error');
      return;
    }

    // Tarihleri API formatına çevir
    const formattedEventDate = eventDate?.toISOString().split('T')[0];
    const formattedStartTime = startTime?.toISOString();
    const formattedEndTime = endTime?.toISOString();

    const submitData = {
      ...form,
      event_date: formattedEventDate,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
    };

    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/events', submitData);
      if (response.data.status === 'success') {
        showToast('Etkinlik başarıyla oluşturuldu', 'success');
        router.back();
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Etkinlik oluşturulurken bir hata oluştu',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (
    locationName: string,
    coordinates: { latitude: number; longitude: number }
  ) => {
    setForm(prev => ({
      ...prev,
      location_name: locationName,
      location_lat: coordinates.latitude,
      location_long: coordinates.longitude
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Box style={styles.content}>
        <Text style={styles.title}>Yeni Etkinlik Oluştur</Text>

        <FormControl isInvalid={!!errors.title}>
          <FormControlLabel>Etkinlik Başlığı</FormControlLabel>
          <Input>
            <InputField
              placeholder="Etkinlik başlığını girin"
              value={form.title}
              onChangeText={(text: string) => setForm(prev => ({ ...prev, title: text }))}
            />
          </Input>
          {errors.title && <FormControlError>{errors.title}</FormControlError>}
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormControlLabel>Açıklama</FormControlLabel>
          <Input>
            <InputField
              placeholder="Etkinlik açıklamasını girin"
              value={form.description}
              onChangeText={(text: string) => setForm(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />
          </Input>
          {errors.description && <FormControlError>{errors.description}</FormControlError>}
        </FormControl>

        <SportSelector
          label="Spor Türü"
          value={form.sport_id}
          onChange={(sportId) => setForm(prev => ({ ...prev, sport_id: sportId }))}
          error={errors.sport_id}
        />

        <CustomDateTimePicker
          label="Etkinlik Tarihi"
          value={eventDate}
          onChange={setEventDate}
          mode="date"
          minimumDate={new Date()}
          error={errors.event_date}
        />

        <CustomDateTimePicker
          label="Başlangıç Saati"
          value={startTime}
          onChange={setStartTime}
          mode="time"
          error={errors.start_time}
        />

        <CustomDateTimePicker
          label="Bitiş Saati"
          value={endTime}
          onChange={setEndTime}
          mode="time"
          error={errors.end_time}
        />

        <LocationSelector
          label="Konum"
          value={form.location_name}
          mapPreviewUrl={form.location_lat && form.location_long ? 
            `https://maps.googleapis.com/maps/api/staticmap?center=${form.location_lat},${form.location_long}&zoom=15&size=400x200&key=YOUR_API_KEY` : 
            ''}
          onPress={() => setIsLocationModalVisible(true)}
          error={errors.location_name}
        />

        <FormControl isInvalid={!!errors.max_participants}>
          <FormControlLabel>Maksimum Katılımcı Sayısı</FormControlLabel>
          <Input>
            <InputField
              placeholder="Maksimum katılımcı sayısını girin"
              value={form.max_participants.toString()}
            onChangeText={(text) => {
              const number = parseInt(text) || 0;
              setForm(prev => ({ ...prev, max_participants: number }));
            }}
            keyboardType="numeric"
            />
          </Input>
          {errors.max_participants && (
            <FormControlError>{errors.max_participants}</FormControlError>
          )}
        </FormControl>

        <Button
          onPress={handleSubmit}
          isDisabled={isLoading}
          style={styles.submitButton}
        >
          <ButtonText>{isLoading ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}</ButtonText>
        </Button>
      </Box>

      <LocationSelectorModal
        visible={isLocationModalVisible}
        onSelect={handleLocationSelect}
        onClose={() => setIsLocationModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 24,
  },
});

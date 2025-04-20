export interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  time: string;
  endTime: string;
  location: string;
  category: string;
  participants: number;
  maxParticipants: number;
  status: string;
  organizer: string;
  image: any;
  isAttending: boolean;
} 
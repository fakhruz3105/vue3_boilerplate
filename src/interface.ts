import type { Role } from './enum';

export interface SensorType {
  id?: string;
  name: string;
  dataCollected: string[];
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sensor {
  id?: string;
  location: { latitude: number; longitude: number };
  condition: boolean;
  sensorType: string;
  installer?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: Role;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PumpSchedule {
  id?: string;
  time: string;
  repeatDaily: boolean;
  setter: string;
  createdAt?: Date;
  updatedAt?: Date;
}

import type { Exercise } from './exercise';

export type SeededExercise = Omit<Exercise, 'origin'>;

// Starter catalog: one exercise per muscle group. Ids are fixed here so every device stores the
// same ones, and must never change: workouts will reference them. Names are Spanish data.
export const SEEDED_EXERCISES: readonly SeededExercise[] = [
  {
    id: 'a228e171-66d7-40db-887e-2b5d5930f375',
    name: 'Press de banca con barra',
    primaryMuscleGroup: 'chest',
    secondaryMuscleGroups: ['shoulders', 'triceps'],
    equipment: 'barbell',
  },
  {
    id: 'a13d46b3-89bb-4c30-afa6-17510b3ea59f',
    name: 'Jalón al pecho',
    primaryMuscleGroup: 'lats',
    secondaryMuscleGroups: ['biceps'],
    equipment: 'cable',
  },
  {
    id: 'e4786222-d95a-41da-86f3-0b6d666d1e5e',
    name: 'Remo con barra',
    primaryMuscleGroup: 'upper_back',
    secondaryMuscleGroups: ['lats', 'biceps'],
    equipment: 'barbell',
  },
  {
    id: '1613927c-e322-4d4c-8404-945618cf04bf',
    name: 'Encogimientos con mancuernas',
    primaryMuscleGroup: 'traps',
    secondaryMuscleGroups: [],
    equipment: 'dumbbell',
  },
  {
    id: '31f02952-aea5-4f89-a955-c49d7e076e3e',
    name: 'Press militar con barra',
    primaryMuscleGroup: 'shoulders',
    secondaryMuscleGroups: ['triceps'],
    equipment: 'barbell',
  },
  {
    id: 'a832c314-1ae4-4b6d-8e08-1f5b2a28203b',
    name: 'Curl de bíceps con mancuernas',
    primaryMuscleGroup: 'biceps',
    secondaryMuscleGroups: ['forearms'],
    equipment: 'dumbbell',
  },
  {
    id: '68d55d68-f8a9-4fbd-823a-94e7d43fc231',
    name: 'Extensión de tríceps en polea',
    primaryMuscleGroup: 'triceps',
    secondaryMuscleGroups: [],
    equipment: 'cable',
  },
  {
    id: '6ac536e5-d598-489b-978f-a66b30aeb13d',
    name: 'Curl de muñeca con barra',
    primaryMuscleGroup: 'forearms',
    secondaryMuscleGroups: [],
    equipment: 'barbell',
  },
  {
    id: '1d248e95-9416-4df6-96d5-52f39894299b',
    name: 'Crunch abdominal',
    primaryMuscleGroup: 'abs',
    secondaryMuscleGroups: [],
    equipment: 'bodyweight',
  },
  {
    id: '48244b01-8053-4f8c-97d1-deee2fb1af88',
    name: 'Hiperextensiones',
    primaryMuscleGroup: 'lower_back',
    secondaryMuscleGroups: ['glutes', 'hamstrings'],
    equipment: 'bodyweight',
  },
  {
    id: '96805215-aae8-4662-be29-b1d027f57b97',
    name: 'Hip thrust con barra',
    primaryMuscleGroup: 'glutes',
    secondaryMuscleGroups: ['hamstrings'],
    equipment: 'barbell',
  },
  {
    id: 'f04ff8a6-93a0-447c-99f9-81a17aa70dce',
    name: 'Sentadilla con barra',
    primaryMuscleGroup: 'quads',
    secondaryMuscleGroups: ['glutes', 'adductors'],
    equipment: 'barbell',
  },
  {
    id: 'dfbc3064-b5d2-48b9-86af-b09c6a8c1716',
    name: 'Curl femoral acostado',
    primaryMuscleGroup: 'hamstrings',
    secondaryMuscleGroups: [],
    equipment: 'machine',
  },
  {
    id: '205f70c4-f20b-4487-a4c2-6c03f64d6439',
    name: 'Elevación de talones de pie',
    primaryMuscleGroup: 'calves',
    secondaryMuscleGroups: [],
    equipment: 'machine',
  },
  {
    id: '7a1b8bcf-b93c-4688-a55b-c9056551daff',
    name: 'Aducción de cadera en máquina',
    primaryMuscleGroup: 'adductors',
    secondaryMuscleGroups: [],
    equipment: 'machine',
  },
  {
    id: '83ab59a0-e7ee-4906-bde0-871058cefab7',
    name: 'Abducción de cadera en máquina',
    primaryMuscleGroup: 'abductors',
    secondaryMuscleGroups: [],
    equipment: 'machine',
  },
  {
    id: '8bcfdce3-5c87-44a1-a7e2-8807ada29535',
    name: 'Saltos de tijera',
    primaryMuscleGroup: 'cardio',
    secondaryMuscleGroups: [],
    equipment: 'bodyweight',
  },
  {
    id: 'e0745341-cefd-4514-baf6-9ef8ac78030b',
    name: 'Burpees',
    primaryMuscleGroup: 'full_body',
    secondaryMuscleGroups: [],
    equipment: 'bodyweight',
  },
];

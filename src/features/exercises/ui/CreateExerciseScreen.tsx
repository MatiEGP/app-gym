import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { createCustomExercise, type NewExerciseInput } from '../application';
import { ExerciseForm } from './ExerciseForm';

/** Form to add a custom exercise: name, primary group, optional secondary groups and equipment. */
export function CreateExerciseScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  function save(input: NewExerciseInput) {
    const result = createCustomExercise(input);
    if (result.ok) {
      router.back();
    } else {
      return result.errors;
    }
  }

  return <ExerciseForm submitLabel={t(($) => $.exercises.create.save)} onSubmit={save} />;
}

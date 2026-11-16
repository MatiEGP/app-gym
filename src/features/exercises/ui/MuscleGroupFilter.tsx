import { useTranslation } from 'react-i18next';

import { MUSCLE_GROUPS, type MuscleGroup } from '../application';
import { ChipSelect } from './ChipSelect';

type Props = {
  selected: MuscleGroup | null;
  onChange: (group: MuscleGroup | null) => void;
  /** Accessibility label of the chip row; defaults to the catalog filter label. */
  label?: string;
};

/** Single-select muscle group chips. Pressing the selected chip clears the selection. */
export function MuscleGroupFilter({ selected, onChange, label }: Props) {
  const { t } = useTranslation();
  const options = MUSCLE_GROUPS.map((group) => ({
    value: group,
    label: t(($) => $.exercises.muscleGroups[group]),
  }));

  return (
    <ChipSelect
      label={label ?? t(($) => $.exercises.catalog.muscleGroupFilterLabel)}
      options={options}
      isSelected={(group) => group === selected}
      onPress={(group) => onChange(group === selected ? null : group)}
    />
  );
}

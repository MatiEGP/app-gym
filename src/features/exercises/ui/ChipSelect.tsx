import { Pressable, ScrollView, Text } from 'react-native';

type Props<T extends string> = {
  label: string;
  options: readonly { value: T; label: string }[];
  isSelected: (value: T) => boolean;
  onPress: (value: T) => void;
};

/** A labelled row of toggle chips; the caller decides what pressing a chip does. */
export function ChipSelect<T extends string>({ label, options, isSelected, onPress }: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="grow-0"
      contentContainerClassName="gap-2 px-4 py-2"
      accessibilityLabel={label}
    >
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onPress(option.value)}
            className={`rounded-full px-4 py-2 ${selected ? 'bg-primary' : 'bg-surface'}`}
          >
            <Text className={selected ? 'text-surface' : 'text-text'}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

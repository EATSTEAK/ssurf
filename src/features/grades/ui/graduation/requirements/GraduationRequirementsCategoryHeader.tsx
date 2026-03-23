import { Pressable, View } from 'react-native';

import { styles } from '@/features/grades/ui/graduation/GraduationRequirementsSection.styles';
import { ChevronRightToggleIcon } from '@/shared/ui/ChevronRightToggleIcon';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

interface GraduationRequirementsCategoryHeaderProps {
  category: string;
  fulfilledCount: number;
  isCollapsible: boolean;
  isExpanded: boolean;
  isFulfilled: boolean;
  onToggle: () => void;
  totalCount: number;
}

export const GraduationRequirementsCategoryHeader = ({
  category,
  fulfilledCount,
  isCollapsible,
  isExpanded,
  isFulfilled,
  onToggle,
  totalCount,
}: GraduationRequirementsCategoryHeaderProps) => {
  const summaryColor = isFulfilled ? 'successInverted' : 'errorInverted';

  const content = (
    <View style={styles.headerRow}>
      <View style={styles.headerTitleRow}>
        {isCollapsible ? (
          <ChevronRightToggleIcon
            color={styles.toggleIcon.color}
            expanded={isExpanded}
            size={styles.toggleIcon.size}
          />
        ) : null}
        <ThemedText typography="headingLg">{category}</ThemedText>
      </View>
      <ThemedText color={summaryColor} typography="bodyMd">
        {fulfilledCount} / {totalCount} 충족
      </ThemedText>
    </View>
  );

  if (!isCollapsible) {
    return content;
  }

  return (
    <Pressable
      accessibilityLabel={`${category} 카테고리 ${isExpanded ? '숨기기' : '보기'}`}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      onPress={onToggle}
      style={({ pressed }) => styles.headerPressable(pressed)}
    >
      {content}
    </Pressable>
  );
};

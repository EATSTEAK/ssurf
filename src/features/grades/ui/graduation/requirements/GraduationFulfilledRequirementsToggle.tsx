import { Pressable } from 'react-native';

import { styles } from '@/features/grades/ui/graduation/GraduationRequirementsSection.styles';
import { ChevronRightToggleIcon } from '@/shared/ui/ChevronRightToggleIcon';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

interface GraduationFulfilledRequirementsToggleProps {
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const GraduationFulfilledRequirementsToggle = ({
  count,
  isExpanded,
  onToggle,
}: GraduationFulfilledRequirementsToggleProps) => (
  <Pressable
    accessibilityLabel={`충족된 요건 ${count}개 ${isExpanded ? '숨기기' : '보기'}`}
    accessibilityRole="button"
    accessibilityState={{ expanded: isExpanded }}
    onPress={onToggle}
    style={({ pressed }) => styles.toggleButton(pressed)}
  >
    <ChevronRightToggleIcon expanded={isExpanded} />
    <ThemedText color="fgSurfaceMuted" typography="bodySm">
      충족된 요건 {count}개 {isExpanded ? '숨기기' : '보기'}
    </ThemedText>
  </Pressable>
);

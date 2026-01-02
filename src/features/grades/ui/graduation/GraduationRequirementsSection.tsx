import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { GraduationRequirementEntity } from '@/entities/graduationRequirements/model';
import { GraduationRequirementItem } from '@/features/grades/ui/graduation/GraduationRequirmentItem';
import { CardView } from '@/shared/ui/containers/CardView';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(2),
  },
  itemsView: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(2),
  },
}));

export interface GraduationRequirementsSectionProps {
  requirements: GraduationRequirementEntity[];
}

const categoryOrder: Record<string, number> = {
  '졸업필수 요건': 0,
  교양필수: 1,
  교양선택: 2,
  전공기초: 3,
  전공: 4,
  채플: 5,
};

export const GraduationRequirementsSection = ({
  requirements,
}: GraduationRequirementsSectionProps) => {
  const categorizedRequirements = Object.entries(
    requirements.reduce<Record<string, GraduationRequirementEntity[]>>((acc, requirement) => {
      const category = requirement.category || '기타';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(requirement);
      return acc;
    }, {}),
  ).sort(([a], [b]) => {
    const orderA = categoryOrder[a] ?? Number.MAX_SAFE_INTEGER;
    const orderB = categoryOrder[b] ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
  return (
    <View style={styles.root}>
      {categorizedRequirements.map(([category, reqs]) => (
        <CardView key={category}>
          <ThemedText typography="headingLg">{category}</ThemedText>
          <Space gap={1} />
          <View style={styles.itemsView}>
            {reqs.sort().map((requirement) => (
              <GraduationRequirementItem
                item={requirement}
                key={requirement.name}
                showCategory={false}
              />
            ))}
          </View>
        </CardView>
      ))}
      <Space gap={8} />
    </View>
  );
};

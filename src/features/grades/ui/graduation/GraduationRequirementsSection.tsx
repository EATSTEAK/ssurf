import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { GraduationRequirementEntity } from '@/entities/graduationRequirements/model';
import { GraduationRequirementItem } from '@/features/grades/ui/graduation/GraduationRequirementItem';
import { CardView } from '@/shared/ui/containers/CardView';
import { ChevronRightIcon } from '@/shared/ui/icons';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(2),
  },
  headerRow: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 1,
    gap: theme.gap(0.5),
  },
  headerPressable: (pressed: boolean) => ({
    backgroundColor: pressed ? theme.colors.surfaceDimmer : 'transparent',
    borderRadius: theme.cornerRadius.md,
    marginHorizontal: -theme.gap(0.5),
    marginVertical: -theme.gap(0.5),
    paddingHorizontal: theme.gap(0.5),
    paddingVertical: theme.gap(0.5),
  }),
  itemsView: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(2),
  },
  toggleButton: (pressed: boolean) => ({
    alignItems: 'center',
    backgroundColor: pressed ? theme.colors.surfaceDimmer : 'transparent',
    borderRadius: theme.cornerRadius.md,
    display: 'flex',
    flexDirection: 'row',
    gap: theme.gap(0.5),
    paddingVertical: theme.gap(0.25),
  }),
  toggleIconContainer: (expanded: boolean) => ({
    transform: [{ rotate: expanded ? '90deg' : '0deg' }],
  }),
  toggleIcon: {
    color: theme.colorsHex.fgSurfaceMuted,
    size: 12,
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

const isFulfilledRequirement = ({ result }: GraduationRequirementEntity) => result === 1;

const sortRequirementsByName = (a: GraduationRequirementEntity, b: GraduationRequirementEntity) =>
  a.name.localeCompare(b.name);

export const GraduationRequirementsSection = ({
  requirements,
}: GraduationRequirementsSectionProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const categorizedRequirements = Object.entries(
    requirements.reduce<Record<string, GraduationRequirementEntity[]>>((acc, requirement) => {
      const category = requirement.category || '기타';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(requirement);
      return acc;
    }, {}),
  ).sort(([categoryA, reqsA], [categoryB, reqsB]) => {
    const hasUnfulfilledA = reqsA.some((requirement) => !isFulfilledRequirement(requirement));
    const hasUnfulfilledB = reqsB.some((requirement) => !isFulfilledRequirement(requirement));

    if (hasUnfulfilledA !== hasUnfulfilledB) {
      return hasUnfulfilledA ? -1 : 1;
    }

    const orderA = categoryOrder[categoryA] ?? Number.MAX_SAFE_INTEGER;
    const orderB = categoryOrder[categoryB] ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !(prev[category] ?? false),
    }));
  };

  return (
    <View style={styles.root}>
      {categorizedRequirements.map(([category, reqs]) => {
        const fulfilledReqs = reqs.filter(isFulfilledRequirement).sort(sortRequirementsByName);
        const unfulfilledReqs = reqs
          .filter((requirement) => !isFulfilledRequirement(requirement))
          .sort(sortRequirementsByName);
        const isFulfilled = unfulfilledReqs.length === 0;
        const isExpanded = expandedCategories[category] ?? false;
        const shouldCollapseAtHeader = isFulfilled;
        const showCategoryContent = !shouldCollapseAtHeader || isExpanded;

        return (
          <CardView key={category}>
            {shouldCollapseAtHeader ? (
              <Pressable
                accessibilityLabel={`${category} 카테고리 ${isExpanded ? '숨기기' : '보기'}`}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                onPress={() => toggleCategory(category)}
                style={({ pressed }) => styles.headerPressable(pressed)}
              >
                <View style={styles.headerRow}>
                  <View style={styles.headerTitleRow}>
                    <View style={styles.toggleIconContainer(isExpanded)}>
                      <ChevronRightIcon
                        color={styles.toggleIcon.color}
                        size={styles.toggleIcon.size}
                      />
                    </View>
                    <ThemedText typography="headingLg">{category}</ThemedText>
                  </View>
                  <ThemedText color="successInverted" typography="bodyMd">
                    {fulfilledReqs.length} / {reqs.length} 충족
                  </ThemedText>
                </View>
              </Pressable>
            ) : (
              <View style={styles.headerRow}>
                <ThemedText typography="headingLg">{category}</ThemedText>
                <ThemedText color="errorInverted" typography="bodyMd">
                  {fulfilledReqs.length} / {reqs.length} 충족
                </ThemedText>
              </View>
            )}
            {showCategoryContent ? (
              <>
                <Space gap={1} />
                {unfulfilledReqs.length > 0 ? (
                  <View style={styles.itemsView}>
                    {unfulfilledReqs.map((requirement) => (
                      <GraduationRequirementItem
                        item={requirement}
                        key={requirement.name}
                        showCategory={false}
                      />
                    ))}
                  </View>
                ) : null}
                {fulfilledReqs.length > 0 && !shouldCollapseAtHeader ? (
                  <>
                    {unfulfilledReqs.length > 0 && <Space gap={0.5} />}
                    <Pressable
                      accessibilityLabel={`충족된 요건 ${fulfilledReqs.length}개 ${isExpanded ? '숨기기' : '보기'}`}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isExpanded }}
                      onPress={() => toggleCategory(category)}
                      style={({ pressed }) => styles.toggleButton(pressed)}
                    >
                      <View style={styles.toggleIconContainer(isExpanded)}>
                        <ChevronRightIcon
                          color={styles.toggleIcon.color}
                          size={styles.toggleIcon.size}
                        />
                      </View>
                      <ThemedText color="fgSurfaceMuted" typography="bodySm">
                        충족된 요건 {fulfilledReqs.length}개 {isExpanded ? '숨기기' : '보기'}
                      </ThemedText>
                    </Pressable>
                    {isExpanded ? (
                      <>
                        <Space gap={0.5} />
                        <View style={styles.itemsView}>
                          {fulfilledReqs.map((requirement) => (
                            <GraduationRequirementItem
                              item={requirement}
                              key={requirement.name}
                              showCategory={false}
                            />
                          ))}
                        </View>
                      </>
                    ) : null}
                  </>
                ) : null}
                {fulfilledReqs.length > 0 && shouldCollapseAtHeader ? (
                  <View style={styles.itemsView}>
                    {fulfilledReqs.map((requirement) => (
                      <GraduationRequirementItem
                        item={requirement}
                        key={requirement.name}
                        showCategory={false}
                      />
                    ))}
                  </View>
                ) : null}
              </>
            ) : null}
          </CardView>
        );
      })}
      <Space gap={8} />
    </View>
  );
};

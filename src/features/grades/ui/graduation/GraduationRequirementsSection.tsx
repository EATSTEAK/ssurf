import { useState } from 'react';
import { View } from 'react-native';

import { GraduationRequirementEntity } from '@/entities/graduationRequirements/model';
import { styles } from '@/features/grades/ui/graduation/GraduationRequirementsSection.styles';
import { GraduationFulfilledRequirementsToggle } from '@/features/grades/ui/graduation/requirements/GraduationFulfilledRequirementsToggle';
import { GraduationRequirementsCategoryHeader } from '@/features/grades/ui/graduation/requirements/GraduationRequirementsCategoryHeader';
import { GraduationRequirementsList } from '@/features/grades/ui/graduation/requirements/GraduationRequirementsList';
import { CardView } from '@/shared/ui/containers/CardView';
import { Space } from '@/shared/ui/primitives/Space';

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

        const content = isFulfilled ? (
          isExpanded ? (
            <View style={styles.fulfilledCategoryContent}>
              <GraduationRequirementsList requirements={fulfilledReqs} />
            </View>
          ) : null
        ) : (
          <View>
            <Space gap={1} />
            <GraduationRequirementsList requirements={unfulfilledReqs} />
            {fulfilledReqs.length > 0 ? (
              <View style={styles.fulfilledRequirementsToggleSpacing}>
                <GraduationFulfilledRequirementsToggle
                  count={fulfilledReqs.length}
                  isExpanded={isExpanded}
                  onToggle={() => toggleCategory(category)}
                />
                {isExpanded ? <GraduationRequirementsList requirements={fulfilledReqs} /> : null}
              </View>
            ) : null}
          </View>
        );

        return (
          <CardView key={category} style={isFulfilled ? styles.fulfilledCategoryCard : undefined}>
            <GraduationRequirementsCategoryHeader
              category={category}
              fulfilledCount={fulfilledReqs.length}
              isCollapsible={isFulfilled}
              isExpanded={isExpanded}
              isFulfilled={isFulfilled}
              onToggle={() => toggleCategory(category)}
              totalCount={reqs.length}
            />
            {content}
          </CardView>
        );
      })}
      <Space gap={8} />
    </View>
  );
};

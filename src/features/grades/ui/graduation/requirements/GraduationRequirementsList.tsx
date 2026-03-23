import { View } from 'react-native';

import { GraduationRequirementEntity } from '@/entities/graduationRequirements/model';
import { styles } from '@/features/grades/ui/graduation/GraduationRequirementsSection.styles';
import { GraduationRequirementItem } from '@/features/grades/ui/graduation/requirements/GraduationRequirementItem';

interface GraduationRequirementsListProps {
  requirements: GraduationRequirementEntity[];
}

export const GraduationRequirementsList = ({ requirements }: GraduationRequirementsListProps) => (
  <View style={styles.itemsView}>
    {requirements.map((requirement) => (
      <GraduationRequirementItem item={requirement} key={requirement.name} showCategory={false} />
    ))}
  </View>
);

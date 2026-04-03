import { FlatList, Modal, Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { FeedSiteEntity } from '@/entities/feed/model';
import { Button } from '@/shared/ui/primitives/Button';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.gap(3),
    width: '85%',
    maxWidth: 450,
    maxHeight: '80%',
    gap: theme.gap(3),
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  listContainer: {
    maxHeight: 300,
    gap: theme.gap(2),
  },
  section: {
    gap: theme.gap(1),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.gap(2),
    paddingHorizontal: theme.gap(2),
    borderRadius: theme.cornerRadius.md,
    gap: theme.gap(2),
  },
  itemSelected: {
    backgroundColor: theme.colors.primaryContainer,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.fgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.fgPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '600',
  },
  itemDescription: {
    marginTop: 2,
  },
  kindBadge: {
    paddingHorizontal: theme.gap(1),
    paddingVertical: 2,
    borderRadius: theme.cornerRadius.sm,
    backgroundColor: theme.colors.surfaceDim,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.gap(2),
    width: '100%',
  },
}));

export type CalendarSourcePickerModalProps = {
  description?: string;
  onClose: () => void;
  onSaveCalendarSlugs: (selectedSlugs: string[]) => void;
  selectedCalendarSlugs: string[];
  sites: FeedSiteEntity[];
  visible: boolean;
};

export const CalendarSourcePickerModal = ({
  visible,
  onClose,
  onSaveCalendarSlugs,
  selectedCalendarSlugs,
  sites,
  description = '피드 일정 페이지에 표시할 일정 소스를 선택하세요',
}: CalendarSourcePickerModalProps) => {
  const calendarSites = sites.filter((site) => site.kind === 'calendar');

  const handleToggleCalendar = (slug: string) => {
    if (selectedCalendarSlugs.includes(slug)) {
      onSaveCalendarSlugs(selectedCalendarSlugs.filter((selected) => selected !== slug));
      return;
    }

    onSaveCalendarSlugs([...selectedCalendarSlugs, slug]);
  };

  const renderCalendarSite = ({ item }: { item: FeedSiteEntity }) => {
    const isSelected = selectedCalendarSlugs.includes(item.slug);

    return (
      <Pressable
        onPress={() => handleToggleCalendar(item.slug)}
        style={[styles.item, isSelected && styles.itemSelected]}
      >
        <View style={[styles.indicator, isSelected && styles.indicatorSelected]}>
          {isSelected && <ThemedText style={styles.checkmark}>✓</ThemedText>}
        </View>
        <View style={styles.itemContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemedText style={styles.itemTitle} typography="labelMd">
              {item.title}
            </ThemedText>
            <View style={styles.kindBadge}>
              <ThemedText typography="labelSm">일정</ThemedText>
            </View>
          </View>
          {item.description && (
            <ThemedText color="fgSecondary" style={styles.itemDescription} typography="bodySm">
              {item.description}
            </ThemedText>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.overlay}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalContent}>
          <ThemedText style={styles.title} typography="headingLg">
            소스 선택
          </ThemedText>
          <ThemedText color="fgSecondary" style={styles.description} typography="bodyMd">
            {description}
          </ThemedText>

          <View style={styles.listContainer}>
            {calendarSites.length > 0 && (
              <View style={styles.section}>
                <ThemedText color="fgSecondary" typography="labelMd">
                  일정
                </ThemedText>
                <FlatList
                  data={calendarSites}
                  keyExtractor={(item) => item.slug}
                  renderItem={renderCalendarSite}
                />
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button onPress={onClose} style={{ flex: 1 }} variant="secondary">
              닫기
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

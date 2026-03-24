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
  listContainer: {
    maxHeight: 300,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.fgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
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

export type FeedSourcePickerModalProps = {
  onClose: () => void;
  onSave: (selectedSlugs: string[]) => void;
  selectedSlugs: string[];
  sites: FeedSiteEntity[];
  visible: boolean;
};

export const FeedSourcePickerModal = ({
  visible,
  onClose,
  onSave,
  selectedSlugs,
  sites,
}: FeedSourcePickerModalProps) => {
  const handleToggle = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      onSave(selectedSlugs.filter((s) => s !== slug));
    } else {
      onSave([...selectedSlugs, slug]);
    }
  };

  const noticeSites = sites.filter((s) => s.kind === 'notice');
  const calendarSites = sites.filter((s) => s.kind === 'calendar');

  const renderSite = ({ item }: { item: FeedSiteEntity }) => {
    const isSelected = selectedSlugs.includes(item.slug);

    return (
      <Pressable
        onPress={() => handleToggle(item.slug)}
        style={[styles.item, isSelected && styles.itemSelected]}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <ThemedText style={styles.checkmark}>✓</ThemedText>}
        </View>
        <View style={styles.itemContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemedText style={styles.itemTitle} typography="labelMd">
              {item.title}
            </ThemedText>
            <View style={styles.kindBadge}>
              <ThemedText typography="labelSm">
                {item.kind === 'notice' ? '공지' : '일정'}
              </ThemedText>
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
          <ThemedText color="fgSecondary" style={{ textAlign: 'center' }} typography="bodyMd">
            확인할 공지사항과 일정을 선택하세요
          </ThemedText>

          <View style={styles.listContainer}>
            {noticeSites.length > 0 && (
              <>
                <ThemedText color="fgSecondary" typography="labelMd">
                  공지사항
                </ThemedText>
                <FlatList
                  data={noticeSites}
                  keyExtractor={(item) => item.slug}
                  renderItem={renderSite}
                  scrollEnabled={true}
                />
              </>
            )}
            {calendarSites.length > 0 && (
              <>
                <ThemedText color="fgSecondary" style={{ marginTop: 8 }} typography="labelMd">
                  일정
                </ThemedText>
                <FlatList
                  data={calendarSites}
                  keyExtractor={(item) => item.slug}
                  renderItem={renderSite}
                  scrollEnabled={true}
                />
              </>
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

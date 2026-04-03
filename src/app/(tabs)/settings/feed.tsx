import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Platform, Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useFeedSites } from '@/entities/feed/lib/queries';
import { useSetting } from '@/entities/settings/lib/queries';
import { setSettings } from '@/entities/settings/service';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { Header } from '@/shared/ui/headers/Header';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    paddingBottom: theme.gap(8),
  },
  topView: {
    width: '100%',
    gap: theme.gap(1),
    flexDirection: 'column',
    padding: theme.gap(3),
  },
  section: {
    gap: theme.gap(1),
    paddingHorizontal: theme.gap(3),
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
}));

export default function FeedSettingsScreen() {
  const { data: sites } = useFeedSites();
  const { studentId } = useRusaintApplication();
  const [selectedNoticeSlugs] = useSetting('selectedNoticeSlugs');
  const [selectedNoticeSlug] = useSetting('selectedNoticeSlug');
  const [selectedCalendarSlugs, setSelectedCalendarSlugs] = useSetting('selectedCalendarSlugs');

  const noticeSites = useMemo(() => sites.filter((site) => site.kind === 'notice'), [sites]);
  const calendarSites = useMemo(() => sites.filter((site) => site.kind === 'calendar'), [sites]);

  const toggleNotice = (slug: string) => {
    const nextSlugs = selectedNoticeSlugs.includes(slug)
      ? selectedNoticeSlugs.filter((selected) => selected !== slug)
      : [...selectedNoticeSlugs, slug];

    if (!studentId) {
      return;
    }

    if (nextSlugs.length === 0) {
      void setSettings(studentId, {
        selectedNoticeSlugs: nextSlugs,
      });
      return;
    }

    void setSettings(studentId, {
      selectedNoticeSlugs: nextSlugs,
      selectedNoticeSlug: nextSlugs.includes(selectedNoticeSlug)
        ? selectedNoticeSlug
        : nextSlugs[0],
    });
  };

  const toggleCalendar = (slug: string) => {
    const nextSlugs = selectedCalendarSlugs.includes(slug)
      ? selectedCalendarSlugs.filter((selected) => selected !== slug)
      : [...selectedCalendarSlugs, slug];

    void setSelectedCalendarSlugs(nextSlugs);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '피드 설정',
          headerTitle: () => <></>,
        }}
      />
      <View style={styles.root}>
        <FlatList
          contentContainerStyle={styles.content}
          data={[
            { items: noticeSites, kind: 'notice', title: '공지사항' as const },
            { items: calendarSites, kind: 'calendar', title: '일정' as const },
          ]}
          keyExtractor={(item) => item.kind}
          ListHeaderComponent={
            <SafeContainer>
              {Platform.OS === 'ios' && <Space gap={2} />}
              <View style={styles.topView}>
                <Header title="피드 설정" />
                <ThemedText color="fgSecondary" typography="labelMd">
                  공지와 일정 소스를 선택하세요
                </ThemedText>
              </View>
            </SafeContainer>
          }
          renderItem={({ item: section }) => (
            <View style={styles.section}>
              <ThemedText color="fgSecondary" typography="labelMd">
                {section.title}
              </ThemedText>
              {section.items.map((site) => {
                const isSelected =
                  section.kind === 'notice'
                    ? selectedNoticeSlugs.includes(site.slug)
                    : selectedCalendarSlugs.includes(site.slug);

                return (
                  <Pressable
                    key={site.slug}
                    onPress={() =>
                      section.kind === 'notice'
                        ? toggleNotice(site.slug)
                        : toggleCalendar(site.slug)
                    }
                    style={[styles.item, isSelected && styles.itemSelected]}
                  >
                    <View style={[styles.indicator, isSelected && styles.indicatorSelected]}>
                      {isSelected && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                    </View>
                    <View style={styles.itemContent}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ThemedText style={styles.itemTitle} typography="labelMd">
                          {site.title}
                        </ThemedText>
                        <View style={styles.kindBadge}>
                          <ThemedText typography="labelSm">
                            {section.kind === 'notice' ? '공지' : '일정'}
                          </ThemedText>
                        </View>
                      </View>
                      {site.description ? (
                        <ThemedText
                          color="fgSecondary"
                          style={styles.itemDescription}
                          typography="bodySm"
                        >
                          {site.description}
                        </ThemedText>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        />
      </View>
    </>
  );
}

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useFeedCalendars, useFeedNotices, useFeedSites } from '@/entities/feed/lib/queries';
import { useSyncFeed } from '@/entities/feed/lib/sync';
import { FeedCalendarEntity, FeedNoticeEntity } from '@/entities/feed/model';
import { FeedCalendarContent } from '@/features/feed/ui/FeedCalendarContent';
import { FeedNoticeContent } from '@/features/feed/ui/FeedNoticeContent';
import { FeedSourcePickerModal } from '@/features/feed/ui/FeedSourcePickerModal';
import { useExpoSecureStore } from '@/shared/lib/useExpoSecureStore';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { Space } from '@/shared/ui/primitives/Space';
import { Tabs } from '@/shared/ui/primitives/Tabs';

const DEFAULT_SELECTED_SLUGS = ['scatch.ssu.ac.kr', 'calendar/ssu-academic-calendar'];

const styles = StyleSheet.create((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  topView: {
    width: '100%',
    display: 'flex',
    gap: theme.gap(1),
    flexDirection: 'column',
  },
  headerContainer: {
    paddingHorizontal: theme.gap(3),
    paddingTop: theme.gap(3),
  },
  tabContent: {
    paddingVertical: theme.gap(3),
    gap: theme.gap(2),
  },
  settingButton: {
    padding: theme.gap(1),
    borderRadius: theme.cornerRadius.md,
  },
}));

export default function FeedScreen() {
  const { studentId } = useRusaintApplication();
  const [selectedTab, setSelectedTab] = useState<'공지사항' | '일정'>('공지사항');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedSlugs, setSelectedSlugs] = useExpoSecureStore<string[]>({
    key: 'feed.selectedSlugs',
    defaultValue: DEFAULT_SELECTED_SLUGS,
  });

  const { data: sites } = useFeedSites();
  const { sync, syncSites } = useSyncFeed(studentId ?? '');

  const noticeSlugs = selectedSlugs.filter((slug) => {
    const site = sites.find((s) => s.slug === slug);
    return site ? site.kind === 'notice' : !slug.includes('calendar/');
  });
  const calendarSlugs = selectedSlugs.filter((slug) => {
    const site = sites.find((s) => s.slug === slug);
    return site ? site.kind === 'calendar' : slug.includes('calendar/');
  });

  useEffect(() => {
    void syncSites();
  }, [syncSites]);

  const {
    data: notices,
    error: noticeError,
    isSyncing: isNoticeSyncing,
  } = useFeedNotices(studentId ?? '', noticeSlugs);
  const {
    data: calendars,
    error: calendarError,
    isSyncing: isCalendarSyncing,
  } = useFeedCalendars(studentId ?? '', calendarSlugs);

  const scrollY = useSharedValue(0);
  const currentIsSyncing = selectedTab === '공지사항' ? isNoticeSyncing : isCalendarSyncing;

  const handleRefresh = useCallback(() => {
    if (currentIsSyncing) {return;}
    void syncSites({ force: true });
    void sync(selectedSlugs, { force: true });
  }, [currentIsSyncing, selectedSlugs, sync, syncSites]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleOpenUrl = useCallback(async (url: null | string) => {
    if (!url) {
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        console.error(`Cannot open feed URL: ${url}`);
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open feed URL:', error);
    }
  }, []);

  const handlePressNotice = useCallback((item: FeedNoticeEntity) => {
    void handleOpenUrl(item.url);
  }, [handleOpenUrl]);

  const handlePressCalendar = useCallback((item: FeedCalendarEntity) => {
    void handleOpenUrl(item.url);
  }, [handleOpenUrl]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '피드',
          headerTitle: () => <></>,
          headerRight: () => (
            <Pressable onPress={() => setIsModalVisible(true)} style={styles.settingButton}>
              <MaterialCommunityIcons color="white" name="cog" size={24} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.root}>
        <RefreshableScrollView
          onRefresh={handleRefresh}
          onScroll={scrollHandler}
          refreshing={currentIsSyncing}
          scrollEventThrottle={16}
        >
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <View style={styles.headerContainer}>
                <Header title="피드" />
              </View>
              <Tabs.Root
                onValueChange={(v) => setSelectedTab(v as '공지사항' | '일정')}
                value={selectedTab}
              >
                <Tabs.List>
                  <Tabs.Trigger value="공지사항" />
                  <Tabs.Trigger value="일정" />
                </Tabs.List>
              </Tabs.Root>
            </View>
            <View style={styles.tabContent}>
              {selectedTab === '공지사항' ? (
                <FeedNoticeContent
                  error={noticeError}
                  hasSources={noticeSlugs.length > 0}
                  isSyncing={isNoticeSyncing}
                  items={notices}
                  onPressItem={handlePressNotice}
                />
              ) : (
                <FeedCalendarContent
                  error={calendarError}
                  hasSources={calendarSlugs.length > 0}
                  isSyncing={isCalendarSyncing}
                  items={calendars}
                  onPressItem={handlePressCalendar}
                />
              )}
            </View>
            <Space gap={8} />
          </SafeContainer>
        </RefreshableScrollView>
        <FloatingHeader label={selectedTab} scrollY={scrollY} title="피드" />
      </View>

      <FeedSourcePickerModal
        onClose={() => setIsModalVisible(false)}
        onSave={setSelectedSlugs}
        selectedSlugs={selectedSlugs}
        sites={sites}
        visible={isModalVisible}
      />
    </>
  );
}

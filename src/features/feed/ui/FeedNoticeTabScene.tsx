import * as Linking from 'expo-linking';
import { useCallback } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, StyleProp, View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useFeedNoticeItems } from '@/entities/feed/lib/queries';
import { FeedNoticeListItem } from '@/entities/feed/model';
import { CollapsibleTabs } from '@/shared/ui/collapsible-tabs/CollapsibleTabs';

import {
  FeedNoticeContent,
  renderFeedNoticeEmptyState,
  renderFeedNoticeErrorState,
  renderFeedNoticeLoadingState,
} from './FeedNoticeContent';

const styles = StyleSheet.create((theme) => ({
  content: {
    backgroundColor: theme.colors.surfaceDim,
    minHeight: '100%',
  },
}));

type FeedNoticeTabSceneProps = {
  error?: Error;
  isSyncing: boolean;
  listContentContainerStyle?: StyleProp<ViewStyle>;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  slug: string;
};

export function FeedNoticeTabScene({
  error,
  isSyncing,
  listContentContainerStyle,
  onScroll,
  slug,
}: FeedNoticeTabSceneProps) {
  const { data, updatedAt } = useFeedNoticeItems(slug ? [slug] : []);

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
    } catch (openError) {
      console.error('Failed to open feed URL:', openError);
    }
  }, []);

  const handlePressNotice = useCallback(
    (item: FeedNoticeListItem) => {
      void handleOpenUrl(item.url);
    },
    [handleOpenUrl],
  );

  if (error && data.length === 0) {
    return renderFeedNoticeErrorState(error);
  }

  if (!slug) {
    return renderFeedNoticeEmptyState();
  }

  if ((isSyncing || updatedAt === undefined) && data.length === 0) {
    return renderFeedNoticeLoadingState();
  }

  if (data.length === 0) {
    return renderFeedNoticeEmptyState('empty');
  }

  return (
    <CollapsibleTabs.ScrollView
      contentContainerStyle={listContentContainerStyle}
      onScroll={onScroll}
      refreshing={isSyncing}
      scrollEventThrottle={16}
    >
      <View style={styles.content}>
        {data.map((item, index) => (
          <FeedNoticeContent
            isLast={index === data.length - 1}
            item={item}
            key={`${item.slug}-${item.id}`}
            onPressItem={handlePressNotice}
          />
        ))}
      </View>
    </CollapsibleTabs.ScrollView>
  );
}

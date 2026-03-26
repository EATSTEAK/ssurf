import * as Linking from 'expo-linking';
import { useCallback } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useFeedNoticeItems } from '@/entities/feed/lib/queries';
import { FeedNoticeListItem } from '@/entities/feed/model';
import { CollapsibleTabs } from '@/shared/ui/collapsible-tabs/CollapsibleTabs';

import {
  FeedNoticeContent,
  renderFeedNoticeEmptyState,
  renderFeedNoticeErrorState,
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
  slug: string;
};

export function FeedNoticeTabScene({
  error,
  isSyncing,
  listContentContainerStyle,
  slug,
}: FeedNoticeTabSceneProps) {
  const { data } = useFeedNoticeItems(slug ? [slug] : []);

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

  if (!slug) {
    return renderFeedNoticeEmptyState();
  }

  if (error) {
    return renderFeedNoticeErrorState(error);
  }

  if (data.length === 0 && !isSyncing) {
    return renderFeedNoticeEmptyState('empty');
  }

  return (
    <CollapsibleTabs.ScrollView
      contentContainerStyle={listContentContainerStyle}
      refreshing={isSyncing}
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

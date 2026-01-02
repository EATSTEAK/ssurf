import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { Platform, View } from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import errorImage from '@/assets/error.png';
import loadingImage from '@/assets/loading.png';
import { useGraduationView } from '@/features/grades/lib/useGraduationView';
import { GraduationSummary } from '@/features/grades/ui/GraduationSummary';
import { SafeContainer } from '@/shared/ui/containers/Container';
import { RefreshableScrollView } from '@/shared/ui/containers/RefreshableScrollView';
import { FloatingHeader } from '@/shared/ui/headers/FloatingHeader';
import { Header } from '@/shared/ui/headers/Header';
import { Space } from '@/shared/ui/primitives/Space';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

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
    padding: theme.gap(3),
  },

  errorView: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 16,
    marginBottom: 96,
  },
  imageView: {
    width: 150,
    height: 150,
    marginBottom: theme.gap(2),
  },
  eyeIcon: {
    size: 16,
    color: theme.colorsHex.fgSurface,
  },
  eyeOffIcon: {
    size: 16,
    color: theme.colorsHex.fgSurfaceMuted,
  },
}));

function GraduationContent() {
  const { data, error, isLoading, refresh } = useGraduationView();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleRefresh = async () => {
    // 로딩 중이면 리프레시하지 않음
    if (isLoading) {
      return;
    }
    await refresh();
  };

  if (!data) {
    return (
      <View style={styles.root}>
        <RefreshableScrollView onRefresh={handleRefresh} refreshing={isLoading}>
          <SafeContainer>
            {Platform.OS === 'ios' && <Space gap={2} />}
            <View style={styles.topView}>
              <Header title="졸업" />
            </View>
            <Space gap={1} />
            <View style={styles.errorView}>
              {error ? (
                <>
                  <Image contentFit="contain" source={errorImage} style={styles.imageView} />
                  <ThemedText color="error" typography="headingLg">
                    정보를 가져오는 중 오류가 발생했어요.
                  </ThemedText>
                  <ThemedText typography="bodyLg">아래로 당겨 다시 시도해보세요.</ThemedText>
                  <ThemedText typography="bodySm">{error?.message}</ThemedText>
                </>
              ) : (
                <>
                  <Image contentFit="contain" source={loadingImage} style={styles.imageView} />
                  <ThemedText typography="headingLg">정보를 가져오는 중이에요.</ThemedText>
                  <ThemedText typography="bodyLg">잠시만 기다려주세요.</ThemedText>
                </>
              )}
            </View>
          </SafeContainer>
        </RefreshableScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <RefreshableScrollView
        onRefresh={handleRefresh}
        onScroll={scrollHandler}
        refreshing={isLoading}
        scrollEventThrottle={16}
      >
        <SafeContainer>
          {Platform.OS === 'ios' && <Space gap={2} />}
          <View style={styles.topView}>
            <Header title="졸업" />
            <Space gap={1} />
            <GraduationSummary
              general={data.general}
              showDetailsButton={false}
              student={data.student}
            />
            <Space gap={1} />
          </View>

          <Space gap={8} />
        </SafeContainer>
      </RefreshableScrollView>
      <FloatingHeader scrollY={scrollY} title="졸업" />
    </View>
  );
}

export default function Graduation() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '졸업',
          headerTitle: () => <></>,
          headerBackVisible: true,
        }}
      />
      <GraduationContent />
    </>
  );
}

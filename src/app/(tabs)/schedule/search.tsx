import type { Lecture, YearSemester } from '@rusaint/react-native';

import { LegendList } from '@legendapp/list';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useCourseCatalogSearch } from '@/entities/courseSchedule/lib/queries';
import { useSetting } from '@/entities/settings/lib/queries';
import { CourseSearchResult } from '@/features/schedule/ui/CourseSearchResult';
import { CourseSemesterPicker } from '@/features/schedule/ui/CourseSemesterPicker';
import {
  getEstimatedCurrentSemester,
  parseSemesterSlug,
  semesterToSlug,
  semesterToString,
} from '@/shared/lib/semester';
import { useRusaintApplication } from '@/shared/providers/RusaintApplicationProvider';
import { Header } from '@/shared/ui/headers/Header';
import { Button } from '@/shared/ui/primitives/Button';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  list: {
    backgroundColor: theme.colors.surface,
  },
  listContent: {
    paddingBottom: theme.gap(8),
  },
  pageHeading: {
    gap: theme.gap(1),
    padding: theme.gap(3),
  },
  root: {
    backgroundColor: theme.colors.surface,
    flex: 1,
  },
  state: {
    alignItems: 'center',
    gap: theme.gap(2),
    justifyContent: 'center',
    minHeight: 320,
    padding: theme.gap(3),
  },
}));

type RouteParam = string | string[] | undefined;

type SearchRouteParams = {
  term?: RouteParam;
};

export default function CourseSearchRoute() {
  const router = useRouter();
  const { term } = useLocalSearchParams<SearchRouteParams>();
  const { defaultScheduleSemester } = useRusaintApplication();
  const [savedSemester] = useSetting('schedule.selectedSemester');
  const estimatedSemester = getEstimatedCurrentSemester();
  const routeSemester = typeof term === 'string' ? parseSemesterSlug(term) : null;
  const [selectedSemester, setSelectedSemester] = useState<YearSemester>(
    routeSemester ?? savedSemester ?? defaultScheduleSemester ?? estimatedSemester,
  );
  const searchCourses = useCourseCatalogSearch();
  const requestId = useRef(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Lecture[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSemesterPickerVisible, setIsSemesterPickerVisible] = useState(false);

  const resetResults = () => {
    requestId.current += 1;
    setResults(null);
    setError(null);
    setIsSearching(false);
  };

  const handleSearch = async (value: string) => {
    const keyword = value.trim();
    setQuery(keyword);
    if (!keyword) {
      resetResults();
      return;
    }

    const currentRequestId = ++requestId.current;
    setIsSearching(true);
    setError(null);

    try {
      const data = await searchCourses(selectedSemester.year, selectedSemester.semester, keyword);
      if (requestId.current === currentRequestId) {
        setResults(data);
      }
    } catch (searchError) {
      if (requestId.current === currentRequestId) {
        setResults(null);
        setError(searchError instanceof Error ? searchError : new Error(String(searchError)));
      }
    } finally {
      if (requestId.current === currentRequestId) {
        setIsSearching(false);
      }
    }
  };

  const handleSemesterChange = (semester: YearSemester) => {
    setSelectedSemester(semester);
    resetResults();
  };

  const handlePressCourse = (lecture: Lecture) => {
    router.push({
      pathname: '/(tabs)/schedule/course/[term]/[code]',
      params: {
        code: lecture.code,
        term: semesterToSlug(selectedSemester),
      },
    });
  };

  const stateContent = isSearching ? (
    <View style={styles.state}>
      <ActivityIndicator accessibilityLabel="강의 검색 중" />
      <ThemedText typography="bodyLg">강의를 검색하고 있어요.</ThemedText>
    </View>
  ) : error ? (
    <View style={styles.state}>
      <ThemedText color="error" selectable typography="headingMd">
        강의를 검색하지 못했어요.
      </ThemedText>
      <ThemedText color="fgSecondary" selectable typography="bodySm">
        {error.message}
      </ThemedText>
      <Button onPress={() => void handleSearch(query)} variant="outline">
        다시 시도
      </Button>
    </View>
  ) : results?.length === 0 ? (
    <View style={styles.state}>
      <ThemedText typography="headingMd">검색 결과가 없어요.</ThemedText>
      <ThemedText color="fgSecondary" typography="bodyMd">
        다른 과목명이나 과목코드로 검색해주세요.
      </ThemedText>
    </View>
  ) : results === null ? (
    <View style={styles.state}>
      <ThemedText typography="headingMd">강의를 검색해보세요.</ThemedText>
      <ThemedText color="fgSecondary" typography="bodyMd">
        과목명 또는 전체 과목코드를 입력해주세요.
      </ThemedText>
    </View>
  ) : null;

  return (
    <>
      <Stack.Screen
        options={{
          headerBackVisible: true,
          headerRight: () => (
            <CourseSemesterPicker
              onChange={handleSemesterChange}
              onClose={() => setIsSemesterPickerVisible(false)}
              onOpen={() => setIsSemesterPickerVisible(true)}
              selectedSemester={selectedSemester}
              visible={isSemesterPickerVisible}
            />
          ),
          headerSearchBarOptions: {
            autoCapitalize: 'none',
            cancelButtonText: '취소',
            hideWhenScrolling: false,
            onCancelButtonPress: () => {
              setQuery('');
              resetResults();
            },
            onChangeText: (event) => {
              setQuery(event.nativeEvent.text);
              resetResults();
            },
            onSearchButtonPress: (event) => void handleSearch(event.nativeEvent.text),
            placeholder: '과목명 또는 과목코드',
          },
          headerShadowVisible: false,
          headerShown: true,
          headerTitle: () => <></>,
          headerTransparent: true,
          title: '강의 검색',
        }}
      />
      <View style={styles.root}>
        <LegendList
          contentContainerStyle={styles.listContent}
          contentInsetAdjustmentBehavior="automatic"
          data={stateContent ? [] : (results ?? [])}
          keyExtractor={(item) => item.code}
          ListEmptyComponent={stateContent}
          ListHeaderComponent={
            <View style={styles.pageHeading}>
              <Header title="강의 검색" />
              <ThemedText color="fgSecondary" typography="labelMd">
                {semesterToString(selectedSemester)}
              </ThemedText>
              {results && !stateContent ? (
                <ThemedText color="fgSecondary" typography="labelMd">
                  {results.length}개의 강의
                </ThemedText>
              ) : null}
            </View>
          }
          recycleItems
          renderItem={({ index, item }) => (
            <CourseSearchResult
              isLast={index === (results?.length ?? 0) - 1}
              item={item}
              onPress={handlePressCourse}
            />
          )}
          style={styles.list}
        />
      </View>
    </>
  );
}

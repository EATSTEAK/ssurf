import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(2),
  },
  headerRow: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 1,
    gap: theme.gap(0.5),
  },
  fulfilledCategoryCard: {
    gap: 0,
    padding: 0,
  },
  headerPressable: (pressed: boolean) => ({
    alignSelf: 'stretch',
    backgroundColor: pressed ? theme.colors.surfaceDimmer : 'transparent',
    paddingBottom: theme.gap(3),
    paddingHorizontal: theme.gap(3),
    paddingTop: theme.gap(3),
  }),
  fulfilledCategoryContent: {
    gap: theme.gap(1),
    paddingBottom: theme.gap(3),
    paddingHorizontal: theme.gap(3),
  },
  fulfilledRequirementsToggleSpacing: {
    gap: theme.gap(1),
  },
  itemsView: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.gap(2),
  },
  toggleButton: (pressed: boolean) => ({
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: pressed ? theme.colors.surfaceDimmer : 'transparent',
    display: 'flex',
    flexDirection: 'row',
    gap: theme.gap(0.5),
    marginHorizontal: -theme.gap(3),
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(2),
  }),
  toggleIcon: {
    color: theme.colorsHex.fgSurfaceMuted,
    size: 12,
  },
}));

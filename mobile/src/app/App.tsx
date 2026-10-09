import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '../shared/ui/theme';
import { RootNavigator } from './navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';

const App = () => {
  const { isDark, colors } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  return (
    <AppProviders>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer
        theme={{
          ...base,
          colors: {
            ...base.colors,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            primary: colors.primary,
            border: colors.border,
          },
        }}
      >
        <RootNavigator />
      </NavigationContainer>
    </AppProviders>
  );
};

export default App;

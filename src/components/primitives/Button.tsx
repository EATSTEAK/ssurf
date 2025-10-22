// NOTE: Example components for placeholder
import { ReactNode } from 'react';
import { Pressable } from 'react-native';

export const Button = ({ children }: { children: ReactNode }) => {
  return <Pressable>{children}</Pressable>;
};

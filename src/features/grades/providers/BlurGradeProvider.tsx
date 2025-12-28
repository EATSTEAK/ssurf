import { createContext, ReactNode, useContext, useState } from 'react';

interface BlurGradeContextValue {
  isBlurred: boolean;
  toggleBlur: () => void;
}

const BlurGradeContext = createContext<BlurGradeContextValue | undefined>(undefined);

interface BlurGradeProviderProps {
  children: ReactNode;
}

export function BlurGradeProvider({ children }: BlurGradeProviderProps) {
  const [isBlurred, setIsBlurred] = useState(false);

  const toggleBlur = () => {
    setIsBlurred((prev) => !prev);
  };

  return (
    <BlurGradeContext.Provider value={{ isBlurred, toggleBlur }}>
      {children}
    </BlurGradeContext.Provider>
  );
}

export function useBlurGrade() {
  const context = useContext(BlurGradeContext);
  if (context === undefined) {
    throw new Error('useBlurGrade는 BlurGradeProvider 내부에서 사용되어야 합니다.');
  }
  return context;
}

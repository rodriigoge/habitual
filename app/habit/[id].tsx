import { useLocalSearchParams, useRouter } from 'expo-router';
import { HabitDetails } from '../../src/features/habits/components/HabitDetails';

export default function HabitDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return (
    <HabitDetails
      id={id}
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/');
      }}
    />
  );
}

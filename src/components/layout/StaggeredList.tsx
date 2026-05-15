import { ReactNode } from "react";

import { AnimatedView } from "@/components/layout/AnimatedView";
import { animation } from "@/theme";

type StaggeredListProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
};

export function StaggeredList<T>({
  data,
  renderItem,
  keyExtractor,
}: StaggeredListProps<T>) {
  return (
    <>
      {data.map((item, index) => (
        <AnimatedView key={keyExtractor(item, index)} delay={index * animation.stagger}>
          {renderItem(item, index)}
        </AnimatedView>
      ))}
    </>
  );
}

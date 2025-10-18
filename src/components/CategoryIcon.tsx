import { Cable, Battery, Tv, Smartphone, Laptop, Recycle } from "lucide-react";

interface CategoryIconProps {
  category: string;
}

const CategoryIcon = ({ category }: CategoryIconProps) => {
  const iconMap: Record<string, any> = {
    Cable,
    Battery,
    TV: Tv,
    Mobile: Smartphone,
    Laptop,
    Other: Recycle,
  };

  const Icon = iconMap[category] || Recycle;

  return (
    <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center">
      <Icon className="h-8 w-8 text-primary-foreground" />
    </div>
  );
};

export default CategoryIcon;

import {
  ArrowRightIcon,
  CaretLeftIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  HeartIcon,
  PlusIcon,
  ShoppingCartIcon,
  StarIcon,
} from "phosphor-react-native";

// Export the Icon type from phosphor-react-native
export type { Icon } from "phosphor-react-native";

export const Icons = {
  CaretLeft: CaretLeftIcon,
  ArrowRight: ArrowRightIcon,
  Check: CheckIcon,
  Heart: HeartIcon,
  Plus: PlusIcon,
  ShoppingCart: ShoppingCartIcon,
  Star: StarIcon,
  Eye: EyeIcon,
  EyeSlash: EyeSlashIcon,
} as const;

export type IconName = keyof typeof Icons;

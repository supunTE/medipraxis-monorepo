import {
  ArrowRightIcon,
  CalendarIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  HeartIcon,
  InfoIcon,
  MagnifyingGlassIcon,
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
  CaretDown: CaretDownIcon,
  Eye: EyeIcon,
  EyeSlash: EyeSlashIcon,
  Search: MagnifyingGlassIcon,
  Calendar: CalendarIcon,
  CaretRight: CaretRightIcon,
  CaretUp: CaretUpIcon,
  Info: InfoIcon,
} as const;

export type IconName = keyof typeof Icons;

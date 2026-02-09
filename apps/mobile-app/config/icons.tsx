import {
  ArrowRightIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CheckIcon,
  DotsThreeVerticalIcon,
  EyeIcon,
  EyeSlashIcon,
  FileTextIcon,
  HeartIcon,
  InfoIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  PlusIcon,
  ShareNetworkIcon,
  ShoppingCartIcon,
  StarIcon,
  UserIcon,
  WarningIcon,
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
  MagnifyingGlass: MagnifyingGlassIcon,
  Info: InfoIcon,
  User: UserIcon,
  Phone: PhoneIcon,
  ShareNetwork: ShareNetworkIcon,
  DotsThreeVertical: DotsThreeVerticalIcon,
  CalendarBlank: CalendarBlankIcon,
  FileText: FileTextIcon,
  Warning: WarningIcon,
} as const;

export type IconName = keyof typeof Icons;

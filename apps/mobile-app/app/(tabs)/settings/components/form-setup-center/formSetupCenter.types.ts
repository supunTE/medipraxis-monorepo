export interface FormTile {
  id: string;
  title: string;
  description: string;
  image: any;
}

export type FormSetupCenterProps = {
  visible?: boolean;
  onClose?: () => void;
};

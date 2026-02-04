export interface FormTile {
  id: string;
  title: string;
  description: string;
}

export type FormSetupCenterProps = {
  visible: boolean;
  onClose: () => void;
};

import {Cliente} from "../service/inteface.ts"

export interface ClienteFormProps {
  initialData?: Partial<Cliente>;
  onSubmit: (idCliente : number|null) => void;
  onCancel?: () => void;
}
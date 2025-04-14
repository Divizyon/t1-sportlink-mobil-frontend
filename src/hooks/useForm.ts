import { useForm as useReactHookForm, FieldValues, UseFormProps as ReactHookFormProps } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface UseFormProps<T extends FieldValues> {
  schema: yup.ObjectSchema<T>;
  defaultValues?: Partial<T>;
}

export const useForm = <T extends FieldValues>({ schema, defaultValues }: UseFormProps<T>) => {
  const form = useReactHookForm<T>({
    resolver: yupResolver(schema) as any,
    defaultValues: defaultValues as any,
    mode: 'onChange',
  });

  return form;
}; 
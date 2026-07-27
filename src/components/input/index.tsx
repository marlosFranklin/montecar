import { type RegisterOptions, type UseFormRegister } from "react-hook-form";

interface InputProps {
  type: string;
  placeholder: string;
  name: string;
  register: UseFormRegister<any>;
  error?: string;
  rules?: RegisterOptions;
}

export function Input({
  name,
  type,
  placeholder,
  register,
  rules,
  error,
}: InputProps) {
  return (
    <div>
      <input
        placeholder={placeholder}
        type={type}
        {...register(name, rules)}
        id={name}
        className="w-full border border-gray-400 outline-0 rounded-md h-11 px-2"
      />
      {error && <p className="my-1 text-red-500">{error}</p>}
    </div>
  );
}

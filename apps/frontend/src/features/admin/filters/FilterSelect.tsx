'use client';

type FilterOption<T extends string = string> = {
  value: T;
  label: string;
};

type FilterSelectProps<T extends string = string> = {
  label: string;
  value: T;
  options: Array<FilterOption<T>>;
  onChange: (value: T) => void;
};

export function FilterSelect<T extends string = string>({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps<T>) {
  return (
    <label className="admin-order-filter">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

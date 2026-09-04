'use client';

type FilterDateInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function FilterDateInput({ label, value, onChange }: FilterDateInputProps) {
  return (
    <label className="admin-order-filter">
      <span>{label}</span>
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

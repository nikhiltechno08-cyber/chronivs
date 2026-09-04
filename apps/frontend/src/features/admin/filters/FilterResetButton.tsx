'use client';

type FilterResetButtonProps = {
  onClick: () => void;
  label?: string;
};

export function FilterResetButton({ onClick, label = 'Reset' }: FilterResetButtonProps) {
  return (
    <button type="button" className="admin-order-filter-reset" onClick={onClick}>
      {label}
    </button>
  );
}

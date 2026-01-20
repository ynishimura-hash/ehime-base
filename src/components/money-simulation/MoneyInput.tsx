import React, { useState, useEffect } from 'react';

interface Props {
    value: number;
    onChange: (value: number) => void;
    className?: string; // To allow passing the existing Tailwind classes
    placeholder?: string;
    step?: number;
}

export default function MoneyInput({ value, onChange, className = "", placeholder, step }: Props) {
    const formatValue = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const [localValue, setLocalValue] = useState(value === 0 ? '' : formatValue(value));

    // Sync from parent
    useEffect(() => {
        const numLocal = Number(localValue.replace(/,/g, ''));
        if (numLocal !== value && localValue !== '') {
            setLocalValue(value === 0 ? '' : formatValue(value));
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setLocalValue(raw);

        if (raw === '') {
            return;
        }

        const rawNumber = raw.replace(/,/g, '');
        const numValue = Number(rawNumber);

        if (!isNaN(numValue)) {
            onChange(numValue);
        }
    };

    const handleBlur = () => {
        if (localValue === '') {
            // If empty, revert to parent value (unless parent value is 0, which we show as empty?)
            // Actually, if parent is 0, we show empty. If parent is 500, we show 500.
            // If user cleared it, we want it to revert to previous valid value (parent value).
            // But if parent value was 0, it stays empty.
            if (value !== 0) {
                setLocalValue(formatValue(value));
            }
        } else {
            // Format on blur
            const rawNumber = localValue.replace(/,/g, '');
            const num = Number(rawNumber);
            if (!isNaN(num)) {
                setLocalValue(num === 0 ? '' : formatValue(num));
            }
        }
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                className={`${className} pr-8`}
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                inputMode="numeric"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold pointer-events-none">
                円
            </span>
        </div>
    );
}

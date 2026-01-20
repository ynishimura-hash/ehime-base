import React, { useState, useEffect } from 'react';

interface Props {
    value: number;
    onChange: (value: number) => void;
    className?: string; // To allow passing the existing Tailwind classes
    placeholder?: string;
    min?: number;
    max?: number;
}

export default function SliderMoneyInput({ value, onChange, className = "", placeholder, min = 0, max = 100000 }: Props) {
    const formatValue = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const [localValue, setLocalValue] = useState(value === 0 ? '' : formatValue(value));

    // Sync from parent
    useEffect(() => {
        const numLocal = Number(localValue.replace(/,/g, ''));
        if (numLocal !== value) {
            setLocalValue(value === 0 ? '' : formatValue(value));
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setLocalValue(raw);

        if (raw === '') {
            onChange(0);
            return;
        }

        const rawNumber = raw.replace(/,/g, '');
        const numValue = Number(rawNumber);

        if (!isNaN(numValue)) {
            onChange(numValue);
        }
    };

    const handleBlur = () => {
        const rawNumber = localValue.replace(/,/g, '');
        const num = Number(rawNumber);
        if (!isNaN(num)) {
            setLocalValue(num === 0 ? '' : formatValue(num));
        } else {
            // Revert if NaN
            setLocalValue(value === 0 ? '' : formatValue(value));
        }
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        onChange(val);
        setLocalValue(formatValue(val));
    };

    return (
        <div className="w-full">
            <div className="relative w-full mb-2">
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
            <input
                type="range"
                min={min}
                max={max}
                step={1000} // Reasonable step
                value={value}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>
    );
}

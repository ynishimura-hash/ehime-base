import React, { useState, useEffect } from 'react';

interface Props {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    step?: number;
    className?: string;
    unit?: string;
}

export default function NumberInput({ value, onChange, placeholder, step = 1, className = "", unit }: Props) {
    const [localValue, setLocalValue] = useState(value.toString());

    useEffect(() => {
        // Sync with parent only if valid and different
        if (Number(localValue) !== value && localValue !== '') {
            setLocalValue(value.toString());
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setLocalValue(raw);

        if (raw === '') {
            return;
        }

        const num = Number(raw);
        if (!isNaN(num)) {
            onChange(num);
        }
    };

    const handleBlur = () => {
        if (localValue === '') {
            setLocalValue(value.toString());
        }
    };

    return (
        <div className={`relative ${className.includes('w-') ? '' : 'w-full'}`}>
            <input
                type="number"
                step={step}
                className={`${className} ${unit ? 'pr-8' : ''}`}
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
            />
            {unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold pointer-events-none">
                    {unit}
                </span>
            )}
        </div>
    );
}

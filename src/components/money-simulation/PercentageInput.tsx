import React, { useState, useEffect } from 'react';

interface Props {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    step?: number;
    className?: string;
}

export default function PercentageInput({ value, onChange, placeholder, step = 0.1, className = "" }: Props) {
    const [localValue, setLocalValue] = useState(value.toString());

    // Sync from parent only if the value is meaningfully different and we are not currently editing to an empty string effectively
    // But basic sync is safer to ensure external updates are reflected.
    // We'll trust the parent value primarily, but we need to handle the case where parent value hasn't changed (because we didn't call onChange)
    // but we want to show empty.
    useEffect(() => {
        // If the parent value matches what we parsed from our local value, don't override (keeps cursor stable-ish/formatting)
        // But here we just have simple numbers.
        if (Number(localValue) !== value && localValue !== '') {
            setLocalValue(value.toString());
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setLocalValue(raw);

        if (raw === '') {
            // User cleared input. Do NOT update parent to 0.
            // Parent keeps previous value.
            return;
        }

        const num = Number(raw);
        if (!isNaN(num)) {
            onChange(num);
        }
    };

    const handleBlur = () => {
        if (localValue === '') {
            // On blur, if empty, revert to the current valid parent value
            setLocalValue(value.toString());
        } else {
            // Optional: Format standard (e.g. 5. -> 5)
            const num = Number(localValue);
            if (!isNaN(num)) {
                setLocalValue(num.toString());
            }
        }
    };

    return (
        <div className={`flex items-center bg-white border border-purple-200 rounded-lg px-3 py-2 ${className}`}>
            <input
                type="number"
                step={step}
                className="w-full text-sm text-slate-900 font-medium outline-none bg-transparent"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
            />
            <span className="text-slate-500 text-sm font-bold ml-1">%</span>
        </div>
    );
}

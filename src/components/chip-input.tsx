'use client';

import { X } from 'lucide-react';
import { type ChangeEvent, type KeyboardEvent, useState } from 'react';

import { Button } from '@/components/ui/button';

type ChipInputProps = {
  placeholder?: string;
  label?: string;
  value?: string[];
  onChange?: (chips: string[]) => void;
  suggestions?: string[];
  className?: string;
};

const ChipInput = ({
  placeholder = 'Type and press Enter...',
  label,
  value,
  onChange,
  suggestions = [],
  className = '',
}: ChipInputProps) => {
  // Use controlled value if provided, otherwise use internal state
  const [internalChips, setInternalChips] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  const chips = value !== undefined ? value : internalChips;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addChip = (chip: string) => {
    const trimmedChip = chip.trim();
    if (!trimmedChip) return;

    // Don't add duplicates
    if (!chips.includes(trimmedChip)) {
      const newChips = [...chips, trimmedChip];

      if (onChange) {
        onChange(newChips);
      } else {
        setInternalChips(newChips);
      }
    }

    setInputValue('');
  };

  const removeChip = (index: number) => {
    const newChips = [...chips];
    newChips.splice(index, 1);

    if (onChange) {
      onChange(newChips);
    } else {
      setInternalChips(newChips);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addChip(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && chips.length > 0) {
      removeChip(chips.length - 1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addChip(suggestion);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          {label}
        </label>
      )}

      <div className='flex flex-wrap gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white'>
        {chips.map((chip, index) => (
          <div
            key={index}
            className='flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm'
          >
            <span>{chip}</span>
            <button
              type='button'
              onClick={() => removeChip(index)}
              className='ml-1 text-blue-600 hover:text-blue-800 focus:outline-none'
              aria-label={`Remove ${chip}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <input
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className='flex-grow outline-none border-none focus:border-none  min-w-[120px] p-1'
          placeholder={chips.length === 0 ? placeholder : ''}
        />
        <Button
          type='button'
          className='ml-2'
          onClick={() => addChip(inputValue)}
        >
          Add Skill
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className='mt-2'>
          <p className='text-sm text-gray-500 mb-2'>Suggestions:</p>
          <div className='flex flex-wrap gap-2'>
            {suggestions
              .filter((suggestion) => !chips.includes(suggestion))
              .map((suggestion, index) => (
                <button
                  key={index}
                  type='button'
                  onClick={() => handleSuggestionClick(suggestion)}
                  className='bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm'
                >
                  {suggestion}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChipInput;

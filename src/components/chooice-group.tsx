import { Check } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

export type ChoiceGroupProps = {
  className?: string;
  children: React.ReactNode;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  type?: 'single' | 'multiple';
  name?: string;
  'aria-label'?: string;
  variant?: 'default' | 'square';
  orientation?: 'vertical' | 'horizontal';
};

export type ChoiceItemProps = {
  className?: string;
  value: string;
  label: string;
  index?: string | number;
  disabled?: boolean;
  icon?: React.ReactNode;
};

const ChoiceGroupContext = React.createContext<{
  selected: string | string[];
  onChange?: (value: string | string[]) => void;
  type: 'single' | 'multiple';
  name?: string;
  registerItem?: (el: HTMLDivElement | null) => void;
  variant: 'default' | 'square';
  orientation: 'vertical' | 'horizontal';
}>({
  selected: '',
  type: 'single',
  variant: 'default',
  orientation: 'vertical',
});

export const ChoiceGroup = ({
  className,
  children,
  value = '',
  onChange,
  type = 'single',
  name,
  'aria-label': ariaLabel,
  variant = 'default',
  orientation = 'vertical',
}: ChoiceGroupProps) => {
  const itemsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const [itemCount, setItemCount] = React.useState(0);

  const registerItem = React.useCallback((el: HTMLDivElement | null) => {
    if (el) {
      const index = parseInt(el.dataset.index || '0');
      itemsRef.current[index] = el;
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = itemsRef.current.filter(Boolean);
    const currentIndex = items.findIndex(
      (item) => item === document.activeElement
    );

    const isHorizontal = orientation === 'horizontal';

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isHorizontal && currentIndex < items.length - 1) {
          items[currentIndex + 1]?.focus();
        } else if (!isHorizontal) {
          items[0]?.focus();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          items[currentIndex + 1]?.focus();
        } else {
          items[0]?.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isHorizontal && currentIndex > 0) {
          items[currentIndex - 1]?.focus();
        } else if (!isHorizontal) {
          items[items.length - 1]?.focus();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (currentIndex > 0) {
          items[currentIndex - 1]?.focus();
        } else {
          items[items.length - 1]?.focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
    }
  };

  React.useEffect(() => {
    setItemCount(React.Children.count(children));
  }, [children]);

  return (
    <ChoiceGroupContext.Provider
      value={{
        selected: value,
        onChange,
        type,
        name,
        registerItem,
        variant,
        orientation,
      }}
    >
      <div
        role={type === 'single' ? 'radiogroup' : 'group'}
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex w-full',
          orientation === 'vertical'
            ? 'flex-col gap-2'
            : 'md:flex-row md:justify-between  md:gap-3 flex-col gap-2',
          className
        )}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              'data-index': index,
            } as any);
          }
          return child;
        })}
      </div>
    </ChoiceGroupContext.Provider>
  );
};

export const ChoiceItem = React.forwardRef<HTMLDivElement, ChoiceItemProps>(
  (
    { className, value, label, index, disabled = false, icon, ...props },
    ref
  ) => {
    const {
      selected,
      onChange,
      type,
      name,
      registerItem,
      variant,
      orientation,
    } = React.useContext(ChoiceGroupContext);
    const itemRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      if (registerItem) {
        registerItem(itemRef.current);
      }
    }, [registerItem]);

    const isSelected = Array.isArray(selected)
      ? selected.includes(value)
      : selected === value;

    const handleChange = () => {
      if (disabled) return;

      if (type === 'multiple' && Array.isArray(selected)) {
        const newValue = isSelected
          ? selected.filter((v) => v !== value)
          : [...selected, value];
        onChange?.(newValue);
      } else {
        onChange?.(value);
      }
    };

    // Determine styles based on variant
    const defaultVariantStyles = cn(
      'flex items-center gap-3 p-4 rounded-lg border border-gray-200',
      'transition-all duration-200 ease-in-out',
      'hover:border-blue-500 hover:bg-blue-50',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      isSelected && 'border-blue-500 bg-blue-50',
      disabled
        ? 'opacity-50 cursor-not-allowed hover:border-gray-200 hover:bg-transparent'
        : 'cursor-pointer'
    );

    const squareVariantStyles = cn(
      'flex flex-col items-center justify-center p-5 rounded-lg border border-gray-200',
      'transition-all duration-200 ease-in-out',
      'min-w-40 min-h-40 text-center',
      'hover:border-blue-500 hover:bg-blue-50',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      isSelected && 'border-blue-500 bg-blue-50',
      disabled
        ? 'opacity-50 cursor-not-allowed hover:border-gray-200 hover:bg-transparent'
        : 'cursor-pointer'
    );

    return (
      <div
        {...props}
        ref={(el) => {
          itemRef.current = el;
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }
        }}
        role={type === 'single' ? 'radio' : 'checkbox'}
        tabIndex={disabled ? -1 : 0}
        aria-checked={isSelected}
        aria-disabled={disabled}
        aria-label={label}
        onClick={handleChange}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleChange();
          }
        }}
        className={cn(
          variant === 'default' ? defaultVariantStyles : squareVariantStyles,
          className
        )}
      >
        {variant === 'default' ? (
          <>
            <div
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-md border border-gray-300',
                'transition-all duration-200',
                isSelected && 'bg-blue-500 border-blue-500',
                type === 'single' && 'rounded-full'
              )}
            >
              {isSelected &&
                (type === 'multiple' ? (
                  <Check className='w-4 h-4 text-white' />
                ) : (
                  <div className='w-3 h-3 rounded-full bg-white' />
                ))}
            </div>
            <div className='flex gap-2'>
              {index && <span className='text-gray-500'>{index}.</span>}
              <span className='text-gray-900'>{label}</span>
            </div>
          </>
        ) : (
          <>
            {/* Square variant with icon at the top */}
            {isSelected && (
              <div className='absolute top-2 right-2 bg-blue-500 rounded-full p-1'>
                <Check className='w-3 h-3 text-white' />
              </div>
            )}
            <div className='flex flex-col items-center justify-center gap-3'>
              {icon && <div className='text-blue-500 mb-2'>{icon}</div>}
              <span className='text-gray-900 font-medium'>{label}</span>
              {index && (
                <span className='text-gray-500 text-sm'>Option {index}</span>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
);

ChoiceItem.displayName = 'ChoiceItem';

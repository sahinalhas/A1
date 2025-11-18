import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODERN_SHADOWS, ANIMATION_VARIANTS, STAGGER_DELAYS } from '@/lib/config/theme.config';

interface ModernCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  gradient?: string;
  shadow?: keyof typeof MODERN_SHADOWS;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  delay?: number;
  onClick?: () => void;
}

export function ModernCard({
  title,
  description,
  children,
  icon: Icon,
  gradient,
  shadow = 'md',
  className,
  headerClassName,
  contentClassName,
  delay = 0,
  onClick,
}: ModernCardProps) {
  const CardWrapper = delay > 0 ? motion.div : 'div';
  const animationProps = delay > 0 
    ? {
        initial: ANIMATION_VARIANTS.fadeIn.initial,
        animate: ANIMATION_VARIANTS.fadeIn.animate,
        transition: { delay },
      }
    : {};

  return (
    <CardWrapper {...animationProps}>
      <Card 
        className={cn(
          'relative overflow-hidden',
          MODERN_SHADOWS[shadow],
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        {gradient && (
          <div className={cn('absolute inset-0 opacity-5', gradient)} />
        )}
        
        <CardHeader className={cn('relative', headerClassName)}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
            {Icon && gradient && (
              <div className={cn('p-2 rounded-lg bg-opacity-10', gradient)}>
                <Icon className="h-4 w-4" />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className={cn('relative', contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </CardWrapper>
  );
}

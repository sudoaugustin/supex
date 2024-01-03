import { VariantProps, cva } from 'class-variance-authority';
import { ProgressBar } from 'icons/Loading';
import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type Props = (LinkProps | ButtonProps) & {
  icon?: ReactNode;
  label: ReactNode;
  inline?: boolean;
  className?: string;
};

export default function Button({ icon, label, inline = true, className, ...rest }: Props) {
  const props = {
    ...rest,
    children: label,
    className: 'px-4 py-2 text-emerald-500 bg-emerald-400/25 hover:bg-emerald-400/50 rounded-md',
  };

  return props.href ? <a href={props.href} {...(props as LinkProps)} /> : <button type="button" {...(props as ButtonProps)} />;
}

export type { Props as ButtonProps };

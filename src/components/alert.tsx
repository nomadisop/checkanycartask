import type { ReactNode } from "react";
import { InfoIcon, WarningIcon } from "@phosphor-icons/react";

const TONES = {
  danger: { box: "bg-red-50 text-red-900 ring-red-200", icon: WarningIcon, iconColor: "text-red-600" },
  neutral: { box: "bg-white text-zinc-900 ring-zinc-200", icon: InfoIcon, iconColor: "text-zinc-500" },
};

type Props = {
  tone?: keyof typeof TONES;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
};

export default function Alert({ tone = "neutral", title, children, action }: Props) {
  const { box, icon: Icon, iconColor } = TONES[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex gap-3 rounded-xl p-4 ring-1 motion-safe:animate-fade-up ${box}`}
    >
      <Icon size={20} weight="fill" aria-hidden="true" className={`mt-0.5 shrink-0 ${iconColor}`} />
      <div className="flex flex-col items-start gap-1.5">
        <p className="font-semibold">{title}</p>
        {children && <div className="text-sm leading-relaxed text-pretty opacity-90">{children}</div>}
        {action && <div className="mt-1">{action}</div>}
      </div>
    </div>
  );
}

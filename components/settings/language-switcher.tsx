"use client";

import { Check, Globe } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { LOCALE_CONFIG } from "@/lib/constants";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const handleLanguageChange = (lang: string) => {
        if (LOCALE_CONFIG.SUPPORTED.includes(lang as any)) {
            setLanguage(lang as any);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="group relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border/50 bg-background/50 backdrop-blur-md text-foreground transition-all duration-500 hover:bg-foreground hover:text-background hover:border-foreground/30 shadow-sm focus:outline-none">
                    <div className="absolute inset-0 flex h-full w-full justify-center -translate-x-full -skew-x-13 group-hover:duration-1000 group-hover:translate-x-full">
                        <div className="relative h-full w-4 bg-background/20 dark:bg-background/20" />
                    </div>
                    <span className="relative z-10 flex items-center justify-center">
                        <Globe className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12" />
                    </span>
                    <span className="sr-only">Switch Language</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[120] bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl min-w-[140px] p-2">
                <DropdownMenuItem onClick={() => handleLanguageChange("en")} className="rounded-xl cursor-pointer my-0.5 focus:bg-secondary">
                    <span className={cn("mr-2 flex h-3.5 w-3.5 items-center justify-center")}>
                        {language === "en" && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="text-xs tracking-widest uppercase">English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("tr")} className="rounded-xl cursor-pointer my-0.5 focus:bg-secondary">
                    <span className={cn("mr-2 flex h-3.5 w-3.5 items-center justify-center")}>
                        {language === "tr" && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="text-xs tracking-widest uppercase">Türkçe</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

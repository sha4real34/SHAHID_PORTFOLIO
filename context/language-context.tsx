"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import en from "@/content/en.json";
import tr from "@/content/tr.json";
import { STORAGE_KEYS, LOCALE_CONFIG } from "@/lib/constants";

type Content = typeof en;
export type Language = typeof LOCALE_CONFIG.SUPPORTED[number];

interface LanguageContextType {
    language: Language;
    content: any;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries: Record<Language, Content> = { en, tr };

const parseContentWithHtml = (data: any): any => {
    if (typeof data === "string") {
        const hasHtml = /<[a-z][\s\S]*>/i.test(data);

        if (hasHtml) {
            return (
                <span
                    key={data}
                    dangerouslySetInnerHTML={{ __html: data }}
                />
            );
        }
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(parseContentWithHtml);
    }

    if (typeof data === "object" && data !== null) {
        const result: any = {};
        for (const key in data) {
            result[key] = parseContentWithHtml(data[key]);
        }
        return result;
    }

    return data;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>(LOCALE_CONFIG.DEFAULT);

    useEffect(() => {
        const savedLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;

        if (savedLang && LOCALE_CONFIG.SUPPORTED.includes(savedLang)) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
        document.documentElement.lang = lang;
    };

    const processedContent = useMemo(() => {
        return parseContentWithHtml(dictionaries[language]);
    }, [language]);

    const value = {
        language,
        content: processedContent,
        setLanguage,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
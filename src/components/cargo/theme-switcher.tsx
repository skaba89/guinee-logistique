/**
 * theme-switcher.tsx — Basculeur de thème Dark/Light pour Guinée Logistique
 *
 * BRANCHEMENT : Importez ThemeSwitcher depuis ce fichier et placez-le
 * dans votre header ou navbar. next-themes est déjà installé et configuré.
 *
 * Exemple :
 *   import ThemeSwitcher from '@/components/cargo/theme-switcher';
 *   // Dans votre header :
 *   <ThemeSwitcher />
 */

'use client';

import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Changer le thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2">
          <Sun className="w-4 h-4" />
          Clair
          {theme === 'light' && <span className="ml-auto text-teal-500">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2">
          <Moon className="w-4 h-4" />
          Sombre
          {theme === 'dark' && <span className="ml-auto text-teal-500">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2">
          <Monitor className="w-4 h-4" />
          Système
          {theme === 'system' && <span className="ml-auto text-teal-500">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

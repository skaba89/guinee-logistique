'use client';

import React, { useState } from 'react';
import {
  User,
  Building,
  Bell,
  Moon,
  Sun,
  Globe,
  Info,
  Mail,
  Phone,
  MapPin,
  Shield,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCargoStore } from '@/lib/cargo-store';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const user = useCargoStore((s) => s.user);
  const { theme, setTheme } = useTheme();

  const [companyInfo, setCompanyInfo] = useState({
    name: 'Cargo 360 Algérie',
    address: '23 Rue Didouche Mourad, Alger Centre',
    phone: '+213 21 00 00 00',
    email: 'contact@cargo360.dz',
  });

  const [notifications, setNotifications] = useState({
    emailNewShipment: true,
    emailStatusChange: true,
    emailInvoice: true,
    smsShipment: false,
    smsStatusChange: true,
    smsDelivery: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configurez votre application</p>
        </div>
        <Button
          size="sm"
          className="text-xs text-white"
          style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }}
          onClick={handleSave}
        >
          <Save className="w-4 h-4 mr-1" />
          {saved ? 'Enregistré !' : 'Enregistrer'}
        </Button>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5" style={{ color: '#1a56db' }} />
            Profil utilisateur
          </CardTitle>
          <CardDescription>Vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }}>
                {user?.name?.split(' ').map((n) => n[0]).join('') || 'AB'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{user?.name || 'Utilisateur'}</h3>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                {user?.role || 'Administrateur'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Nom complet</Label>
              <Input value={user?.name || ''} disabled className="bg-gray-50 dark:bg-gray-900" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Email</Label>
              <Input value={user?.email || ''} disabled className="bg-gray-50 dark:bg-gray-900" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Téléphone</Label>
              <Input value={user?.phone || ''} disabled className="bg-gray-50 dark:bg-gray-900" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Rôle</Label>
              <Input value={user?.role || ''} disabled className="bg-gray-50 dark:bg-gray-900" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="w-5 h-5" style={{ color: '#1a56db' }} />
            Informations entreprise
          </CardTitle>
          <CardDescription>Détails de votre société</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Nom de l&apos;entreprise</Label>
              <Input
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email professionnel</Label>
              <Input
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Téléphone</Label>
              <Input
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Adresse</Label>
              <Input
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-5 h-5" style={{ color: '#1a56db' }} />
            Notifications
          </CardTitle>
          <CardDescription>Configurez vos alertes</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Notifications email
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Nouvelle expédition</p>
                  <p className="text-xs text-gray-500">Recevoir un email lors de la création d&apos;une expédition</p>
                </div>
                <Switch
                  checked={notifications.emailNewShipment}
                  onCheckedChange={(v) => setNotifications({ ...notifications, emailNewShipment: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Changement de statut</p>
                  <p className="text-xs text-gray-500">Notification lors du changement de statut d&apos;un colis</p>
                </div>
                <Switch
                  checked={notifications.emailStatusChange}
                  onCheckedChange={(v) => setNotifications({ ...notifications, emailStatusChange: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Facturation</p>
                  <p className="text-xs text-gray-500">Alerte pour les nouvelles factures et paiements</p>
                </div>
                <Switch
                  checked={notifications.emailInvoice}
                  onCheckedChange={(v) => setNotifications({ ...notifications, emailInvoice: v })}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              Notifications SMS
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Création d&apos;expédition</p>
                  <p className="text-xs text-gray-500">SMS lors de la création</p>
                </div>
                <Switch
                  checked={notifications.smsShipment}
                  onCheckedChange={(v) => setNotifications({ ...notifications, smsShipment: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Changement de statut</p>
                  <p className="text-xs text-gray-500">SMS pour les changements importants</p>
                </div>
                <Switch
                  checked={notifications.smsStatusChange}
                  onCheckedChange={(v) => setNotifications({ ...notifications, smsStatusChange: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Livraison</p>
                  <p className="text-xs text-gray-500">SMS de confirmation de livraison</p>
                </div>
                <Switch
                  checked={notifications.smsDelivery}
                  onCheckedChange={(v) => setNotifications({ ...notifications, smsDelivery: v })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5" style={{ color: '#1a56db' }} /> : <Sun className="w-5 h-5" style={{ color: '#1a56db' }} />}
            Apparence
          </CardTitle>
          <CardDescription>Personnalisez l&apos;interface</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Mode sombre</p>
              <p className="text-xs text-gray-500">Basculer entre le mode clair et sombre</p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                Langue
              </p>
              <p className="text-xs text-gray-500">Langue de l&apos;interface</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              Français
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-5 h-5" style={{ color: '#1a56db' }} />
            À propos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Application</p>
              <p className="font-medium">Cargo 360</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Version</p>
              <p className="font-medium">2.1.0</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Support technique</p>
              <p className="font-medium">support@cargo360.dz</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Contact commercial</p>
              <p className="font-medium">+213 21 00 00 00</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs text-gray-500">
            © 2026 Cargo 360 Algérie. Tous droits réservés. Système de gestion logistique.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

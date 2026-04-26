'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, Plane, Ship, Truck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCargoStore } from '@/lib/cargo-store';

export default function LoginPage() {
  const login = useCargoStore((s) => s.login);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    const success = login(phone, password);
    if (!success) {
      setError('Numéro de téléphone ou mot de passe incorrect');
    }
    setLoading(false);
  };

  const modeCards = [
    { icon: Plane, label: 'Aérien', color: 'from-sky-400 to-blue-500' },
    { icon: Ship, label: 'Maritime', color: 'from-teal-400 to-cyan-500' },
    { icon: Truck, label: 'Terrestre', color: 'from-amber-400 to-orange-500' },
    { icon: MapPin, label: 'Suivi', color: 'from-emerald-400 to-green-500' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0b1f3a 0%, #1a3a5c 50%, #0b1f3a 100%)' }}>
        {/* Animated mesh gradient */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #3b7cff 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #00c9a7 0%, transparent 70%)' }}
            animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-56 h-56 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #4facfe 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.3, 1], x: [-30, 0, -30], y: [20, 0, 20] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b7cff, #00c9a7)' }}>
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Cargo 360</h1>
                <p className="text-xs text-blue-200 tracking-widest uppercase">Logistique & Transport</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-2">
              Votre logistique, sous contrôle total
            </h2>
            <p className="text-blue-200/80 mb-12 max-w-md mx-auto">
              Plateforme complète de gestion de colis et d&apos;expéditions. Suivez, gérez et optimisez vos envois en temps réel.
            </p>

            {/* Mode cards */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              {modeCards.map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="rounded-xl p-4 text-center backdrop-blur-sm border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <div className={`w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center bg-gradient-to-br ${card.color}`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{card.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b7cff, #00c9a7)' }}>
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Cargo 360</h1>
            </div>
          </div>

          {/* Logo area */}
          <div className="hidden lg:flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a56db, #0b1f3a)' }}>
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">CARGO 360</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#1a56db' }}>
              Espace Professionnel
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Accédez à votre espace de gestion logistique
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0600000001"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(v === true)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  Se souvenir de moi
                </Label>
              </div>
              <button
                type="button"
                className="text-sm font-medium hover:underline"
                style={{ color: '#1a56db' }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }}
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Besoin d&apos;un accès ?{' '}
              <button className="font-medium hover:underline" style={{ color: '#1a56db' }}>
                Contacter l&apos;administrateur
              </button>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              Identifiants de démonstration
            </p>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
              <p><span className="font-medium">Admin:</span> 0600000001 / admin123</p>
              <p><span className="font-medium">Agent:</span> 0600000002 / user123</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

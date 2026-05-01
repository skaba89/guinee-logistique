'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, Ship, Plane, Truck, Container, Globe, ArrowRight, Mail, KeyRound, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useCargoStore } from '@/lib/cargo-store';

export default function LoginPage() {
  const login = useCargoStore((s) => s.login);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [showDemoCreds, setShowDemoCreds] = useState(false);

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

  const animatedIcons = [
    { icon: Ship, x: '15%', y: '20%', delay: 0, duration: 6 },
    { icon: Plane, x: '70%', y: '15%', delay: 1, duration: 7 },
    { icon: Truck, x: '25%', y: '70%', delay: 2, duration: 8 },
    { icon: Container, x: '60%', y: '65%', delay: 0.5, duration: 5 },
    { icon: Globe, x: '80%', y: '45%', delay: 1.5, duration: 9 },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0d3b36 50%, #0f172a 100%)' }}>
        {/* Animated mesh gradient */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #0d9488 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.3, 1], x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)' }}
            animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.4, 1], x: [-40, 0, -40], y: [30, 0, 30] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Floating icons */}
        <div className="absolute inset-0">
          {animatedIcons.map((item, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={{ left: item.x, top: item.y }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0.08, 0.15, 0.08],
                scale: [0.8, 1.1, 0.8],
                y: [0, -15, 0],
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: item.delay,
              }}
            >
              <item.icon className="w-12 h-12 text-teal-300/20" />
            </motion.div>
          ))}
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
            <div className="mb-8 flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
                <Ship className="w-8 h-8 text-white" />
                <div className="absolute -right-1 -top-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#0f172a', border: '2px solid #0d9488' }}>
                  <ArrowRight className="w-3 h-3 text-teal-400" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-white tracking-tight">LogisWay</h1>
                <p className="text-[10px] text-teal-300/70 tracking-[0.25em] uppercase">Logistique Internationale</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-3">
              La logistique mondiale, simplifiée
            </h2>
            <p className="text-teal-200/60 mb-4 text-sm">
              Maritime &bull; Aérien &bull; Terrestre &bull; Colis &bull; Douanes
            </p>
            <p className="text-slate-400/60 text-xs max-w-md mx-auto mb-12">
              Plateforme complète de gestion logistique internationale. Suivez, gérez et optimisez vos flux de marchandises à travers le monde.
            </p>

            {/* Animated mode cards */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              {[
                { icon: Ship, label: 'Maritime', color: 'from-teal-500 to-emerald-600' },
                { icon: Plane, label: 'Aérien', color: 'from-cyan-500 to-teal-600' },
                { icon: Truck, label: 'Terrestre', color: 'from-emerald-500 to-green-600' },
              ].map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="rounded-xl p-4 text-center backdrop-blur-sm border border-teal-500/10"
                  style={{ background: 'rgba(13, 148, 136, 0.08)' }}
                >
                  <div className={`w-11 h-11 rounded-lg mx-auto mb-2 flex items-center justify-center bg-gradient-to-br ${card.color}`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-teal-100">{card.label}</span>
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
            <div className="w-11 h-11 rounded-xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              <Ship className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">LogisWay</h1>
            </div>
          </div>

          {/* Logo area for desktop */}
          <div className="hidden lg:flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}>
              <Ship className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">LOGISWAY</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#0d9488' }}>
              Espace Professionnel
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Accédez à votre plateforme de gestion logistique internationale
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
                  placeholder="Mot de passe"
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
                style={{ color: '#0d9488' }}
                onClick={() => { setShowForgotDialog(true); setForgotSent(false); setForgotPhone(''); }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
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

          {/* Client Portal Link */}
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full h-10 text-sm border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"
              onClick={() => {
                login('0600000001', 'admin123');
              }}
            >
              <Globe className="w-4 h-4 mr-2" />
              Portail Client
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Besoin d&apos;un accès ?{' '}
              <button className="font-medium hover:underline" style={{ color: '#0d9488' }} onClick={() => { setShowContactDialog(true); setContactSent(false); setContactMessage(''); }}>
                Contacter l&apos;administrateur
              </button>
            </p>
          </div>

          {/* Demo credentials - hidden by default */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowDemoCreds(!showDemoCreds)}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors flex items-center gap-1 mx-auto"
            >
              <KeyRound className="w-3 h-3" />
              {showDemoCreds ? 'Masquer' : 'Afficher'} les identifiants de démonstration
            </button>
            {showDemoCreds && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                  <p><span className="font-medium">Admin:</span> 0600000001 / admin123</p>
                  <p><span className="font-medium">Agent:</span> 0600000002 / user123</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-teal-500" />
              Mot de passe oublié
            </DialogTitle>
            <DialogDescription>
              Entrez votre numéro de téléphone pour recevoir un code de réinitialisation.
            </DialogDescription>
          </DialogHeader>
          {forgotSent ? (
            <div className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Code envoyé avec succès</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Un code de réinitialisation a été envoyé par SMS au {forgotPhone}. Vérifiez votre téléphone et suivez les instructions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-phone">Numéro de téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="forgot-phone"
                    type="tel"
                    placeholder="0600000001"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <Button
                className="w-full h-11 text-white font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                onClick={() => {
                  if (forgotPhone.trim()) setForgotSent(true);
                }}
                disabled={!forgotPhone.trim()}
              >
                Envoyer le code de réinitialisation
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForgotDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Admin Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-500" />
              Contacter l&apos;administrateur
            </DialogTitle>
            <DialogDescription>
              Envoyez un message à l&apos;équipe technique pour demander un accès ou signaler un problème.
            </DialogDescription>
          </DialogHeader>
          {contactSent ? (
            <div className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Message envoyé</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Votre demande a été transmise à l&apos;équipe technique. Vous recevrez une réponse sous 24h.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-msg">Votre message</Label>
                <textarea
                  id="contact-msg"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Décrivez votre besoin ou problème..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span>admin@logisway.pro</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>+213 21 00 00 00</span>
                </div>
              </div>
              <Button
                className="w-full h-11 text-white font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
                onClick={() => {
                  if (contactMessage.trim()) setContactSent(true);
                }}
                disabled={!contactMessage.trim()}
              >
                Envoyer le message
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
